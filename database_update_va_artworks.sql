-- Update va_artworks table with correct chapter_id and collection_id for batches 10-21
-- Based on PDF mapping and batch assignments

-- Batch 10: SECTION 3 - Fashion Illustration
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'couture-signatures' WHERE seq = 46; -- artwork_0046 → PDF 0016
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'formal-ceremonial-couture' WHERE seq = 47; -- artwork_0047 → PDF 0017
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'formal-ceremonial-couture' WHERE seq = 48; -- artwork_0048 → PDF 0018
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'couture-signatures' WHERE seq = 49; -- artwork_0049 → PDF 0020
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'formal-ceremonial-couture' WHERE seq = 50; -- artwork_0050 → PDF 0019

-- Batch 11: SECTION 3 (1 artwork) + SECTION 5 (4 artworks)
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'formal-ceremonial-couture' WHERE seq = 51; -- artwork_0051 → PDF 0014
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'oppenheimer-barbie' WHERE seq = 52; -- artwork_0052 → PDF 0026
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'oppenheimer-barbie' WHERE seq = 53; -- artwork_0053 → PDF 0030
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'time-will-tell' WHERE seq = 54; -- artwork_0054 → PDF 0028
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'time-will-tell' WHERE seq = 55; -- artwork_0055 → PDF 0027

-- Batch 12: SECTION 5 (1 artwork) + SECTION 10 (4 artworks)
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'time-will-tell' WHERE seq = 56; -- artwork_0056 → PDF 0029
UPDATE va_artworks SET chapter_id = 'shoes', collection_id = 'ta-lo-pa-chief' WHERE seq = 57; -- artwork_0057 → PDF 0059
UPDATE va_artworks SET chapter_id = 'shoes', collection_id = 'ta-lo-pa-chief' WHERE seq = 58; -- artwork_0058 → PDF 0055
UPDATE va_artworks SET chapter_id = 'shoes', collection_id = 'ta-lo-pa-chief' WHERE seq = 59; -- artwork_0059 → PDF 0056
UPDATE va_artworks SET chapter_id = 'shoes', collection_id = 'ta-lo-pa-chief' WHERE seq = 60; -- artwork_0060 → PDF 0057

-- Batch 13: SECTION 10 (1 artwork) + SECTION 11 (2 artworks) + SECTION 6 (2 artworks)
UPDATE va_artworks SET chapter_id = 'shoes', collection_id = 'ta-lo-pa-chief' WHERE seq = 61; -- artwork_0061 → PDF 0058
UPDATE va_artworks SET chapter_id = 'bags', collection_id = 'aski-eko-bag' WHERE seq = 62; -- artwork_0062 → PDF 0061
UPDATE va_artworks SET chapter_id = 'bags', collection_id = 'aski-eko-bag' WHERE seq = 63; -- artwork_0063 → PDF 0060
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'five-for-five' WHERE seq = 64; -- artwork_0064 → PDF 0031
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'five-for-five' WHERE seq = 65; -- artwork_0065 → PDF 0033

-- Batch 14: SECTION 6 (2 artworks) + SECTION 1 (2 artworks) + SECTION 13 (1 artwork)
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq = 66; -- artwork_0066 → PDF 0034
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'five-for-five' WHERE seq = 67; -- artwork_0067 → PDF 0032
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'teyana-met-gala-2025' WHERE seq = 68; -- artwork_0068 → PDF 0003
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'red-wine-dress' WHERE seq = 69; -- artwork_0069 → PDF 0001
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 70; -- artwork_0070 → PDF 0073

-- Batch 15: SECTION 17 (1 artwork) + SECTION 15 (1 artwork) + SECTION 1 (1 artwork) + SECTION 9 (2 artworks)
UPDATE va_artworks SET chapter_id = 'product-illustrations', collection_id = NULL WHERE seq = 71; -- artwork_0071 → PDF 0095
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 72; -- artwork_0072 → PDF 0106
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = 'corn-row-dress' WHERE seq = 73; -- artwork_0073 → PDF 0002
UPDATE va_artworks SET chapter_id = 'bridal-designs', collection_id = 'formal-ceremonial-couture' WHERE seq = 74; -- artwork_0074 → PDF 0051
UPDATE va_artworks SET chapter_id = 'bridal-designs', collection_id = 'formal-ceremonial-couture' WHERE seq = 75; -- artwork_0075 → PDF 0052

