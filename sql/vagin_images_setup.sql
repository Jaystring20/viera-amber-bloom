-- ═══════════════════════════════════════════════════════════════════════════════
-- Viera Amber · VAGIN Site Images CMS Setup (idempotent — safe to re-run)
-- Run this in Supabase SQL Editor (Database → SQL Editor → New query)
--
-- Lets admins swap / upload / delete the photos shown on the VAGIN page
-- from the dashboard (VAGIN Images tab), without touching code.
-- Uploads reuse the existing public 'gallery' storage bucket (folder vagin/).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Table ───────────────────────────────────────────────────────────────────

create table if not exists va_vagin_images (
  id         uuid primary key default gen_random_uuid(),
  slot       text unique not null,   -- stable key referenced by the site (e.g. vagin_team_01)
  label      text not null,          -- human-friendly name shown in the admin
  section    text not null default 'General',  -- where on the page it appears
  image_url  text not null,          -- /vagin-images/… OR Supabase Storage https://…
  sort_order int  not null default 0,
  updated_at timestamptz not null default now()
);

-- ── 2. Row-Level Security ──────────────────────────────────────────────────────

alter table va_vagin_images enable row level security;

-- public read (site visitors need the image URLs)
drop policy if exists "public read vagin_images" on va_vagin_images;
create policy "public read vagin_images" on va_vagin_images
  for select using (true);

-- admin write (must be in va_admins table — same rule as the gallery)
drop policy if exists "admin write vagin_images" on va_vagin_images;
create policy "admin write vagin_images" on va_vagin_images
  for all using (
    exists (select 1 from va_admins where email = (auth.jwt() ->> 'email'))
  );

-- ── 3. Seed slots with the current static images ───────────────────────────────
-- Slots are stable keys; replacing an image just updates image_url.

insert into va_vagin_images (slot, label, section, image_url, sort_order) values
  ('vagin_team_01',        'Community event — girls celebrating', 'Hero photo cluster',   '/vagin-images/vagin_team_01.webp',        1),
  ('vagin_team_02',        'Community outreach — two women',      'Hero photo cluster',   '/vagin-images/vagin_team_02.webp',        2),
  ('vagin_team_03',        'Clegg Girls Senior High School',      'Hero photo cluster',   '/vagin-images/vagin_team_03.webp',        3),
  ('vagin_malawi_01',      'Malawi session 1',                    'Malawi field work',    '/vagin-images/vagin_malawi_01.webp',      4),
  ('vagin_malawi_02',      'Malawi session 2',                    'Malawi field work',    '/vagin-images/vagin_malawi_02.webp',      5),
  ('vagin_malawi_03',      'Malawi session 3',                    'Malawi field work',    '/vagin-images/vagin_malawi_03.webp',      6),
  ('vagin_malawi_04',      'Malawi session 4',                    'Malawi field work',    '/vagin-images/vagin_malawi_04.webp',      7),
  ('vagin_page_05_img_2',  'Session photo A',                     'Session snapshots',    '/vagin-images/vagin_page_05_img_2.webp',  8),
  ('vagin_page_06_img_1',  'Session photo B',                     'Session snapshots',    '/vagin-images/vagin_page_06_img_1.webp',  9),
  ('vagin_page_08_img_3',  'Session photo C',                     'Session snapshots',    '/vagin-images/vagin_page_08_img_3.webp', 10),
  -- 'Meet the Team' renders every row in this section, so admins can add/remove
  ('vagin_meet_01',        'Community Outreach',                  'Meet the Team',        '/vagin-images/vagin_team_01.webp',       11),
  ('vagin_meet_02',        'Clegg Girls Senior High',             'Meet the Team',        '/vagin-images/vagin_team_03.webp',       12),
  ('vagin_meet_03',        'Field Team',                          'Meet the Team',        '/vagin-images/vagin_malawi_02.webp',     13)
on conflict (slot) do nothing;
