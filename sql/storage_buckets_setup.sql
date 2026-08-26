-- ═══════════════════════════════════════════════════════════════════════════
-- Storage buckets — 'gallery' and 'viva-assets'
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WHY THIS FILE EXISTS
--
-- Every image upload in the admin was failing with "Bucket not found"
-- (NoSuchBucket). Neither bucket had ever been created. sql/gallery_setup.sql
-- documented 'gallery' as a MANUAL dashboard step:
--
--     -- Create the 'gallery' bucket manually in Supabase:
--     --   Storage → New bucket → Name: gallery → Public: ON
--
-- A manual step in a comment is a step that eventually does not happen, and
-- this is what that looks like in production. Nothing in the app can create a
-- bucket at runtime — the publishable key has no such right — so the upload
-- can only ever fail until this is run. Codifying it here so the setup is
-- reproducible on a fresh project instead of living in a comment.
--
-- Buckets in use, from the code:
--   gallery      — GalleryAdminTab.tsx:158      (artworks/)
--                  VAGINImagesAdminTab.tsx:135  (vagin/)
--   viva-assets  — AdminProducts.tsx:748        (VIVA product photos)
--
-- Safe to re-run: every statement is idempotent.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1. Create the buckets ────────────────────────────────────────────────────
-- public = true so getPublicUrl() resolves. Public affects READ only; writes
-- are still gated by the policies in section 2.

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('viva-assets', 'viva-assets', true)
on conflict (id) do update set public = true;


-- ── 2. Policies on storage.objects ───────────────────────────────────────────
-- Creating a bucket alone is NOT enough. storage.objects has RLS on by
-- default with no policies, so an upload into a brand-new bucket fails with
-- "new row violates row-level security policy" — a different error from the
-- one that led here, and the next one you would hit without this section.
--
-- The admin gate mirrors gallery_setup.sql's va_artworks policy exactly:
-- membership in va_admins, keyed on the JWT email.

-- Public read. Matches public = true above; makes the intent explicit rather
-- than relying on the bucket flag alone.
drop policy if exists "public read gallery" on storage.objects;
create policy "public read gallery" on storage.objects
  for select using (bucket_id in ('gallery', 'viva-assets'));

-- Admin upload.
drop policy if exists "admin insert gallery" on storage.objects;
create policy "admin insert gallery" on storage.objects
  for insert with check (
    bucket_id in ('gallery', 'viva-assets')
    and exists (select 1 from va_admins where email = (auth.jwt() ->> 'email'))
  );

-- Admin overwrite. The VAGIN images tab replaces images in place, which is an
-- update rather than an insert.
drop policy if exists "admin update gallery" on storage.objects;
create policy "admin update gallery" on storage.objects
  for update using (
    bucket_id in ('gallery', 'viva-assets')
    and exists (select 1 from va_admins where email = (auth.jwt() ->> 'email'))
  );

-- Admin delete, so replaced images can be cleaned up rather than orphaned.
drop policy if exists "admin delete gallery" on storage.objects;
create policy "admin delete gallery" on storage.objects
  for delete using (
    bucket_id in ('gallery', 'viva-assets')
    and exists (select 1 from va_admins where email = (auth.jwt() ->> 'email'))
  );


-- ── 3. Verify ────────────────────────────────────────────────────────────────
-- Expect two rows, both with public = true.

select id, name, public from storage.buckets where id in ('gallery', 'viva-assets');
