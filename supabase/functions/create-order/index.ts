// VIVA — create a pending order before payment is attempted.
//
// The browser sends product ids, quantities and delivery details. It does
// NOT send an amount: every price is resolved server-side from the
// catalogue, so the total cannot be tampered with. The reference we
// generate here is what gets handed to Paystack, and it is what
// verify-payment later looks the order up by.
//
// Creating the row *before* redirecting to Paystack also means an
// abandoned checkout leaves a trace, which is how you find out that
// people are dropping at payment rather than never reaching it.
//
// Deploy:
//   supabase functions deploy create-order

import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  unitPriceSubunit,
  titleFor,
  MAX_QTY_PER_LINE,
  type Currency,
} from "../_shared/viva-catalogue.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IncomingItem {
  id: string;
  qty: number;
}

interface CreateOrderRequest {
  items: IncomingItem[];
  currency: Currency;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    notes?: string;
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Deliberately permissive — the goal is to catch a typo, not to police
// what a valid address looks like in every country.
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured: Supabase credentials missing." }, 500);
  }

  let body: CreateOrderRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Malformed request body." }, 400);
  }

  // ── Currency ────────────────────────────────────────────────────────
  const currency = body.currency;
  if (currency !== "NGN" && currency !== "USD") {
    return json({ error: "Unsupported currency." }, 400);
  }

  // ── Items ───────────────────────────────────────────────────────────
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json({ error: "Your basket is empty." }, 400);
  }
  if (body.items.length > 50) {
    return json({ error: "Too many lines in one order." }, 400);
  }

  const lines: {
    product_id: string;
    title: string;
    unit_price_subunit: number;
    qty: number;
    line_total_subunit: number;
  }[] = [];

  for (const raw of body.items) {
    const id = trim(raw?.id);
    const qty = Number(raw?.qty);

    if (!id) return json({ error: "An item was missing its product id." }, 400);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return json({ error: `Invalid quantity for "${id}".` }, 400);
    }

    // Fail closed: an id we do not recognise is never priced at zero.
    const unit = unitPriceSubunit(id, currency);
    const title = titleFor(id);
    if (unit === null || title === null) {
      return json({ error: `We no longer stock "${id}". Please refresh and try again.` }, 409);
    }

    lines.push({
      product_id: id,
      title,
      unit_price_subunit: unit,
      qty,
      line_total_subunit: unit * qty,
    });
  }

  const amountSubunit = lines.reduce((sum, l) => sum + l.line_total_subunit, 0);
  if (amountSubunit <= 0) {
    return json({ error: "Order total came to zero." }, 400);
  }

  // ── Delivery details ────────────────────────────────────────────────
  const c = body.customer ?? ({} as CreateOrderRequest["customer"]);
  const customer = {
    name:    trim(c.name),
    email:   trim(c.email).toLowerCase(),
    phone:   trim(c.phone),
    address: trim(c.address),
    city:    trim(c.city),
    state:   trim(c.state),
    country: trim(c.country) || "Nigeria",
    notes:   trim(c.notes),
  };

  const missing = (["name", "email", "phone", "address", "city", "state"] as const)
    .filter((k) => !customer[k]);
  if (missing.length) {
    return json({ error: `Please complete: ${missing.join(", ")}.`, fields: missing }, 400);
  }
  if (!looksLikeEmail(customer.email)) {
    return json({ error: "That email address does not look right.", fields: ["email"] }, 400);
  }

  // ── Persist ─────────────────────────────────────────────────────────
  const reference = `VIVA-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: order, error: orderError } = await supabase
    .from("viva_orders")
    .insert({
      reference,
      status: "pending",
      currency,
      amount_subunit: amountSubunit,
      customer_name:    customer.name,
      customer_email:   customer.email,
      customer_phone:   customer.phone,
      delivery_address: customer.address,
      delivery_city:    customer.city,
      delivery_state:   customer.state,
      delivery_country: customer.country,
      delivery_notes:   customer.notes || null,
    })
    .select("id, reference, amount_subunit, currency")
    .single();

  if (orderError || !order) {
    console.error("create-order: insert failed", orderError);
    return json({ error: "Could not start your order. Please try again." }, 500);
  }

  const { error: itemsError } = await supabase
    .from("viva_order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));

  if (itemsError) {
    // Roll the header back rather than leaving an order with no contents.
    console.error("create-order: items insert failed", itemsError);
    await supabase.from("viva_orders").delete().eq("id", order.id);
    return json({ error: "Could not start your order. Please try again." }, 500);
  }

  return json({
    reference:      order.reference,
    amountSubunit:  order.amount_subunit,
    currency:       order.currency,
    email:          customer.email,
  });
});
