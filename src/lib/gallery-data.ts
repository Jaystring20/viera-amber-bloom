// Curated collection data for the Viera Amber illustration gallery.
// 98 artworks (73 original + 25 added Aug 2026) across the 9 plain
// categories from the client's "Illustrations pack" PDF — see
// src/lib/illustration-categories.ts for the canonical list this must stay
// in sync with. This file used to group everything into 7 POETIC chapters
// (muses, atelier, lagos, heritage, wearable, fivefor5, speaks) with their
// own taglines/descriptions; the client's explicit direction was to drop
// that narrative layer entirely and use her document's plain category
// names, so ChapterId below now holds those 9 ids instead. Every artwork's
// `chapter` field was re-tagged by matching its image against the exact
// page it appears on in her PDF, not guessed.
// Image files are contiguous: artwork_0001.webp … artwork_0073.webp in
// /public/artworks, then artwork_0074.webp … artwork_0098.webp for the
// Aug 2026 addition (titles/stories intentionally blank — pending real
// copy from Faith; see the `draft` flag).

export type Medium =
  | "Portrait"
  | "Couture"
  | "Fashion Design"
  | "Product"
  | "Footwear"
  | "Campaign";

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

export type CollectionId =
  | "fashion-collections"
  | "bridal-designs"
  | "jewelry"
  | "shoes"
  | "bags"
  | "birthday-illustrations"
  | "wedding-celebrations"
  | "editorial-narratives"
  | "intimate-moments"
  | "formal-events";

export interface Artwork {
  id: string;
  n: number;
  title: string;
  story: string;
  chapter: ChapterId;
  medium: Medium;
  image: string;
  feature?: boolean;
  collection?: CollectionId;
  umbrella?: "fashion" | "lifestyle";
  /** Themed collection this piece belongs to (e.g. "eden-collection", "time-will-tell").
      Most pieces are null — only works with extra writeups/annotations have collections. */
  collectionId?: string;
  /** True for pieces with no title/story yet — kept out of the public gallery. */
  draft?: boolean;
}

export interface Chapter {
  id: ChapterId;
  index: string;
  name: string;
  tagline: string;
  description: string;
  layout: "mosaic" | "rail" | "feature";
}

export interface IllustrationCollection {
  id: string;
  categoryId: ChapterId;
  name: string;
  description?: string;
  sortOrder: number;
  /** For "Time Will Tell" and similar, optional segment label (e.g. "Past", "Present", "Future"). */
  segment?: string;
}

export const MEDIA: Medium[] = [
  "Portrait",
  "Couture",
  "Fashion Design",
  "Product",
  "Footwear",
  "Campaign",
];

// Plain category names + PDF page order, per the client's document — the
// tagline/description fields are kept (Chapter/ChapterIntro still read
// them) but intentionally empty per her direction to drop the poetic
// framing; ChapterIntro only renders them when non-empty.
export const CHAPTERS: Chapter[] = [
  { id: "fashion-illustrations", index: "01", name: "Fashion Illustrations", tagline: "", description: "", layout: "mosaic" },
  { id: "bridal-designs",        index: "02", name: "Bridal Designs",        tagline: "", description: "", layout: "mosaic" },
  { id: "shoes",                 index: "03", name: "Shoes",                 tagline: "", description: "", layout: "rail" },
  { id: "bags",                  index: "04", name: "Bags",                 tagline: "", description: "", layout: "rail" },
  { id: "single-illustrations",  index: "05", name: "Single Illustrations",  tagline: "", description: "", layout: "mosaic" },
  { id: "product-illustrations", index: "06", name: "Product Illustrations", tagline: "", description: "", layout: "mosaic" },
  { id: "birthday-couple",       index: "07", name: "Birthday & Couple Illustrations", tagline: "", description: "", layout: "mosaic" },
  { id: "book-covers",           index: "08", name: "Book Covers",           tagline: "", description: "", layout: "mosaic" },
  { id: "event-programs",        index: "09", name: "Event Programs",        tagline: "", description: "", layout: "mosaic" },
];

