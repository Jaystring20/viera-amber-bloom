-- Point the gallery's "Jacqueline" entry back at the Jacqueline image.
--
-- Why: the 29 Sep 2026 re-extraction (commit 1e1681c) renumbered
-- /public/artworks. Jacqueline moved from artwork_0064.webp to
-- artwork_0031.webp (verified by image comparison), and artwork_0064.webp
-- is now a different piece. Rows seeded by sql/gallery_setup.sql still use
-- the old path, so "Jacqueline" shows the wrong picture in the Gallery CMS.
--
-- Run in the Supabase SQL editor. Step 1 is read-only; step 2 only changes
-- a row titled Jacqueline that still points at the old file.

-- 1. Look first
select id, seq, title, image_url
from va_artworks
where title ilike 'jacqueline%'
   or image_url in ('/artworks/artwork_0064.webp', '/artworks/artwork_0031.webp')
order by seq;

-- 2. Fix
update va_artworks
set image_url = '/artworks/artwork_0031.webp'
where title ilike 'jacqueline%'
  and image_url = '/artworks/artwork_0064.webp';

-- 3. Check again (Jacqueline should now show artwork_0031.webp)
select id, seq, title, image_url
from va_artworks
where title ilike 'jacqueline%';
