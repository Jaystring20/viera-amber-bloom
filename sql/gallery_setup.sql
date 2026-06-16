-- ═══════════════════════════════════════════════════════════════════════════════
-- Viera Amber · Gallery CMS Setup (idempotent — safe to re-run)
-- Run this in Supabase SQL Editor (Database → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Tables ──────────────────────────────────────────────────────────────────

create table if not exists va_gallery_chapters (
  id          text primary key,        -- slug: muses | atelier | lagos | heritage | wearable | fivefor5 | speaks
  index_label text not null,           -- '01', '02', …
  name        text not null,
  tagline     text not null,
  description text not null,
  layout      text not null default 'mosaic',  -- mosaic | rail | feature
  sort_order  int  not null default 0
);

create table if not exists va_artworks (
  id          uuid primary key default gen_random_uuid(),
  seq         int  not null,           -- display order (= original artwork number)
  title       text not null,
  story       text not null,
  chapter_id  text references va_gallery_chapters(id) on delete set null,
  medium      text not null,           -- Portrait | Couture | Fashion Design | Product | Footwear | Campaign
  image_url   text not null,           -- /artworks/artwork_NNNN.webp  OR  Supabase Storage https://…
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── 2. Row-Level Security ──────────────────────────────────────────────────────

alter table va_gallery_chapters enable row level security;
alter table va_artworks         enable row level security;

-- public read (gallery is visible to all visitors)
drop policy if exists "public read gallery_chapters" on va_gallery_chapters;
create policy "public read gallery_chapters" on va_gallery_chapters
  for select using (true);

drop policy if exists "public read artworks" on va_artworks;
create policy "public read artworks" on va_artworks
  for select using (true);

-- admin write (must be in va_admins table)
drop policy if exists "admin write gallery_chapters" on va_gallery_chapters;
create policy "admin write gallery_chapters" on va_gallery_chapters
  for all using (
    exists (select 1 from va_admins where email = (auth.jwt() ->> 'email'))
  );

drop policy if exists "admin write artworks" on va_artworks;
create policy "admin write artworks" on va_artworks
  for all using (
    exists (select 1 from va_admins where email = (auth.jwt() ->> 'email'))
  );

-- ── 3. Storage bucket ─────────────────────────────────────────────────────────
-- Create the 'gallery' bucket manually in Supabase:
--   Storage → New bucket → Name: gallery → Public: ON
-- Then come back and run the INSERT statements below.

-- ── 4. Seed chapters ──────────────────────────────────────────────────────────

insert into va_gallery_chapters (id, index_label, name, tagline, description, layout, sort_order) values
  ('muses',    '01', 'The Named Muses',          'Every woman has a name.',
   'Before she is a style, she is a person. These portraits begin with a name and let the rest follow — Jacqueline, Wandé, Céline, Ifeyinwa — women who own their own gaze.',
   'mosaic', 1),
  ('atelier',  '02', 'The Atelier',              'From sketch to seam.',
   'The working heart of the house: garments drawn with their fabric, their cut, and their Yoruba names intact. Fashion as a mother tongue.',
   'feature', 2),
  ('lagos',    '03', 'Lagos Icons',              'The city, worn.',
   'Danfo buses, Agege bread, tomato tins, day-old newspapers — the everyday furniture of Lagos recast as objects of desire. Wit you can carry.',
   'rail', 3),
  ('heritage', '04', 'Heritage & Regalia',       'She remembers.',
   'Crowns no one handed her, robes she drew from memory. Where culture and ceremony meet the woman who refuses to forget where she comes from.',
   'mosaic', 4),
  ('wearable', '05', 'Wearable Confidence',      'Art that wears itself.',
   'The runway core — gowns and statement looks for women who decided long ago that presence is something you put on.',
   'mosaic', 5),
  ('fivefor5', '06', 'The #5for5 Collection',    'Five demands, worn.',
   'In October 2020, a generation took to the streets under one banner: #EndSARS. This collection wears the movement''s five demands — release, remembrance, justice, reform, and fair pay — turning protest into something you cannot look away from.',
   'feature', 6),
  ('speaks',   '07', 'She Speaks',               'Art with a voice.',
   'Campaigns, commemorations, and quiet manifestos — the work that steps off the page to say something out loud.',
   'mosaic', 7)
on conflict (id) do nothing;

-- ── 5. Seed artworks ──────────────────────────────────────────────────────────
-- Images served from /public/artworks/ — same paths the site already uses.
-- After seeding, upload replacements via the Gallery tab to move images to Storage.

insert into va_artworks (seq, title, story, chapter_id, medium, image_url, featured) values

-- 01 · The Named Muses
(24, 'The Hatmaker',  'She chose the hat before she chose the room. Presence was never something she asked for — it was something she wore.',  'muses', 'Portrait',       '/artworks/artwork_0024.webp', true),
(64, 'Jacqueline',   'Under the brim of her hat she keeps her own counsel — and her own crown.',                                              'muses', 'Portrait',       '/artworks/artwork_0064.webp', false),
(65, 'Wandé',        'Wrapped in colour and palm-shade, she answers to no season but her own.',                                               'muses', 'Portrait',       '/artworks/artwork_0065.webp', false),
(66, 'Céline',       'Two buns, one bow, zero apologies — softness sharpened to a point.',                                                    'muses', 'Portrait',       '/artworks/artwork_0066.webp', false),
(67, 'Ifeyinwa',     'Her name means love; her gold hoops make sure the room remembers it.',                                                   'muses', 'Portrait',       '/artworks/artwork_0067.webp', false),
(21, 'Marigold',     'She blooms loud and on purpose, the way marigolds refuse to be overlooked.',                                            'muses', 'Portrait',       '/artworks/artwork_0021.webp', false),
(70, 'Setting',      'Caught mid-transformation — rollers in, certainty already on.',                                                         'muses', 'Portrait',       '/artworks/artwork_0070.webp', false),
(72, 'Rush Hour',    'Boardroom shoulders, danfo in hand — she carries the whole city to the meeting.',                                       'muses', 'Portrait',       '/artworks/artwork_0072.webp', false),

-- 02 · The Atelier
(36, 'The Ada-Set',          'Àda — first of her time, leader of her tribe. An Aso-oke statement blazer and flowing maxi for the woman who wants more, even on a Monday.',                               'atelier', 'Fashion Design', '/artworks/artwork_0036.webp', true),
(37, 'The Ulu Shorts',       'Cuffs in the last place you''d expect them — multi-coloured Aso-oke shorts and a cropped blazer, cut for daring, unconventional women.',                                  'atelier', 'Fashion Design', '/artworks/artwork_0037.webp', false),
(38, 'The Ibari-Set',        'Magenta on a midweek mission — a corseted set for the woman sealing the contract and making friends while she''s at it.',                                                  'atelier', 'Fashion Design', '/artworks/artwork_0038.webp', false),
(39, 'The Yéwándé 3-Piece',  'Three pieces, three lives — a mix-and-match cropped blazer, short and pant for the girl who refuses to be read just one way.',                                            'atelier', 'Fashion Design', '/artworks/artwork_0039.webp', false),
(40, 'The Kikelomo Dress',   'The Friday little black dress — detachable taffeta bubble sleeves that move between classy and carefree, because Fridays should be easy.',                                 'atelier', 'Fashion Design', '/artworks/artwork_0040.webp', false),

-- 03 · Lagos Icons
(29, 'Danfo',            'The yellow bus that runs the city, shrunk to fit on your shoulder.',                                                   'lagos', 'Product',  '/artworks/artwork_0029.webp', true),
(30, 'Last Bus to Oshodi','Conductor''s call and rush-hour chaos, stitched into a clutch.',                                                     'lagos', 'Product',  '/artworks/artwork_0030.webp', false),
(28, 'Under Lock',       'A handbag that guards its secrets like a Lagos landlady guards her gate.',                                             'lagos', 'Product',  '/artworks/artwork_0028.webp', false),
(31, 'Tin Tomato',       'Every Nigerian kitchen''s hero, recast in hardware and shine.',                                                        'lagos', 'Product',  '/artworks/artwork_0031.webp', false),
(32, 'Agege',            'Soft, sweet, everywhere by morning — the people''s loaf as luxury.',                                                   'lagos', 'Product',  '/artworks/artwork_0032.webp', false),
(33, 'The Daily',        'Yesterday''s headlines, tomorrow''s accessory — news you can carry.',                                                  'lagos', 'Product',  '/artworks/artwork_0033.webp', false),
(71, 'Nala',             'Pantry staple to power accessory — flavour you wear.',                                                                 'lagos', 'Product',  '/artworks/artwork_0071.webp', false),
(62, 'Driver''s Seat',   'She holds the wheel; the bag just makes it official.',                                                                 'lagos', 'Product',  '/artworks/artwork_0062.webp', false),
(63, 'Driver''s Seat II','Same control, cleaner backdrop — the city in her rear-view.',                                                         'lagos', 'Product',  '/artworks/artwork_0063.webp', false),
(57, 'Exhibit 1',        'Evidence of a woman who walks in on her own terms.',                                                                   'lagos', 'Footwear', '/artworks/artwork_0057.webp', false),
(58, 'Exhibit 2',        'Gilded, strapped, sentence pending — guilty of glamour.',                                                              'lagos', 'Footwear', '/artworks/artwork_0058.webp', false),
(59, 'Exhibit 3',        'Streetwear with a fare-stage attitude.',                                                                               'lagos', 'Footwear', '/artworks/artwork_0059.webp', false),
(60, 'Exhibit 4',        'Boots built for arriving, never for waiting.',                                                                         'lagos', 'Footwear', '/artworks/artwork_0060.webp', false),
(61, 'Exhibit 5',        'Elevation — literal and otherwise.',                                                                                   'lagos', 'Footwear', '/artworks/artwork_0061.webp', false),

-- 04 · Heritage & Regalia
(44, 'Trial by Fire',       'She walks out of the flames dressed in her grandmother''s courage.',                                                                                                      'heritage', 'Couture',        '/artworks/artwork_0044.webp', true),
(3,  'Morning Veil',        'She wears white like a sunrise wears the sky — quietly, completely.',                                                                                                    'heritage', 'Couture',        '/artworks/artwork_0003.webp', false),
(41, 'Aso-Ibora Mesh',      'The Saturday-morning cover cloth — the wrapper of chores and childhood, remade in mesh as something worth being seen in.',                                              'heritage', 'Fashion Design', '/artworks/artwork_0041.webp', false),
(42, 'The Omo-Oba Regalia', 'Daughter of the King of kings — regalia for those who carry their Father''s presence in every stride. Ọmọ-ọba: child of royalty.',                                    'heritage', 'Fashion Design', '/artworks/artwork_0042.webp', false),
(47, 'The Oracle',          'Wrapped in dusk and prophecy, she speaks only when it matters.',                                                                                                        'heritage', 'Couture',        '/artworks/artwork_0047.webp', false),
(48, 'Forest Hymn',         'Earth tones and evening air — a hymn to where she comes from.',                                                                                                         'heritage', 'Couture',        '/artworks/artwork_0048.webp', false),
(50, 'Coronation',          'No one handed her the crown; she drew it and put it on herself.',                                                                                                       'heritage', 'Couture',        '/artworks/artwork_0050.webp', false),
(51, 'High Priestess',      'Robed in light, keeper of rites no one taught her — she remembered.',                                                                                                   'heritage', 'Couture',        '/artworks/artwork_0051.webp', false),
(68, 'The Red Room',        'Behind the velvet rope, she is the exhibit and the curator both.',                                                                                                      'heritage', 'Couture',        '/artworks/artwork_0068.webp', false),

-- 05 · Wearable Confidence
(73, 'The Golden Hour',  'Light gathers at the seams; this is what confidence looks like at dusk.',                                         'wearable', 'Couture', '/artworks/artwork_0073.webp', true),
(1,  'Pink Means Business','Soft colour, hard entrance — she made pink a power move.',                                                      'wearable', 'Couture', '/artworks/artwork_0001.webp', false),
(2,  'On Her Own Time',  'The clock runs behind her, not the other way around.',                                                            'wearable', 'Couture', '/artworks/artwork_0002.webp', false),
(4,  'First Bloom',      'Structured at the shoulder, blooming everywhere else.',                                                           'wearable', 'Couture', '/artworks/artwork_0004.webp', false),
(8,  'Plume',            'Feathered and fearless, she trails drama like perfume.',                                                          'wearable', 'Couture', '/artworks/artwork_0008.webp', false),
(9,  'Limited Edition',  'Numbered, signed, one of one — like the woman it was drawn for.',                                                 'wearable', 'Couture', '/artworks/artwork_0009.webp', false),
(10, 'Polka & Poise',    'Dots that dare you to underestimate the woman wearing them.',                                                     'wearable', 'Couture', '/artworks/artwork_0010.webp', false),
(13, 'Midnight Toast',   'Sparkler high, hem heavy with gold — here''s to her.',                                                           'wearable', 'Couture', '/artworks/artwork_0013.webp', false),
(22, 'On the Prowl',     'She wears the print the way she enters a room: already winning.',                                                 'wearable', 'Couture', '/artworks/artwork_0022.webp', false),
(34, 'Sunday Best',      'Quiet florals for a woman who knows she''s the loudest thing in the room.',                                      'wearable', 'Couture', '/artworks/artwork_0034.webp', false),
(43, 'Candy Stripe',     'Sweet on the surface, steel underneath.',                                                                        'wearable', 'Couture', '/artworks/artwork_0043.webp', false),
(45, 'Cloud Nine',       'Yards of white like weather; she is the forecast.',                                                              'wearable', 'Couture', '/artworks/artwork_0045.webp', false),
(46, 'Nightshade',       'Beautiful, a little dangerous, entirely in bloom.',                                                              'wearable', 'Couture', '/artworks/artwork_0046.webp', false),
(49, 'Ember',            'Still glowing long after the room thought she''d cooled.',                                                       'wearable', 'Couture', '/artworks/artwork_0049.webp', false),
(69, 'Smoke & Rose',     'Ash-grey drape, rose-red nerve.',                                                                                'wearable', 'Couture', '/artworks/artwork_0069.webp', false),

-- 06 · The #5for5 Collection
(52, 'Release Them',      '#5for5, demand one: the immediate release of all arrested protesters — worn like a verdict in END SARS sashes.',                              'fivefor5', 'Campaign', '/artworks/artwork_0052.webp', true),
(53, 'White Robes',       'For the civilian soldiers who never came home — now in white, remembered in every hallelujah chorus.',                                        'fivefor5', 'Campaign', '/artworks/artwork_0053.webp', false),
(54, 'Served Hot',        'Justice for every life taken — and the demand that it be served hot.',                                                                        'fivefor5', 'Campaign', '/artworks/artwork_0054.webp', false),
(55, 'Same Old Disguise', 'Fine cloth, fine name — but the same old person still hides underneath. Reform, not rebranding.',                                             'fivefor5', 'Campaign', '/artworks/artwork_0055.webp', false),
(56, 'Pay Them Well',     'Even the police know how to wear starched agbada — so pay them well, and let them protect, not prey.',                                        'fivefor5', 'Campaign', '/artworks/artwork_0056.webp', false),

-- 07 · She Speaks
(6,  'New Chapter',       'She closed the book the world wrote for her and opened a blank one.',                                               'speaks', 'Couture',   '/artworks/artwork_0006.webp', true),
(26, 'Unsilenced',        'The tape was meant to quiet her. Read it again.',                                                                   'speaks', 'Campaign',  '/artworks/artwork_0026.webp', true),
(15, 'Embrace Equity',    'Not the same start for everyone — the same chance to finish.',                                                      'speaks', 'Campaign',  '/artworks/artwork_0015.webp', false),
(16, 'One of a Kind',     'Mass-produced was never on the table.',                                                                             'speaks', 'Campaign',  '/artworks/artwork_0016.webp', false),
(17, 'Inspire Inclusion', 'Pull up a chair; better yet, build a longer table.',                                                                'speaks', 'Campaign',  '/artworks/artwork_0017.webp', false),
(18, 'Break the Bias',    'Arms crossed, mind open, line drawn.',                                                                              'speaks', 'Campaign',  '/artworks/artwork_0018.webp', false),
(25, 'First Light',       'Before she was anyone''s anything, she was someone''s whole morning.',                                             'speaks', 'Campaign',  '/artworks/artwork_0025.webp', false),
(20, 'Season''s Cards',   'A tree built from every kind word she kept.',                                                                       'speaks', 'Campaign',  '/artworks/artwork_0020.webp', false),
(19, 'Sweet Talk',        'A little colour, a little candy, a lot of intention.',                                                              'speaks', 'Campaign',  '/artworks/artwork_0019.webp', false),
(35, 'Miss Dior',         'An homage in ink — couture seen through her own eyes.',                                                             'speaks', 'Campaign',  '/artworks/artwork_0035.webp', false),
(7,  'The Last Word',     'She lets you finish. Then she finishes it.',                                                                        'speaks', 'Couture',   '/artworks/artwork_0007.webp', false),
(11, 'Return to Sender',  'Every letter she sends is addressed, first, to herself.',                                                           'speaks', 'Couture',   '/artworks/artwork_0011.webp', false),
(12, 'Off Duty',          'Even at rest, she''s the most interesting thing in the frame.',                                                    'speaks', 'Couture',   '/artworks/artwork_0012.webp', false),
(14, 'Quarter Past Her',  'Time keeps her schedule now.',                                                                                      'speaks', 'Couture',   '/artworks/artwork_0014.webp', false),
(23, 'The Queen''s Game', 'She moves last, and she moves everything.',                                                                         'speaks', 'Couture',   '/artworks/artwork_0023.webp', false),
(27, 'Forward Only',      'The sign said it; she''d already decided it.',                                                                     'speaks', 'Couture',   '/artworks/artwork_0027.webp', false),
(5,  'Love, Medium-Rare', 'Appetite without apology — she takes her pleasures seriously.',                                                     'speaks', 'Campaign',  '/artworks/artwork_0005.webp', false)

on conflict do nothing;
