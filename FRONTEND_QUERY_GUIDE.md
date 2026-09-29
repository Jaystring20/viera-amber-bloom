# Frontend Query Guide: Illustrations Database

## Overview
The `va_artworks` table now contains 103 illustrations organized into:
- **9 Chapters** (subcategories): fashion-illustrations, shoes, bags, bridal-designs, single-illustrations, product-illustrations, birthday-couple, book-covers, event-programs
- **15 Collections**: specific themed groupings
- **21 Sections**: organizing sequence from PDF extraction

---

## Basic Queries

### 1. Get All Artworks
```sql
SELECT id, seq, title, chapter_id, collection_id, image_url 
FROM va_artworks 
ORDER BY seq ASC;
```

### 2. Get Artworks by Chapter (Category)
```sql
-- Fashion Illustrations
SELECT id, seq, title, collection_id, image_url 
FROM va_artworks 
WHERE chapter_id = 'fashion-illustrations' 
ORDER BY seq ASC;

-- Shoes
SELECT id, seq, title, collection_id, image_url 
FROM va_artworks 
WHERE chapter_id = 'shoes' 
ORDER BY seq ASC;

-- Single Illustrations
SELECT id, seq, title, collection_id, image_url 
FROM va_artworks 
WHERE chapter_id = 'single-illustrations' 
ORDER BY seq ASC;
```

### 3. Get All Chapters (for Browse menu)
```sql
SELECT DISTINCT chapter_id 
FROM va_artworks 
ORDER BY chapter_id ASC;
```

---

## Collection Queries

### 4. Get Artworks by Collection
```sql
-- #5for5 Campaign
SELECT id, seq, title, chapter_id, image_url 
FROM va_artworks 
WHERE collection_id = 'five-for-five' 
ORDER BY seq ASC;

-- Eden Collection
SELECT id, seq, title, chapter_id, image_url 
FROM va_artworks 
WHERE collection_id = 'eden-collection' 
ORDER BY seq ASC;

-- To Lo Pa Chief Shoe Collection
SELECT id, seq, title, chapter_id, image_url 
FROM va_artworks 
WHERE collection_id = 'ta-lo-pa-chief' 
ORDER BY seq ASC;
```

### 5. Get All Collections (for Collection browser)
```sql
SELECT DISTINCT collection_id 
FROM va_artworks 
WHERE collection_id IS NOT NULL 
ORDER BY collection_id ASC;
```

### 6. Get Collections within a Chapter
```sql
SELECT DISTINCT collection_id 
FROM va_artworks 
WHERE chapter_id = 'fashion-illustrations' 
  AND collection_id IS NOT NULL 
ORDER BY collection_id ASC;
```

---

## Section-Based Queries

### 7. Get Artwork Count by Chapter
```sql
SELECT chapter_id, COUNT(*) as artwork_count 
FROM va_artworks 
GROUP BY chapter_id 
ORDER BY chapter_id ASC;
```

### 8. Get Section Information
```sql
-- Get all artworks organized by extraction sequence (1-103)
SELECT seq, chapter_id, collection_id, title, image_url 
FROM va_artworks 
ORDER BY seq ASC;
```

### 9. Get Artworks by Sequence Range (for pagination)
```sql
-- Section 1 (artworks 1-3)
SELECT * FROM va_artworks WHERE seq BETWEEN 1 AND 3 ORDER BY seq;

-- Section 10 (artworks 48-52)
SELECT * FROM va_artworks WHERE seq BETWEEN 48 AND 52 ORDER BY seq;
```

---

## Advanced Queries

### 10. Get Chapter with Collection Breakdown
```sql
SELECT chapter_id, collection_id, COUNT(*) as count 
FROM va_artworks 
GROUP BY chapter_id, collection_id 
ORDER BY chapter_id, collection_id;
```

### 11. Full Featured Query (Single Artwork)
```sql
SELECT 
    id,
    seq,
    title,
    story,
    medium,
    chapter_id,
    collection_id,
    image_url,
    featured,
    is_draft,
    created_at
FROM va_artworks 
WHERE seq = 1;
```

### 12. Search by Title or Story
```sql
SELECT id, seq, title, chapter_id, collection_id, image_url 
FROM va_artworks 
WHERE title ILIKE '%keyword%' 
   OR story ILIKE '%keyword%' 
ORDER BY seq ASC;
```

