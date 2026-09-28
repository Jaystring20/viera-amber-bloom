/**
 * Design tokens and constants for the Illustrations Gallery
 * Maps to ILLUSTRATIONS_GALLERY_DESIGN.md
 */

export const COLORS = {
  alabaster: "#FAF9F6",
  burgundy: "#6E0025",
  gold: "#D4AF37",
  cream: "#F5EDE6",
  darkText: "#221A1A",
  burgundyAlpha: "rgba(110, 0, 37, 0.14)",
  burgundyAlpha08: "rgba(110, 0, 37, 0.08)",
  goldAlpha: "rgba(212, 175, 55, 0.3)",
};

export const TYPOGRAPHY = {
  display: "Cormorant Garamond, serif",
  body: "DM Sans, sans-serif",
  sizes: {
    heroHeadline: "clamp(48px, 8vw, 56px)",
    h1: "clamp(32px, 7vw, 48px)",
    h2: "clamp(24px, 5vw, 36px)",
    h3: "clamp(18px, 3vw, 24px)",
    body: "clamp(14px, 1.5vw, 16px)",
    small: "clamp(11px, 1.2vw, 13px)",
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    loose: 1.75,
  },
};

export const SPACING = {
  heroTop: "80px",
  heroBtnGap: "40px",
  heroBottom: "96px",
  sectionPaddingTop: "24px",
  sectionPaddingBottom: "24px",
  tabHPadding: "16px",
  tabVPadding: "12px",
  gridGap: "0px", // Editorial flush alignment
  containerSidePadding: "clamp(56px, 5vw, 72px)",
  maxWidth: "1100px",
  sectionBreak: "80px",
};

export const BREAKPOINTS = {
  mobile: 375,
  tablet: 641,
  desktop: 1025,
  wide: 1441,
};

export const MOTION = {
  fadeIn: { duration: 0.4, ease: "easeOut" },
  fadeInImage: { duration: 0.4, ease: "easeOut" },
  stagger: { amount: 0.06 }, // 60ms per image
  hoverScale: { duration: 0.2, ease: "easeOut" },
  tabSwitch: { duration: 0.2, ease: "easeInOut" },
  modalEnter: { duration: 0.3, ease: "easeOut" },
  modalSlide: { duration: 0.4, ease: "easeOut" },
  modalExit: { duration: 0.2, ease: "easeIn" },
};

// Section configuration (21 sections as per FRONTEND_QUERY_GUIDE.md)
export const SECTIONS = [
  { number: 1, name: "Fashion Illustrations", seq_start: 1, seq_end: 3 },
  { number: 2, name: "Fashion Illustrations", seq_start: 4, seq_end: 13 },
  { number: 3, name: "Eden Collection", seq_start: 14, seq_end: 20 },
  { number: 4, name: "Oppenheimer & Barbie", seq_start: 21, seq_end: 25 },
  { number: 5, name: "#5for5 Campaign", seq_start: 26, seq_end: 30 },
  { number: 6, name: "Fashion Illustrations", seq_start: 31, seq_end: 34 },
  { number: 7, name: "Fashion Illustrations", seq_start: 35, seq_end: 36 },
  { number: 8, name: "Fashion Illustrations", seq_start: 37, seq_end: 43 },
  { number: 9, name: "Bridal Designs", seq_start: 44, seq_end: 47 },
  { number: 10, name: "Ta Lo Pa Chief", seq_start: 48, seq_end: 52 },
  { number: 11, name: "Ride or Die Bags", seq_start: 53, seq_end: 54 },
  { number: 12, name: "Aski Eko Bag", seq_start: 55, seq_end: 60 },
  { number: 13, name: "Single Illustrations", seq_start: 61, seq_end: 66 },
  { number: 14, name: "Single Illustrations", seq_start: 67, seq_end: 70 },
  { number: 15, name: "Single Illustrations", seq_start: 71, seq_end: 83 },
  { number: 16, name: "Christmas & New Year", seq_start: 84, seq_end: 87 },
  { number: 17, name: "Product Illustrations", seq_start: 88, seq_end: 88 },
  { number: 18, name: "Birthday & Couple", seq_start: 89, seq_end: 96 },
  { number: 19, name: "Birthday & Couple", seq_start: 97, seq_end: 97 },
  { number: 20, name: "Book Covers", seq_start: 98, seq_end: 98 },
  { number: 21, name: "Event Programs", seq_start: 99, seq_end: 103 },
];

// Two-tier category structure
export const MAIN_CATEGORIES = {
  fashion: {
    label: "Fashion Illustration",
    subcategories: ["fashion-illustrations", "bridal-designs", "shoes", "bags"],
  },
  lifestyle: {
    label: "Lifestyle Illustration",
    subcategories: [
      "single-illustrations",
      "product-illustrations",
      "birthday-couple",
      "book-covers",
      "event-programs",
    ],
  },
};

// Subcategory display names
export const SUBCATEGORY_LABELS: Record<string, string> = {
  "fashion-illustrations": "Fashion Illustrations",
  "bridal-designs": "Bridal Designs",
  shoes: "Shoes",
  bags: "Bags",
  "single-illustrations": "Single Illustrations",
  "product-illustrations": "Product Illustrations",
  "birthday-couple": "Birthday & Couple",
  "book-covers": "Book Covers",
  "event-programs": "Event Programs",
};
