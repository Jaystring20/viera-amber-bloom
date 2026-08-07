// VIVA — verify a Paystack transaction server-side before calling it paid.
//
// The old checkout treated Paystack's browser callback as proof of
// payment: it showed a success screen and emptied the cart on the client's
// say-so. That callback is just JavaScript running on the customer's
// machine — it can be invoked by hand, and it also fires for payments that
// later fail or reverse. The only thing that settles it is asking Paystack
// directly, with the secret key, from a server.
//
// The secret key must never reach the browser. Set it as a function
// secret, not in .env:
//   supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx
//   supabase functions deploy verify-payment

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl   = Deno.env.get("SUPABASE_URL");
  const serviceKey    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const paystackKey   = Deno.env.get("PAYSTACK_SECRET_KEY");

  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured: Supabase credentials missing." }, 500);
  }
  if (!paystackKey) {
    return json({ error: "Server not configured: PAYSTACK_SECRET_KEY secret is missing." }, 500);
  }

  let reference = "";
  try {
    const body = await req.json();
    reference = typeof body?.reference === "string" ? body.reference.trim() : "";
  } catch {
    return json({ error: "Malformed request body." }, 400);
  }
  if (!reference) return json({ error: "Missing payment reference." }, 400);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── The order we created before payment ─────────────────────────────
  const { data: order, error: lookupError } = await supabase
    .from("viva_orders")
    .select("id, status, amount_subunit, currency")
    .eq("reference", reference)
    .single();

  if (lookupError || !order) {
    return json({ error: "We could not find that order." }, 404);
  }

  // Idempotent: a retried or double-fired callback must not re-process.
  if (order.status === "paid") {
    return json({ status: "paid", alreadyRecorded: true });
  }

  // ── Ask Paystack ────────────────────────────────────────────────────
  let payload: {
    status?: boolean;
    data?: { status?: string; amount?: number; currency?: string; reference?: string };
    message?: string;
  };

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } },
    );
    payload = await res.json();
  } catch (e) {
    // A network failure here is not a failed payment — the customer may
    // well have paid. Leave the order pending for manual reconciliation
    // rather than marking it failed.
    console.error("verify-payment: Paystack unreachable", e);
    return json({ error: "We could not confirm your payment just yet. Please contact us before paying again." }, 502);
  }

  const tx = payload?.data;
  const succeeded = payload?.status === true && tx?.status === "success";

  if (!succeeded) {
    await supabase
      .from("viva_orders")
      .update({ status: "failed", paystack_status: tx?.status ?? "unknown" })
      .eq("id", order.id);
    return json({ status: "failed", error: payload?.message ?? "Payment was not completed." }, 402);
  }

  // ── The checks that actually matter ─────────────────────────────────
  // Paystack reporting "success" is not enough on its own: confirm they
  // charged the amount and currency this order was created for.
  if (Number(tx?.amount) !== Number(order.amount_subunit)) {
    console.error("verify-payment: amount mismatch", {
      reference, expected: order.amount_subunit, got: tx?.amount,
    });
    await supabase
      .from("viva_orders")
      .update({ status: "failed", paystack_status: "amount_mismatch" })
      .eq("id", order.id);
    return json({ status: "failed", error: "Payment amount did not match the order." }, 409);
  }

  if (tx?.currency && tx.currency !== order.currency) {
    await supabase
      .from("viva_orders")
      .update({ status: "failed", paystack_status: "currency_mismatch" })
      .eq("id", order.id);
    return json({ status: "failed", error: "Payment currency did not match the order." }, 409);
  }

  // ── Settle ──────────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from("viva_orders")
    .update({
      status: "paid",
      paystack_reference: tx?.reference ?? reference,
      paystack_status: "success",
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "pending"); // guards against a concurrent second callback

  if (updateError) {
    console.error("verify-payment: could not mark paid", updateError);
    return json({ error: "Payment succeeded but we could not record it. Please contact us." }, 500);
  }

  // Best effort — the order is already safe, so a notification failure
  // must not turn a successful payment into an error for the customer.
  try {
    await supabase.functions.invoke("notify-admin", {
      body: { type: "order", data: { reference, amountSubunit: order.amount_subunit, currency: order.currency } },
    });
  } catch (e) {
    console.error("verify-payment: notify-admin failed (non-fatal)", e);
  }

  return json({ status: "paid" });
});
