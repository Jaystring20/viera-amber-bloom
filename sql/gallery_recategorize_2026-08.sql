-- ═══════════════════════════════════════════════════════════════════════════════
-- Viera Amber · Illustrations category rebuild (2026-08)
-- Run this in Supabase SQL Editor (Database → SQL Editor → New query)
-- Idempotent — safe to re-run.
--
-- What this does:
--   1. Adds `umbrella` to va_gallery_chapters (fashion | lifestyle) and
--      `is_draft` to va_artworks (drafts stay hidden from the public site
--      until a real title/story is filled in).
--   2. Replaces the 7 poetic "chapters" (muses, atelier, lagos, heritage,
--      wearable, fivefor5, speaks) with the 9 plain categories from the
--      client's "Illustrations pack" PDF, grouped under Fashion /
--      Lifestyle, in the PDF's own page order.
--   3. Re-tags all 73 existing artworks to their correct new category —
--      derived by matching each existing image against the exact page it
--      appears on in the client's PDF, not guessed.
--   4. Inserts the 25 new pieces from "New illustrations.zip" as drafts
--      (title/story intentionally blank — Faith supplies these; the site
--      won't show them until she does).
--
-- Two existing pieces don't appear anywhere in the new PDF catalogue:
--   artwork_0028 "Under Lock" and artwork_0072 "Rush Hour".
-- They're placed below on a best-guess basis (0028 → Bags, matches its
-- product/bag content; 0072 → Single Illustrations, it's a portrait) so
-- nothing goes uncategorized, but confirm with Faith whether they should
-- stay, move, or retire — this was NOT in her document either way.
--
-- ⚠️ THIS IS THE ONLY FILE TO RUN. Do not run sql/gallery_setup.sql again —
-- va_artworks has no unique constraint on `seq` (its primary key is a
-- random UUID), so re-running that file's INSERT doesn't hit any conflict
-- and just duplicates every row. Step 0 below cleans up exactly that mess
-- if it already happened; it's a no-op if it didn't.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 0. De-duplicate va_artworks, if gallery_setup.sql was run more than
-- once ─────────────────────────────────────────────────────────────────────
-- Keeps one row per seq (the lowest id — an arbitrary but deterministic
-- pick since duplicate rows are byte-identical copies) and drops the rest.
-- Harmless / no-op when there are no duplicates.

delete from va_artworks a
using va_artworks b
where a.seq = b.seq
  and a.id > b.id;

-- ── 1. Schema additions ──────────────────────────────────────────────────────────

alter table va_gallery_chapters add column if not exists umbrella text;
alter table va_artworks         add column if not exists is_draft boolean not null default false;

-- Root cause of the duplication above: seq was never actually unique at the
-- DB level (va_artworks' primary key is a random uuid), so any re-run of an
-- INSERT with no matching conflict target just added more rows. This closes
-- that door for good — after this, "on conflict (seq)" below actually works,
-- and any future accidental re-run of this file (or gallery_setup.sql) is a
-- true no-op instead of a silent duplicate. (Postgres has no ADD CONSTRAINT
-- IF NOT EXISTS, hence the guard block.)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'va_artworks_seq_key') then
    alter table va_artworks add constraint va_artworks_seq_key unique (seq);
  end if;
end $$;

-- ── 2. New categories (umbrella + PDF page order) ────────────────────────────────
-- id values are stable slugs used as anchor ids on the page (#category-<id>).

insert into va_gallery_chapters (id, index_label, name, tagline, description, layout, sort_order, umbrella) values
  ('fashion-illustrations', '01', 'Fashion Illustrations', '', '', 'mosaic',  1, 'fashion'),
  ('bridal-designs',        '02', 'Bridal Designs',        '', '', 'mosaic',  2, 'fashion'),
  ('shoes',                 '03', 'Shoes',                 '', '', 'rail',    3, 'fashion'),
  ('bags',                  '04', 'Bags',                  '', '', 'rail',    4, 'fashion'),
  ('single-illustrations',  '05', 'Single Illustrations',  '', '', 'mosaic',  5, 'lifestyle'),
  ('product-illustrations', '06', 'Product Illustrations', '', '', 'mosaic',  6, 'lifestyle'),
  ('birthday-couple',       '07', 'Birthday & Couple Illustrations', '', '', 'mosaic', 7, 'lifestyle'),
  ('book-covers',           '08', 'Book Covers',           '', '', 'mosaic',  8, 'lifestyle'),
  ('event-programs',        '09', 'Event Programs',        '', '', 'mosaic',  9, 'lifestyle')
on conflict (id) do update set
  index_label = excluded.index_label,
  name        = excluded.name,
  layout      = excluded.layout,
  sort_order  = excluded.sort_order,
  umbrella    = excluded.umbrella;

-- ── 3. Re-tag all 73 existing artworks to their new category ────────────────────
-- Matched by exact image comparison against the client's PDF page-by-page.

update va_artworks set chapter_id = 'fashion-illustrations' where seq in
  (1,2,3,4,7,8,9,13,21,22,30,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,64,65,66,67,68,69,73);

update va_artworks set chapter_id = 'shoes' where seq in (57,58,59,60,61);

update va_artworks set chapter_id = 'bags' where seq in (29,31,32,33,62,63);

update va_artworks set chapter_id = 'single-illustrations' where seq in
  (5,6,10,11,12,14,15,16,17,18,19,20,23,24,25,26,27,70);

update va_artworks set chapter_id = 'product-illustrations' where seq in (71);

-- Not found in the new PDF catalogue — best-guess placement, flagged above.
update va_artworks set chapter_id = 'bags'                 where seq = 28; -- "Under Lock"
update va_artworks set chapter_id = 'single-illustrations'  where seq = 72; -- "Rush Hour"

-- ── 4. Retire the old poetic chapters ────────────────────────────────────────────
-- Safe now that every artwork above has been repointed to a new category id.

delete from va_gallery_chapters where id in
  ('muses','atelier','lagos','heritage','wearable','fivefor5','speaks');

-- ── 5. New pieces from "New illustrations.zip" — drafts, no title/story yet ─────
-- image_url paths assume the webp files have been deployed to /public/artworks/
-- (artwork_0074.webp … artwork_0105.webp). is_draft = true keeps these off the
-- public site until Faith supplies real title/story text and an admin clears
-- the draft flag. artwork_0099–0105 (the 2 new Bags + 5 Event Programs) were
-- extracted directly from the PDF catalogue itself, not the higher-res zip —
-- no full-resolution source existed for these at the time this was written.

insert into va_artworks (seq, title, story, chapter_id, medium, image_url, featured, is_draft) values
  (74, '', '', 'bridal-designs',       'Couture',  '/artworks/artwork_0074.webp', false, true),
  (75, '', '', 'bridal-designs',       'Couture',  '/artworks/artwork_0075.webp', false, true),
  (76, '', '', 'bridal-designs',       'Couture',  '/artworks/artwork_0076.webp', false, true),
  (77, '', '', 'bridal-designs',       'Couture',  '/artworks/artwork_0077.webp', false, true),
  (78, '', '', 'fashion-illustrations','Fashion Design', '/artworks/artwork_0078.webp', false, true),
  (79, '', '', 'fashion-illustrations','Fashion Design', '/artworks/artwork_0079.webp', false, true),
  (80, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0080.webp', false, true),
  (81, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0081.webp', false, true),
  (82, '', '', 'single-illustrations', 'Portrait', '/artworks/artwork_0082.webp', false, true),
  (83, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0083.webp', false, true),
  (84, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0084.webp', false, true),
  (85, '', '', 'single-illustrations', 'Portrait', '/artworks/artwork_0085.webp', false, true),
  (86, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0086.webp', false, true),
  (87, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0087.webp', false, true),
  (88, '', '', 'single-illustrations', 'Campaign', '/artworks/artwork_0088.webp', false, true),
  (89, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0089.webp', false, true),
  (90, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0090.webp', false, true),
  (91, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0091.webp', false, true),
  (92, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0092.webp', false, true),
  (93, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0093.webp', false, true),
  (94, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0094.webp', false, true),
  (95, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0095.webp', false, true),
  (96, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0096.webp', false, true),
  (97, '', '', 'birthday-couple',      'Portrait', '/artworks/artwork_0097.webp', false, true),
  (98, '', '', 'book-covers',          'Campaign', '/artworks/artwork_0098.webp', false, true),
  (99, '', '', 'bags',                 'Product',  '/artworks/artwork_0099.webp', false, true),
  (100, '', '', 'bags',                'Product',  '/artworks/artwork_0100.webp', false, true),
  (101, '', '', 'event-programs',      'Campaign', '/artworks/artwork_0101.webp', false, true),
  (102, '', '', 'event-programs',      'Campaign', '/artworks/artwork_0102.webp', false, true),
  (103, '', '', 'event-programs',      'Campaign', '/artworks/artwork_0103.webp', false, true),
  (104, '', '', 'event-programs',      'Campaign', '/artworks/artwork_0104.webp', false, true),
  (105, '', '', 'event-programs',      'Campaign', '/artworks/artwork_0105.webp', false, true)
on conflict (seq) do nothing;
