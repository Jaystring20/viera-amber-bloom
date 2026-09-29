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
  // FASHION ILLUSTRATION COLLECTIONS
  { id: "section-1", number: 1, name: "The red-wine dress", description: "If red wine was a dress, she would be a captivating blend of elegance and complexity.", seq_start: 1, seq_end: 3 },
  { id: "section-2", number: 2, name: "The Corn-row dress", description: "Inspired by the Nigerian corn row \"all-back\" traditional hairstyles.", seq_start: 4, seq_end: 6 },
  { id: "section-3", number: 3, name: "The Teyana Taylor's 2025 Met gala inspired outfit", description: "", seq_start: 7, seq_end: 9 },
  { id: "section-4", number: 4, name: "The Eden collection", description: "Inspired by the Biblical story of creation.", seq_start: 10, seq_end: 16 },
  { id: "section-5", number: 5, name: "The Oppenheimer-Barbie collection", description: "Inspired by the movies.", seq_start: 17, seq_end: 18 },
  { id: "section-6", number: 6, name: "Time will tell collection", description: "Inspired by the way man has told time over the years.", seq_start: 19, seq_end: 21 },
  { id: "section-7", number: 7, name: "#5for5 collection", description: "An artistic expression of advocacy for human rights and good governance in Nigeria during the October 2020 #EndSARS protest.", seq_start: 22, seq_end: 26 },
  { id: "section-8", number: 8, name: "A 7-day ready to wear collection", description: "", seq_start: 27, seq_end: 33 },
  { id: "section-9", number: 9, name: "Bridal Designs", description: "", seq_start: 34, seq_end: 40 },
  { id: "section-10", number: 10, name: "Ta lo pa chief Shoe collection", description: "Inspired by lagos crime stories.", seq_start: 41, seq_end: 45 },
  { id: "section-11", number: 11, name: "The ride or die bags", description: "Inspired by the steering wheels of cars such as Tesla.", seq_start: 46, seq_end: 47 },
  { id: "section-12", number: 12, name: "The sisi Eko bag collection", description: "Inspired by elements of Lagos traffic.", seq_start: 48, seq_end: 53 },

  // LIFESTYLE ILLUSTRATION COLLECTIONS
  { id: "section-13", number: 13, name: "Single Illustrations", description: "", seq_start: 54, seq_end: 57 },
  { id: "section-14", number: 14, name: "IWD theme inspired Illustrations", description: "", seq_start: 58, seq_end: 61 },
  { id: "section-15", number: 15, name: "Christmas and New year illustrations", description: "", seq_start: 62, seq_end: 65 },
  { id: "section-16", number: 16, name: "Malta Guinness", description: "", seq_start: 66, seq_end: 66 },
  { id: "section-17", number: 17, name: "Birthday & Couple Illustrations", description: "", seq_start: 67, seq_end: 75 },
  { id: "section-18", number: 18, name: "Book Covers", description: "", seq_start: 76, seq_end: 76 },
  { id: "section-19", number: 19, name: "Event Programs", description: "", seq_start: 77, seq_end: 103 },
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
  // Section 1: The red-wine dress (seq 1-3)
  ...Array.from({ length: 3 }, (_, i) => mk(1 + i, "fashion-illustrations")),

  // Section 2: The Corn-row dress (seq 4-6)
  ...Array.from({ length: 3 }, (_, i) => mk(4 + i, "fashion-illustrations")),

  // Section 3: The Teyana Taylor's 2025 Met gala inspired outfit (seq 7-9)
  ...Array.from({ length: 3 }, (_, i) => mk(7 + i, "fashion-illustrations")),

  // Section 4: The Eden collection (seq 10-16)
  ...Array.from({ length: 7 }, (_, i) => mk(10 + i, "fashion-illustrations")),

  // Section 5: The Oppenheimer-Barbie collection (seq 17-18)
  ...Array.from({ length: 2 }, (_, i) => mk(17 + i, "fashion-illustrations")),

  // Section 6: Time will tell collection (seq 19-21)
  ...Array.from({ length: 3 }, (_, i) => mk(19 + i, "fashion-illustrations")),

  // Section 7: #5for5 collection (seq 22-26)
  ...Array.from({ length: 5 }, (_, i) => mk(22 + i, "fashion-illustrations")),

  // Section 8: A 7-day ready to wear collection (seq 27-33)
  ...Array.from({ length: 7 }, (_, i) => mk(27 + i, "fashion-illustrations")),

  // Section 9: Bridal Designs (seq 34-40)
  ...Array.from({ length: 7 }, (_, i) => mk(34 + i, "bridal-designs")),

  // Section 10: Ta lo pa chief Shoe collection (seq 41-45)
  ...Array.from({ length: 5 }, (_, i) => mk(41 + i, "shoes")),

  // Section 11: The ride or die bags (seq 46-47)
  ...Array.from({ length: 2 }, (_, i) => mk(46 + i, "bags")),

  // Section 12: The sisi Eko bag collection (seq 48-53)
  ...Array.from({ length: 6 }, (_, i) => mk(48 + i, "bags")),

  // Section 13: Single Illustrations (seq 54-57)
  ...Array.from({ length: 4 }, (_, i) => mk(54 + i, "single-illustrations")),

  // Section 14: IWD theme inspired Illustrations (seq 58-61)
  ...Array.from({ length: 4 }, (_, i) => mk(58 + i, "single-illustrations")),

  // Section 15: Christmas and New year illustrations (seq 62-65)
  ...Array.from({ length: 4 }, (_, i) => mk(62 + i, "single-illustrations")),

  // Section 16: Malta Guinness (seq 66)
  mk(66, "product-illustrations"),

  // Section 17: Birthday & Couple Illustrations (seq 67-75)
  ...Array.from({ length: 9 }, (_, i) => mk(67 + i, "birthday-couple")),

  // Section 18: Book Covers (seq 76)
  mk(76, "book-covers"),

  // Section 19: Event Programs (seq 77-103)
  ...Array.from({ length: 27 }, (_, i) => mk(77 + i, "event-programs")),
];
