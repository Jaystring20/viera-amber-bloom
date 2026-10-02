-- VIVA products: admin-only writes + the fields the storefront needs.
--
-- 1. Security. The old "Admin manage" policy was FOR ALL USING (true), so
--    anyone holding the public anon key could insert, edit or delete
--    products. Writes (and reading inactive rows) are now limited to emails
--    in va_admins, the same rule va_artworks and the storage buckets use.
--    "Public read active" is unchanged: visitors still see active products.
-- Applied with ALTER POLICY (same name, new rule) rather than drop + create.
alter policy "Admin manage" on public.products
  using (exists (select 1 from public.va_admins where va_admins.email = (auth.jwt() ->> 'email')))
  with check (exists (select 1 from public.va_admins where va_admins.email = (auth.jwt() ->> 'email')));

-- 2. Fields the VIVA page groups and prices by.
--    slug             stable id; carts saved in visitors' browsers key on it
--    collection       which line the product sits under on /viva
--    purchase_options Ajogún Top Only / Pants Only / Both prices
alter table public.products
  add column if not exists slug text unique,
  add column if not exists collection text
    check (collection in ('ajogun', 'nka', 'daughters')),
  add column if not exists purchase_options jsonb;
