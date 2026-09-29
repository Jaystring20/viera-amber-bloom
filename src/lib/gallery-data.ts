// 103 Artworks from Illustrations pack.pdf - Sequential display
// Extracted in exact order: artwork_0001.webp through artwork_0103.webp

export type ChapterId =
  | "fashion-illustrations"
  | "bridal-designs"
  | "shoes"
  | "bags"
  | "single-illustrations"
  | "product-illustrations"
  | "birthday-couple"
  | "book-covers"
  | "event-programs";

export interface Artwork {
  id: string;
  seq: number;
  title: string;
  story: string;
  chapter: ChapterId;
  image: string;
}

export interface Chapter {
  id: ChapterId;
  name: string;
}

export interface Section {
  id: string;
  number: number;
  name: string;
  seq_start: number;
  seq_end: number;
}

export const CHAPTERS: Chapter[] = [
  { id: "fashion-illustrations", name: "Fashion Illustration" },
  { id: "bridal-designs", name: "Bridal Designs" },
  { id: "shoes", name: "Shoes" },
  { id: "bags", name: "Bags" },
  { id: "single-illustrations", name: "Single Illustrations" },
  { id: "product-illustrations", name: "Product Illustrations" },
  { id: "birthday-couple", name: "Birthday & Couple Illustrations" },
  { id: "book-covers", name: "Book Covers" },
  { id: "event-programs", name: "Event Programs" },
];

export const SECTIONS: Section[] = [
  { id: "section-1", number: 1, name: "Fashion Illustrations - Part 1", seq_start: 1, seq_end: 12 },
  { id: "section-2", number: 2, name: "Fashion Illustrations - Part 2", seq_start: 13, seq_end: 20 },
  { id: "section-3", number: 3, name: "Fashion Illustrations - Part 3", seq_start: 21, seq_end: 30 },
  { id: "section-4", number: 4, name: "Fashion Illustrations - Part 4", seq_start: 31, seq_end: 36 },
  { id: "section-5", number: 5, name: "Fashion Illustrations - Part 5", seq_start: 37, seq_end: 43 },
  { id: "section-6", number: 6, name: "Fashion Illustrations - Part 6", seq_start: 44, seq_end: 52 },
  { id: "section-7", number: 7, name: "Bridal Designs", seq_start: 53, seq_end: 56 },
  { id: "section-8", number: 8, name: "Shoes", seq_start: 57, seq_end: 61 },
  { id: "section-9", number: 9, name: "Bags", seq_start: 62, seq_end: 69 },
  { id: "section-10", number: 10, name: "Single Illustrations - Part 1", seq_start: 70, seq_end: 80 },
  { id: "section-11", number: 11, name: "Single Illustrations - Part 2", seq_start: 81, seq_end: 87 },
  { id: "section-12", number: 12, name: "Product Illustrations", seq_start: 88, seq_end: 88 },
  { id: "section-13", number: 13, name: "Birthday & Couple - Part 1", seq_start: 89, seq_end: 95 },
  { id: "section-14", number: 14, name: "Birthday & Couple - Part 2", seq_start: 96, seq_end: 97 },
  { id: "section-15", number: 15, name: "Book Covers", seq_start: 98, seq_end: 98 },
  { id: "section-16", number: 16, name: "Event Programs", seq_start: 99, seq_end: 103 },
  { id: "section-17", number: 17, name: "Archive", seq_start: 0, seq_end: 0 },
  { id: "section-18", number: 18, name: "Archive", seq_start: 0, seq_end: 0 },
  { id: "section-19", number: 19, name: "Archive", seq_start: 0, seq_end: 0 },
  { id: "section-20", number: 20, name: "Archive", seq_start: 0, seq_end: 0 },
  { id: "section-21", number: 21, name: "Archive", seq_start: 0, seq_end: 0 },
];

// All 103 artworks with titles and stories for first 12
function mk(seq: number, chapter: ChapterId, title: string = "", story: string = ""): Artwork {
  return {
    id: `artwork-${seq}`,
    seq,
    title: title || `Illustration ${seq}`,
    story,
    chapter,
    image: `/artworks/artwork_${String(seq).padStart(4, "0")}.webp`,
  };
}

