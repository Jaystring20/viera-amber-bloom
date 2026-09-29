-- Reset va_artworks table - Delete all records to start fresh
DELETE FROM va_artworks;

-- Verify deletion
SELECT COUNT(*) as remaining_records FROM va_artworks;
