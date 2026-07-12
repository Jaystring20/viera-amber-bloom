-- ═══════════════════════════════════════════════════════════════════════════════
-- Viera Amber · PAD KOLO WhatsApp Bot Setup (idempotent — safe to re-run)
-- Run this in Supabase SQL Editor (Database → SQL Editor → New query)
-- Spec: https://github.com/Jaystring20/viera-amber-bloom/issues/1
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Bot session state (one row per matron phone) ────────────────────────────

create table if not exists vagin_bot_sessions (
  id               uuid primary key default gen_random_uuid(),
  phone            text unique not null,          -- E.164, e.g. +2348012345678
  matron_id        uuid references vagin_matrons(id) on delete cascade,
  state            text not null default 'IDLE',  -- IDLE | MENU | ISSUE_* | SAVE_* | STOCK_* | *_CONFIRM
  context          jsonb not null default '{}',   -- pending op: girl id, qty, type, amount
  message_count_1m int  not null default 0,       -- rate-limit counter
  window_start     timestamptz not null default now(),
  blocked_until    timestamptz,                   -- set after rate-limit breach
  expires_at       timestamptz not null default now() + interval '30 minutes',
  updated_at       timestamptz not null default now()
);

-- ── 2. Bot audit log (every message in and out) ─────────────────────────────────

create table if not exists vagin_bot_logs (
  id            uuid primary key default gen_random_uuid(),
  direction     text not null check (direction in ('in', 'out')),
  phone         text not null,
  matron_id     uuid references vagin_matrons(id) on delete set null,
  raw_text      text not null,
  parsed_intent text,                              -- ISSUE | SAVE | BAL | STOCK | UNDO | HELP | MENU | UNKNOWN | REJECTED
  session_state text,
  tx_id         uuid references vagin_transactions(id) on delete set null,
  error         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_bot_logs_created on vagin_bot_logs(created_at desc);
create index if not exists idx_bot_logs_phone   on vagin_bot_logs(phone);

-- ── 3. Bot configuration (single row) ───────────────────────────────────────────

create table if not exists vagin_bot_config (
  id               int primary key default 1 check (id = 1),
  bot_enabled      boolean not null default true,   -- kill switch
  pack_price_ngn   int     not null default 700,    -- price per PACK of pads
  undo_window_min  int     not null default 15,
  outlier_min_ngn  int     not null default 50,     -- deposits outside range get flagged
  outlier_max_ngn  int     not null default 5000,
  admin_phone      text                              -- receives stock-request forwards (P2)
);

insert into vagin_bot_config (id) values (1) on conflict (id) do nothing;

-- ── 4. Transaction void/flag support ────────────────────────────────────────────

alter table vagin_transactions add column if not exists voided        boolean not null default false;
alter table vagin_transactions add column if not exists voided_reason text;
alter table vagin_transactions add column if not exists flagged       boolean not null default false;

-- ── 5. Row-Level Security ───────────────────────────────────────────────────────
-- Admin-gated (same pattern as gallery/vagin tables). The Edge Function uses the
-- service role key and bypasses RLS; the dashboard Simulator runs as an admin.

alter table vagin_bot_sessions enable row level security;
alter table vagin_bot_logs     enable row level security;
alter table vagin_bot_config   enable row level security;

drop policy if exists "admin all bot_sessions" on vagin_bot_sessions;
create policy "admin all bot_sessions" on vagin_bot_sessions
  for all using (exists (select 1 from va_admins where email = (auth.jwt() ->> 'email')));

drop policy if exists "admin all bot_logs" on vagin_bot_logs;
create policy "admin all bot_logs" on vagin_bot_logs
  for all using (exists (select 1 from va_admins where email = (auth.jwt() ->> 'email')));

drop policy if exists "admin all bot_config" on vagin_bot_config;
create policy "admin all bot_config" on vagin_bot_config
  for all using (exists (select 1 from va_admins where email = (auth.jwt() ->> 'email')));