export const ARTWORKS_103: Artwork[] = [
  // Section 1: Fashion Illustrations - Part 1 (seq 1-12) - WITH DESCRIPTIONS
  mk(1, "fashion-illustrations", "Silhouette in Motion", "A dynamic exploration of form and fabric in flowing movement"),
  mk(2, "fashion-illustrations", "Golden Hour Elegance", "Warm tones capture the essence of sophisticated evening wear"),
  mk(3, "fashion-illustrations", "Vermillion Statement", "Bold color makes a powerful fashion declaration"),
  mk(4, "fashion-illustrations", "Geometric Precision", "Clean lines and structured silhouettes define modern fashion"),
  mk(5, "fashion-illustrations", "Layered Sophistication", "Multiple textures create depth and visual interest"),
  mk(6, "fashion-illustrations", "Mineral Earth Tones", "Natural palette celebrating organic beauty"),
  mk(7, "fashion-illustrations", "Platinum Reflections", "Metallic elements bring contemporary edge to classic form"),
  mk(8, "fashion-illustrations", "Emerald Dream", "Rich jewel tones embody luxury and grace"),
  mk(9, "fashion-illustrations", "Silken Flow", "Liquid fabrics capture movement and elegance"),
  mk(10, "fashion-illustrations", "Structured Grace", "Tailoring meets artistry in perfect balance"),
  mk(11, "fashion-illustrations", "Sapphire Statement", "Deep blues convey confidence and power"),
  mk(12, "fashion-illustrations", "Minimalist Icon", "Less is more in this striking composition"),

  // Section 2: Fashion Illustrations - Part 2 (seq 13-20)
  ...Array.from({ length: 8 }, (_, i) => mk(13 + i, "fashion-illustrations")),

  // Section 3: Fashion Illustrations - Part 3 (seq 21-30)
  ...Array.from({ length: 10 }, (_, i) => mk(21 + i, "fashion-illustrations")),

  // Section 4: Fashion Illustrations - Part 4 (seq 31-36)
  ...Array.from({ length: 6 }, (_, i) => mk(31 + i, "fashion-illustrations")),

  // Section 5: Fashion Illustrations - Part 5 (seq 37-43)
  ...Array.from({ length: 7 }, (_, i) => mk(37 + i, "fashion-illustrations")),

  // Section 6: Fashion Illustrations - Part 6 (seq 44-52)
  ...Array.from({ length: 9 }, (_, i) => mk(44 + i, "fashion-illustrations")),

  // Section 7: Bridal Designs (seq 53-56)
  ...Array.from({ length: 4 }, (_, i) => mk(53 + i, "bridal-designs")),

  // Section 8: Shoes (seq 57-61)
  ...Array.from({ length: 5 }, (_, i) => mk(57 + i, "shoes")),

  // Section 9: Bags (seq 62-69)
  ...Array.from({ length: 8 }, (_, i) => mk(62 + i, "bags")),

  // Section 10: Single Illustrations - Part 1 (seq 70-80)
  ...Array.from({ length: 11 }, (_, i) => mk(70 + i, "single-illustrations")),

  // Section 11: Single Illustrations - Part 2 (seq 81-87)
  ...Array.from({ length: 7 }, (_, i) => mk(81 + i, "single-illustrations")),

  // Section 12: Product Illustrations (seq 88)
  mk(88, "product-illustrations"),

  // Section 13: Birthday & Couple - Part 1 (seq 89-95)
  ...Array.from({ length: 7 }, (_, i) => mk(89 + i, "birthday-couple")),

  // Section 14: Birthday & Couple - Part 2 (seq 96-97)
  ...Array.from({ length: 2 }, (_, i) => mk(96 + i, "birthday-couple")),

  // Section 15: Book Covers (seq 98)
  mk(98, "book-covers"),

  // Section 16: Event Programs (seq 99-103)
  ...Array.from({ length: 5 }, (_, i) => mk(99 + i, "event-programs")),
];
