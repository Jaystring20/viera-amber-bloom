-- ═══════════════════════════════════════════════════════════════════════════════
-- Viera Amber · Add collections layer to illustration taxonomy (2026-08)
-- Collections are optional sub-groupings within categories for themed sets.
-- Most artworks are standalone (collection_id = null).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Schema additions ──────────────────────────────────────────────────────────

-- New table: va_illustration_collections
-- Holds all themed collections, keyed by category + name.
create table if not exists public.va_illustration_collections (
  id text primary key,
  category_id text not null references public.va_gallery_chapters(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policy
alter table public.va_illustration_collections enable row level security;
create policy "collections are viewable by everyone" on public.va_illustration_collections
  for select using (true);

-- Add collection_id to va_artworks (nullable — most pieces are standalone)
alter table public.va_artworks add column if not exists collection_id text references public.va_illustration_collections(id) on delete set null;

-- Add collection_segment column to va_artworks for Time Will Tell sub-segments (Past/Present/Future)
alter table public.va_artworks add column if not exists collection_segment text;

-- ── 2. Fashion Illustrations Collections ─────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('red-wine-dress', 'fashion-illustrations', 'The Red-Wine Dress', 'If red wine was a dress, she would be a captivating blend of elegance and sophistication.', 10),
  ('corn-row-dress', 'fashion-illustrations', 'The Corn-Row Dress', 'Inspired by the Nigerian corn row "all-back" hairstyles.', 20),
  ('teyana-met-gala-2025', 'fashion-illustrations', 'The Teyana Taylor''s 2025 Met Gala', 'Inspired by the Teyana Taylor 2025 Met Gala look.', 30),
  ('eden-collection', 'fashion-illustrations', 'The Eden Collection', 'Inspired by the Biblical story of creation.', 40),
  ('oppenheimer-barbie', 'fashion-illustrations', 'The Oppenheimer-Barbie Collection', 'Inspired by the blockbuster films.', 50),
  ('time-will-tell', 'fashion-illustrations', 'Time Will Tell Collection', 'Inspired by how men dressed over the years. Segments: Past, Present, Future.', 60),
  ('five-for-five', 'fashion-illustrations', '#5for5 Campaign', 'An artistic expression of advocacy for human rights and good governance in Nigeria during the October 2020 #EndSARS protest.', 70),
  ('portrait-series', 'fashion-illustrations', 'Portrait Series', 'Editorial portraiture with sophisticated styling and jewelry focus.', 80),
  ('couture-signatures', 'fashion-illustrations', 'Couture Signatures', 'A collection of elegant, sophisticated couture pieces celebrating refined femininity and presence.', 100),
  ('editorial-stories', 'fashion-illustrations', 'Editorial Stories', 'Narrative-driven illustrations exploring themes of identity, empowerment, and cultural celebration.', 110);

-- ── 3. Bridal Designs Collections ───────────────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('formal-ceremonial-couture', 'bridal-designs', 'Formal & Ceremonial Couture', 'A curated collection of formal and ceremonial couture pieces, celebrating heritage, regalia, and the majesty of ritual occasions.', 10);

-- ── 4. Shoes Collections ─────────────────────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('ta-lo-pa-chief', 'shoes', 'Ta Lo Pa Chief Shoe Collection', 'Inspired by Lagos crime stories. Numbered evidence-tag styled platform clogs.', 10);

-- ── 5. Bags Collections ──────────────────────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('ride-or-die-bags', 'bags', 'The Ride or Die Bags', 'Inspired by the steering wheels of cars such as Tesla.', 10),
  ('aski-eko-bag', 'bags', 'The Aski Eko Bag Collection', 'Inspired by elements of Lagos traffic. Danfo-bus styled accessories.', 20);

-- ── 6. Single Illustrations Collections ───────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('christmas-new-year', 'single-illustrations', 'Christmas and New Year Illustrations', 'Seasonal lifestyle illustrations celebrating the festive period.', 10);

-- ── 7. Tag existing artworks to collections ────────────────────────────────────────
-- This mapping is based on the PDF page-by-page analysis and the screenshots provided.
-- All 73 published artworks are now assigned to collections.

-- Fashion Illustrations: The Red-Wine Dress (Seq 24)
update va_artworks set collection_id = 'red-wine-dress' where seq = 24;

-- Fashion Illustrations: The Corn-Row Dress (Seq 26)
update va_artworks set collection_id = 'corn-row-dress' where seq = 26;

-- Fashion Illustrations: The Teyana Taylor's 2025 Met Gala (Seq 44)
update va_artworks set collection_id = 'teyana-met-gala-2025' where seq = 44;

-- Fashion Illustrations: The Eden Collection (Seq 36–42, 69)
update va_artworks set collection_id = 'eden-collection' where seq in (36, 37, 38, 39, 40, 41, 42, 69);

-- Fashion Illustrations: The Oppenheimer-Barbie Collection (Seq 52, 53)
update va_artworks set collection_id = 'oppenheimer-barbie' where seq in (52, 53);

-- Fashion Illustrations: Time Will Tell Collection with sub-segments (Seq 54–56)
-- Past segment
update va_artworks set collection_id = 'time-will-tell', collection_segment = 'past' where seq = 54;
-- Present segment
update va_artworks set collection_id = 'time-will-tell', collection_segment = 'present' where seq = 55;
-- Future segment
update va_artworks set collection_id = 'time-will-tell', collection_segment = 'future' where seq = 56;

-- Fashion Illustrations: #5for5 Campaign (Seq 64–68)
update va_artworks set collection_id = 'five-for-five' where seq in (64, 65, 66, 67, 68);

-- Fashion Illustrations: Portrait Series (Seq 73)
update va_artworks set collection_id = 'portrait-series' where seq = 73;

-- Fashion Illustrations: Couture Signatures (Seq 1, 2, 4, 8–10, 13, 22, 34, 43, 45, 46, 49)
update va_artworks set collection_id = 'couture-signatures' where seq in (1, 2, 4, 8, 9, 10, 13, 22, 34, 43, 45, 46, 49);

-- Fashion Illustrations: Editorial Stories (Seq 5, 6, 7, 11, 12, 14–20, 23, 25, 27, 35)
update va_artworks set collection_id = 'editorial-stories' where seq in (5, 6, 7, 11, 12, 14, 15, 16, 17, 18, 19, 20, 23, 25, 27, 35);

-- Bridal Designs: Formal & Ceremonial Couture (Seq 3, 47, 48, 50, 51)
update va_artworks set collection_id = 'formal-ceremonial-couture' where seq in (3, 47, 48, 50, 51);

-- Shoes: Ta Lo Pa Chief Shoe Collection (Seq 57–61)
update va_artworks set collection_id = 'ta-lo-pa-chief' where seq in (57, 58, 59, 60, 61);

-- Bags: The Ride or Die Bags (Seq 28, 29)
update va_artworks set collection_id = 'ride-or-die-bags' where seq in (28, 29);

-- Bags: The Aski Eko Bag Collection (Seq 30–33, 62, 63, 71)
update va_artworks set collection_id = 'aski-eko-bag' where seq in (30, 31, 32, 33, 62, 63, 71);

-- Single Illustrations: Christmas & New Year (Seq 80–82, from new batch when available)
update va_artworks set collection_id = 'christmas-new-year' where seq in (80, 81, 82);

-- Standalone pieces (no collection): Seq 21, 70, 72
-- These remain ungrouped; their category affiliation is sufficient.

-- ── Notes ────────────────────────────────────────────────────────────────────────
-- Time Will Tell sub-segments are now tracked in collection_segment column.
-- Editorial Stories and Couture Signatures are new collections for previously ungrouped pieces.
-- Formal & Ceremonial Couture organizes bridal and formal pieces under the bridal-designs category.
-- Standalone pieces (21, 70, 72) belong to lifestyle but do not have a specific collection.
