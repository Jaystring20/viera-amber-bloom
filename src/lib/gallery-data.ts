// Curated collection data for the Viera Amber illustration gallery.
// 73 artworks across 6 story chapters, each with a poetic title + story.
// Real names on the art (Jacqueline, Wandé, the Yoruba design names) are preserved.
// Image files are contiguous: artwork_0001.webp … artwork_0073.webp in /public/artworks.

export type Medium =
  | "Portrait"
  | "Couture"
  | "Fashion Design"
  | "Product"
  | "Footwear"
  | "Campaign";

export type ChapterId =
  | "muses"
  | "atelier"
  | "lagos"
  | "heritage"
  | "wearable"
  | "fivefor5"
  | "speaks";

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
}

export interface Chapter {
  id: ChapterId;
  index: string;
  name: string;
  tagline: string;
  description: string;
  layout: "mosaic" | "rail" | "feature";
}

export const MEDIA: Medium[] = [
  "Portrait",
  "Couture",
  "Fashion Design",
  "Product",
  "Footwear",
  "Campaign",
];

export const CHAPTERS: Chapter[] = [
  {
    id: "muses",
    index: "01",
    name: "The Named Muses",
    tagline: "Every woman has a name.",
    description:
      "Before she is a style, she is a person. These portraits begin with a name and let the rest follow — Jacqueline, Wandé, Céline, Ifeyinwa — women who own their own gaze.",
    layout: "mosaic",
  },
  {
    id: "atelier",
    index: "02",
    name: "The Atelier",
    tagline: "From sketch to seam.",
    description:
      "The working heart of the house: garments drawn with their fabric, their cut, and their Yoruba names intact. Fashion as a mother tongue.",
    layout: "feature",
  },
  {
    id: "lagos",
    index: "03",
    name: "Lagos Icons",
    tagline: "The city, worn.",
    description:
      "Danfo buses, Agege bread, tomato tins, day-old newspapers — the everyday furniture of Lagos recast as objects of desire. Wit you can carry.",
    layout: "rail",
  },
  {
    id: "heritage",
    index: "04",
    name: "Heritage & Regalia",
    tagline: "She remembers.",
    description:
      "Crowns no one handed her, robes she drew from memory. Where culture and ceremony meet the woman who refuses to forget where she comes from.",
    layout: "mosaic",
  },
  {
    id: "wearable",
    index: "05",
    name: "Wearable Confidence",
    tagline: "Art that wears itself.",
    description:
      "The runway core — gowns and statement looks for women who decided long ago that presence is something you put on.",
    layout: "mosaic",
  },
  {
    id: "fivefor5",
    index: "06",
    name: "The #5for5 Collection",
    tagline: "Five demands, worn.",
    description:
      "In October 2020, a generation took to the streets under one banner: #EndSARS. This collection wears the movement's five demands — release, remembrance, justice, reform, and fair pay — turning protest into something you cannot look away from.",
    layout: "feature",
  },
  {
    id: "speaks",
    index: "07",
    name: "She Speaks",
    tagline: "Art with a voice.",
    description:
      "Campaigns, commemorations, and quiet manifestos — the work that steps off the page to say something out loud.",
    layout: "mosaic",
  },
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
});

