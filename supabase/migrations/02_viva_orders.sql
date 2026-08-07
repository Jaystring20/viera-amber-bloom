-- ═══════════════════════════════════════════════════════════════════════
-- VIVA commerce — orders and line items
--
-- Before this, a completed checkout wrote nothing anywhere: the success
-- callback cleared the cart and that was the end of it. A paying customer
-- left no record of what they bought or where to ship it.
--
-- Security model: no client ever touches these tables. RLS is enabled with
-- NO anon/authenticated policies, so the anon key can neither read nor
-- write. All access is via the create-order / verify-payment edge
-- functions, which use the service role key and therefore bypass RLS.
-- This is deliberate — order rows carry customer addresses and phone
-- numbers, and an amount column that must never be client-writable.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Orders ────────────────────────────────────────────────────────────
create table if not exists viva_orders (
  id                 uuid primary key default gen_random_uuid(),

  -- Our own reference, generated server-side and handed to Paystack.
  -- Unique so a replayed verify call can never create a second order.
  reference          text not null unique,

  status             text not null default 'pending'
                       check (status in ('pending', 'paid', 'failed', 'abandoned')),

  currency           text not null check (currency in ('NGN', 'USD')),

  -- Stored in the minor unit (kobo / cents) exactly as Paystack expects,
  -- as an integer. Never a float — money in floating point is a bug that
  -- shows up as a one-kobo mismatch six months later.
  amount_subunit     bigint not null check (amount_subunit > 0),

  -- Delivery. These are required because the shop sells physical,
  -- made-to-measure garments; an email alone cannot be fulfilled.
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text not null,
  delivery_address   text not null,
  delivery_city      text not null,
  delivery_state     text not null,
  delivery_country   text not null default 'Nigeria',
  delivery_notes     text,

  -- What Paystack told us on verification, kept for reconciliation.
  paystack_reference text,
  paystack_status    text,
  paid_at            timestamptz,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Line items ────────────────────────────────────────────────────────
-- Prices are copied in at order time rather than joined from the
-- catalogue, so changing a product's price later never rewrites history.
create table if not exists viva_order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references viva_orders(id) on delete cascade,

  product_id          text not null,
  title               text not null,
  variant             text,

  unit_price_subunit  bigint not null check (unit_price_subunit >= 0),
  qty                 integer not null check (qty > 0 and qty <= 99),
  line_total_subunit  bigint not null check (line_total_subunit >= 0),

  created_at          timestamptz not null default now()
);

create index if not exists viva_order_items_order_id_idx on viva_order_items (order_id);
create index if not exists viva_orders_status_idx        on viva_orders (status);
create index if not exists viva_orders_created_at_idx    on viva_orders (created_at desc);
create index if not exists viva_orders_email_idx         on viva_orders (customer_email);

-- ── updated_at maintenance ────────────────────────────────────────────
create or replace function viva_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists viva_orders_touch_updated_at on viva_orders;
create trigger viva_orders_touch_updated_at
  before update on viva_orders
  for each row execute function viva_touch_updated_at();

-- ── Row level security ────────────────────────────────────────────────
-- Enabled with no policies: this denies every request that arrives with
-- the anon or authenticated role. The edge functions use the service role
-- key, which bypasses RLS entirely. Do not add an anon policy here — a
-- readable orders table leaks customer addresses, and a writable one lets
-- a browser set its own amount.
alter table viva_orders      enable row level security;
alter table viva_order_items enable row level security;

revoke all on viva_orders      from anon, authenticated;
revoke all on viva_order_items from anon, authenticated;
