# Artwork to Collection Mapping (From gallery-data.ts)

## Summary of Current Assignments

All 16 collections have artworks assigned. The database has detailed mappings showing which artwork belongs to which collection via the `collectionId` field.

**KEY INSIGHT:** 
The artworks are ALREADY properly assigned in gallery-data.ts to their collections! The issue is that:

1. Some artworks have `collectionId` set (themed collections)
2. But their `chapter` field might not match the collection's `categoryId`
3. For the page to render collections properly, we need to display artworks where `collectionId` matches

## Current Assignment Summary:

- **red-wine-dress**: artwork_0024
- **corn-row-dress**: artwork_0026  
- **teyana-met-gala-2025**: artwork_0044
- **eden-collection**: artworks_0036-0042, 0069
- **oppenheimer-barbie**: artworks_0052-0053
- **time-will-tell**: artworks_0054-0056
- **five-for-five**: artworks_0064-0068
- **portrait-series**: artwork_0073
- **couture-signatures**: artworks_0001-0002, 0004, 0008-0009, 0013, 0022, 0034, 0043, 0045-0046, 0049
- **editorial-stories**: artworks_0006-0007, 0011-0012, 0014-0020, 0023, 0025, 0027, 0035
- **ta-lo-pa-chief**: artworks_0057-0061 (shoes)
- **ride-or-die-bags**: artworks_0028-0029, 0062-0063
- **aski-eko-bag**: artworks_0030-0033, 0062-0063, 0071
- **formal-ceremonial-couture**: artworks_0003, 0047-0048, 0050-0051
- **christmas-new-year**: artwork_0020 (and possibly others)

## Next Action

The page is already collection-based, so it SHOULD display these collections with their assigned artworks. We just need to verify visually that these assignments match the PDF layout.
