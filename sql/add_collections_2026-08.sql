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

-- ── 2. Fashion Illustrations Collections ─────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('red-wine-dress', 'fashion-illustrations', 'The Red-Wine Dress', 'If red wine was a dress, she would be a captivating blend of elegance and sophistication.', 10),
  ('corn-row-dress', 'fashion-illustrations', 'The Corn-Row Dress', 'Inspired by the Nigerian corn row "all-back" hairstyles.', 20),
  ('teyana-met-gala-2025', 'fashion-illustrations', 'The Teyana Taylor''s 2025 Met Gala', 'The Teyana Taylor''s 2025 Met gala inspired outfit.', 30),
  ('eden-collection', 'fashion-illustrations', 'The Eden Collection', 'Inspired by the Biblical story of creation.', 40),
  ('oppenheimer-barbie', 'fashion-illustrations', 'The Oppenheimer-Barbie Collection', 'Inspired by the movies.', 50),
  ('time-will-tell', 'fashion-illustrations', 'Time Will Tell Collection', 'Inspired by the way men dressed over the years. Segments: Past, Present, Future.', 60),
  ('five-for-five', 'fashion-illustrations', '#5for5 Campaign', 'An artistic expression of advocacy for human rights and good governance in Nigeria during the October 2020 #EndSARS protest.', 70),
  ('portrait-series', 'fashion-illustrations', 'Portrait Series', 'Editorial portraiture with sophisticated styling and jewelry focus.', 80),
  ('seven-day-ready-wear', 'fashion-illustrations', '7-Day Ready to Wear Collection', 'A collection of versatile, mix-and-match ready-to-wear designs with coordinated color palettes.', 90);

-- ── 3. Shoes Collections ─────────────────────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('ta-lo-pa-chief', 'shoes', 'Ta Lo Pa Chief Shoe Collection', 'Inspired by Lagos crime stories. Numbered evidence-tag styled platform clogs.', 10);

-- ── 4. Bags Collections ──────────────────────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('ride-or-die-bags', 'bags', 'The Ride or Die Bags', 'Inspired by the steering wheels of cars such as Tesla.', 10),
  ('aski-eko-bag', 'bags', 'The Aski Eko Bag Collection', 'Inspired by elements of Lagos traffic. Danfo-bus styled accessories.', 20);

-- ── 5. Single Illustrations Collections ───────────────────────────────────────────

insert into va_illustration_collections (id, category_id, name, description, sort_order) values
  ('christmas-new-year', 'single-illustrations', 'Christmas and New Year Illustrations', 'Seasonal lifestyle illustrations celebrating the festive period.', 10);

-- ── 6. Tag existing artworks to collections ────────────────────────────────────────
-- This mapping is based on the PDF page-by-page analysis and the screenshots provided.

-- Fashion Illustrations: Red-Wine Dress (artwork_0024)
update va_artworks set collection_id = 'red-wine-dress' where seq = 24;

-- Fashion Illustrations: Corn-Row Dress (artwork_0026)
update va_artworks set collection_id = 'corn-row-dress' where seq = 26;

-- Fashion Illustrations: Teyana Taylor Met Gala (artwork_0044)
update va_artworks set collection_id = 'teyana-met-gala-2025' where seq = 44;

-- Fashion Illustrations: Eden Collection (artwork_0036–0042, 0069)
update va_artworks set collection_id = 'eden-collection' where seq in (36, 37, 38, 39, 40, 41, 42, 69);

-- Fashion Illustrations: Oppenheimer-Barbie (artwork_0052, 0053)
update va_artworks set collection_id = 'oppenheimer-barbie' where seq in (52, 53);

-- Fashion Illustrations: Time Will Tell with sub-segments
-- Past (artwork_0054)
update va_artworks set collection_id = 'time-will-tell' where seq = 54;

-- Present (artwork_0055)
update va_artworks set collection_id = 'time-will-tell' where seq = 55;

-- Future (artwork_0056)
update va_artworks set collection_id = 'time-will-tell' where seq = 56;

-- Fashion Illustrations: #5for5 Campaign (artwork_0064–0068)
update va_artworks set collection_id = 'five-for-five' where seq in (64, 65, 66, 67, 68);

-- Fashion Illustrations: Portrait Series (artwork_0073 and 3 others from the 32 new)
-- Placeholder for now — will update with correct new artwork seqs

-- Shoes: Ta Lo Pa Chief (artwork_0057–0061)
update va_artworks set collection_id = 'ta-lo-pa-chief' where seq in (57, 58, 59, 60, 61);

-- Bags: Ride or Die (artwork_0028, 0029)
update va_artworks set collection_id = 'ride-or-die-bags' where seq in (28, 29);

-- Bags: Aski Eko (artwork_0062, 0063, and the 2 new ones: 0099, 0100)
update va_artworks set collection_id = 'aski-eko-bag' where seq in (62, 63, 99, 100);

-- Single Illustrations: Christmas & New Year (artwork_0080, 0081, 0082 from the new batch)
update va_artworks set collection_id = 'christmas-new-year' where seq in (80, 81, 82);

-- ── Notes ────────────────────────────────────────────────────────────────────────
-- Time Will Tell sub-segments (Past/Present/Future) need special UI handling.
-- The collection_id alone doesn't capture the sub-segment; that will be handled
-- via a collection_segment or similar field if needed. For now, all three pieces
-- share the same collection_id; UI can infer segment from artwork order or add
-- a separate metadata field.