// Themed collections within categories. Most artworks don't belong to a
// collection (collectionId = null); only pieces with extra writeups/annotations.
export const COLLECTIONS: IllustrationCollection[] = [
  // ── Fashion Illustrations ────────────────────────────────────────────────
  { id: "red-wine-dress",        categoryId: "fashion-illustrations", name: "The Red-Wine Dress",              description: "If red wine was a dress, she would be a captivating blend of elegance and sophistication.", sortOrder: 10 },
  { id: "corn-row-dress",        categoryId: "fashion-illustrations", name: "The Corn-Row Dress",            description: "Inspired by the Nigerian corn row \"all-back\" hairstyles.", sortOrder: 20 },
  { id: "teyana-met-gala-2025",  categoryId: "fashion-illustrations", name: "The Teyana Taylor's 2025 Met Gala", description: "The Teyana Taylor's 2025 Met gala inspired outfit.", sortOrder: 30 },
  { id: "eden-collection",       categoryId: "fashion-illustrations", name: "The Eden Collection",           description: "Inspired by the Biblical story of creation.", sortOrder: 40 },
  { id: "oppenheimer-barbie",    categoryId: "fashion-illustrations", name: "The Oppenheimer-Barbie Collection", description: "Inspired by the movies.", sortOrder: 50 },
  { id: "time-will-tell",        categoryId: "fashion-illustrations", name: "Time Will Tell Collection",      description: "Inspired by the way men dressed over the years.", sortOrder: 60 },
  { id: "five-for-five",         categoryId: "fashion-illustrations", name: "#5for5 Campaign",                description: "An artistic expression of advocacy for human rights and good governance in Nigeria during the October 2020 #EndSARS protest.", sortOrder: 70 },
  { id: "portrait-series",       categoryId: "fashion-illustrations", name: "Portrait Series",               description: "Editorial portraiture with sophisticated styling and jewelry focus.", sortOrder: 80 },
  { id: "seven-day-ready-wear",  categoryId: "fashion-illustrations", name: "7-Day Ready to Wear Collection", description: "A collection of versatile, mix-and-match ready-to-wear designs with coordinated color palettes.", sortOrder: 90 },

  // ── Shoes ────────────────────────────────────────────────────────────────
  { id: "ta-lo-pa-chief",        categoryId: "shoes",                 name: "Ta Lo Pa Chief Shoe Collection", description: "Inspired by Lagos crime stories. Numbered evidence-tag styled platform clogs.", sortOrder: 10 },

  // ── Bags ─────────────────────────────────────────────────────────────────
  { id: "ride-or-die-bags",      categoryId: "bags",                  name: "The Ride or Die Bags",          description: "Inspired by the steering wheels of cars such as Tesla.", sortOrder: 10 },
  { id: "aski-eko-bag",          categoryId: "bags",                  name: "The Aski Eko Bag Collection",    description: "Inspired by elements of Lagos traffic. Danfo-bus styled accessories.", sortOrder: 20 },

  // ── Bridal Designs ──────────────────────────────────────────────────────
  { id: "formal-ceremonial-couture", categoryId: "bridal-designs", name: "Formal & Ceremonial Couture", description: "A curated collection of formal and ceremonial couture pieces, celebrating heritage, regalia, and the majesty of ritual occasions.", sortOrder: 10 },

  // ── Single Illustrations ─────────────────────────────────────────────────
  { id: "christmas-new-year",    categoryId: "single-illustrations",  name: "Christmas and New Year Illustrations", description: "Seasonal lifestyle illustrations celebrating the festive period.", sortOrder: 10 },

  // ── New groupings for previously ungrouped fashion pieces ────────────────
  { id: "couture-signatures",    categoryId: "fashion-illustrations", name: "Couture Signatures",  description: "A collection of elegant, sophisticated couture pieces celebrating refined femininity and presence.", sortOrder: 100 },
  { id: "editorial-stories",     categoryId: "fashion-illustrations", name: "Editorial Stories",   description: "Narrative-driven illustrations exploring themes of identity, empowerment, and cultural celebration.", sortOrder: 110 },
];

const img = (n: number) => `/artworks/artwork_${String(n).padStart(4, "0")}.webp`;
const mk = (
  n: number,
  title: string,
  story: string,
  chapter: ChapterId,
  medium: Medium,
  feature = false,
  collection?: CollectionId,
  umbrella?: "fashion" | "lifestyle",
  draft = false,
  collectionId?: string,
): Artwork => ({
  id: `art-${String(n).padStart(4, "0")}`,
  n,
  title,
  story,
  chapter,
  medium,
  image: img(n),
  feature,
  collection,
  umbrella,
  collectionId,
  draft,
});

