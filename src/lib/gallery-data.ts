// 103 Artworks from Illustrations pack.pdf - Organized by actual collections
// Extracted from 21-page document with sections from pages 2-22

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
  description: string;
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
  { id: "section-1", number: 1, name: "", description: "", seq_start: 1, seq_end: 3 },
  { id: "section-2", number: 2, name: "", description: "", seq_start: 4, seq_end: 13 },
  { id: "section-4", number: 4, name: "The Eden collection", description: "Inspired by the Biblical story of creation.", seq_start: 14, seq_end: 20 },
  { id: "section-5", number: 5, name: "The Oppenheimer-Barbie collection", description: "Inspired by the movies.", seq_start: 21, seq_end: 22 },
  { id: "section-6", number: 6, name: "Time will tell collection", description: "Inspired by the way man has told time over the years.", seq_start: 23, seq_end: 25 },
  { id: "section-7", number: 7, name: "#5for5 collection", description: "An artistic expression of advocacy for human rights and good governance in Nigeria during the October 2020 #EndSARS protest.", seq_start: 26, seq_end: 30 },
  { id: "section-7b", number: 7, name: "", description: "", seq_start: 31, seq_end: 34 },
  { id: "section-7c", number: 7, name: "", description: "", seq_start: 35, seq_end: 36 },
  { id: "section-8", number: 8, name: "A 7-day ready to wear collection", description: "", seq_start: 37, seq_end: 43 },
  { id: "section-9", number: 9, name: "Bridal Designs", description: "", seq_start: 44, seq_end: 47 },
  { id: "section-10", number: 10, name: "Ta lo pa chief Shoe collection", description: "Inspired by lagos crime stories.", seq_start: 48, seq_end: 52 },
  { id: "section-11", number: 11, name: "The ride or die bags", description: "Inspired by the steering wheels of cars such as Tesla.", seq_start: 53, seq_end: 54 },
  { id: "section-12", number: 12, name: "The sisi Eko bag collection", description: "Inspired by elements of Lagos traffic.", seq_start: 55, seq_end: 60 },
  { id: "section-13", number: 13, name: "", description: "", seq_start: 61, seq_end: 66 },
  { id: "section-14", number: 14, name: "IWD theme inspired Illustrations", description: "", seq_start: 67, seq_end: 70 },
  { id: "section-14b", number: 14, name: "", description: "", seq_start: 71, seq_end: 83 },
  { id: "section-15", number: 15, name: "Christmas and New year illustrations", description: "", seq_start: 84, seq_end: 87 },
  { id: "section-16", number: 16, name: "Malta Guinness", description: "", seq_start: 88, seq_end: 88 },
  { id: "section-17", number: 17, name: "Birthday & Couple Illustrations", description: "", seq_start: 89, seq_end: 96 },
  { id: "section-17b", number: 17, name: "", description: "", seq_start: 97, seq_end: 97 },
  { id: "section-18", number: 18, name: "Book Covers", description: "", seq_start: 98, seq_end: 98 },
  { id: "section-19", number: 19, name: "Event Programs", description: "", seq_start: 99, seq_end: 103 },
  { id: "section-20", number: 20, name: "Archive", description: "", seq_start: 0, seq_end: 0 },
  { id: "section-21", number: 21, name: "Archive", description: "", seq_start: 0, seq_end: 0 },
];

// All 103 artworks - NO individual titles, using collection names only
function mk(seq: number, chapter: ChapterId, title: string = "", story: string = ""): Artwork {
  return {
    id: `artwork-${seq}`,
    seq,
    title: title || "", // NO generic "Illustration X" names
    story,
    chapter,
    image: `/artworks/artwork_${String(seq).padStart(4, "0")}.webp`,
  };
}

export const ARTWORKS_103: Artwork[] = [
  // Page 2 (PDF): each artwork carries its own title + description
  mk(1, "fashion-illustrations", "The red-wine dress.", "If red wine was a dress, she would be a captivating blend of elegance and complexity."),
  mk(2, "fashion-illustrations", "The Corn-row dress.", "Inspired by the Nigerian corn row “all-back” traditional hairstyles."),
  mk(3, "fashion-illustrations", "The Teyana Taylor’s 2025 Met gala inspired outfit."),

  // Placeholder (seq 4-14) until the next PDF pages are done
  ...Array.from({ length: 11 }, (_, i) => mk(4 + i, "fashion-illustrations")),

  // Section 4: The Eden collection (seq 15-18)
  ...Array.from({ length: 4 }, (_, i) => mk(15 + i, "fashion-illustrations")),

  // Section 5: The Oppenheimer-Barbie collection (seq 19-22)
  ...Array.from({ length: 4 }, (_, i) => mk(19 + i, "fashion-illustrations")),

  // Section 6: Time will tell collection (seq 23-28)
  ...Array.from({ length: 6 }, (_, i) => mk(23 + i, "fashion-illustrations")),

  // Section 7: #5for5 collection (seq 29-36)
  ...Array.from({ length: 2 }, (_, i) => mk(29 + i, "fashion-illustrations")),
  // Jacqueline: title and story restored from the pre-renumbering seed
  // (sql/gallery_setup.sql, where she was seq 64).
  mk(31, "fashion-illustrations", "Jacqueline", "Under the brim of her hat she keeps her own counsel — and her own crown."),
  ...Array.from({ length: 5 }, (_, i) => mk(32 + i, "fashion-illustrations")),

  // Section 8: A 7-day ready to wear collection (seq 37-43)
  ...Array.from({ length: 7 }, (_, i) => mk(37 + i, "fashion-illustrations")),

  // Section 9: Bridal Designs (seq 44-50)
  ...Array.from({ length: 4 }, (_, i) => mk(44 + i, "bridal-designs")),

  // Section 10: Ta lo pa chief Shoe collection (seq 51-58)
  ...Array.from({ length: 5 }, (_, i) => mk(48 + i, "shoes")),

  // Section 11: The ride or die bags (seq 59-65)
  ...Array.from({ length: 2 }, (_, i) => mk(53 + i, "bags")),

  // Section 12: The sisi Eko bag collection (seq 66-72)
  ...Array.from({ length: 6 }, (_, i) => mk(55 + i, "bags")),
  ...Array.from({ length: 27 }, (_, i) => mk(61 + i, "single-illustrations")),

  // Malta Guinness (seq 88)
  mk(88, "product-illustrations"),

  // Birthday & Couple (seq 89-97)
  ...Array.from({ length: 9 }, (_, i) => mk(89 + i, "birthday-couple")),

  // Book Covers (seq 98)
  mk(98, "book-covers"),

  // Event Programs (seq 99-103)
  ...Array.from({ length: 5 }, (_, i) => mk(99 + i, "event-programs")),
];