-- Batch 16: SECTION 9 (2 artworks) + SECTION 2 (2 artworks) + SECTION 15 (1 artwork)
UPDATE va_artworks SET chapter_id = 'bridal-designs', collection_id = 'formal-ceremonial-couture' WHERE seq = 76; -- artwork_0076 → PDF 0053
UPDATE va_artworks SET chapter_id = 'bridal-designs', collection_id = 'formal-ceremonial-couture' WHERE seq = 77; -- artwork_0077 → PDF 0054
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq = 78; -- artwork_0078 → PDF 0007
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq = 79; -- artwork_0079 → PDF 0007 (collision, skipped during rename)
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 80; -- artwork_0080 → PDF 0087

-- Batch 17: SECTION 15 (4 artworks) + SECTION 2 (1 artwork)
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 81; -- artwork_0081 → PDF 0090
UPDATE va_artworks SET chapter_id = 'fashion-illustrations', collection_id = NULL WHERE seq = 82; -- artwork_0082 → PDF 0006
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 83; -- artwork_0083 → PDF 0086
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 84; -- artwork_0084 → PDF 0089
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 85; -- artwork_0085 → PDF 0081

-- Batch 18: SECTION 15 (3 artworks) + SECTION 18 (2 artworks)
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 86; -- artwork_0086 → PDF 0091
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 87; -- artwork_0087 → PDF 0092
UPDATE va_artworks SET chapter_id = 'single-illustrations', collection_id = 'christmas-new-year' WHERE seq = 88; -- artwork_0088 → PDF 0094
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 89; -- artwork_0089 → PDF 0096
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 90; -- artwork_0090 → PDF 0100

-- Batch 19: SECTION 18 (5 artworks)
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 91; -- artwork_0091 → PDF 0098
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 92; -- artwork_0092 → PDF 0103
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 93; -- artwork_0093 → PDF 0104
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 94; -- artwork_0094 → PDF 0099
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 95; -- artwork_0095 → PDF 0097

-- Batch 20: SECTION 18 (2 artworks) + SECTION 20 (1 artwork) + SECTION 12 (2 artworks)
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 96; -- artwork_0096 → PDF 0101
UPDATE va_artworks SET chapter_id = 'birthday-couple', collection_id = NULL WHERE seq = 97; -- artwork_0097 → PDF 0102
UPDATE va_artworks SET chapter_id = 'book-covers', collection_id = NULL WHERE seq = 98; -- artwork_0098 → PDF 0105
UPDATE va_artworks SET chapter_id = 'bags', collection_id = 'aski-eko-bag' WHERE seq = 99; -- artwork_0099 → PDF 0067
UPDATE va_artworks SET chapter_id = 'bags', collection_id = 'aski-eko-bag' WHERE seq = 100; -- artwork_0100 → PDF 0066

-- Batch 21: SECTION 21 (5 artworks) - Event Programs
UPDATE va_artworks SET chapter_id = 'event-programs', collection_id = NULL WHERE seq = 101; -- artwork_0101 → PDF 0107
UPDATE va_artworks SET chapter_id = 'event-programs', collection_id = NULL WHERE seq = 102; -- artwork_0102 → PDF 0108
UPDATE va_artworks SET chapter_id = 'event-programs', collection_id = NULL WHERE seq = 103; -- artwork_0103 → PDF 0109
UPDATE va_artworks SET chapter_id = 'event-programs', collection_id = NULL WHERE seq = 104; -- artwork_0104 → PDF 0110
UPDATE va_artworks SET chapter_id = 'event-programs', collection_id = NULL WHERE seq = 105; -- artwork_0105 → PDF 0111