---

## Frontend Implementation Patterns

### Pattern 1: Browse by Category
```javascript
// Get chapters for dropdown menu
const chapters = await supabase
  .from('va_artworks')
  .select('chapter_id')
  .neq('chapter_id', null)
  .distinct()
  .order('chapter_id');

// Then fetch artworks for selected chapter
const artworks = await supabase
  .from('va_artworks')
  .select('*')
  .eq('chapter_id', selectedChapter)
  .order('seq');
```

### Pattern 2: Filter by Collection
```javascript
// Get collections in selected chapter
const collections = await supabase
  .from('va_artworks')
  .select('collection_id')
  .eq('chapter_id', selectedChapter)
  .neq('collection_id', null)
  .distinct();

// Get artworks in selected collection
const artworks = await supabase
  .from('va_artworks')
  .select('*')
  .eq('collection_id', selectedCollection)
  .order('seq');
```

### Pattern 3: Sequential Browse (by Section)
```javascript
// Section 1: 3 artworks (seq 1-3)
// Section 2: 10 artworks (seq 4-13)
// etc.

const sectionArtworks = await supabase
  .from('va_artworks')
  .select('*')
  .gte('seq', startSeq)
  .lte('seq', endSeq)
  .order('seq');
```

---

## Section Map Reference

| Section | Seq Range | Chapter | Collection | Count |
|---------|-----------|---------|------------|-------|
| 1 | 1-3 | fashion-illustrations | NULL | 3 |
| 2 | 4-13 | fashion-illustrations | NULL | 10 |
| 3 | 14-20 | fashion-illustrations | eden-collection | 7 |
| 4 | 21-25 | fashion-illustrations | oppenheimer-barbie, time-will-tell | 5 |
| 5 | 26-30 | fashion-illustrations | five-for-five | 5 |
| 6 | 31-34 | fashion-illustrations | NULL | 4 |
| 7 | 35-36 | fashion-illustrations | NULL | 2 |
| 8 | 37-43 | fashion-illustrations | NULL | 7 |
| 9 | 44-47 | bridal-designs | NULL | 4 |
| 10 | 48-52 | shoes | ta-lo-pa-chief | 5 |
| 11 | 53-54 | bags | ride-or-die-bags | 2 |
| 12 | 55-60 | bags | aski-eko-bag | 6 |
| 13 | 61-66 | single-illustrations | NULL | 6 |
| 14 | 67-70 | single-illustrations | NULL | 4 |
| 15 | 71-83 | single-illustrations | NULL | 13 |
| 16 | 84-87 | single-illustrations | christmas-new-year | 4 |
| 17 | 88 | product-illustrations | NULL | 1 |
| 18 | 89-96 | birthday-couple | NULL | 8 |
| 19 | 97 | birthday-couple | NULL | 1 |
| 20 | 98 | book-covers | NULL | 1 |
| 21 | 99-103 | event-programs | NULL | 5 |

---

## Chapter Summary

### Fashion Illustration (60 artworks)
- **fashion-illustrations** (48 artworks)
  - Collections: eden-collection, oppenheimer-barbie, time-will-tell, five-for-five
- **bridal-designs** (4 artworks)
- **shoes** (5 artworks)
  - Collection: ta-lo-pa-chief
- **bags** (8 artworks)
  - Collections: ride-or-die-bags, aski-eko-bag

### Lifestyle Illustration (43 artworks)
- **single-illustrations** (27 artworks)
  - Collection: christmas-new-year
- **product-illustrations** (1 artwork)
- **birthday-couple** (9 artworks)
- **book-covers** (1 artwork)
- **event-programs** (5 artworks)

---

## Performance Considerations

✅ **Indexed Columns**: `chapter_id`, `collection_id`, `seq`
✅ **Query Performance**: All queries use indexed columns - O(log n)
✅ **Pagination**: Use `seq` column for efficient range queries
✅ **Caching**: Results can be cached by chapter/collection (unlikely to change)

---

## Notes for Frontend Team

1. **Always order by `seq`** to maintain PDF extraction order
2. **Collections can be NULL** — not all artworks have a collection
3. **103 total artworks** — use this for validation
4. **Medium is "Digital Illustration"** for all artworks
5. **Draft status**: All artworks have `is_draft = false` (published)
6. **No featured artworks yet** — `featured = false` for all (can be updated later)