export const ARTWORKS: Artwork[] = [
  // ── 01 · The Named Muses ───────────────────────────────────────────────
  mk(24, "The Hatmaker", "She chose the hat before she chose the room. Presence was never something she asked for — it was something she wore.", "muses", "Portrait", true, "jewelry", "fashion"),
  mk(64, "Jacqueline", "Under the brim of her hat she keeps her own counsel — and her own crown.", "muses", "Portrait", false, "jewelry", "fashion"),
  mk(65, "Wandé", "Wrapped in colour and palm-shade, she answers to no season but her own.", "muses", "Portrait", false, "jewelry", "fashion"),
  mk(66, "Céline", "Two buns, one bow, zero apologies — softness sharpened to a point.", "muses", "Portrait", false, "jewelry", "fashion"),
  mk(67, "Ifeyinwa", "Her name means love; her gold hoops make sure the room remembers it.", "muses", "Portrait", false, "jewelry", "fashion"),
  mk(21, "Marigold", "She blooms loud and on purpose, the way marigolds refuse to be overlooked.", "muses", "Portrait", false, "birthday-illustrations", "lifestyle"),
  mk(70, "Setting", "Caught mid-transformation — rollers in, certainty already on.", "muses", "Portrait", false, "birthday-illustrations", "lifestyle"),
  mk(72, "Rush Hour", "Boardroom shoulders, danfo in hand — she carries the whole city to the meeting.", "muses", "Portrait", false, "formal-events", "lifestyle"),

  // ── 02 · The Atelier ───────────────────────────────────────────────────
  // Named ready-to-wear line (real garment names + notes taken from the design plates).
  mk(36, "The Ada-Set", "Àda — first of her time, leader of her tribe. An Aso-oke statement blazer and flowing maxi for the woman who wants more, even on a Monday.", "atelier", "Fashion Design", true, "bridal-designs", "fashion"),
  mk(37, "The Ulu Shorts", "Cuffs in the last place you'd expect them — multi-coloured Aso-oke shorts and a cropped blazer, cut for daring, unconventional women.", "atelier", "Fashion Design", false, "fashion-collections", "fashion"),
  mk(38, "The Ibari-Set", "Magenta on a midweek mission — a corseted set for the woman sealing the contract and making friends while she's at it.", "atelier", "Fashion Design", false, "fashion-collections", "fashion"),
  mk(39, "The Yéwándé 3-Piece", "Three pieces, three lives — a mix-and-match cropped blazer, short and pant for the girl who refuses to be read just one way.", "atelier", "Fashion Design", false, "fashion-collections", "fashion"),
  mk(40, "The Kikelomo Dress", "The Friday little black dress — detachable taffeta bubble sleeves that move between classy and carefree, because Fridays should be easy.", "atelier", "Fashion Design", false, "fashion-collections", "fashion"),

  // ── 03 · Lagos Icons ───────────────────────────────────────────────────
  mk(29, "Danfo", "The yellow bus that runs the city, shrunk to fit on your shoulder.", "lagos", "Product", true, "bags", "fashion"),
  mk(30, "Last Bus to Oshodi", "Conductor's call and rush-hour chaos, stitched into a clutch.", "lagos", "Product", false, "bags", "fashion"),
  mk(28, "Under Lock", "A handbag that guards its secrets like a Lagos landlady guards her gate.", "lagos", "Product", false, "bags", "fashion"),
  mk(31, "Tin Tomato", "Every Nigerian kitchen's hero, recast in hardware and shine.", "lagos", "Product", false, "bags", "fashion"),
  mk(32, "Agege", "Soft, sweet, everywhere by morning — the people's loaf as luxury.", "lagos", "Product", false, "bags", "fashion"),
  mk(33, "The Daily", "Yesterday's headlines, tomorrow's accessory — news you can carry.", "lagos", "Product", false, "bags", "fashion"),
  mk(71, "Nala", "Pantry staple to power accessory — flavour you wear.", "lagos", "Product", false, "bags", "fashion"),
  mk(62, "Driver's Seat", "She holds the wheel; the bag just makes it official.", "lagos", "Product", false, "bags", "fashion"),
  mk(63, "Driver's Seat II", "Same control, cleaner backdrop — the city in her rear-view.", "lagos", "Product", false, "bags", "fashion"),
  mk(57, "Exhibit 1", "Evidence of a woman who walks in on her own terms.", "lagos", "Footwear", false, "shoes", "fashion"),
  mk(58, "Exhibit 2", "Gilded, strapped, sentence pending — guilty of glamour.", "lagos", "Footwear", false, "shoes", "fashion"),
  mk(59, "Exhibit 3", "Streetwear with a fare-stage attitude.", "lagos", "Footwear", false, "shoes", "fashion"),
  mk(60, "Exhibit 4", "Boots built for arriving, never for waiting.", "lagos", "Footwear", false, "shoes", "fashion"),
  mk(61, "Exhibit 5", "Elevation — literal and otherwise.", "lagos", "Footwear", false, "shoes", "fashion"),

  // ── 04 · Heritage & Regalia ────────────────────────────────────────────
  mk(44, "Trial by Fire", "She walks out of the flames dressed in her grandmother's courage.", "heritage", "Couture", true, "formal-events", "lifestyle"),
  mk(3, "Morning Veil", "She wears white like a sunrise wears the sky — quietly, completely.", "heritage", "Couture", false, "bridal-designs", "fashion"),
  mk(41, "Aso-Ibora Mesh", "The Saturday-morning cover cloth — the wrapper of chores and childhood, remade in mesh as something worth being seen in.", "heritage", "Fashion Design", false, "bridal-designs", "fashion"),
  mk(42, "The Omo-Oba Regalia", "Daughter of the King of kings — regalia for those who carry their Father's presence in every stride. Ọmọ-ọba: child of royalty.", "heritage", "Fashion Design", false, "bridal-designs", "fashion"),
  mk(47, "The Oracle", "Wrapped in dusk and prophecy, she speaks only when it matters.", "heritage", "Couture", false, "formal-events", "lifestyle"),
  mk(48, "Forest Hymn", "Earth tones and evening air — a hymn to where she comes from.", "heritage", "Couture", false, "formal-events", "lifestyle"),
  mk(50, "Coronation", "No one handed her the crown; she drew it and put it on herself.", "heritage", "Couture", false, "formal-events", "lifestyle"),
  mk(51, "High Priestess", "Robed in light, keeper of rites no one taught her — she remembered.", "heritage", "Couture", false, "formal-events", "lifestyle"),
  mk(68, "The Red Room", "Behind the velvet rope, she is the exhibit and the curator both.", "heritage", "Couture", false, "jewelry", "fashion"),

  // ── 05 · Wearable Confidence ───────────────────────────────────────────
  mk(73, "The Golden Hour", "Light gathers at the seams; this is what confidence looks like at dusk.", "wearable", "Couture", true, "formal-events", "lifestyle"),
  mk(1, "Pink Means Business", "Soft colour, hard entrance — she made pink a power move.", "wearable", "Couture", false, "formal-events", "lifestyle"),
  mk(2, "On Her Own Time", "The clock runs behind her, not the other way around.", "wearable", "Couture", false, "intimate-moments", "lifestyle"),
  mk(4, "First Bloom", "Structured at the shoulder, blooming everywhere else.", "wearable", "Couture", false, "wedding-celebrations", "lifestyle"),
  mk(8, "Plume", "Feathered and fearless, she trails drama like perfume.", "wearable", "Couture", false, "wedding-celebrations", "lifestyle"),
  mk(9, "Limited Edition", "Numbered, signed, one of one — like the woman it was drawn for.", "wearable", "Couture", false, "intimate-moments", "lifestyle"),
  mk(10, "Polka & Poise", "Dots that dare you to underestimate the woman wearing them.", "wearable", "Couture", false, "intimate-moments", "lifestyle"),
  mk(13, "Midnight Toast", "Sparkler high, hem heavy with gold — here's to her.", "wearable", "Couture", false, "intimate-moments", "lifestyle"),
  mk(22, "On the Prowl", "She wears the print the way she enters a room: already winning.", "wearable", "Couture", false, "formal-events", "lifestyle"),
  mk(34, "Sunday Best", "Quiet florals for a woman who knows she's the loudest thing in the room.", "wearable", "Couture", false, "formal-events", "lifestyle"),
  mk(43, "Candy Stripe", "Sweet on the surface, steel underneath.", "wearable", "Couture", false, "wedding-celebrations", "lifestyle"),
  mk(45, "Cloud Nine", "Yards of white like weather; she is the forecast.", "wearable", "Couture", false, "wedding-celebrations", "lifestyle"),
  mk(46, "Nightshade", "Beautiful, a little dangerous, entirely in bloom.", "wearable", "Couture", false, "formal-events", "lifestyle"),
  mk(49, "Ember", "Still glowing long after the room thought she'd cooled.", "wearable", "Couture", false, "formal-events", "lifestyle"),
  mk(69, "Smoke & Rose", "Ash-grey drape, rose-red nerve.", "wearable", "Couture", false, "wedding-celebrations", "lifestyle"),

  // ── 06 · The #5for5 Collection (#EndSARS) ──────────────────────────────
  // The five demands of #EndSARS, worn. Notes are the artist's own captions.
  mk(52, "Release Them", "#5for5, demand one: the immediate release of all arrested protesters — worn like a verdict in END SARS sashes.", "fivefor5", "Campaign", true, "formal-events", "lifestyle"),
  mk(53, "White Robes", "For the civilian soldiers who never came home — now in white, remembered in every hallelujah chorus.", "fivefor5", "Campaign", false, "formal-events", "lifestyle"),
  mk(54, "Served Hot", "Justice for every life taken — and the demand that it be served hot.", "fivefor5", "Campaign", false, "formal-events", "lifestyle"),
  mk(55, "Same Old Disguise", "Fine cloth, fine name — but the same old person still hides underneath. Reform, not rebranding.", "fivefor5", "Campaign", false, "formal-events", "lifestyle"),
  mk(56, "Pay Them Well", "Even the police know how to wear starched agbada — so pay them well, and let them protect, not prey.", "fivefor5", "Campaign", false, "formal-events", "lifestyle"),

  // ── 07 · She Speaks ────────────────────────────────────────────────────
  mk(6, "New Chapter", "She closed the book the world wrote for her and opened a blank one.", "speaks", "Couture", true, "editorial-narratives", "lifestyle"),
  mk(26, "Unsilenced", "The tape was meant to quiet her. Read it again.", "speaks", "Campaign", true, "editorial-narratives", "lifestyle"),
  mk(15, "Embrace Equity", "Not the same start for everyone — the same chance to finish.", "speaks", "Campaign", false, "editorial-narratives", "lifestyle"),
  mk(16, "One of a Kind", "Mass-produced was never on the table.", "speaks", "Campaign", false, "editorial-narratives", "lifestyle"),
  mk(17, "Inspire Inclusion", "Pull up a chair; better yet, build a longer table.", "speaks", "Campaign", false, "editorial-narratives", "lifestyle"),
  mk(18, "Break the Bias", "Arms crossed, mind open, line drawn.", "speaks", "Campaign", false, "editorial-narratives", "lifestyle"),
  mk(25, "First Light", "Before she was anyone's anything, she was someone's whole morning.", "speaks", "Campaign", false, "birthday-illustrations", "lifestyle"),
  mk(20, "Season's Cards", "A tree built from every kind word she kept.", "speaks", "Campaign", false, "birthday-illustrations", "lifestyle"),
  mk(19, "Sweet Talk", "A little colour, a little candy, a lot of intention.", "speaks", "Campaign", false, "birthday-illustrations", "lifestyle"),
  mk(35, "Miss Dior", "An homage in ink — couture seen through her own eyes.", "speaks", "Campaign", false, "editorial-narratives", "lifestyle"),
  mk(7, "The Last Word", "She lets you finish. Then she finishes it.", "speaks", "Couture", false, "intimate-moments", "lifestyle"),
  mk(11, "Return to Sender", "Every letter she sends is addressed, first, to herself.", "speaks", "Couture", false, "intimate-moments", "lifestyle"),
  mk(12, "Off Duty", "Even at rest, she's the most interesting thing in the frame.", "speaks", "Couture", false, "intimate-moments", "lifestyle"),
  mk(14, "Quarter Past Her", "Time keeps her schedule now.", "speaks", "Couture", false, "intimate-moments", "lifestyle"),
  mk(23, "The Queen's Game", "She moves last, and she moves everything.", "speaks", "Couture", false, "editorial-narratives", "lifestyle"),
  mk(27, "Forward Only", "The sign said it; she'd already decided it.", "speaks", "Couture", false, "editorial-narratives", "lifestyle"),
  mk(5, "Love, Medium-Rare", "Appetite without apology — she takes her pleasures seriously.", "speaks", "Campaign", false, "birthday-illustrations", "lifestyle"),
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
