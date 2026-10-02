-- VAM masterclass waitlist.
--
-- Both forms (/vam and the VAM chapter on the home page) write here. The
-- /vam form already inserted into this table, but it had never been
-- created, so every sign-up failed; the home form saved nothing at all.
--
-- Visitors can add themselves but never read the list; only emails in
-- va_admins (the dashboard login) can read or remove entries. One row per
-- email, case-insensitive: the forms treat a duplicate as "already on the list".
create table if not exists public.vam_waitlist (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  source     text not null default 'vam_page' check (source in ('vam_page', 'home')),
  created_at timestamptz not null default now()
);

create unique index if not exists vam_waitlist_email_key on public.vam_waitlist (lower(email));

alter table public.vam_waitlist enable row level security;

create policy "anyone can join vam waitlist" on public.vam_waitlist
  for insert to anon, authenticated
  with check (true);

create policy "admins read vam waitlist" on public.vam_waitlist
  for select
  using (exists (select 1 from public.va_admins where va_admins.email = (auth.jwt() ->> 'email')));

create policy "admins remove from vam waitlist" on public.vam_waitlist
  for delete
  using (exists (select 1 from public.va_admins where va_admins.email = (auth.jwt() ->> 'email')));