export const ARTWORKS: Artwork[] = [
  // ── 01 · The Named Muses ───────────────────────────────────────────────
  mk(24, "The Hatmaker", "She chose the hat before she chose the room. Presence was never something she asked for — it was something she wore.", "single-illustrations", "Portrait", true, "jewelry", "fashion", false, "red-wine-dress"),
  mk(64, "Jacqueline", "Under the brim of her hat she keeps her own counsel — and her own crown.", "fashion-illustrations", "Portrait", false, "jewelry", "fashion", false, "five-for-five"),
  mk(65, "Wandé", "Wrapped in colour and palm-shade, she answers to no season but her own.", "fashion-illustrations", "Portrait", false, "jewelry", "fashion", false, "five-for-five"),
  mk(66, "Céline", "Two buns, one bow, zero apologies — softness sharpened to a point.", "fashion-illustrations", "Portrait", false, "jewelry", "fashion", false, "five-for-five"),
  mk(67, "Ifeyinwa", "Her name means love; her gold hoops make sure the room remembers it.", "fashion-illustrations", "Portrait", false, "jewelry", "fashion", false, "five-for-five"),
  mk(21, "Marigold", "She blooms loud and on purpose, the way marigolds refuse to be overlooked.", "fashion-illustrations", "Portrait", false, "birthday-illustrations", "lifestyle"),
  mk(70, "Setting", "Caught mid-transformation — rollers in, certainty already on.", "single-illustrations", "Portrait", false, "birthday-illustrations", "lifestyle"),
  mk(72, "Rush Hour", "Boardroom shoulders, danfo in hand — she carries the whole city to the meeting.", "single-illustrations", "Portrait", false, "formal-events", "lifestyle"),

  // ── 02 · The Atelier ───────────────────────────────────────────────────
  // Named ready-to-wear line (real garment names + notes taken from the design plates).
  mk(36, "The Ada-Set", "Àda — first of her time, leader of her tribe. An Aso-oke statement blazer and flowing maxi for the woman who wants more, even on a Monday.", "fashion-illustrations", "Fashion Design", true, "bridal-designs", "fashion", false, "eden-collection"),
  mk(37, "The Ulu Shorts", "Cuffs in the last place you'd expect them — multi-coloured Aso-oke shorts and a cropped blazer, cut for daring, unconventional women.", "fashion-illustrations", "Fashion Design", false, "fashion-collections", "fashion", false, "eden-collection"),
  mk(38, "The Ibari-Set", "Magenta on a midweek mission — a corseted set for the woman sealing the contract and making friends while she's at it.", "fashion-illustrations", "Fashion Design", false, "fashion-collections", "fashion", false, "eden-collection"),
  mk(39, "The Yéwándé 3-Piece", "Three pieces, three lives — a mix-and-match cropped blazer, short and pant for the girl who refuses to be read just one way.", "fashion-illustrations", "Fashion Design", false, "fashion-collections", "fashion", false, "eden-collection"),
  mk(40, "The Kikelomo Dress", "The Friday little black dress — detachable taffeta bubble sleeves that move between classy and carefree, because Fridays should be easy.", "fashion-illustrations", "Fashion Design", false, "fashion-collections", "fashion", false, "eden-collection"),

  // ── 03 · Lagos Icons ───────────────────────────────────────────────────
  mk(29, "Danfo", "The yellow bus that runs the city, shrunk to fit on your shoulder.", "bags", "Product", true, "bags", "fashion", false, "ride-or-die-bags"),
  mk(30, "Last Bus to Oshodi", "Conductor's call and rush-hour chaos, stitched into a clutch.", "fashion-illustrations", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(28, "Under Lock", "A handbag that guards its secrets like a Lagos landlady guards her gate.", "bags", "Product", false, "bags", "fashion", false, "ride-or-die-bags"),
  mk(31, "Tin Tomato", "Every Nigerian kitchen's hero, recast in hardware and shine.", "bags", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(32, "Agege", "Soft, sweet, everywhere by morning — the people's loaf as luxury.", "bags", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(33, "The Daily", "Yesterday's headlines, tomorrow's accessory — news you can carry.", "bags", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(71, "Nala", "Pantry staple to power accessory — flavour you wear.", "product-illustrations", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(62, "Driver's Seat", "She holds the wheel; the bag just makes it official.", "bags", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(63, "Driver's Seat II", "Same control, cleaner backdrop — the city in her rear-view.", "bags", "Product", false, "bags", "fashion", false, "aski-eko-bag"),
  mk(57, "Exhibit 1", "Evidence of a woman who walks in on her own terms.", "shoes", "Footwear", false, "shoes", "fashion", false, "ta-lo-pa-chief"),
  mk(58, "Exhibit 2", "Gilded, strapped, sentence pending — guilty of glamour.", "shoes", "Footwear", false, "shoes", "fashion", false, "ta-lo-pa-chief"),
  mk(59, "Exhibit 3", "Streetwear with a fare-stage attitude.", "shoes", "Footwear", false, "shoes", "fashion", false, "ta-lo-pa-chief"),
  mk(60, "Exhibit 4", "Boots built for arriving, never for waiting.", "shoes", "Footwear", false, "shoes", "fashion", false, "ta-lo-pa-chief"),
  mk(61, "Exhibit 5", "Elevation — literal and otherwise.", "shoes", "Footwear", false, "shoes", "fashion", false, "ta-lo-pa-chief"),

  // ── 04 · Heritage & Regalia ────────────────────────────────────────────
  mk(44, "Trial by Fire", "She walks out of the flames dressed in her grandmother's courage.", "fashion-illustrations", "Couture", true, "formal-events", "lifestyle", false, "teyana-met-gala-2025"),
  mk(3, "Morning Veil", "She wears white like a sunrise wears the sky — quietly, completely.", "fashion-illustrations", "Couture", false, "bridal-designs", "fashion", false, "formal-ceremonial-couture"),
  mk(41, "Aso-Ibora Mesh", "The Saturday-morning cover cloth — the wrapper of chores and childhood, remade in mesh as something worth being seen in.", "fashion-illustrations", "Fashion Design", false, "bridal-designs", "fashion", false, "eden-collection"),
  mk(42, "The Omo-Oba Regalia", "Daughter of the King of kings — regalia for those who carry their Father's presence in every stride. Ọmọ-ọba: child of royalty.", "fashion-illustrations", "Fashion Design", false, "bridal-designs", "fashion", false, "eden-collection"),
  mk(47, "The Oracle", "Wrapped in dusk and prophecy, she speaks only when it matters.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "formal-ceremonial-couture"),
  mk(48, "Forest Hymn", "Earth tones and evening air — a hymn to where she comes from.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "formal-ceremonial-couture"),
  mk(50, "Coronation", "No one handed her the crown; she drew it and put it on herself.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "formal-ceremonial-couture"),
  mk(51, "High Priestess", "Robed in light, keeper of rites no one taught her — she remembered.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "formal-ceremonial-couture"),
  mk(68, "The Red Room", "Behind the velvet rope, she is the exhibit and the curator both.", "fashion-illustrations", "Couture", false, "jewelry", "fashion", false, "five-for-five"),

  // ── 05 · Wearable Confidence ───────────────────────────────────────────
  mk(73, "The Golden Hour", "Light gathers at the seams; this is what confidence looks like at dusk.", "fashion-illustrations", "Couture", true, "formal-events", "lifestyle", false, "portrait-series"),
  mk(1, "Pink Means Business", "Soft colour, hard entrance — she made pink a power move.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "couture-signatures"),
  mk(2, "On Her Own Time", "The clock runs behind her, not the other way around.", "fashion-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "couture-signatures"),
  mk(4, "First Bloom", "Structured at the shoulder, blooming everywhere else.", "fashion-illustrations", "Couture", false, "wedding-celebrations", "lifestyle", false, "couture-signatures"),
  mk(8, "Plume", "Feathered and fearless, she trails drama like perfume.", "fashion-illustrations", "Couture", false, "wedding-celebrations", "lifestyle", false, "couture-signatures"),
  mk(9, "Limited Edition", "Numbered, signed, one of one — like the woman it was drawn for.", "fashion-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "couture-signatures"),
  mk(10, "Polka & Poise", "Dots that dare you to underestimate the woman wearing them.", "single-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "couture-signatures"),
  mk(13, "Midnight Toast", "Sparkler high, hem heavy with gold — here's to her.", "fashion-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "couture-signatures"),
  mk(22, "On the Prowl", "She wears the print the way she enters a room: already winning.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "couture-signatures"),
  mk(34, "Sunday Best", "Quiet florals for a woman who knows she's the loudest thing in the room.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "couture-signatures"),
  mk(43, "Candy Stripe", "Sweet on the surface, steel underneath.", "fashion-illustrations", "Couture", false, "wedding-celebrations", "lifestyle", false, "couture-signatures"),
  mk(45, "Cloud Nine", "Yards of white like weather; she is the forecast.", "fashion-illustrations", "Couture", false, "wedding-celebrations", "lifestyle", false, "couture-signatures"),
  mk(46, "Nightshade", "Beautiful, a little dangerous, entirely in bloom.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "couture-signatures"),
  mk(49, "Ember", "Still glowing long after the room thought she'd cooled.", "fashion-illustrations", "Couture", false, "formal-events", "lifestyle", false, "couture-signatures"),
  mk(69, "Smoke & Rose", "Ash-grey drape, rose-red nerve.", "fashion-illustrations", "Couture", false, "wedding-celebrations", "lifestyle", false, "eden-collection"),

  // ── 06 · The #5for5 Collection (#EndSARS) ──────────────────────────────
  // The five demands of #EndSARS, worn. Notes are the artist's own captions.
  mk(52, "Release Them", "#5for5, demand one: the immediate release of all arrested protesters — worn like a verdict in END SARS sashes.", "fashion-illustrations", "Campaign", true, "formal-events", "lifestyle", false, "oppenheimer-barbie"),
  mk(53, "White Robes", "For the civilian soldiers who never came home — now in white, remembered in every hallelujah chorus.", "fashion-illustrations", "Campaign", false, "formal-events", "lifestyle", false, "oppenheimer-barbie"),
  mk(54, "Served Hot", "Justice for every life taken — and the demand that it be served hot.", "fashion-illustrations", "Campaign", false, "formal-events", "lifestyle", false, "time-will-tell"),
  mk(55, "Same Old Disguise", "Fine cloth, fine name — but the same old person still hides underneath. Reform, not rebranding.", "fashion-illustrations", "Campaign", false, "formal-events", "lifestyle", false, "time-will-tell"),
  mk(56, "Pay Them Well", "Even the police know how to wear starched agbada — so pay them well, and let them protect, not prey.", "fashion-illustrations", "Campaign", false, "formal-events", "lifestyle", false, "time-will-tell"),

  // ── 07 · She Speaks ────────────────────────────────────────────────────
  mk(6, "New Chapter", "She closed the book the world wrote for her and opened a blank one.", "single-illustrations", "Couture", true, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(26, "Unsilenced", "The tape was meant to quiet her. Read it again.", "single-illustrations", "Campaign", true, "editorial-narratives", "lifestyle", false, "corn-row-dress"),
  mk(15, "Embrace Equity", "Not the same start for everyone — the same chance to finish.", "single-illustrations", "Campaign", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(16, "One of a Kind", "Mass-produced was never on the table.", "single-illustrations", "Campaign", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(17, "Inspire Inclusion", "Pull up a chair; better yet, build a longer table.", "single-illustrations", "Campaign", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(18, "Break the Bias", "Arms crossed, mind open, line drawn.", "single-illustrations", "Campaign", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(25, "First Light", "Before she was anyone's anything, she was someone's whole morning.", "single-illustrations", "Campaign", false, "birthday-illustrations", "lifestyle", false, "editorial-stories"),
  mk(20, "Season's Cards", "A tree built from every kind word she kept.", "single-illustrations", "Campaign", false, "birthday-illustrations", "lifestyle", false, "editorial-stories"),
  mk(19, "Sweet Talk", "A little colour, a little candy, a lot of intention.", "single-illustrations", "Campaign", false, "birthday-illustrations", "lifestyle", false, "editorial-stories"),
  mk(35, "Miss Dior", "An homage in ink — couture seen through her own eyes.", "fashion-illustrations", "Campaign", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(7, "The Last Word", "She lets you finish. Then she finishes it.", "fashion-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "editorial-stories"),
  mk(11, "Return to Sender", "Every letter she sends is addressed, first, to herself.", "single-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "editorial-stories"),
  mk(12, "Off Duty", "Even at rest, she's the most interesting thing in the frame.", "single-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "editorial-stories"),
  mk(14, "Quarter Past Her", "Time keeps her schedule now.", "single-illustrations", "Couture", false, "intimate-moments", "lifestyle", false, "editorial-stories"),
  mk(23, "The Queen's Game", "She moves last, and she moves everything.", "single-illustrations", "Couture", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(27, "Forward Only", "The sign said it; she'd already decided it.", "single-illustrations", "Couture", false, "editorial-narratives", "lifestyle", false, "editorial-stories"),
  mk(5, "Love, Medium-Rare", "Appetite without apology — she takes her pleasures seriously.", "single-illustrations", "Campaign", false, "birthday-illustrations", "lifestyle", false, "editorial-stories"),

  // ── Aug 2026 addition — 25 new pieces from "New illustrations.zip",
  // categorized by matching each one to its exact page in the client's PDF.
  // No collection/umbrella tag (that system is separate, untouched here) and
  // no title/story yet — draft:true keeps these out of the public gallery
  // until Faith supplies real copy; see illustration-categories.ts.
  mk(74, "", "", "bridal-designs",        "Couture",        false, undefined, undefined, true),
  mk(75, "", "", "bridal-designs",        "Couture",        false, undefined, undefined, true),
  mk(76, "", "", "bridal-designs",        "Couture",        false, undefined, undefined, true),
  mk(77, "", "", "bridal-designs",        "Couture",        false, undefined, undefined, true),
  mk(78, "", "", "fashion-illustrations", "Fashion Design", false, undefined, undefined, true),
  mk(79, "", "", "fashion-illustrations", "Fashion Design", false, undefined, undefined, true),
  mk(80, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(81, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(82, "", "", "single-illustrations",  "Portrait",       false, undefined, undefined, true),
  mk(83, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(84, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(85, "", "", "single-illustrations",  "Portrait",       false, undefined, undefined, true),
  mk(86, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(87, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(88, "", "", "single-illustrations",  "Campaign",       false, undefined, undefined, true),
  mk(89, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(90, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(91, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(92, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(93, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(94, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(95, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(96, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(97, "", "", "birthday-couple",       "Portrait",       false, undefined, undefined, true),
  mk(98, "", "", "book-covers",           "Campaign",       false, undefined, undefined, true),

  // artwork_0099–0105: the 2 new Bags + 5 Event Programs pieces, extracted
  // directly from the PDF catalogue (no full-res source existed yet).
  mk(99,  "", "", "bags",            "Product",  false, undefined, undefined, true),
  mk(100, "", "", "bags",            "Product",  false, undefined, undefined, true),
  mk(101, "", "", "event-programs",  "Campaign", false, undefined, undefined, true),
  mk(102, "", "", "event-programs",  "Campaign", false, undefined, undefined, true),
  mk(103, "", "", "event-programs",  "Campaign", false, undefined, undefined, true),
  mk(104, "", "", "event-programs",  "Campaign", false, undefined, undefined, true),
  mk(105, "", "", "event-programs",  "Campaign", false, undefined, undefined, true),
];

// Collection helpers
export const getArtworksByCollection = (collectionId: CollectionId): Artwork[] => {
  return ARTWORKS.filter(art => art.collection === collectionId);
};

export const getArtworksByUmbrella = (umbrella: "fashion" | "lifestyle"): Artwork[] => {
  return ARTWORKS.filter(art => art.umbrella === umbrella);
};

export const getCollectionMetadata = (collectionId: CollectionId) => {
  const artworks = getArtworksByCollection(collectionId);
  const names: Record<CollectionId, string> = {
    "fashion-collections": "Fashion Collections",
    "bridal-designs": "Bridal Designs",
    "jewelry": "Jewelry",
    "shoes": "Shoes",
    "bags": "Bags",
    "birthday-illustrations": "Birthday Illustrations",
    "wedding-celebrations": "Wedding Celebrations",
    "editorial-narratives": "Editorial Narratives",
    "intimate-moments": "Intimate Moments",
    "formal-events": "Formal Events",
  };
  return {
    name: names[collectionId],
    count: artworks.length,
    artworks,
  };
};

// Back-compat aliases for earlier imports.
export type GalleryArtwork = Artwork;
export const GALLERY_ARTWORKS = ARTWORKS;
