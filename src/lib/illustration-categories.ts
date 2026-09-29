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
  /** Hue/saturation pulled from the hero artwork, used for the hero background wash. */
  hue: number;
  sat: number;
}

export const ILLUSTRATION_CATEGORIES: IllustrationCategory[] = [
  // ── Fashion Illustration ──────────────────────────────────────────────
  { id: "fashion-illustrations", name: "Fashion Illustrations", umbrella: "fashion", image: "artwork_0001.webp", hue: 355, sat: 70 },
  { id: "bridal-designs",        name: "Bridal Designs",        umbrella: "fashion", image: "artwork_0044.webp", hue: 345, sat: 35 },
  { id: "shoes",                 name: "Shoes",                 umbrella: "fashion", image: "artwork_0048.webp", hue: 25, sat: 70 },
  { id: "bags",                  name: "Bags",                  umbrella: "fashion", image: "artwork_0053.webp", hue: 335, sat: 70 },
  // ── Lifestyle Illustration ────────────────────────────────────────────
  { id: "single-illustrations",  name: "Single Illustrations",  umbrella: "lifestyle", image: "artwork_0080.webp", hue: 25, sat: 47 },
  { id: "product-illustrations", name: "Product Illustrations", umbrella: "lifestyle", image: "artwork_0088.webp", hue: 45, sat: 56 },
  { id: "birthday-couple",       name: "Birthday & Couple Illustrations", umbrella: "lifestyle", image: "artwork_0089.webp", hue: 25, sat: 51 },
  { id: "book-covers",           name: "Book Covers",           umbrella: "lifestyle", image: "artwork_0098.webp", hue: 5, sat: 70 },
  { id: "event-programs",        name: "Event Programs",        umbrella: "lifestyle", image: "artwork_0099.webp", hue: 30, sat: 8 },
];

export const categoryAnchorId = (id: string) => `category-${id}`;

/** Scrolls to a category's section further down the Illustrations page body. */
export const scrollToCategory = (id: string, behavior: ScrollBehavior = "smooth") => {
  const el = document.getElementById(categoryAnchorId(id));
  if (el) el.scrollIntoView({ behavior, block: "start" });
};
