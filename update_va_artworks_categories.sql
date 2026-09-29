-- Update va_artworks with chapter_id and collection_id mappings
-- Using only valid collection IDs from va_illustration_collections table

-- SECTION 1 (3 artworks): Fashion Illustrations
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq IN (1, 2, 3);

-- SECTION 2 (10 artworks): Fashion Illustrations
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq IN (4, 5, 6, 7, 8, 9, 10, 11, 12, 13);

-- SECTION 3 (7 artworks): Fashion Illustrations - Eden Collection
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'eden-collection' WHERE seq IN (14, 15, 16, 17, 18, 19, 20);

-- SECTION 4 (5 artworks): Fashion Illustrations - Oppenheimer-Barbie (2) + Time will tell (3)
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'oppenheimer-barbie' WHERE seq IN (21, 22);
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'time-will-tell' WHERE seq IN (23, 24, 25);

-- SECTION 5 (5 artworks): Fashion Illustrations - #5for5
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'five-for-five' WHERE seq IN (26, 27, 28, 29, 30);

-- SECTION 6 (4 artworks): Fashion Illustrations
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq IN (31, 32, 33, 34);

-- SECTION 7 (2 artworks): Fashion Illustrations
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq IN (35, 36);

-- SECTION 8 (7 artworks): Fashion Illustrations - 7 Day Ready to Wear (no matching collection)
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq IN (37, 38, 39, 40, 41, 42, 43);

-- SECTION 9 (4 artworks): Bridal Designs
UPDATE va_artworks SET chapter_id = 'bridal-designs', collection_id = NULL WHERE seq IN (44, 45, 46, 47);

-- SECTION 10 (5 artworks): Shoes - To Lo Pa Chief
UPDATE va_artworks SET chapter_id = 'shoes', collection_id = 'ta-lo-pa-chief' WHERE seq IN (48, 49, 50, 51, 52);

-- SECTION 11 (2 artworks): Bags - Ride or Die
UPDATE va_artworks SET chapter_id = 'bags', collection_id = 'ride-or-die-bags' WHERE seq IN (53, 54);

-- SECTION 12 (6 artworks): Bags - Sisi Eko Bag (Aski Eko Bag)
UPDATE va_artworks SET chapter_id = 'bags', collection_id = 'aski-eko-bag' WHERE seq IN (55, 56, 57, 58, 59, 60);

-- SECTION 13 (6 artworks): Single Illustrations
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = NULL WHERE seq IN (61, 62, 63, 64, 65, 66);

-- SECTION 14 (4 artworks): Single Illustrations - IWD Theme (no matching collection, using editorial-stories as fallback)
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = NULL WHERE seq IN (67, 68, 69, 70);

-- SECTION 15 (13 artworks): Single Illustrations
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = NULL WHERE seq IN (71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83);

-- SECTION 16 (4 artworks): Single Illustrations - Christmas & New Year
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq IN (84, 85, 86, 87);

-- SECTION 17 (1 artwork): Product Illustrations - Malta Guinness (no matching collection)
UPDATE va_artworks SET chapter_id = 'product-illustrations', collection_id = NULL WHERE seq = 88;

-- SECTION 18 (8 artworks): Birthday & Couple Illustration
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq IN (89, 90, 91, 92, 93, 94, 95, 96);

-- SECTION 19 (1 artwork): Birthday & Couple Illustration
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 97;

-- SECTION 20 (1 artwork): Book Covers
UPDATE va_artworks SET chapter_id = 'book-covers', collection_id = NULL WHERE seq = 98;

-- SECTION 21 (5 artworks): Event Programs
UPDATE va_artworks SET chapter_id = 'event-programs', collection_id = NULL WHERE seq IN (99, 100, 101, 102, 103);

-- Verification queries
SELECT 'Chapter Distribution' as report;
SELECT chapter_id, COUNT(*) as count FROM va_artworks GROUP BY chapter_id ORDER BY chapter_id;

SELECT '';
SELECT 'Collection Distribution' as report;
SELECT collection_id, COUNT(*) as count FROM va_artworks WHERE collection_id IS NOT NULL GROUP BY collection_id ORDER BY collection_id;

SELECT '';
SELECT 'Total Artworks' as report;
SELECT COUNT(*) as total FROM va_artworks;
