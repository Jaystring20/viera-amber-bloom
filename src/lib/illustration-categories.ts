// Single source of truth for the Illustrations page's category taxonomy —
// matches the client's "Illustrations pack" PDF exactly (page order, names,
// and the Fashion/Lifestyle umbrella grouping) and mirrors the `id` values
// seeded into va_gallery_chapters (sql/gallery_recategorize_2026-08.sql).
//
// Previously this list existed three times, out of sync with each other and
// with the DB: RotatingHeroCarousel and CategoryThumbnailNav each hardcoded
// their own 6-item version (most of whose ids didn't even match the
// CollectionId type CollectionPage expected — several hero clicks led to a
// blank "Collection Not Found" page), while EditorialGallery pulled a
// completely different 7-chapter poetic taxonomy from the DB. This file
// replaces all three call sites. Category order here IS the body's render
// order — the hero and "Browse by Category" row both scroll to
// `#category-<id>` further down the same page rather than navigating away.

export type Umbrella = "fashion" | "lifestyle";

export interface IllustrationCategory {
  id: string;
  name: string;
  umbrella: Umbrella;
  /** A representative image already in /public/artworks, used for hero/thumbnail art. */
  image: string;
}

export const ILLUSTRATION_CATEGORIES: IllustrationCategory[] = [
  // ── Fashion Illustration ──────────────────────────────────────────────
  { id: "fashion-illustrations", name: "Fashion Illustrations", umbrella: "fashion", image: "artwork_0001.webp" },
  { id: "bridal-designs",        name: "Bridal Designs",        umbrella: "fashion", image: "artwork_0074.webp" },
  { id: "shoes",                 name: "Shoes",                 umbrella: "fashion", image: "artwork_0057.webp" },
  { id: "bags",                  name: "Bags",                  umbrella: "fashion", image: "artwork_0029.webp" },
  // ── Lifestyle Illustration ────────────────────────────────────────────
  { id: "single-illustrations",  name: "Single Illustrations",  umbrella: "lifestyle", image: "artwork_0024.webp" },
  { id: "product-illustrations", name: "Product Illustrations", umbrella: "lifestyle", image: "artwork_0071.webp" },
  { id: "birthday-couple",       name: "Birthday & Couple Illustrations", umbrella: "lifestyle", image: "artwork_0089.webp" },
  { id: "book-covers",           name: "Book Covers",           umbrella: "lifestyle", image: "artwork_0098.webp" },
  { id: "event-programs",        name: "Event Programs",        umbrella: "lifestyle", image: "artwork_0101.webp" },
];

export const categoryAnchorId = (id: string) => `category-${id}`;

/** Scrolls to a category's section further down the Illustrations page body. */
export const scrollToCategory = (id: string, behavior: ScrollBehavior = "smooth") => {
  const el = document.getElementById(categoryAnchorId(id));
  if (el) el.scrollIntoView({ behavior, block: "start" });
};
