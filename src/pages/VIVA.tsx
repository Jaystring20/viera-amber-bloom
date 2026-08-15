import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Send, ShoppingBag, X, Plus, Minus, MessageCircle, Sparkles, Upload, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import VivaLaunchModal from "@/components/VivaLaunchModal";
import { fadeIn, fadeSlideUp, staggerContainer, cardItem, scaleXRule, inViewProps, useReducedVariants } from "@/lib/animations";
import { supabase } from "@/lib/supabase";
import { useProducts, type Product } from "@/hooks/useProducts";

import { whatsappLink } from "@/config/contact";

const vivaHeroLeft  = "/viva/hero-left.webp";  // Look 1 — olive kimono — left flank
const vivaHeroRight = "/viva/hero-right.webp"; // Look 2 — hot-pink crop — right flank

const ALABASTER  = "#FAF9F6";
const CREAM      = "#F5EDE6";
const BURGUNDY   = "#6E0025";
const GOLD       = "#D4AF37";
const DARK_TEXT  = "#221A1A";
const CORMORANT  = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const GOLD_ALPHA = "rgba(212,175,55,0.3)";
const BURG_ALPHA = "rgba(110,0,37,0.14)";

// Three outfit looks go into the lookbook
const LOOKBOOK = [
  { title: "The Heritage", mood: "Power & Craft",     photo: "/viva/look-1.webp", desc: "Olive woven kimono · Wide-leg pleated denim · Gold cuffs" },
  { title: "The Bold",     mood: "Vivid Authority",   photo: "/viva/look-2.webp", desc: "Hot-pink structured crop · Wide-leg denim · Statement earrings" },
  { title: "The Artist",   mood: "Chromatic Freedom", photo: "/viva/look-3.webp", desc: "Chartreuse palazzo · Structured crop · Layered gold jewellery" },
];

// Fallback catalogue. The shop reads from the `products` table so the admin
// UI can drive it, but keeps this as the offline/empty-table answer — a
// storefront that renders nothing when a query fails reads as broken.
// ═══════════════════════════════════════════════════════════
// AJOGÚN — four standalone style cards, each with its own
// Top Only / Pants Only / Both toggle
// ═══════════════════════════════════════════════════════════
//
// Previously this was one card nesting a style-picker inside a
// combo-picker inside a carousel — three decisions stacked in one box,
// which read as confusing rather than rich. The client's direction:
// unstack it. Four styles are four products, full stop, exactly like
// every other card in this grid. Each one still needs to express "Top
// Only / Pants Only / Both" because that choice is real (Ajogún is
// made-to-order and pants are a genuine separate garment) — but it's
// a single flat 3-way toggle per card, not a picker inside a picker.
const AJOGUN_STANDARD_OPTIONS = {
  topOnly:   { NGN: 40000, USD: 26 },
  pantsOnly: { NGN: 15000, USD: 10 },
  both:      { NGN: 65000, USD: 42 },
};

const SHOP_PRODUCTS: ShopProduct[] = [
  // ═══════════════════════════════════════════════════════════
  // SECTION 1: AJOGÚN (THE INHERITANCE) — 4 standalone style cards
  // ═══════════════════════════════════════════════════════════

  {
    id: "ajogun-plain",
    title: "Ajogún Plain Aṣọ-Òkè",
    subtitle: "The Inheritance · Heritage Collection",
    type: "garment" as const,
    badge: "Made to Order",
    collection: "ajogun",
    images: ["/viva/collection/ajogun/plain/plain_1.jpeg", "/viva/collection/ajogun/plain/plain_2.jpeg", "/viva/collection/ajogun/plain/plain_3.jpeg"],
    priceNGN: 40000,
    priceUSD: 26,
    desc: "Heritage Aṣọ-Òkè top in clean, plain weave. Choose Top, Pants, or the complete set.",
    fullDesc: "The Ajogún Plain Aṣọ-Òkè showcases the elegant simplicity of traditional woven fabric. The unadorned weave lets the richness of the fabric itself take center stage. Made to your measurements for a perfect fit.",
    materials: "100% premium Aṣọ-Òkè fabric · plain weave · bespoke tailoring",
    care: "Dry clean recommended. Gentle hand wash for delicate preservation. Store away from direct sunlight.",
    purchaseOptions: AJOGUN_STANDARD_OPTIONS,
  },

  {
    id: "ajogun-patched",
    title: "Ajogún Patched Aṣọ-Òkè",
    subtitle: "The Inheritance · Heritage Collection",
    type: "garment" as const,
    badge: "Made to Order",
    collection: "ajogun",
    images: ["/viva/collection/ajogun/patched/patched_1.jpeg", "/viva/collection/ajogun/patched/patched_2.png"],
    priceNGN: 40000,
    priceUSD: 26,
    desc: "Heritage Aṣọ-Òkè top in signature patched weave. Choose Top, Pants, or the complete set.",
    fullDesc: "The Ajogún Patched Aṣọ-Òkè celebrates traditional heritage craftsmanship. The patched weave technique creates visual depth and texture, rooted in ancestral practices. Made to your measurements for a perfect fit.",
    materials: "100% premium Aṣọ-Òkè fabric · hand-patched weave · bespoke tailoring",
    care: "Dry clean recommended. Handle with care to preserve the patched weave integrity. Store in cool, dry environment.",
    purchaseOptions: AJOGUN_STANDARD_OPTIONS,
  },

  {
    id: "ajogun-one-sleeved",
    title: "One-Sleeved Ajogún",
    subtitle: "The Inheritance · Heritage Collection",
    type: "garment" as const,
    badge: "Made to Order",
    collection: "ajogun",
    images: ["/viva/collection/ajogun/one-sleeved/one_sleeved_1.jpeg", "/viva/collection/ajogun/one-sleeved/one_sleeved_2.jpeg"],
    priceNGN: 40000,
    priceUSD: 26,
    desc: "Architectural one-sleeved Aṣọ-Òkè top, a bold reinterpretation of heritage. Choose Top, Pants, or the complete set.",
    fullDesc: "The One-Sleeved Ajogún modernizes ancestral design while honoring tradition. This architectural piece features asymmetrical tailoring in premium Aṣọ-Òkè fabric. Made to your exact measurements.",
    materials: "100% premium Aṣọ-Òkè fabric · architectural cut · bespoke tailoring",
    care: "Dry clean recommended. Lay flat to dry. Preserve the architectural seams with careful handling.",
    purchaseOptions: AJOGUN_STANDARD_OPTIONS,
  },

  {
    id: "ajogun-other-fabrics",
    title: "Ajogún Top: Other Fabrics",
    subtitle: "The Inheritance · Akwẹ́tẹ́ & Specialty Fabrics",
    type: "garment" as const,
    badge: "Premium Sourcing",
    collection: "ajogun",
    images: ["/viva/collection/ajogun/other-fabrics/fabric_1.jpeg", "/viva/collection/ajogun/other-fabrics/fabric_2.jpeg", "/viva/collection/ajogun/other-fabrics/fabric_3.jpeg", "/viva/collection/ajogun/other-fabrics/fabric_4.jpeg", "/viva/collection/ajogun/other-fabrics/fabric_5.jpeg"],
    priceNGN: 50000,
    priceUSD: 32,
    desc: "Ajogún top in whole-piece fabrics (Akwẹ́tẹ́, specialty textiles). Choose Top, Pants, or the complete set.",
    fullDesc: "The Ajogún Top in Premium Fabrics elevates the collection with exclusive whole-piece textiles like Akwẹ́tẹ́ and custom-sourced materials. Each piece is unique. Made to your measurements.",
    materials: "100% Akwẹ́tẹ́ or specialty sourced fabrics · whole-piece construction · bespoke tailoring",
    care: "Dry clean only. These premium fabrics require specialized care. Store in archival-quality tissue.",
    purchaseOptions: {
      topOnly:   { NGN: 50000, USD: 32 },
      pantsOnly: { NGN: 25000, USD: 16 },
      both:      { NGN: 75000, USD: 48 },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 2: NKÀ (THE CRAFTSMANSHIP)
  // ═══════════════════════════════════════════════════════════

  {
    id: "nka-adire",
    title: "Nkà Garment: Àdịrẹ",
    subtitle: "Craftsmanship · Artisan Collection",
    type: "garment" as const,
    badge: "Signature Fabric",
    collection: "nka",
    images: ["/viva/collection/nka/adire_1.jpeg", "/viva/collection/nka/adire_2.jpeg"],
    priceNGN: 25000,
    priceUSD: 16,
    desc: "Artisan-designed garment in signature Àdịrẹ fabric. Resist-dyed textile celebrating craftsmanship and artistic expression.",
    fullDesc: "The Nkà Garment in Àdịrẹ is a celebration of artisan mastery. The Àdịrẹ resist-dyed fabric features intricate patterns that speak to centuries of textile tradition. Each piece is uniquely designed to express artistic agency—a wearable declaration of craftsmanship. Made to your measurements for personalized fit.",
    materials: "100% Àdịrẹ resist-dyed fabric · artisan construction · bespoke tailoring",
    care: "Hand wash in cool water. Use color-safe detergent. Lay flat to dry to preserve the resist-dye patterns."
  },

  {
    id: "nka-silk-crepe",
    title: "Nkà Garment: Silk & Crepe",
    subtitle: "Craftsmanship · Artisan Collection",
    type: "garment" as const,
    badge: "Premium Fabrics",
    collection: "nka",
    // Single confirmed image ("Nkà garment other fabrics.jpeg"). The second
    // slot previously borrowed a Daughter of Adonai apparel photo — removed
    // per client direction to not mix collections.
    images: ["/viva/collection/nka/silk_crepe_1.jpeg"],
    priceNGN: 20000,
    priceUSD: 13,
    desc: "Artisan garment in luxurious silk and crepe blends. Light, flowing fabric for sophisticated expression of artistic identity.",
    fullDesc: "The Nkà Garment in Silk & Crepe offers sophistication through lightweight, flowing fabrics. The crepe drape and silk sheen create movement and elegance, perfect for artistic expression. Each design celebrates individual craftsmanship and the wearer's unique identity. Custom-fitted to your measurements.",
    materials: "Silk and crepe blend · artisan design · bespoke tailoring",
    care: "Hand wash or dry clean. Air dry away from direct sunlight. Iron on low heat if needed."
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 3: DAUGHTERS OF ADONAI COLLECTION
  // T-shirt sold separately from Pants — pants come in 3 styles, all
  // sharing the signature ring-hardware detail at the hem. Photos are
  // shared between the T-shirt and Pants listings where a single outfit
  // shot shows both pieces — normal for outfit photography, not a mixup.
  // ═══════════════════════════════════════════════════════════

  {
    id: "daughters-tee",
    title: "Daughter of Adonai T-Shirt",
    subtitle: "Daughters of Adonai · Graphic Apparel",
    type: "garment" as const,
    badge: "Graphic Tee",
    collection: "daughters",
    images: [
      "/viva/collection/daughter-of-adonai/crop-denim-white.jpeg",
      "/viva/collection/daughter-of-adonai/crop-denim-black.jpeg",
      "/viva/collection/daughter-of-adonai/dnd-graphic-white.jpeg",
    ],
    priceNGN: 25000,
    priceUSD: 16,
    desc: "Statement graphic tee in premium cotton, available in white and black. Sold separately from the pants shown styled with it.",
    fullDesc: "The Daughter of Adonai T-Shirt is a wearable declaration of identity and heritage. The artistic print is carefully crafted onto premium cotton, creating a piece that is both comfortable and meaningful. Available in white and black.",
    materials: "100% premium cotton · screen-printed graphic · bespoke sizing",
    care: "Machine wash cold. Turn inside out before washing to protect the print. Tumble dry low or air dry."
  },

  {
    id: "daughters-pants-crop-denim",
    title: "Daughters of Adonai Pants: 3/4 Denim",
    subtitle: "Daughters of Adonai · Signature Ring Hardware",
    type: "garment" as const,
    badge: "Signature Hardware",
    collection: "daughters",
    images: [
      "/viva/collection/daughter-of-adonai/crop-denim-white.jpeg",
      "/viva/collection/daughter-of-adonai/crop-denim-black.jpeg",
    ],
    priceNGN: 25000,
    priceUSD: 16,
    desc: "Cropped 3/4-length denim with the collection's signature ring hardware connecting the hem pieces. Sold separately from the tee.",
    fullDesc: "These cropped denim pants carry the Daughters of Adonai signature: metal rings connecting cut pieces at the hem, a distinctive detail that sets them apart from standard denim. A 3/4 length for a cropped, modern silhouette.",
    materials: "Premium denim · signature ring hardware · bespoke fit",
    care: "Machine wash cold, inside out. Line dry to preserve the hardware finish."
  },

  {
    id: "daughters-pants-full-denim",
    title: "Daughters of Adonai Pants: Full Denim",
    subtitle: "Daughters of Adonai · Signature Ring Hardware",
    type: "garment" as const,
    badge: "Signature Hardware",
    collection: "daughters",
    images: [
      "/viva/collection/daughter-of-adonai/full-denim-black.jpeg",
      "/viva/collection/daughter-of-adonai/full-denim-white.jpeg",
    ],
    priceNGN: 25000,
    priceUSD: 16,
    desc: "Full-length wide-leg denim with the collection's signature ring hardware connecting the hem pieces. Sold separately from the tee.",
    fullDesc: "The full-length version of the signature ring-hardware denim: a relaxed, wide-leg cut that runs to the floor, with the same metal-ring hem detail as the 3/4 version. A more elongated, statement silhouette.",
    materials: "Premium denim · signature ring hardware · bespoke fit",
    care: "Machine wash cold, inside out. Line dry to preserve the hardware finish."
  },

  {
    id: "daughters-pants-silk-cream",
    title: "Daughters of Adonai Pants: 3/4 Silk",
    subtitle: "Daughters of Adonai · Signature Ring Hardware",
    type: "garment" as const,
    badge: "Signature Hardware",
    collection: "daughters",
    images: [
      "/viva/collection/daughter-of-adonai/silk-cream-white.jpeg",
    ],
    priceNGN: 25000,
    priceUSD: 16,
    desc: "Cropped 3/4-length silk in a soft cream tone, with the collection's signature ring hardware at the hem. Sold separately from the tee.",
    fullDesc: "A softer counterpart to the denim styles: cream silk cut to the same 3/4 length, finished with the same signature ring hardware connecting the hem pieces. A more fluid alternative for the same statement detail.",
    materials: "Silk · signature ring hardware · bespoke fit",
    care: "Dry clean recommended. Handle the hardware finish with care."
  },

  // ═══════════════════════════════════════════════════════════
  // PRINTS
  // ═══════════════════════════════════════════════════════════

  // Only one confirmed print image exists right now
  // ("Edit_tshirt_text_and_illustration_202608111230.jpeg"). Three
  // near-identical listings previously shared that one photo — removed per
  // client direction rather than presenting fabricated variety.
  {
    // NOTE: the only source image here is actually a t-shirt product photo
    // (a model wearing a "DND" graphic tee), not a fine-art print — the
    // original paper-stock / hand-signed / archival-inks copy was invented
    // and has been removed. Kept as a print listing per client direction
    // pending real print artwork; copy now describes only what the image
    // actually shows.
    id: "art-print-daughters",
    title: "Visual Graphic Print",
    subtitle: "Daughters of Adonai Collection",
    type: "print" as const,
    badge: "Graphic Art",
    images: ["/viva/collection/prints/art_print_1.jpeg"],
    priceNGN: 35000,
    priceUSD: 22,
    desc: "A visual graphic piece from the Daughters of Adonai collection, celebrating bold self-expression.",
    fullDesc: "Part of VIVA's visual graphic collection, this piece captures the confident, self-possessed spirit at the heart of the Daughters of Adonai narrative. Reach out for details on format and sizing.",
    materials: "Details available on enquiry",
    care: "Handle with care."
  },
];

// Every product carries an id once it is in the shop — DB rows have a uuid,
// the fallback entries have their slug. The cart, carousel and modals all
// key on it, so it is required here even though it is optional on Product.
type ShopProduct = Product & { id: string };
// Garments are cut to order, so a line without a size is not an order —
// it is the first question of a conversation. Prints have no size at all.
const GARMENT_SIZES = ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "Made to my measurements"] as const;
type GarmentSize = typeof GARMENT_SIZES[number];
const BESPOKE_SIZE: GarmentSize = "Made to my measurements";

// variantKey distinguishes lines of the same base product that represent
// different style/option selections (e.g. Ajogún "plain-aso-oke::topOnly"
// vs "patched-aso-oke::topWithPants") — without it those would collapse
// into a single cart line and silently merge unrelated quantities/prices.
// unitPriceNGN/USD override product.priceNGN/USD when a variant's combo
// pricing differs from the base product's listed price.
type CartItem = {
  product: ShopProduct;
  qty: number;
  size?: GarmentSize;
  variantKey?: string;
  variantLabel?: string;
  unitPriceNGN?: number;
  unitPriceUSD?: number;
};

// Composite identity for a cart line — two lines are "the same" only if
// both the base product id AND the variant selection match.
const cartLineKey = (i: Pick<CartItem, "product" | "variantKey">) =>
  i.variantKey ? `${i.product.id}::${i.variantKey}` : i.product.id;

// Persisted shape. Only ids and choices are stored — never the product
// objects themselves, so a price or title change in the catalogue is picked
// up on the next load instead of being frozen into someone's basket. Variant
// lines persist their own price/label since that pricing is computed at
// add-to-cart time and lives outside the base catalogue entry.
const CART_STORAGE_KEY = "viva.cart.v1";
type StoredLine = {
  id: string;
  qty: number;
  size?: string;
  variantKey?: string;
  variantLabel?: string;
  unitPriceNGN?: number;
  unitPriceUSD?: number;
};

// Rehydrated against whichever catalogue is actually live, not against the
// fallback: a database row is keyed by uuid while a fallback entry is keyed
// by slug, so restoring before the real catalogue has loaded would silently
// drop every line as "discontinued".
function loadCart(catalogue: ShopProduct[]): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const lines: StoredLine[] = JSON.parse(raw);
    if (!Array.isArray(lines)) return [];
    return lines.flatMap(line => {
      const product = catalogue.find(p => p.id === line.id);
      // A discontinued id is dropped rather than resurrected as a broken row.
      if (!product) return [];
      const qty = Number(line.qty);
      if (!Number.isInteger(qty) || qty < 1) return [];
      const size = GARMENT_SIZES.find(s => s === line.size);
      return [{
        product,
        qty: Math.min(qty, 99),
        ...(size ? { size } : {}),
        ...(line.variantKey ? { variantKey: line.variantKey } : {}),
        ...(line.variantLabel ? { variantLabel: line.variantLabel } : {}),
        ...(typeof line.unitPriceNGN === "number" ? { unitPriceNGN: line.unitPriceNGN } : {}),
        ...(typeof line.unitPriceUSD === "number" ? { unitPriceUSD: line.unitPriceUSD } : {}),
      }];
    });
  } catch {
    // Corrupt or unavailable storage (private mode, quota) must never stop
    // the shop rendering — an empty basket is a fine failure mode.
    return [];
  }
}

// Carousel state for each product
interface CarouselState {
  [productId: string]: number; // current image index
}

// Upcoming pieces (no photo yet)
const COMING = [
  { title: "Coronation",  mood: "Divine Right",   desc: "There is a moment when a woman stops asking permission. Coronation is that moment, dressed." },
  { title: "Golden Hour", mood: "Warmth & Light", desc: "The hour when everything you've built is lit from the right angle. Warm, burnished, yours." },
];

const PILLARS = [
  { heading: "Structured Fluidity", line: "Where precision meets the body in motion.", numeral: "I" },
  { heading: "Artistic Agency",     line: "Every garment is a declaration.",             numeral: "II" },
  { heading: "Sacred Identity",     line: "Dressed in who you are, and whose you are.", numeral: "III" },
];

const PILLAR_ICONS = [
  // Structured Fluidity — straight line bisecting a wave
  <svg key="fluidity" width="44" height="28" viewBox="0 0 44 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <line x1="0" y1="14" x2="44" y2="14" strokeOpacity="0.35"/>
    <path d="M0 5 C5.5 5 5.5 23 11 23 C16.5 23 16.5 5 22 5 C27.5 5 27.5 23 33 23 C38.5 23 38.5 5 44 5" fill="none"/>
  </svg>,
  // Artistic Agency — starburst / asterisk
  <svg key="agency" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <line x1="16" y1="2"    x2="16" y2="30"/>
    <line x1="2"  y1="16"   x2="30" y2="16"/>
    <line x1="5.4" y1="5.4" x2="26.6" y2="26.6"/>
    <line x1="26.6" y1="5.4" x2="5.4" y2="26.6"/>
  </svg>,
  // Sacred Identity — minimal crown
  <svg key="identity" width="36" height="28" viewBox="0 0 36 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 24 L6 8 L13 17 L18 3 L23 17 L30 8 L33 24 Z"/>
    <line x1="3" y1="24" x2="33" y2="24"/>
  </svg>,
];

const enquiryInputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.13)",
  border: "1px solid rgba(250,249,246,0.22)",
  borderRadius: 6,
  padding: "12px 14px",
  color: ALABASTER,
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: 13,
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

// The hero masthead and eyebrow briefly sat on a backing plate here
// (rgba(18,4,10) at various alphas, tuned down over several rounds from
// 0.78 to 0.35) to guarantee contrast against bright video frames. Removed
// on client direction — "my attention is on the color gradient... it's
// like ombre from bottom to top" — in favor of the scrim gradient alone,
// reshaped on both viewports to actually cover where that text sits. See
// the "Mobile scrim" and "DESKTOP SCRIM" comments below for the current
// approach and its verification.

// ═══════════════════════════════════════════════════════════
// AJOGÚN STYLE CARD — a standard product card with one added row:
// a flat Top / Pants / Both toggle
// ═══════════════════════════════════════════════════════════
//
// Deliberately built to be visually indistinguishable from every other
// card in the grid — same width, same carousel, same badge and type
// scale — because the earlier version's confusion came from nesting a
// style-picker inside a combo-picker inside its own oversized card. Each
// Ajogún style is now just a product, full stop; it happens to have three
// purchasable shapes instead of one. The image carousel reuses the exact
// same shared state (getCarouselIndex / nextImage / prevImage, keyed by
// this product's own id) that every other garment card uses — no parallel
// carousel implementation to keep in sync.
interface AjogunStyleCardProps {
  product: ShopProduct;
  currency: "NGN" | "USD";
  reduced: boolean;
  currentImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onOpenDetail: () => void;
  onAddToCart: (product: ShopProduct, variant: { key: string; label: string; priceNGN: number; priceUSD: number }) => void;
}

type AjogunOption = "topOnly" | "pantsOnly" | "both";
const AJOGUN_OPTION_LABEL: Record<AjogunOption, string> = {
  topOnly: "Top",
  pantsOnly: "Pants",
  both: "Both",
};

const AjogunStyleCard = ({ product, currency, reduced, currentImageIndex, onPrevImage, onNextImage, onOpenDetail, onAddToCart }: AjogunStyleCardProps) => {
  const [option, setOption] = useState<AjogunOption>("topOnly");
  const opts = product.purchaseOptions;
  if (!opts) return null;

  const price = opts[option] ?? opts.topOnly ?? { NGN: product.priceNGN, USD: product.priceUSD };
  const currentImage = product.images[currentImageIndex];
  const fmt = (p?: { NGN: number; USD: number }) => (p ? (currency === "NGN" ? `₦${p.NGN.toLocaleString()}` : `$${p.USD}`) : "—");

  const handleAddToCart = () => {
    onAddToCart(product, {
      key: option,
      label: `${product.title} · ${AJOGUN_OPTION_LABEL[option]}`,
      priceNGN: price.NGN,
      priceUSD: price.USD,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
      style={{
        background: "#fff",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${BURG_ALPHA}`,
        boxShadow: "0 2px 12px rgba(110,0,37,0.06)",
      }}
    >
      {/* Image carousel — identical markup/behavior to every other garment card */}
      <div
        style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative", cursor: "pointer", background: "rgba(110,0,37,0.03)" }}
        onClick={onOpenDetail}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={product.title}
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        </AnimatePresence>
        <span style={{
          position: "absolute", top: 8, left: 8,
          fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 7, letterSpacing: "1.5px", textTransform: "uppercase",
          background: "rgba(110,0,37,0.9)", color: GOLD, padding: "3px 7px", borderRadius: 2,
        }}>{product.badge}</span>

        {product.images.length > 1 && (
          <>
            <motion.button
              onClick={(e) => { e.stopPropagation(); onPrevImage(); }}
              whileHover={reduced ? {} : { scale: 1.08 }}
              whileTap={reduced ? {} : { scale: 0.94 }}
              style={{
                position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 10, color: BURGUNDY,
              }}
            ><ChevronLeft size={15} strokeWidth={1.5} /></motion.button>

            <motion.button
              onClick={(e) => { e.stopPropagation(); onNextImage(); }}
              whileHover={reduced ? {} : { scale: 1.08 }}
              whileTap={reduced ? {} : { scale: 0.94 }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 10, color: BURGUNDY,
              }}
            ><ChevronRight size={15} strokeWidth={1.5} /></motion.button>

            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 10 }}>
              {product.images.map((_, idx) => (
                <div key={idx} style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: idx === currentImageIndex ? BURGUNDY : "rgba(110,0,37,0.25)", transition: "all 0.3s",
                }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product info — same scale as the standard garment card so all
          eight cards in the grid (4 Ajogún + others) read as one family. */}
      <div style={{ padding: "18px 16px" }}>
        <p style={{
          fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 8, color: BURGUNDY, opacity: 0.4,
          letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 4px 0",
        }}>{product.subtitle}</p>
        <h3 style={{ fontFamily: CORMORANT, fontSize: 20, fontWeight: 600, color: DARK_TEXT, margin: "0 0 8px 0", lineHeight: 1.15 }}>
          {product.title}
        </h3>
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(34,26,26,0.45)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
          {product.desc}
        </p>

        {/* Flat 3-way toggle — replaces the old nested style/option pickers */}
        <div style={{ display: "flex", border: `1px solid ${BURG_ALPHA}`, borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
          {(["topOnly", "pantsOnly", "both"] as AjogunOption[]).map((opt) => {
            const available = Boolean(opts[opt]);
            const active = option === opt;
            return (
              <button
                key={opt}
                onClick={() => available && setOption(opt)}
                disabled={!available}
                style={{
                  flex: 1, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10.5, letterSpacing: "0.5px",
                  padding: "9px 4px", border: "none", cursor: available ? "pointer" : "not-allowed", transition: "all 0.15s",
                  background: active ? BURGUNDY : "transparent",
                  color: active ? GOLD : DARK_TEXT,
                  opacity: available ? 1 : 0.3,
                  fontWeight: active ? 600 : 400,
                }}
              >{AJOGUN_OPTION_LABEL[opt]}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <span style={{ fontFamily: CORMORANT, fontSize: 20, fontWeight: 600, color: BURGUNDY }}>
              {fmt(price)}
            </span>
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, color: "rgba(110,0,37,0.3)", marginLeft: 4 }}>
              {currency === "NGN" ? `/ $${price.USD}` : `/ ₦${price.NGN.toLocaleString()}`}
            </span>
          </div>
          <motion.button
            onClick={handleAddToCart}
            whileHover={reduced ? {} : { scale: 1.04 }}
            whileTap={reduced ? {} : { scale: 0.96 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase",
              fontWeight: 600, background: BURGUNDY, color: GOLD, border: "none", borderRadius: 3,
              padding: "8px 14px", cursor: "pointer", transition: "all 0.2s",
            }}
          >Add</motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// STANDARD GARMENT CARD — single-image-carousel, single-price card
// ═══════════════════════════════════════════════════════════
//
// Extracted out of the grid's .map() so it can be reused across three
// separately-labeled collection sections (Ajogún, Nkà, Daughters of
// Adonai) without three copies of the same ~200-line block drifting out
// of sync with each other.
interface StandardGarmentCardProps {
  product: ShopProduct;
  currency: "NGN" | "USD";
  reduced: boolean;
  index: number;
  currentImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onOpenDetail: () => void;
  onAddToCart: (product: ShopProduct) => void;
}

const StandardGarmentCard = ({ product, currency, reduced, index, currentImageIndex, onPrevImage, onNextImage, onOpenDetail, onAddToCart }: StandardGarmentCardProps) => {
  const currentImage = product.images[currentImageIndex];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
      style={{
        background: "#fff",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${BURG_ALPHA}`,
        boxShadow: "0 2px 12px rgba(110,0,37,0.06)",
      }}
    >
      {/* Image with carousel */}
      <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative", cursor: "pointer", background: "rgba(110,0,37,0.03)" }}
        onClick={onOpenDetail}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={product.title}
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
          />
        </AnimatePresence>
        <span style={{
          position: "absolute", top: 8, left: 8,
          fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 7, letterSpacing: "1.5px", textTransform: "uppercase",
          background: "rgba(110,0,37,0.9)", color: GOLD, padding: "3px 7px", borderRadius: 2,
        }}>{product.badge}</span>

        {product.images.length > 1 && (
          <>
            <motion.button
              onClick={(e) => { e.stopPropagation(); onPrevImage(); }}
              whileHover={reduced ? {} : { scale: 1.08 }}
              whileTap={reduced ? {} : { scale: 0.94 }}
              style={{
                position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 10, color: BURGUNDY,
              }}
            ><ChevronLeft size={15} strokeWidth={1.5} /></motion.button>

            <motion.button
              onClick={(e) => { e.stopPropagation(); onNextImage(); }}
              whileHover={reduced ? {} : { scale: 1.08 }}
              whileTap={reduced ? {} : { scale: 0.94 }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 10, color: BURGUNDY,
              }}
            ><ChevronRight size={15} strokeWidth={1.5} /></motion.button>

            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 10 }}>
              {product.images.map((_, idx) => (
                <div key={idx} style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: idx === currentImageIndex ? BURGUNDY : "rgba(110,0,37,0.25)", transition: "all 0.3s",
                }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product info */}
      <div style={{ padding: "18px 16px" }}>
        <p style={{
          fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 8, color: BURGUNDY, opacity: 0.4,
          letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 4px 0",
        }}>{product.subtitle}</p>
        <h3 style={{ fontFamily: CORMORANT, fontSize: 20, fontWeight: 600, color: DARK_TEXT, margin: "0 0 8px 0", lineHeight: 1.15 }}>
          {product.title}
        </h3>
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(34,26,26,0.45)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
          {product.desc}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <span style={{ fontFamily: CORMORANT, fontSize: 20, fontWeight: 600, color: BURGUNDY }}>
              {currency === "NGN" ? `₦${product.priceNGN.toLocaleString()}` : `$${product.priceUSD}`}
            </span>
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, color: "rgba(110,0,37,0.3)", marginLeft: 4 }}>
              {currency === "NGN" ? `/ $${product.priceUSD}` : `/ ₦${product.priceNGN.toLocaleString()}`}
            </span>
          </div>
          <motion.button
            onClick={() => onAddToCart(product)}
            whileHover={reduced ? {} : { scale: 1.04 }}
            whileTap={reduced ? {} : { scale: 0.96 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase",
              fontWeight: 600, background: BURGUNDY, color: GOLD, border: "none", borderRadius: 3,
              padding: "8px 14px", cursor: "pointer", transition: "all 0.2s",
            }}
          >Add</motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const VIVAPage = () => {
  const navigate   = useNavigate();
  const reduced    = useReducedMotion();

  const pillarsRef  = useRef<HTMLDivElement>(null);
  const lookbookRef = useRef<HTMLDivElement>(null);
  const shopRef     = useRef<HTMLDivElement>(null);
  const enquiryRef  = useRef<HTMLDivElement>(null);

  const pillarsInView  = useInView(pillarsRef,  inViewProps);
  const lookbookInView = useInView(lookbookRef, inViewProps);
  const shopInView     = useInView(shopRef,     inViewProps);
  const enquiryInView  = useInView(enquiryRef,  inViewProps);

  const fadeVariants    = useReducedVariants(fadeIn);
  const slideUpVariants = useReducedVariants(fadeSlideUp);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants    = useReducedVariants(cardItem);
  const ruleVariants    = useReducedVariants(scaleXRule);

  const d = (s: number) => (reduced ? 0 : s);

  const [form, setForm] = useState({ name: "", email: "", interest: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  // Hero film carousel — art-directed sources, one per viewport class.
  // Each clip is a 5s loop; we hold for two full cycles so motion never cuts mid-gesture.
  //
  // focusDesktop and focusMobile are deliberately separate values, not one
  // shared crop, because the two stages crop on opposite axes. Mobile is a
  // narrow-tall container: a landscape source overflows sideways and crops
  // left/right, so Y barely matters. Desktop is now full-bleed and typically
  // wider than tall: the same source overflows vertically instead, and how
  // severely depends on how wide the monitor is. A single Y value tuned for
  // one axis is close to meaningless on the other — hence two numbers.
  const HERO_FILMS = [
    {
      id: "loop",
      desktop: "/viva/hero-loop-desktop.mp4",
      mobile:  "/viva/hero-loop-mobile.mp4",
      // Two figures side by side in a wide frame — anchoring to the top would
      // crop the pair off at the knee, so this one holds the middle.
      focusMobile:  "center 42%",
      // Full-bleed desktop crops top/bottom, more severely the wider the
      // monitor. Biased toward the top (a *smaller* Y keeps more headroom
      // visible) so both heads stay in frame from a 1280px laptop up to an
      // ultrawide, at the cost of a little more leg cropped at the bottom —
      // the cheaper thing to lose.
      focusDesktop: "center 28%",
      alt: "Two models in the Batya Collection — pink and olive woven kimonos with wide-leg denim",
    },
    {
      id: "product",
      desktop: "/viva/hero-product-desktop.mp4",
      mobile:  "/viva/hero-product-mobile.mp4",
      // A close portrait: keep the face and the printed tee in frame.
      focusMobile:  "center 22%",
      // This is the close portrait that was previously reported cropping the
      // model's head — a real risk here, since a portrait source in a wide
      // full-bleed frame is cropped far more severely than it was in the old
      // 46%-wide side panel. Anchored close to the top edge on purpose: the
      // face is protected at essentially any desktop width, and what is
      // sacrificed as the screen widens is the torso and the printed text
      // lower on the sweater, which is the correct thing to give up first.
      focusDesktop: "center 9%",
      alt: "Model wearing the Daughters of Adonai graphic tee from the Batya Collection",
    },
  ] as const;

  const HERO_HOLD_MS = 10000;  // two complete 5s loops per clip
  const FILM_FADE_MS = 900;    // handover length; drives both the CSS fade and the park timer
  const [heroFilmIndex, setHeroFilmIndex] = useState(0);
  // A film only reveals once it reports it can play. Until then the base plate
  // shows through, which is the whole point on an unreliable connection.
  const [filmsReady, setFilmsReady] = useState<boolean[]>(() => HERO_FILMS.map(() => false));

  // Breakpoint match drives which cut we mount, so only the active viewport's
  // file is ever fetched — the hidden one must not cost the visitor bandwidth.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    // resize is a belt-and-braces fallback: if the media-query event is ever
    // missed the src must still track the breakpoint, never strand a stale cut.
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  // Pulled back a stop on both stages so the film carries the collection's
  // mood without fighting the copy sitting on top of it. Desktop pulls back
  // slightly harder than mobile now, not lighter — the first pass assumed
  // desktop copy only needed protecting near mid-frame and could afford a
  // lighter touch, but centered text actually spans nearly the whole
  // vertical stage, top to bottom, for the entire time it's on screen. It
  // needs the film tamed everywhere the way mobile already tames it, not a
  // lighter version of the same idea.
  const heroFilmFilter = isDesktop
    ? "saturate(0.86) brightness(0.82) contrast(1.05)"
    : "saturate(0.88) brightness(0.86) contrast(1.04)";

  // Shop state
  const [currency, setCurrency]           = useState<"NGN" | "USD">("NGN");
  // The shop's catalogue: the `products` table when it has rows, the
  // hardcoded list otherwise. Admin edits now reach the storefront, which
  // was the whole point of the admin UI existing.
  const { products, loading: productsLoading } = useProducts(SHOP_PRODUCTS);
  const catalogue = products.filter((p): p is ShopProduct => Boolean(p.id));

  // Restored from storage. This matters more here than on an ordinary shop:
  // checkout deliberately hands off to another app, so the tab is routinely
  // backgrounded and unloaded mid-purchase. A basket that did not survive
  // that was being lost at exactly the moment it was worth most.
  //
  // Starts empty and is filled once the live catalogue is known — see below.
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated]   = useState(false);
  const [cartOpen, setCartOpen]           = useState(false);
  const [orderStatus, setOrderStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [orderError, setOrderError]   = useState<string | null>(null);
  const [orderRef, setOrderRef]       = useState<string | null>(null);

  // Restore once, as soon as we know which catalogue is real.
  useEffect(() => {
    if (cartHydrated || productsLoading) return;
    setCart(loadCart(catalogue));
    setCartHydrated(true);
    // catalogue is derived per-render; productsLoading is the meaningful gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsLoading, cartHydrated]);

  // Mirror the basket into storage on every change. Ids, quantities, sizes,
  // and — for variant lines — the selected style/option and the price that
  // was locked in when it was added. See StoredLine.
  useEffect(() => {
    // Never write before restoring, or the initial empty state would
    // overwrite the very basket we are about to read back.
    if (!cartHydrated) return;
    try {
      const lines: StoredLine[] = cart.map(i => ({
        id: i.product.id,
        qty: i.qty,
        ...(i.size ? { size: i.size } : {}),
        ...(i.variantKey ? { variantKey: i.variantKey } : {}),
        ...(i.variantLabel ? { variantLabel: i.variantLabel } : {}),
        ...(typeof i.unitPriceNGN === "number" ? { unitPriceNGN: i.unitPriceNGN } : {}),
        ...(typeof i.unitPriceUSD === "number" ? { unitPriceUSD: i.unitPriceUSD } : {}),
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private mode or a full quota. Persistence is a convenience; losing
      // it must not break the basket the customer is currently using.
    }
  }, [cart, cartHydrated]);

  // Delivery details. The shop sells physical, made-to-measure garments —
  // an email address alone is not a fulfillable order.
  const [checkout, setCheckout] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", country: "Nigeria", notes: "",
  });
  const setCheckoutField = (k: keyof typeof checkout) => (v: string) =>
    setCheckout(prev => ({ ...prev, [k]: v }));

  // Optional, and only asked for once — not per garment. Requested when any
  // line is bespoke, otherwise offered as a refinement to a standard size.
  const [measurements, setMeasurements] = useState({ bust: "", waist: "", hips: "", height: "" });
  const setMeasurement = (k: keyof typeof measurements) => (v: string) =>
    setMeasurements(prev => ({ ...prev, [k]: v }));

  const garmentLines = cart.filter(i => i.product.type === "garment");
  const linesNeedingSize = garmentLines.filter(i => !i.size);
  const wantsBespoke = garmentLines.some(i => i.size === BESPOKE_SIZE);
  const measurementsProvided = Object.values(measurements).some(v => v.trim().length > 0);

  const REQUIRED_CHECKOUT_FIELDS = ["name", "email", "phone", "address", "city", "state"] as const;
  const detailsComplete = REQUIRED_CHECKOUT_FIELDS.every(k => checkout[k].trim().length > 0);
  // Every garment must carry a size, and a bespoke line must carry at least
  // one measurement — otherwise "made to my measurements" tells Viera nothing.
  const checkoutComplete =
    detailsComplete && linesNeedingSize.length === 0 && (!wantsBespoke || measurementsProvided);

  // Try-On Modal state
  const [tryOnModalOpen, setTryOnModalOpen]                 = useState(false);
  const [selectedGarmentForTryOn, setSelectedGarmentForTryOn] = useState<ShopProduct | null>(null);
  const [personPhotoPreview, setPersonPhotoPreview]         = useState<string | null>(null);
  const [personPhotoFile, setPersonPhotoFile]               = useState<File | null>(null);
  const [tryOnResult, setTryOnResult]                       = useState<string | null>(null);
  const [tryOnStatus, setTryOnStatus]                       = useState<"idle" | "loading" | "done" | "error">("idle");
  const [tryOnError, setTryOnError]                         = useState<string | null>(null);

  // Carousel state
  const [carouselIndices, setCarouselIndices] = useState<CarouselState>({});

  // Product detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ShopProduct | null>(null);
  // Top / Pants / Both selection for products with purchaseOptions (the
  // Ajogún styles), scoped to the modal — the grid card's own toggle lives
  // in AjogunStyleCard's local state and is intentionally independent, so
  // opening the modal always starts from Top Only rather than inheriting
  // whatever was last selected on the card underneath it.
  const [modalPurchaseOption, setModalPurchaseOption] = useState<"topOnly" | "pantsOnly" | "both">("topOnly");
  useEffect(() => { setModalPurchaseOption("topOnly"); }, [selectedProductForDetail?.id]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => {
    const unit = currency === "NGN" ? (i.unitPriceNGN ?? i.product.priceNGN) : (i.unitPriceUSD ?? i.product.priceUSD);
    return s + unit * i.qty;
  }, 0);

  // `variant` is only passed for variant/combo products (currently the
  // Ajogún Collection). It carries the style + option the shopper picked so
  // each distinct combination becomes its own cart line at its own price,
  // instead of collapsing into one line under the base product's price.
  const addToCart = (
    product: ShopProduct,
    variant?: { key: string; label: string; priceNGN: number; priceUSD: number }
  ) => {
    const key = variant ? `${product.id}::${variant.key}` : product.id;
    setCart(prev => {
      const hit = prev.find(i => cartLineKey(i) === key);
      if (hit) return prev.map(i => (cartLineKey(i) === key ? { ...i, qty: i.qty + 1 } : i));
      return [
        ...prev,
        {
          product,
          qty: 1,
          ...(variant
            ? { variantKey: variant.key, variantLabel: variant.label, unitPriceNGN: variant.priceNGN, unitPriceUSD: variant.priceUSD }
            : {}),
        },
      ];
    });
    // Adding to a basket that has already been sent starts a new order —
    // otherwise the drawer would keep showing the previous confirmation.
    setOrderStatus("idle");
    setOrderRef(null);
    setCartOpen(true);
  };

  const setLineSize = (id: string, size: GarmentSize, variantKey?: string) => {
    const key = variantKey ? `${id}::${variantKey}` : id;
    setCart(prev => prev.map(i => (cartLineKey(i) === key ? { ...i, size } : i)));
  };

  const removeFromCart = (id: string, variantKey?: string) => {
    const key = variantKey ? `${id}::${variantKey}` : id;
    setCart(prev => prev.filter(i => cartLineKey(i) !== key));
  };

  const updateQty = (id: string, delta: number, variantKey?: string) => {
    const key = variantKey ? `${id}::${variantKey}` : id;
    setCart(prev => prev.flatMap(i => {
      if (cartLineKey(i) !== key) return [i];
      const q = i.qty + delta;
      return q < 1 ? [] : [{ ...i, qty: q }];
    }));
  };

  // Carousel functions
  const getCarouselIndex = (productId: string) => carouselIndices[productId] ?? 0;

  // Reads the index from `prev`, not from the enclosing render's state. The
  // auto-play interval below is mounted once, so a closure read here always
  // saw the initial {} — every tick computed 0 + 1, and the carousel stuck
  // on the second image instead of cycling.
  const nextImage = (productId: string, imageCount: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) + 1) % imageCount
    }));
  };

  const prevImage = (productId: string, imageCount: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) - 1 + imageCount) % imageCount
    }));
  };

  // Film handover. The incoming clip is rewound and started *before* the fade,
  // so it is already in motion as it surfaces rather than dissolving in on a
  // stale frame. The outgoing clip keeps playing through the crossfade and is
  // only parked once it is invisible — two live decodes for 0.9s, one at rest.
  const filmRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    const timers: number[] = [];
    filmRefs.current.forEach((v, i) => {
      if (!v) return;
      // A cached clip can reach HAVE_FUTURE_DATA before React attaches
      // onCanPlay, which would strand it at opacity 0. Reconcile here.
      if (v.readyState >= 3) {
        setFilmsReady(r => (r[i] ? r : r.map((val, n) => (n === i ? true : val))));
      }
      if (i === heroFilmIndex) {
        try { v.currentTime = 0; } catch { /* not seekable yet — harmless */ }
        // Slightly slower on mobile, where the film sits under the copy —
        // languid motion reads as considered; brisk motion reads as busy.
        v.playbackRate = isDesktop ? 1 : 0.82;
        void v.play().catch(() => {});
      } else {
        timers.push(window.setTimeout(() => v.pause(), FILM_FADE_MS));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [heroFilmIndex, isDesktop]);

  // Hero film carousel — advance after two complete loop cycles.
  // Honours prefers-reduced-motion by holding on the first clip.
  useEffect(() => {
    if (reduced) return;
    const heroInterval = setInterval(() => {
      setHeroFilmIndex(prev => (prev + 1) % HERO_FILMS.length);
    }, HERO_HOLD_MS);
    return () => clearInterval(heroInterval);
  }, [reduced]);

  // Auto-play carousel. Re-armed when the catalogue changes so products
  // arriving from the table get intervals too, and a removed product's
  // interval is cleared rather than left ticking against a stale id.
  // 2000ms read as a blink-and-you-miss-it flicker on product photography —
  // 3000ms gives each image enough time to actually register before the
  // next one arrives.
  useEffect(() => {
    if (reduced) return;
    const intervals = catalogue
      .filter(p => p.images.length > 1)
      .map(product =>
        setInterval(() => {
          nextImage(product.id, product.images.length);
        }, 3000),
      );
    return () => intervals.forEach(clearInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue.map(p => `${p.id}:${p.images.length}`).join(","), reduced]);

  // Try-On Modal handlers
  const openTryOnModal = (product: ShopProduct) => {
    setSelectedGarmentForTryOn(product);
    setTryOnModalOpen(true);
    setPersonPhotoPreview(null);
    setPersonPhotoFile(null);
    setTryOnResult(null);
    setTryOnStatus("idle");
    setTryOnError(null);
  };

  const closeTryOnModal = () => {
    setTryOnModalOpen(false);
    setSelectedGarmentForTryOn(null);
    setPersonPhotoPreview(null);
    setPersonPhotoFile(null);
    setTryOnResult(null);
    setTryOnStatus("idle");
    setTryOnError(null);
  };

  const handleTryOnPhotoSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setTryOnError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setTryOnError("Image is too large. Please use one under 8MB.");
      return;
    }
    setTryOnError(null);
    setTryOnResult(null);
    setTryOnStatus("idle");
    setPersonPhotoFile(file);
    setPersonPhotoPreview(URL.createObjectURL(file));
  };

  const fileToBase64 = (file: File): Promise<{ base64: string; mime: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] ?? "";
        resolve({ base64, mime: file.type || "image/jpeg" });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const urlToBase64 = async (url: string): Promise<{ base64: string; mime: string }> => {
    const res = await fetch(url);
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { base64: dataUrl.split(",")[1] ?? "", mime: blob.type || "image/webp" };
  };

  const runTryOn = async () => {
    if (!personPhotoFile || !selectedGarmentForTryOn) return;
    setTryOnStatus("loading");
    setTryOnError(null);
    setTryOnResult(null);
    try {
      const person = await fileToBase64(personPhotoFile);
      const currentGarmentImage = selectedGarmentForTryOn.images[getCarouselIndex(selectedGarmentForTryOn.id)];
      const garmentImg = await urlToBase64(currentGarmentImage);

      const { data, error: fnError } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          personImageBase64: person.base64,
          personMimeType: person.mime,
          garmentImageBase64: garmentImg.base64,
          garmentMimeType: garmentImg.mime,
          garmentName: selectedGarmentForTryOn.title,
        },
      });

      if (fnError) throw new Error(fnError.message || "Try-on request failed.");
      if (data?.error) throw new Error(data.detail || data.error);
      if (!data?.imageBase64) throw new Error("No image was returned. Please try again.");

      setTryOnResult(`data:${data.mimeType || "image/png"};base64,${data.imageBase64}`);
      setTryOnStatus("done");
    } catch (e) {
      setTryOnError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setTryOnStatus("error");
    }
  };

  const orderViaWhatsApp = () => {
    if (!selectedGarmentForTryOn) return;
    const message =
      `Hi VIVA! I tried on "${selectedGarmentForTryOn.title}" using the virtual try-on and I love it. ` +
      `I'd like to order it / ask about a made-to-measure fit.`;
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  const money = (v: number) =>
    currency === "NGN" ? `₦${v.toLocaleString()}` : `$${v.toLocaleString()}`;

  // The order summary the customer sends. It is written to be read by a
  // human on a phone: one line per piece, the total, then the delivery
  // block. Everything Viera needs to confirm and quote shipping is in the
  // first message, so the conversation starts at "yes" rather than at
  // twenty questions.
  const buildOrderMessage = (ref: string) => {
    const lines = cart.map(i => {
      const unit = currency === "NGN" ? (i.unitPriceNGN ?? i.product.priceNGN) : (i.unitPriceUSD ?? i.product.priceUSD);
      // Size and variant selection both ride on the same line as the piece,
      // so nothing has to be cross-referenced further down the message.
      const size = i.size ? ` · ${i.size}` : "";
      const variant = i.variantLabel ? ` · ${i.variantLabel}` : "";
      return `• ${i.product.title}${variant}${size} ×${i.qty} — ${money(unit * i.qty)}`;
    });

    const measurementBlock = measurementsProvided
      ? [
          ``,
          `MEASUREMENTS`,
          ...(measurements.bust.trim()   ? [`Bust: ${measurements.bust.trim()}`]     : []),
          ...(measurements.waist.trim()  ? [`Waist: ${measurements.waist.trim()}`]   : []),
          ...(measurements.hips.trim()   ? [`Hips: ${measurements.hips.trim()}`]     : []),
          ...(measurements.height.trim() ? [`Height: ${measurements.height.trim()}`] : []),
        ]
      : [];

    return [
      `Hi VIVA! I'd like to place an order.`,
      ``,
      `ORDER ${ref}`,
      ...lines,
      ``,
      `Total: ${money(cartTotal)}`,
      ...measurementBlock,
      ``,
      `DELIVER TO`,
      `${checkout.name}`,
      `${checkout.phone}`,
      `${checkout.email}`,
      `${checkout.address}`,
      `${checkout.city}, ${checkout.state}`,
      `${checkout.country}`,
      ...(checkout.notes.trim() ? [``, `NOTES`, checkout.notes.trim()] : []),
      ``,
      `Please confirm availability, shipping and payment. Thank you!`,
    ].join("\n");
  };

  // Checkout hands off to WhatsApp, where the order is confirmed and paid.
  // Before opening the chat we log the basket to contact_submissions — the
  // same table the enquiry form already writes to — so an order survives
  // even if the customer never sends the message or the chat is lost.
  // That log is best effort: a logging failure must never block the sale.
  const handleWhatsAppCheckout = async () => {
    if (!checkoutComplete || cart.length === 0 || orderStatus !== "idle") return;

    setOrderStatus("sending");
    setOrderError(null);

    const ref = `VIVA-${Date.now().toString(36).toUpperCase()}`;
    const message = buildOrderMessage(ref);

    try {
      await supabase.from("contact_submissions").insert({
        name: checkout.name,
        email: checkout.email,
        subject: `VIVA Order ${ref} — ${money(cartTotal)}`,
        message,
      });
    } catch (e) {
      // Deliberately swallowed. The customer's route to buying is WhatsApp;
      // losing our copy of the record is our problem, not theirs.
      console.error("Order log failed (non-fatal):", e);
    }

    // Opened directly in the click's task so mobile Safari does not treat
    // it as an unsolicited popup. wa.me handles both app and web.
    window.open(
      whatsappLink(message),
      "_blank",
      "noopener,noreferrer",
    );

    setOrderRef(ref);
    setOrderStatus("sent");
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name,
        email: form.email,
        subject: `VIVA Enquiry: ${form.interest || "General"}`,
        message: form.message,
      });
      if (error) throw error;
      supabase.functions.invoke("notify-admin", {
        body: { type: "contact", data: { ...form, subject: `VIVA Enquiry: ${form.interest || "General"}` } },
      }).catch(() => {});
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const scrollToEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("viva-enquiry")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      <NavBar />
      <VivaLaunchModal />

      {/* ═══════════════════════════════════════════════════════
          HERO — Responsive Luxury Editorial
          One composition on every viewport: full-bleed film behind
          centered copy, held legible by a graded burgundy scrim. Desktop
          previously split the frame — burgundy panel with left-aligned
          text on one side, video confined to a 46% right column on the
          other. That seam is gone; the film now covers the whole stage
          and the copy sits centered on top of it, the same technique
          mobile already used.
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{
        minHeight: "clamp(680px, 100svh, 1000px)",
        background: BURGUNDY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* ── FILM STAGE ──────────────────────────────────────────────
            Full-bleed on every breakpoint. Both films stay mounted and
            crossfade on opacity — no presence choreography that can stall
            while a container is display:none, and never an empty stage. */}
        <div
          className="absolute inset-0"
          style={{ overflow: "hidden", background: BURGUNDY }}
        >
          {/* ── BASE PLATE ───────────────────────────────────────────────
              A real element, not a poster attribute. The films sit on top of
              it and fade in only once they can play, so on a slow or failing
              connection this is simply what the hero is — never a blank panel.
              At 50KB / 19KB it paints long before any film could.

              This is also the layer that carries the accessible description:
              the films above are decorative duplicates and are hidden from
              assistive tech. */}
          <img
            src="/viva/hero-fallback-1664.webp"
            srcSet="/viva/hero-fallback-900.webp 900w, /viva/hero-fallback-1664.webp 1664w"
            sizes="100vw"
            alt="Two models in the Batya Collection — a pink woven kimono top and an olive striped kimono top, both with wide-leg pleated denim and gold jewellery."
            fetchPriority="high"
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // Mirrors the loop film's desktop anchor (see HERO_FILMS) so the
              // plate and the film it precedes crop the same way — no visible
              // jump in framing the instant the video takes over.
              objectPosition: isDesktop ? "center 28%" : "center 38%",
              display: "block",
              filter: heroFilmFilter,
            }}
            onError={e => {
              // Last resort: if even the plate fails, fall back to the JPEG
              // rather than exposing burgundy with a broken-image glyph.
              const img = e.currentTarget;
              if (!img.dataset.fallbackTried) {
                img.dataset.fallbackTried = "1";
                img.srcset = "";
                img.src = "/viva/hero-fallback.jpg";
              }
            }}
          />

          {HERO_FILMS.map((film, i) => (
            <video
              key={film.id}
              ref={el => { filmRefs.current[i] = el; }}
              src={isDesktop ? film.desktop : film.mobile}
              autoPlay={i === 0}
              muted
              loop
              playsInline
              aria-hidden="true"
              preload={i === 0 ? "auto" : "metadata"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                // Per-film, per-viewport anchor — see the HERO_FILMS comment
                // for why desktop and mobile cannot share one crop origin.
                objectPosition: isDesktop ? film.focusDesktop : film.focusMobile,
                display: "block",
                filter: heroFilmFilter,
                // Held back until the clip can actually play, so a stalled
                // download shows the plate rather than a black rectangle.
                opacity: i === heroFilmIndex && filmsReady[i] ? 1 : 0,
                // Symmetric ease so neither clip dominates the dissolve
                transition: reduced ? "none" : `opacity ${FILM_FADE_MS}ms cubic-bezier(0.45,0,0.55,1)`,
              }}
              onCanPlay={() => setFilmsReady(r => (r[i] ? r : r.map((v, n) => (n === i ? true : v))))}
              onError={() => setFilmsReady(r => (!r[i] ? r : r.map((v, n) => (n === i ? false : v))))}
            />
          ))}

          {/* Mobile scrim — the ombre gradient carries legibility on its own
              again; the backing plate that briefly wrapped the masthead is
              gone. That plate existed because the ramp used to reach real
              density only around the 56% mark, and the masthead's top
              (roughly 50-52% down the frame) sat just above that line —
              measured against a bright frame, it held to ~4.2:1, short of
              the 4.5:1 floor, and a box was how that got closed. The client
              wants the gradient itself, not a panel breaking it up.
              Re-solved the shape instead of patching around it: the same
              clear window survives in the upper-middle (16-30%, where the
              garment reads), but the climb into density now starts by 40%
              and is essentially there by 48% — covering the masthead
              directly rather than a few percentage points past it. Verified
              against a realistic worst-case frame (not a theoretical pure
              white, which registers as darker than anything actually in
              this footage): every masthead/eyebrow landmark holds at least
              4.66:1, real margin, gradient alone. */}
          <div
            className="md:hidden"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(110,0,37,0.32) 0%, rgba(110,0,37,0.12) 16%, rgba(110,0,37,0.22) 30%, rgba(110,0,37,0.50) 40%, rgba(110,0,37,0.80) 48%, rgba(110,0,37,0.90) 56%, rgba(110,0,37,0.95) 70%, rgba(110,0,37,0.985) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Mobile vignette — draws the eye to the garment in the clear window
              and keeps the frame edges from competing with the copy. */}
          <div
            className="md:hidden"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(115% 62% at 50% 24%, rgba(110,0,37,0) 38%, rgba(80,0,27,0.34) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* ── DESKTOP SCRIM ────────────────────────────────────────────
              Two real problems found in the previous version, both from a
              live screenshot rather than the contrast math alone (the
              numbers were passing; the frame still looked wrong).

              1. It had silently stopped being monotonic. The prior "ease
                 the ground" edit only checked contrast, not shape — it left
                 a peak at 46% with the true bottom (100%) LIGHTER (0.48)
                 than the upper-middle (0.92). That is a hump, the same
                 defect corrected two commits earlier, just relocated.

              2. Even where the shape *was* dense as designed, this scrim
                 and the vignette below it both paint burgundy over the same
                 area and compound: 0.90 linear + 0.16 vignette layered on
                 top does not add to 1.06, it composes to ~92% effective
                 coverage (1-(1-0.90)(1-0.16)) — under 10% of the original
                 video was ever getting through at the masthead, which is
                 exactly the near-solid wash the screenshot showed.

              Direction, quoted directly: "the chest level upward part of
              the video [should be] much clearer than the bottom part...
              halfway upward it is quite clear, however... the text is also
              quite visible." That is two requirements pulling against each
              other at the same location, and no reshaping of a translucent
              wash resolves both there — solving for guaranteed small-text
              contrast in that zone requires ~85-90% coverage; "quite
              clear" video means nowhere near that. Something else has to
              carry legibility. See the text-stroke treatment on the
              masthead/eyebrow elements below — that is the actual fix for
              the text; this gradient's job now is only to be the ombre the
              brief described: genuinely monotonic, strong only near the
              base, and clear enough through the upper two-thirds that the
              model reads as a photograph again, not a color field. Video
              visibility now runs roughly 70% at the wordmark down to 39%
              at the description, versus ~8-10% before. */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(110,0,37,0.14) 0%, rgba(110,0,37,0.20) 15%, rgba(110,0,37,0.28) 30%, rgba(110,0,37,0.36) 46%, rgba(110,0,37,0.46) 58%, rgba(110,0,37,0.60) 70%, rgba(110,0,37,0.76) 84%, rgba(110,0,37,0.90) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Desktop vignette — pulled back sharply above the vertical
              center (0.06 flat through 45%, where the masthead sits) so it
              stops stacking on top of the linear gradient there and
              compounding into near-total coverage. It now only does real
              work in the lower half, closing the left/right edges under
              the heading/description on wide monitors. */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(68% 86% at 50% 50%, rgba(110,0,37,0.06) 0%, rgba(110,0,37,0.06) 45%, rgba(110,0,37,0.16) 70%, rgba(110,0,37,0.12) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Progress rail — which film is showing, centered beneath the copy
            now that the copy itself is centered rather than left-aligned. */}
        <div
          className="hidden md:flex absolute"
          style={{
            bottom: "clamp(32px, 4vw, 56px)",
            left: "50%",
            transform: "translateX(-50%)",
            gap: 10,
            zIndex: 12,
          }}
        >
          {HERO_FILMS.map((film, i) => (
            <button
              key={film.id}
              type="button"
              onClick={() => setHeroFilmIndex(i)}
              aria-label={`Show film ${i + 1} of ${HERO_FILMS.length}`}
              aria-current={i === heroFilmIndex}
              style={{
                width: i === heroFilmIndex ? 44 : 22,
                height: 2,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === heroFilmIndex ? GOLD : "rgba(255,255,255,0.3)",
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.5s ease",
              }}
            />
          ))}
        </div>

        {/* Content wrapper — responsive layout */}
        <div
          className="relative w-full"
          style={{
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            // Stretch so the mobile block can bottom-anchor via mt-auto while
            // the desktop block still centres on the justifyContent below.
            alignSelf: "stretch",
            justifyContent: "center",
            padding: "clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px)",
          }}
        >
          {/* Back button — desktop top-left, mobile top-center */}
          <motion.button
            type="button"
            onClick={() => navigate("/")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            style={{
              position: "absolute",
              // Offset by the padding below so the label stays optically aligned
              // to the content edge while the hit area extends past it.
              top: "calc(clamp(24px, 5vw, 60px) - 12px)",
              left: "calc(clamp(20px, 5vw, 80px) - 10px)",
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.62)",
              cursor: "pointer",
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "clamp(10px, 2vw, 11px)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              // 44x44 minimum target — was a bare 12px glyph with no padding
              padding: "12px 10px",
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 500,
              // Shared by both viewports, sitting right at the top edge of
              // whichever film is playing — needs the same independent
              // protection as the rest of the hero copy now gets. A CSS
              // filter (not textShadow) so it shadows the icon too, not
              // just the "Back" label.
              filter: "drop-shadow(0 1px 6px rgba(60,0,20,0.55))",
            }}
            whileHover={reduced ? {} : { color: "#FFFFFF", x: -3 }}
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            <span>Back</span>
          </motion.button>

          {/* MOBILE LAYOUT — bottom-anchored editorial.
              Three groups (brand / collection / action) separated by a single
              rule, rather than the previous ten-item stack where three gold
              text items and two rules competed for the same eye. */}
          <div className="md:hidden mt-auto flex flex-col items-center text-center w-full" style={{ paddingTop: "clamp(56px, 18vh, 130px)" }}>
            {/* Brand mark — kept as a wordmark, not a heading. "Batya" below is
                the page's h1; VIVA is already the navbar logotype.

                No backing plate — the client's own direction: "my attention
                is on the color gradient... it's like ombre from bottom to
                top," and asked for the panel gone, back to how mobile looked
                before it. The scrim above was reshaped rather than patched
                around: its climb into density now starts by 40% and is
                essentially there by 48%, covering this block directly
                instead of catching up a few points past it. Text-shadow
                restored as the per-element backup it always was before the
                plate existed — same recipe as the H1 and description below,
                which never lost theirs. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.28 }}
              style={{
                fontFamily: CORMORANT,
                // Was 60px — larger than the headline it introduces. At masthead
                // scale the wordmark leads, then hands over to the collection.
                fontSize: "clamp(30px, 7.4vw, 40px)",
                fontWeight: 400,
                letterSpacing: "0.34em",
                lineHeight: 1,
                color: GOLD,
                // Optical centring: the trailing letterspace pushes the word left
                textIndent: "0.34em",
                textShadow: "0 2px 22px rgba(60,0,20,0.65)",
              }}
            >
              VIVA
            </motion.div>

            {/* Attribution */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.34 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(9px, 2.4vw, 10px)",
                // Matches the wordmark's tracking so the pair reads as a lockup
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                // Kept at the raised 0.82 (was 0.6 originally) — the extra
                // opacity is doing real work now that there is no plate
                // underneath it, not just margin on top of one.
                color: "rgba(255,255,255,0.82)",
                margin: "10px 0 0 0",
                fontWeight: 500,
                textShadow: "0 1px 12px rgba(60,0,20,0.55)",
              }}
            >
              By Viera Amber
            </motion.p>

            {/* Hairline — internal to the lockup, not a section divider */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 38 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              style={{
                height: 1,
                background: GOLD,
                opacity: 0.42,
                margin: "15px 0",
              }}
            />

            {/* Mantra — closes the lockup */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.44 }}
              style={{
                fontFamily: CORMORANT,
                fontSize: "clamp(15px, 3.5vw, 18px)",
                fontStyle: "italic",
                // Kept at the raised 0.92 (was 0.8) for the same reason as
                // attribution above.
                color: "rgba(212,175,55,0.92)",
                margin: 0,
                // Descender clearance for the 'y' in "by"
                lineHeight: 1.3,
                paddingBottom: 2,
                textShadow: "0 1px 14px rgba(60,0,20,0.6)",
              }}
            >
              For her, by her.
            </motion.p>

            {/* Eyebrow — back to plain floating text, no chip. This is the
                landmark that measured tightest without a plate (mantra and
                this sit closest to the 4.5:1 floor); the reshaped gradient
                plus its own text-shadow is what carries it now. */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.54 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(11px, 2.6vw, 12px)",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: GOLD,
                margin: "clamp(34px, 8vw, 48px) 0 clamp(14px, 3.4vw, 18px) 0",
                fontWeight: 500,
                textShadow: "0 1px 12px rgba(60,0,20,0.6)",
              }}
            >
              The Maiden Collection
            </motion.p>

            {/* Collection heading — one heading, matching desktop */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.64 }}
              style={{
                fontFamily: CORMORANT,
                fontSize: "clamp(29px, 7.6vw, 42px)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.005em",
                color: "#FFFFFF",
                margin: 0,
                marginBottom: "clamp(14px, 3.5vw, 20px)",
                maxWidth: "15ch",
                textShadow: "0 2px 20px rgba(60,0,20,0.7)",
              }}
            >
              Batya: Daughters of Adonai
            </motion.h1>

            {/* Description — was 12px; now clears the 15px floor, and measured
                in ch rather than a fixed 280px that cramped larger handsets. */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.66 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(15px, 3.7vw, 16px)",
                lineHeight: 1.65,
                color: "rgba(255, 255, 255, 0.90)",
                margin: 0,
                marginBottom: "clamp(26px, 6vw, 36px)",
                maxWidth: "34ch",
                textShadow: "0 1px 14px rgba(60,0,20,0.65)",
              }}
            >
              Structured tailoring meets fluid artistic silhouettes — wearable art for the woman who wears her confidence out loud.
            </motion.p>

            {/* Mobile CTA Buttons — Full width stacked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.72 }}
              className="flex flex-col gap-3 w-full"
              style={{ maxWidth: 340 }}
            >
              {/* Primary — mirrors the desktop CTA. Previously this read
                  "Enquire About a Commission" while linking to #viva-shop. */}
              <a href="#viva-shop" style={{ textDecoration: "none", width: "100%" }}>
                <motion.button
                  type="button"
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  style={{
                    width: "100%",
                    background: GOLD,
                    color: "#1A1A1A",
                    border: "none",
                    padding: "16px 18px",
                    minHeight: 48,
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "clamp(12px, 2.9vw, 13px)",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: 1,
                  }}
                >
                  Shop the Collection
                </motion.button>
              </a>
              {/* Secondary — pairs with desktop. Previously labelled
                  "Try It On Virtually" while calling scrollToEnquiry; it now
                  actually goes to the try-on route it names. */}
              <motion.button
                type="button"
                onClick={() => navigate("/viva/try-on")}
                whileTap={reduced ? {} : { scale: 0.97 }}
                style={{
                  width: "100%",
                  background: "rgba(20,0,8,0.28)",
                  color: GOLD,
                  border: `1px solid ${GOLD}`,
                  padding: "16px 18px",
                  minHeight: 48,
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "clamp(12px, 2.9vw, 13px)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: 1,
                  backdropFilter: "blur(4px)",
                }}
              >
                Try It On Virtually
              </motion.button>
            </motion.div>

            {/* Film rail — mobile had no affordance at all, so two art-directed
                cuts swapped with nothing to indicate or control them. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.84 }}
              className="flex"
              style={{ gap: 10, marginTop: "clamp(24px, 6vw, 34px)" }}
            >
              {HERO_FILMS.map((film, i) => (
                <button
                  key={film.id}
                  type="button"
                  onClick={() => setHeroFilmIndex(i)}
                  aria-label={`Show film ${i + 1} of ${HERO_FILMS.length}`}
                  aria-current={i === heroFilmIndex}
                  style={{
                    // Hairline visual, 44px target: padding carries the hit area
                    padding: "20px 0",
                    width: i === heroFilmIndex ? 40 : 20,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <span style={{
                    display: "block",
                    height: 2,
                    background: i === heroFilmIndex ? GOLD : "rgba(255,255,255,0.34)",
                    transition: "background 0.5s ease",
                  }} />
                </button>
              ))}
            </motion.div>
          </div>

          {/* DESKTOP LAYOUT — centered editorial, the same technique as
              mobile: full-bleed film behind, graded scrim for legibility,
              copy centered on top. Previously this column sat left-aligned
              at 50% width, positioned to clear the video panel that no
              longer exists. Motion now runs on y like mobile's, not x —
              text sliding in sideways reads oddly once it is centered
              rather than pinned to an edge. */}
          <div
            className="hidden md:flex flex-col items-center text-center"
            style={{
              width: "100%",
              maxWidth: "clamp(560px, 60vw, 800px)",
              margin: "0 auto",
              paddingTop: "clamp(8px, 2vw, 30px)",
            }}
          >
            {/* ── MASTHEAD LOCKUP ──────────────────────────────────────────
                Wordmark, attribution and mantra read as one unit. No backing
                plate, and the scrim behind this block is now deliberately
                light — "chest level upward... much clearer... halfway
                upward it is quite clear" was the direction, and a
                translucent wash cannot be both clear and reliably dark
                enough for small text at the same spot. So legibility here
                no longer comes from the background at all: each element
                carries its own shadow, independent of whatever the film is
                doing underneath.

                A hard-edged text-stroke used to sit alongside that shadow
                (the subtitle trick) but the client flagged it live — it was
                reading as a visible thin outline around the letters, not as
                added legibility — so it's removed here. The shadow alone is
                what's carrying contrast now. */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.20, ease: "easeOut" }}
                style={{
                  fontFamily: CORMORANT,
                  // Enlarged and set genuinely bold — Cormorant Garamond 700
                  // is one of the weights actually loaded (index.html), not
                  // a browser-faked bold, so this is real ink weight, not
                  // just a bigger version of the thin 400 cut.
                  fontSize: "clamp(34px, 3.2vw, 48px)",
                  fontWeight: 700,
                  letterSpacing: "0.34em",
                  lineHeight: 1,
                  color: GOLD,
                  // Optical centring: the trailing letterspace pushes the word
                  // left of true-center, same correction mobile's wordmark uses.
                  textIndent: "0.34em",
                  // The two-layer shadow from the last round fixed bright-frame
                  // legibility but overcorrected — reported as "dark shadows,
                  // not bright and bold." Bold, larger letterforms carry far
                  // more of their own visual weight than the thin 400 cut did,
                  // so they need less shadow doing the work: both layers eased
                  // back (tight 0.75->0.55, wide 0.42->0.28 alpha; wide blur
                  // 10px->6px) rather than removed outright, so some bright-
                  // frame insurance survives without the letters reading dim.
                  // The text-stroke that used to sit alongside this shadow is
                  // gone — client flagged it as a visible thin outline around
                  // the letters, not as legibility help.
                  textShadow: "0 1px 2px rgba(30,0,8,0.55), 0 0 6px rgba(30,0,8,0.28)",
                }}
              >
                VIVA
              </motion.div>

              {/* Attribution — same tracking as the wordmark locks the pair together */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.27, ease: "easeOut" }}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  // Same ~1.4x expansion as the wordmark.
                  fontSize: "clamp(13px, 1.05vw, 15px)",
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  // Kept at the raised 0.82 (was 0.55 originally) — the
                  // extra opacity is doing real work now that there is no
                  // plate underneath it, not just margin on top of one.
                  color: "rgba(255,255,255,0.82)",
                  margin: "10px 0 0 0",
                  // Already the heaviest DM Sans cut this project loads
                  // (300/400/500 only, per index.html) — no bolder weight
                  // to move to without a synthetic-bold browser fallback,
                  // so the size increase is carrying this one alone.
                  fontWeight: 500,
                  // Same two-layer shadow fix as the wordmark: this line went
                  // the softest of all four against a bright frame, being
                  // both the smallest text and the lowest-contrast color
                  // (white, not gold). No stroke — see wordmark comment above.
                  textShadow: "0 1px 1.5px rgba(30,0,8,0.7), 0 0 8px rgba(30,0,8,0.4)",
                }}
              >
                By Viera Amber
              </motion.p>

              {/* Hairline — internal to the lockup, not a section divider */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 38 }}
                transition={{ duration: 0.7, delay: 0.33, ease: "easeOut" }}
                style={{
                  height: 1,
                  background: GOLD,
                  opacity: 0.42,
                  margin: "16px auto",
                }}
              />

              {/* Mantra — closes the lockup */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.39, ease: "easeOut" }}
                style={{
                  fontFamily: CORMORANT,
                  // Same ~1.4x expansion as the wordmark.
                  fontSize: "clamp(21px, 1.75vw, 25px)",
                  fontStyle: "italic",
                  // Cormorant Garamond 600 italic is loaded (index.html) —
                  // real bold italic, matching the wordmark's move to a
                  // genuinely heavier cut rather than just scaling the
                  // thin 400 up.
                  fontWeight: 600,
                  // Kept at the raised 0.92 (was 0.78) for the same reason
                  // as attribution above.
                  color: "rgba(212,175,55,0.92)",
                  margin: 0,
                  // Descender clearance for the 'y' in "by"
                  lineHeight: 1.3,
                  paddingBottom: 2,
                  // Same two-layer shadow fix as the wordmark — also thin
                  // Cormorant italic, needed the same insurance for a
                  // bright frame. No stroke — see wordmark comment above.
                  textShadow: "0 1px 2px rgba(30,0,8,0.75), 0 0 9px rgba(30,0,8,0.4)",
                }}
              >
                For her, by her.
              </motion.p>
            </div>

            {/* Eyebrow — back to plain floating text, no chip. Same shadow
                treatment as the masthead — the reshaped gradient behind it
                is deliberately light now, so the glyphs carry their own
                shadow instead of leaning on background density. No stroke —
                see wordmark comment above. */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.48, ease: "easeOut" }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(11px, 0.92vw, 13px)",
                fontWeight: 500,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: GOLD,
                margin: "clamp(38px, 4.4vw, 60px) 0 clamp(18px, 2vw, 26px) 0",
                // Same two-layer shadow fix as the rest of the masthead.
                textShadow: "0 1px 2px rgba(30,0,8,0.72), 0 0 8px rgba(30,0,8,0.4)",
              }}
            >
              The Maiden Collection
            </motion.p>

            {/* Hero heading — one heading, as on mobile. Was previously split
                into a 148px "Batya" with "Daughters of Adonai" set beneath it
                as a separate line, which read as two unrelated titles. */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.56, ease: [0.12, 0.72, 0.48, 1] }}
              style={{
                fontFamily: CORMORANT,
                fontSize: "clamp(40px, 5vw, 74px)",
                fontWeight: 300,
                lineHeight: 1.06,
                color: "#FFFFFF",
                margin: 0,
                marginBottom: "clamp(20px, 2.4vw, 32px)",
                letterSpacing: "-0.012em",
                textShadow: "0 2px 22px rgba(60,0,20,0.7)",
              }}
            >
              Batya: Daughters of Adonai
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.66, ease: "easeOut" }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(14px, 1.1vw, 17px)",
                fontWeight: 400,
                lineHeight: 1.75,
                color: "rgba(255, 255, 255, 0.85)",
                margin: "0 auto",
                marginBottom: "clamp(28px, 3.2vw, 44px)",
                maxWidth: "46ch",
                textShadow: "0 1px 14px rgba(60,0,20,0.6)",
              }}
            >
              Structured tailoring meets fluid artistic silhouettes — wearable art for the woman who wears her confidence out loud.
            </motion.p>

            {/* Desktop CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.74 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
            >
              <a href="#viva-shop" style={{ textDecoration: "none" }}>
                <motion.button
                  type="button"
                  whileHover={reduced ? {} : { scale: 1.04, backgroundColor: "#E5C55A" }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  style={{
                    background: GOLD,
                    color: "#1A1A1A",
                    border: "none",
                    padding: "clamp(15px, 1.5vw, 18px) clamp(30px, 3.2vw, 44px)",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "clamp(11px, 1.05vw, 13px)",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    boxShadow: "0 14px 42px rgba(212, 175, 55, 0.25)",
                  }}
                >
                  Shop the Collection
                </motion.button>
              </a>
              {/* Try-on — same pair as mobile. This is also the only UI route
                  into /viva/try-on since the old stub section was removed. */}
              <motion.button
                type="button"
                onClick={() => navigate("/viva/try-on")}
                whileHover={reduced ? {} : { scale: 1.04, backgroundColor: "rgba(40,0,14,0.5)" }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                style={{
                  // Was rgba(255,255,255,0.03) — essentially transparent, so
                  // this button's legibility depended entirely on the scrim
                  // behind it happening to be dark enough. It now carries its
                  // own dark chip, independent of whatever frame is playing.
                  background: "rgba(40,0,14,0.34)",
                  color: GOLD,
                  border: `1.5px solid ${GOLD}`,
                  padding: "clamp(15px, 1.5vw, 18px) clamp(30px, 3.2vw, 44px)",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "clamp(11px, 1.05vw, 13px)",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: 1,
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(8px)",
                }}
              >
                Try It On Virtually
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHILOSOPHY — editorial triptych, visual-first
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: CREAM, position: "relative", overflow: "hidden" }}>
        {/* Top rule */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: BURGUNDY, opacity: 0.18 }} />

        {/* Section header — centred editorial */}
        <div className="mx-auto px-6" style={{ maxWidth: 1100, paddingTop: 80, paddingBottom: 64, textAlign: "center" }}>
          <motion.p
            variants={fadeVariants} initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, color: BURGUNDY, letterSpacing: "6px", textTransform: "uppercase", marginBottom: 18, opacity: 0.55 }}
          >The VIVA Philosophy</motion.p>

          <motion.h2
            variants={slideUpVariants} initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            style={{ fontFamily: CORMORANT, fontSize: "clamp(30px, 4.5vw, 56px)", fontWeight: 400, fontStyle: "italic", color: DARK_TEXT, margin: "0 auto 0", lineHeight: 1.1, maxWidth: 640 }}
          >
            She wears her confidence out loud.
          </motion.h2>
        </div>

        {/* Divider rule */}
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div style={{ height: 1, background: BURGUNDY, opacity: 0.12 }} />
        </div>

        {/* Three pillars triptych */}
        <motion.div
          ref={pillarsRef}
          variants={staggerVariants} initial="hidden"
          animate={pillarsInView ? "visible" : "hidden"}
          className="mx-auto grid grid-cols-1 md:grid-cols-3"
          style={{ maxWidth: 1100 }}
        >
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.heading}
              variants={cardVariants}
              className={i < 2 ? "md:border-r border-b md:border-b-0" : ""}
              style={{
                padding: "clamp(40px, 5vw, 72px) clamp(24px, 3.5vw, 52px)",
                borderColor: "rgba(110,0,37,0.12)",
                position: "relative",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              {/* Roman numeral watermark */}
              <div aria-hidden="true" style={{
                position: "absolute",
                bottom: "10%",
                right: i === 2 ? "6%" : "auto",
                left: i === 0 ? "6%" : "auto",
                ...(i === 1 ? { left: "50%", transform: "translateX(-50%)" } : {}),
                fontFamily: CORMORANT,
                fontSize: "clamp(80px, 11vw, 130px)",
                fontWeight: 700,
                color: BURGUNDY,
                opacity: 0.045,
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}>
                {p.numeral}
              </div>

              {/* Icon mark */}
              <div style={{ color: BURGUNDY, opacity: 0.7, marginBottom: 28 }}>
                {PILLAR_ICONS[i]}
              </div>

              {/* Gold rule */}
              <div style={{ width: 28, height: 1, background: GOLD, opacity: 0.55, marginBottom: 28 }} />

              {/* Pillar heading */}
              <h3 style={{
                fontFamily: CORMORANT,
                fontSize: "clamp(20px, 2.2vw, 27px)",
                fontWeight: 600,
                color: DARK_TEXT,
                margin: "0 0 20px",
                lineHeight: 1.15,
                letterSpacing: "0.02em",
              }}>{p.heading}</h3>

              {/* Single evocative line */}
              <p style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontSize: "clamp(14px, 1.35vw, 17px)",
                color: BURGUNDY,
                opacity: 0.72,
                margin: 0,
                lineHeight: 1.65,
                maxWidth: 220,
              }}>{p.line}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom rule */}
        <div style={{ height: 1, background: BURGUNDY, opacity: 0.1 }} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          BETWEEN-PILLAR VISUAL BREATHING ROOM — Editorial moment
          A lifestyle image breaks the text density and adds visual
          rhythm between the Philosophy pillars and the Shop section.
          Split-screen on desktop (image + descriptive moment), stacked
          on mobile. Maintains editorial calm with minimal copy overlay.
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: CREAM, paddingTop: 80, paddingBottom: 80 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image: left on desktop, top on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              className="order-2 lg:order-1"
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "2px",
                aspectRatio: "4/5",
              }}
            >
              <img
                src="/viva/lifestyle/lifestyle-01-single-product.webp"
                alt="VIVA Editorial — Woman embodying structured fluidity and artistic agency"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
                loading="lazy"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(110,0,37,0.06) 100%)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* Text: right on desktop, bottom on mobile */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              className="order-1 lg:order-2"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 24,
              }}
            >
              {/* Eyebrow */}
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 11,
                  color: BURGUNDY,
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  margin: 0,
                  opacity: 0.6,
                }}
              >
                The VIVA Philosophy in Motion
              </p>

              {/* Moment description */}
              <div>
                <h3
                  style={{
                    fontFamily: CORMORANT,
                    fontSize: "clamp(24px, 3.5vw, 36px)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: BURGUNDY,
                    margin: "0 0 16px 0",
                    lineHeight: 1.3,
                  }}
                >
                  Where precision meets the body in motion.
                </h3>
                <p
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    color: DARK_TEXT,
                    margin: 0,
                    lineHeight: 1.75,
                    opacity: 0.75,
                    maxWidth: "50ch",
                  }}
                >
                  Structured Fluidity is where every stitch aligns with intention. The body is a canvas for movement — our garments hold that motion with precision, then release it with grace.
                </p>
              </div>

              {/* Accent rule */}
              <div style={{ width: 32, height: 1, background: GOLD, opacity: 0.5 }} />

              {/* Supporting insight */}
              <p
                style={{
                  fontFamily: CORMORANT,
                  fontSize: "clamp(14px, 1.3vw, 17px)",
                  fontStyle: "italic",
                  color: BURGUNDY,
                  margin: 0,
                  lineHeight: 1.65,
                  opacity: 0.68,
                }}
              >
                Every garment is a declaration of who you are.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Old Collection Header and Shop sections removed here and consolidated
          into the new BATYA CURATED EDITORIAL MOMENT section above (positioned
          before Philosophy for easier shopping access). The modals and FABs
          below remain unchanged. */}

      {/* ═══════════════════════════════════════════════════════
          Modals, FABs, and interactive elements
          ═══════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════

      {/* ═══════════════════════════════════════════════════════
          SHOP CATALOGUE — Products only (no narrative)
          Clean, easy-to-browse collection grid positioned at the top
          for effortless shopping discovery.
          ═══════════════════════════════════════════════════════ */}
      <section id="viva-shop" className="w-full" style={{ background: ALABASTER, paddingTop: 80, paddingBottom: 80 }}>
        {/* Widened to match (not trail) the Editorial Masonry section below —
            the client's complaint was that lifestyle/aesthetic photography
            was reading larger and more prominent than the actual product
            shots, when the shop is the primary job of this page. 1100 was
            narrower than Editorial Masonry's 1280 for no functional reason;
            matching it, plus enlarging the card grid itself (see minmax
            below), is what actually fixes the imbalance — width alone
            wouldn't, since auto-fill would've just added a 5th small column. */}
        <div className="mx-auto px-6" style={{ maxWidth: 1360 }}>

          {/* Shop controls header */}
          <div className="flex items-center justify-between mb-12" style={{ flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 10,
                color: BURGUNDY,
                letterSpacing: "5px",
                textTransform: "uppercase",
                margin: "0 0 6px 0",
                opacity: 0.65,
              }}>Maiden Collection</p>
              <h2 style={{
                fontFamily: CORMORANT,
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 400,
                color: BURGUNDY,
                margin: 0,
                lineHeight: 1.1,
              }}>
                Batya: Daughters of Adonai
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Currency toggle */}
              <div style={{ display: "flex", border: `1px solid ${BURG_ALPHA}`, borderRadius: 4, overflow: "hidden" }}>
                {(["NGN", "USD"] as const).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 9,
                    letterSpacing: "1.5px",
                    fontWeight: 600,
                    padding: "7px 14px",
                    border: "none",
                    cursor: "pointer",
                    background: currency === c ? BURGUNDY : "transparent",
                    color: currency === c ? ALABASTER : BURGUNDY,
                    transition: "all 0.2s",
                    textTransform: "uppercase",
                  }}>{c}</button>
                ))}
              </div>
              {/* Cart button */}
              <button onClick={() => setCartOpen(true)} style={{
                position: "relative",
                background: BURGUNDY,
                border: "none",
                borderRadius: 4,
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 9,
                letterSpacing: "1.5px",
                color: GOLD,
                textTransform: "uppercase",
                fontWeight: 600,
                transition: "all 0.2s",
              }}>
                <ShoppingBag size={13} />
                Cart
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: GOLD,
                    color: DARK_TEXT,
                    fontSize: 8,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* THREE COLLECTION SECTIONS — Ajogún, Nkà, Daughters of Adonai.
              Each renders in its own labeled block instead of one flat
              "Garments" grid, so a shopper can tell at a glance which
              collection a piece belongs to. Same 380px card size and card
              components as before — only the grouping is new. */}
          {([
            { key: "ajogun" as const, eyebrow: "The Inheritance", title: "Ajogún Collection" },
            { key: "nka" as const, eyebrow: "The Craftsmanship", title: "Nkà Garment Collection" },
            { key: "daughters" as const, eyebrow: "Graphic Apparel", title: "Daughters of Adonai Collection" },
          ]).map(section => {
            const products = catalogue.filter(p => p.type === "garment" && p.collection === section.key);
            if (products.length === 0) return null;
            return (
              <div key={section.key} style={{ marginBottom: 64 }}>
                <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${BURG_ALPHA}` }}>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 8, color: BURGUNDY, opacity: 0.6,
                    letterSpacing: "3.5px", textTransform: "uppercase", margin: "0 0 4px 0",
                  }}>{section.eyebrow}</p>
                  <h3 style={{ fontFamily: CORMORANT, fontSize: 24, fontWeight: 600, color: DARK_TEXT, margin: 0, lineHeight: 1.15 }}>
                    {section.title}
                  </h3>
                </div>

                {/* Fixed 2 columns rather than auto-fill. Auto-fill at a
                    380px floor gave 3 columns on desktop, which reads fine
                    for Nkà's 2 products but leaves a 4-item section (Ajogún,
                    Daughters of Adonai) with an orphaned 4th card alone on
                    its own row (3 + 1) — visually unbalanced. A flat 2-col
                    grid makes every section in this loop resolve to full
                    rows (2+2 or a single row of 2), and grid-cols-1 on
                    mobile (Tailwind's default, no override needed) means
                    the card is always exactly as wide as its column, so the
                    minmax-floor-vs-container overflow bug from the previous
                    pass can't recur here. */}
                <div ref={section.key === "ajogun" ? shopRef : undefined} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product, i) => {
                    const currentImageIndex = getCarouselIndex(product.id);
                    // Ajogún styles carry a Top / Pants / Both toggle; every
                    // other garment is a single-image-carousel, single-price
                    // card. Both share the same carousel state (keyed by
                    // product id) so there is one carousel implementation
                    // for the whole shop, not one per section.
                    if (product.purchaseOptions) {
                      return (
                        <AjogunStyleCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          reduced={reduced}
                          currentImageIndex={currentImageIndex}
                          onPrevImage={() => prevImage(product.id, product.images.length)}
                          onNextImage={() => nextImage(product.id, product.images.length)}
                          onOpenDetail={() => { setSelectedProductForDetail(product); setDetailModalOpen(true); }}
                          onAddToCart={addToCart}
                        />
                      );
                    }
                    return (
                      <StandardGarmentCard
                        key={product.id}
                        product={product}
                        currency={currency}
                        reduced={reduced}
                        index={i}
                        currentImageIndex={currentImageIndex}
                        onPrevImage={() => prevImage(product.id, product.images.length)}
                        onNextImage={() => nextImage(product.id, product.images.length)}
                        onOpenDetail={() => { setSelectedProductForDetail(product); setDetailModalOpen(true); }}
                        onAddToCart={addToCart}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* PRINTS GRID */}
          <div>
            <p style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 8,
              color: BURGUNDY,
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              margin: "0 0 16px 0",
              paddingBottom: 12,
              borderBottom: `1px solid ${BURG_ALPHA}`,
              opacity: 0.6,
            }}>Illustration Prints</p>

            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))" }}>
              {catalogue.filter(p => p.type === "print").map((product, i) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  whileHover={reduced ? {} : { y: -3, transition: { duration: 0.2 } }}
                  style={{
                    background: "#fff",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${BURG_ALPHA}`,
                    boxShadow: "0 1px 8px rgba(110,0,37,0.05)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "rgba(110,0,37,0.03)" }}>
                    <img src={product.images[0]} alt={product.title} loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top",
                        display: "block",
                      }} />
                  </div>

                  <div style={{ padding: "14px 14px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 7.5,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      background: `rgba(212,175,55,0.12)`,
                      color: `rgba(110,0,37,0.65)`,
                      padding: "3px 7px",
                      borderRadius: 2,
                      display: "inline-block",
                      marginBottom: 6,
                      width: "fit-content",
                    }}>{product.badge}</span>
                    <h3 style={{
                      fontFamily: CORMORANT,
                      fontSize: 17,
                      fontWeight: 600,
                      color: DARK_TEXT,
                      margin: "0 0 3px 0",
                    }}>{product.title}</h3>
                    <p style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 10.5,
                      color: "rgba(34,26,26,0.4)",
                      lineHeight: 1.4,
                      margin: "0 0 12px 0",
                    }}>{product.subtitle}</p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{
                        fontFamily: CORMORANT,
                        fontSize: 17,
                        fontWeight: 600,
                        color: BURGUNDY,
                      }}>
                        {currency === "NGN" ? `₦${product.priceNGN.toLocaleString()}` : `$${product.priceUSD}`}
                      </span>
                      <motion.button
                        onClick={() => addToCart(product)}
                        whileHover={reduced ? {} : { scale: 1.04 }}
                        whileTap={reduced ? {} : { scale: 0.96 }}
                        style={{
                          fontFamily: "DM Sans, system-ui, sans-serif",
                          fontSize: 8.5,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          background: BURGUNDY,
                          color: GOLD,
                          border: "none",
                          borderRadius: 3,
                          padding: "7px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          EDITORIAL MASONRY — Lifestyle + Narrative
          Hero landscape image (60%) paired with editorial narrative (40%),
          then two portrait images below in supporting grid.
          Creates editorial "L" or "F" reading pattern—sophisticated,
          unconventional, and perfectly balanced.
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: ALABASTER, paddingTop: 96, paddingBottom: 96 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>

          {/* ROW 1: MASONRY HERO — Large landscape image + Narrative text */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-16" style={{ alignItems: "start" }}>

            {/* Landscape hero image (60% on desktop, full on mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              className="lg:col-span-7"
              style={{
                position: "relative",
                aspectRatio: "16/10",
                overflow: "hidden",
                borderRadius: 2,
                background: BURGUNDY,
              }}
            >
              <img
                src="/viva/lifestyle/lifestyle-03-duo-moment.webp"
                alt="Batya Collection — Women in heritage-inspired styling"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
              {/* Subtle scrim for depth */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(110,0,37,0.08) 0%, rgba(110,0,37,0.15) 100%)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* Narrative text column (40% on desktop, full on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              className="lg:col-span-5"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
              }}
            >
              {/* Eyebrow */}
              <p style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(9px, 1vw, 11px)",
                color: BURGUNDY,
                letterSpacing: "5px",
                textTransform: "uppercase",
                margin: "0 0 12px 0",
                opacity: 0.65,
                fontWeight: 500,
              }}>The Batya Moment</p>

              {/* Serif headline */}
              <h2 style={{
                fontFamily: CORMORANT,
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: BURGUNDY,
                margin: "0 0 24px 0",
                lineHeight: 1.2,
              }}>
                Daughters of Adonai
              </h2>

              {/* Editorial narrative — summarizes the real collection
                  narrative (see VIVAStory.tsx for the full telling) rather
                  than generic heritage copy. Kept short and specific on
                  purpose: this is a teaser, the two women's full stories
                  live on the story page it links to below. */}
              <div style={{ marginBottom: 32 }}>
                <p style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "clamp(13px, 1.1vw, 15px)",
                  color: DARK_TEXT,
                  lineHeight: 1.75,
                  margin: "0 0 16px 0",
                }}>
                  Batya carries two women forward. One stood before Moses and claimed an inheritance the law said wasn't hers, and was declared right. One left behind a life measured entirely in what her hands had made.
                </p>
                <p style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "clamp(13px, 1.1vw, 15px)",
                  color: DARK_TEXT,
                  lineHeight: 1.75,
                  opacity: 0.75,
                }}>
                  Ajogún is for the woman claiming what already belongs to her. Nká is for the woman whose hands are her legacy. Together, they carry one line: she claims, she creates.
                </p>
              </div>

              {/* Trust signals */}
              <div style={{ marginBottom: 32 }}>
                {[
                  { value: "Made to Order", detail: "Bespoke Fit" },
                  { value: "48–72hrs", detail: "Delivery" },
                  { value: "Heritage Craft", detail: "Artisan-Inspired" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    viewport={{ once: true }}
                    style={{ marginBottom: i < 2 ? 16 : 0 }}
                  >
                    <p style={{
                      fontFamily: CORMORANT,
                      fontSize: "clamp(14px, 1.3vw, 18px)",
                      fontWeight: 600,
                      color: BURGUNDY,
                      margin: 0,
                    }}>
                      {item.value}
                    </p>
                    <p style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: "clamp(8px, 0.9vw, 10px)",
                      color: "rgba(110,0,37,0.5)",
                      margin: "4px 0 0 0",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}>
                      {item.detail}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Read the Full Story — the previous line here was a plain
                  "scroll to explore" cue with nowhere to go. This is now an
                  actual link into the full narrative (VIVAStory.tsx), the
                  one CTA on this page whose intent ("read the story") is
                  distinct from every other CTA ("shop", "try on"). */}
              <Link
                to="/viva/story"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: CORMORANT,
                  fontSize: "clamp(14px, 1.1vw, 16px)",
                  fontStyle: "italic",
                  color: BURGUNDY,
                  lineHeight: 1.6,
                  marginTop: "auto",
                  textDecoration: "none",
                  borderBottom: `1px solid ${BURG_ALPHA}`,
                  paddingBottom: 2,
                  width: "fit-content",
                  transition: "border-color 0.2s, opacity 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = BURGUNDY; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = BURG_ALPHA; }}
              >
                Read the full story
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>

          {/* ROW 2: SUPPORTING PORTRAITS — Two images side-by-side */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
          >
            {/* Portrait 1 */}
            <div
              style={{
                position: "relative",
                aspectRatio: "3/4",
                overflow: "hidden",
                borderRadius: 2,
                background: BURGUNDY,
              }}
            >
              <img
                src="/viva/lifestyle/lifestyle-01-single-product.webp"
                alt="Batya Collection — Single lifestyle moment"
                loading="lazy"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(110,0,37,0.06) 0%, rgba(110,0,37,0.12) 100%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Portrait 2 */}
            <div
              style={{
                position: "relative",
                aspectRatio: "3/4",
                overflow: "hidden",
                borderRadius: 2,
                background: BURGUNDY,
              }}
            >
              <img
                src="/viva/lifestyle/lifestyle-02-landscape-editorial.webp"
                alt="Batya Collection — Editorial lifestyle"
                loading="lazy"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(110,0,37,0.06) 0%, rgba(110,0,37,0.12) 100%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ENQUIRY — deep burgundy accent
          ═══════════════════════════════════════════════════════ */}
      <section
        id="viva-enquiry"
        className="w-full py-20"
        style={{ background: BURGUNDY }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 680 }}>
          <motion.div
            ref={enquiryRef}
            variants={staggerVariants} initial="hidden"
            animate={enquiryInView ? "visible" : "hidden"}
            className="flex flex-col" style={{ gap: 0 }}
          >
            <motion.p variants={fadeVariants}
              style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: `rgba(212,175,55,0.75)`, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 12px 0" }}
            >Commission Enquiry</motion.p>

            <motion.h2 variants={slideUpVariants}
              style={{ fontFamily: CORMORANT, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, color: ALABASTER, margin: "0 0 10px 0", lineHeight: 1.2 }}
            >Own a piece of VIVA.</motion.h2>

            <motion.p variants={fadeVariants}
              style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, fontWeight: 300, color: `rgba(250,249,246,0.52)`, lineHeight: 1.75, margin: "0 0 32px 0" }}
            >
              Select a piece and we'll have it ready for you in 48 to 72 hours. Tell us what you have in mind, whether a garment, an illustration or a collaboration, and we'll be in touch.
            </motion.p>

            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.5 }}
                  className="flex flex-col items-center text-center"
                  style={{ gap: 12, padding: "40px 0" }} aria-live="polite"
                >
                  <div style={{ width: 48, height: 48, borderRadius: "50%", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: GOLD }}>✓</div>
                  <p style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: ALABASTER, margin: 0 }}>Enquiry received.</p>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, fontWeight: 300, color: `rgba(250,249,246,0.48)`, margin: 0 }}>We'll be in touch within 48 hours.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onSubmit={handleEnquiry}
                  className="flex flex-col" style={{ gap: 12 }}
                  aria-label="VIVA commission enquiry form"
                >
                  <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="flex flex-col" style={{ gap: 6 }}>
                      <label htmlFor="viva-name" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: `rgba(212,175,55,0.65)`, letterSpacing: "2px", textTransform: "uppercase" }}>Name *</label>
                      <input id="viva-name" type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={enquiryInputStyle}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                      />
                    </div>
                    <div className="flex flex-col" style={{ gap: 6 }}>
                      <label htmlFor="viva-email" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: `rgba(212,175,55,0.65)`, letterSpacing: "2px", textTransform: "uppercase" }}>Email *</label>
                      <input id="viva-email" type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={enquiryInputStyle}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col" style={{ gap: 6 }}>
                    <label htmlFor="viva-interest" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: `rgba(212,175,55,0.65)`, letterSpacing: "2px", textTransform: "uppercase" }}>I'm interested in</label>
                    <select id="viva-interest" value={form.interest}
                      onChange={(e) => setForm({ ...form, interest: e.target.value })}
                      style={{ ...enquiryInputStyle, backgroundColor: "rgba(0,0,0,0.25)", color: form.interest ? ALABASTER : "rgba(250,249,246,0.35)" }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                    >
                      <option value="" style={{ color: "#666", background: "#2D0010" }}>Select an option...</option>
                      <option value="Bespoke Garment" style={{ color: "#111", background: "#fff" }}>Bespoke Garment</option>
                      <option value="Fashion Illustration Commission" style={{ color: "#111", background: "#fff" }}>Fashion Illustration Commission</option>
                      <option value="Brand Collaboration" style={{ color: "#111", background: "#fff" }}>Brand Collaboration</option>
                      <option value="Editorial / Lookbook" style={{ color: "#111", background: "#fff" }}>Editorial / Lookbook</option>
                      <option value="General Enquiry" style={{ color: "#111", background: "#fff" }}>General Enquiry</option>
                    </select>
                  </div>

                  <div className="flex flex-col" style={{ gap: 6 }}>
                    <label htmlFor="viva-message" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: `rgba(212,175,55,0.65)`, letterSpacing: "2px", textTransform: "uppercase" }}>Tell us more *</label>
                    <textarea id="viva-message" required rows={5} value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your vision, timeline, and any specific references..."
                      style={{ ...enquiryInputStyle, resize: "vertical", minHeight: 120 }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                    />
                  </div>

                  {status === "error" && (
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "#FFAAAA", margin: 0 }}>
                      Something went wrong. Please email us directly at admin@vieraamber.com
                    </p>
                  )}

                  <motion.button
                    type="submit" disabled={status === "loading"}
                    whileHover={reduced ? {} : { opacity: 0.88, scale: 1.01 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    className="flex items-center justify-center gap-2"
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10,
                      letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 500,
                      background: status === "loading" ? `rgba(212,175,55,0.55)` : GOLD,
                      color: DARK_TEXT,
                      border: "none", borderRadius: 6,
                      padding: "14px", cursor: status === "loading" ? "not-allowed" : "pointer", width: "100%",
                    }}
                  >
                    {status === "loading" ? "Sending..." : <><Send size={12} /> Send Enquiry</>}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid rgba(212,175,55,0.1)`, padding: "24px", textAlign: "center", background: "#1A0808" }}>
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: `rgba(212,175,55,0.28)`, margin: 0, letterSpacing: "1px" }}>
          © {new Date().getFullYear()} Viera Amber. All rights reserved.
        </p>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          CART DRAWER — slide-in from right, WhatsApp checkout
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div key="cart-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.58)", zIndex: 200 }}
            />
            <motion.aside key="cart-drawer" role="dialog" aria-label="Shopping cart"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(440px, 100vw)", background: BURGUNDY, zIndex: 201,
                display: "flex", flexDirection: "column",
                boxShadow: "-24px 0 72px rgba(0,0,0,0.55)",
              }}
            >
              {/* Drawer header */}
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GOLD_ALPHA}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShoppingBag size={16} style={{ color: GOLD }} />
                  <span style={{ fontFamily: CORMORANT, fontSize: 20, fontWeight: 700, color: ALABASTER }}>Your Cart</span>
                  {cartCount > 0 && (
                    <span style={{ fontFamily: "DM Sans", fontSize: 9, letterSpacing: "1px", background: `rgba(212,175,55,0.18)`, color: GOLD, padding: "2px 8px", borderRadius: 20 }}>
                      {cartCount} item{cartCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button onClick={() => setCartOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(250,249,246,0.38)", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Cart items */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 0" }}>
                    <ShoppingBag size={32} style={{ color: `rgba(212,175,55,0.22)`, display: "block", margin: "0 auto 14px" }} />
                    <p style={{ fontFamily: CORMORANT, fontSize: 18, color: `rgba(250,249,246,0.38)`, margin: "0 0 6px 0" }}>Your cart is empty.</p>
                    <p style={{ fontFamily: "DM Sans", fontSize: 12, color: `rgba(250,249,246,0.22)`, margin: 0 }}>Add something beautiful.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingTop: 8 }}>
                    {cart.map((line) => {
                      const { product, qty, size, variantKey, variantLabel } = line;
                      const lineImage = variantKey
                        ? product.variants?.find(v => variantKey.startsWith(v.id))?.images[0] ?? product.images[0]
                        : product.images[0];
                      const unitNGN = line.unitPriceNGN ?? product.priceNGN;
                      const unitUSD = line.unitPriceUSD ?? product.priceUSD;
                      const rowKey = cartLineKey(line);
                      return (
                      <div key={rowKey} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 18, marginBottom: 18, borderBottom: `1px solid ${GOLD_ALPHA}` }}>
                        <div style={{ width: 66, height: 82, flexShrink: 0, borderRadius: 3, overflow: "hidden" }}>
                          <img src={lineImage} alt={product.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: CORMORANT, fontSize: 16, color: ALABASTER, margin: "0 0 2px 0", fontWeight: 600 }}>{product.title}</p>
                          <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(212,175,55,0.5)`, margin: "0 0 10px 0" }}>
                            {variantLabel ?? product.subtitle}
                          </p>

                          {/* Size — garments only. Prints have no size, and
                              asking for one would just be a question with no
                              right answer. */}
                          {product.type === "garment" && (
                            <div style={{ marginBottom: 10 }}>
                              <label htmlFor={`size-${rowKey}`} style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(250,249,246,0.5)`, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                Size *
                              </label>
                              <select
                                id={`size-${rowKey}`}
                                value={size ?? ""}
                                onChange={e => setLineSize(product.id, e.target.value as GarmentSize, variantKey)}
                                style={{
                                  width: "100%", minHeight: 40,
                                  background: "rgba(255,255,255,0.13)",
                                  border: `1px solid ${size ? GOLD_ALPHA : "rgba(255,170,170,0.5)"}`,
                                  borderRadius: 4, color: ALABASTER,
                                  fontFamily: "DM Sans", fontSize: 12, padding: "8px 10px",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="" disabled style={{ color: "#888" }}>Choose a size</option>
                                {GARMENT_SIZES.map(s => (
                                  <option key={s} value={s} style={{ background: BURGUNDY, color: ALABASTER }}>{s}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 0, border: `1px solid ${GOLD_ALPHA}`, borderRadius: 4 }}>
                              <button onClick={() => updateQty(product.id, -1, variantKey)}
                                style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", padding: "5px 10px", lineHeight: 1 }}>
                                <Minus size={10} />
                              </button>
                              <span style={{ fontFamily: "DM Sans", fontSize: 12, color: ALABASTER, minWidth: 18, textAlign: "center" }}>{qty}</span>
                              <button onClick={() => updateQty(product.id, 1, variantKey)}
                                style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", padding: "5px 10px", lineHeight: 1 }}>
                                <Plus size={10} />
                              </button>
                            </div>
                            <span style={{ fontFamily: CORMORANT, fontSize: 17, color: GOLD, fontWeight: 700 }}>
                              {currency === "NGN" ? `₦${(unitNGN * qty).toLocaleString()}` : `$${unitUSD * qty}`}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(product.id, variantKey)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: `rgba(250,249,246,0.2)`, padding: 2, marginTop: 2, flexShrink: 0 }}>
                          <X size={13} />
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cart footer — total + WhatsApp handoff */}
              {cart.length > 0 && (
                <div style={{ padding: "20px 24px", borderTop: `1px solid ${GOLD_ALPHA}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                    <span style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(212,175,55,0.5)`, letterSpacing: "2px", textTransform: "uppercase" }}>Total</span>
                    <span style={{ fontFamily: CORMORANT, fontSize: 26, color: GOLD, fontWeight: 700 }}>
                      {currency === "NGN" ? `₦${cartTotal.toLocaleString()}` : `$${cartTotal}`}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {orderStatus === "sent" ? (
                      <motion.div key="order-sent"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: "center", padding: "16px 0" }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, margin: "0 auto 12px" }}>
                          <MessageCircle size={18} />
                        </div>
                        <p style={{ fontFamily: CORMORANT, fontSize: 20, color: ALABASTER, margin: "0 0 6px 0", fontWeight: 700 }}>Your order is ready to send</p>
                        <p style={{ fontFamily: "DM Sans", fontSize: 12, color: `rgba(250,249,246,0.5)`, margin: 0, lineHeight: 1.6 }}>
                          We've opened WhatsApp with your order details. Press send there and Viera will confirm availability, shipping and payment.
                        </p>
                        {orderRef && (
                          <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(212,175,55,0.6)`, margin: "10px 0 0 0", letterSpacing: "1px" }}>
                            {orderRef}
                          </p>
                        )}
                        {/* WhatsApp can be blocked by a popup blocker, and on
                            desktop the app may not be installed. Never strand
                            the customer on a screen with no way forward. */}
                        <button
                          type="button"
                          onClick={() => orderRef && window.open(
                            whatsappLink(buildOrderMessage(orderRef)),
                            "_blank", "noopener,noreferrer",
                          )}
                          style={{
                            marginTop: 14, background: "none", border: `1px solid ${GOLD_ALPHA}`,
                            color: GOLD, borderRadius: 6, padding: "10px 16px", minHeight: 44,
                            fontFamily: "DM Sans", fontSize: 10, letterSpacing: "2px",
                            textTransform: "uppercase", cursor: "pointer",
                          }}
                        >
                          WhatsApp didn't open — try again
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="order-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Delivery details — required, because these are
                            physical made-to-measure pieces. Checkout used to
                            collect an email and nothing else, which left no
                            way to actually send the garment. */}
                        <p style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(212,175,55,0.55)`, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                          Delivery details
                        </p>

                        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                          {([
                            { k: "name",    label: "Full name",       type: "text",  ph: "Ada Okafor",        auto: "name" },
                            { k: "email",   label: "Email",           type: "email", ph: "you@example.com",   auto: "email" },
                            { k: "phone",   label: "Phone",           type: "tel",   ph: "+234 800 000 0000", auto: "tel" },
                            { k: "address", label: "Delivery address",type: "text",  ph: "Street and number", auto: "street-address" },
                          ] as const).map(f => (
                            <div key={f.k}>
                              <label htmlFor={`checkout-${f.k}`} style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(250,249,246,0.5)`, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                {f.label} *
                              </label>
                              <input
                                id={`checkout-${f.k}`}
                                type={f.type}
                                autoComplete={f.auto}
                                value={checkout[f.k]}
                                onChange={e => setCheckoutField(f.k)(e.target.value)}
                                placeholder={f.ph}
                                style={{ ...enquiryInputStyle, fontSize: 12 }}
                                onFocus={e => (e.target.style.borderColor = GOLD)}
                                onBlur={e => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                              />
                            </div>
                          ))}

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {([
                              { k: "city",  label: "City",  ph: "Lagos",       auto: "address-level2" },
                              { k: "state", label: "State", ph: "Lagos State", auto: "address-level1" },
                            ] as const).map(f => (
                              <div key={f.k}>
                                <label htmlFor={`checkout-${f.k}`} style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(250,249,246,0.5)`, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                  {f.label} *
                                </label>
                                <input
                                  id={`checkout-${f.k}`}
                                  type="text"
                                  autoComplete={f.auto}
                                  value={checkout[f.k]}
                                  onChange={e => setCheckoutField(f.k)(e.target.value)}
                                  placeholder={f.ph}
                                  style={{ ...enquiryInputStyle, fontSize: 12 }}
                                  onFocus={e => (e.target.style.borderColor = GOLD)}
                                  onBlur={e => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Measurements — asked once, not per garment. Required
                            only when a line is bespoke, where a size label
                            alone communicates nothing. Otherwise offered, since
                            a standard size plus real numbers still gives a
                            better fit than a size alone. */}
                        {garmentLines.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(212,175,55,0.55)`, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 4px 0" }}>
                              Measurements {wantsBespoke ? "*" : "(optional)"}
                            </p>
                            <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(250,249,246,0.4)`, margin: "0 0 8px 0", lineHeight: 1.5 }}>
                              {wantsBespoke
                                ? "You've chosen a made-to-measure piece — please add at least one measurement."
                                : "Helps Viera refine the fit. Inches or centimetres, whichever you know."}
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {([
                                { k: "bust",   label: "Bust",   ph: "34in" },
                                { k: "waist",  label: "Waist",  ph: "28in" },
                                { k: "hips",   label: "Hips",   ph: "38in" },
                                { k: "height", label: "Height", ph: "5ft 6" },
                              ] as const).map(f => (
                                <div key={f.k}>
                                  <label htmlFor={`m-${f.k}`} style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(250,249,246,0.5)`, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                    {f.label}
                                  </label>
                                  <input
                                    id={`m-${f.k}`}
                                    type="text"
                                    inputMode="text"
                                    value={measurements[f.k]}
                                    onChange={e => setMeasurement(f.k)(e.target.value)}
                                    placeholder={f.ph}
                                    style={{ ...enquiryInputStyle, fontSize: 12 }}
                                    onFocus={e => (e.target.style.borderColor = GOLD)}
                                    onBlur={e => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <motion.button onClick={handleWhatsAppCheckout}
                          disabled={!checkoutComplete || orderStatus === "sending"}
                          whileHover={!checkoutComplete || orderStatus !== "idle" ? {} : { opacity: 0.88 }}
                          whileTap={!checkoutComplete || orderStatus !== "idle" ? {} : { scale: 0.98 }}
                          style={{
                            width: "100%", padding: "14px", minHeight: 48,
                            fontFamily: "DM Sans", fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600,
                            background: !checkoutComplete || orderStatus === "sending" ? "rgba(212,175,55,0.38)" : GOLD,
                            color: DARK_TEXT, border: "none", borderRadius: 6,
                            cursor: !checkoutComplete ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          }}
                        >
                          <MessageCircle size={13} />
                          {orderStatus === "sending" ? "Preparing your order…" : `Complete order on WhatsApp`}
                        </motion.button>

                        {/* Say what the button does before it is pressed —
                            handing off to another app is a surprise otherwise. */}
                        <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(250,249,246,0.42)`, margin: "10px 0 0 0", textAlign: "center", lineHeight: 1.6 }}>
                          {checkoutComplete
                            ? `Opens WhatsApp with your ${money(cartTotal)} order. Viera confirms shipping and payment there.`
                            : linesNeedingSize.length > 0
                              // Name the piece. "Complete the fields above" makes
                              // the customer hunt for what is missing.
                              ? `Choose a size for ${linesNeedingSize.map(i => i.product.title).join(" and ")}.`
                            : wantsBespoke && !measurementsProvided
                              ? "Add at least one measurement for your made-to-measure piece."
                              : "Complete your delivery details to continue."}
                        </p>
                        {orderError && (
                          <p role="alert" style={{ fontFamily: "DM Sans", fontSize: 11, color: "#FFAAAA", margin: "10px 0 0 0", textAlign: "center", lineHeight: 1.5 }}>
                            {orderError}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.aside>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════
            TRY-ON MODAL — product photo upload + preview
            ═══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {tryOnModalOpen && selectedGarmentForTryOn && (
            <motion.div
              key="try-on-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeTryOnModal}
              style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 16,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}
              >
                {/* Header */}
                <div style={{ padding: "24px 28px", borderBottom: `1px solid ${BURG_ALPHA}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontFamily: "DM Sans", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: BURGUNDY, margin: 0, marginBottom: 4 }}>Try On</p>
                    <h3 style={{ fontFamily: CORMORANT, fontSize: 24, fontWeight: 700, color: BURGUNDY, margin: 0 }}>
                      {selectedGarmentForTryOn.title}
                    </h3>
                  </div>
                  <motion.button
                    onClick={closeTryOnModal}
                    whileHover={reduced ? {} : { scale: 1.1 }}
                    whileTap={reduced ? {} : { scale: 0.9 }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, display: "flex" }}
                  >
                    <X size={20} color={BURGUNDY} />
                  </motion.button>
                </div>

                {/* Content */}
                <div style={{ padding: "28px" }}>
                  {/* Photo upload */}
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontFamily: "DM Sans", fontSize: 13, letterSpacing: "1.5px", textTransform: "uppercase", color: BURGUNDY, fontWeight: 600, margin: "0 0 12px 0" }}>
                      Your Photo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTryOnPhotoSelect(e.target.files?.[0])}
                      style={{ display: "none" }}
                      id="try-on-file-input"
                    />
                    <label
                      htmlFor="try-on-file-input"
                      style={{
                        display: "flex", width: "100%", aspectRatio: personPhotoPreview ? "auto" : "4/3",
                        minHeight: 240, border: `2px dashed ${personPhotoPreview ? "transparent" : BURGUNDY}55`,
                        borderRadius: 12, background: "#FAFAFA", cursor: "pointer", overflow: "hidden",
                        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!personPhotoPreview) (e.currentTarget as HTMLLabelElement).style.borderColor = BURGUNDY;
                      }}
                      onMouseLeave={(e) => {
                        if (!personPhotoPreview) (e.currentTarget as HTMLLabelElement).style.borderColor = `${BURGUNDY}55`;
                      }}
                    >
                      {personPhotoPreview ? (
                        <img src={personPhotoPreview} alt="Your photo" style={{ width: "100%", height: "100%", maxHeight: 300, objectFit: "contain" }} />
                      ) : (
                        <>
                          <Upload size={28} color={BURGUNDY} opacity="0.5" />
                          <span style={{ fontFamily: "DM Sans", fontSize: 13, color: BURGUNDY, fontWeight: 600 }}>Upload your photo</span>
                          <span style={{ fontFamily: "DM Sans", fontSize: 11, color: `rgba(110,0,37,0.45)` }}>JPG or PNG · under 8MB</span>
                        </>
                      )}
                    </label>
                    {personPhotoPreview && (
                      <button
                        onClick={() => {
                          setPersonPhotoPreview(null);
                          setPersonPhotoFile(null);
                        }}
                        style={{ marginTop: 8, fontFamily: "DM Sans", fontSize: 11, color: BURGUNDY, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
                      >
                        Change photo
                      </button>
                    )}
                  </div>

                  {/* Error */}
                  {tryOnError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 14px", borderRadius: 8, background: "#FFEBEE", border: "1px solid #FFCDD2",
                        marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start",
                      }}
                    >
                      <AlertCircle size={16} color="#C62828" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: "DM Sans", fontSize: 12, color: "#C62828", lineHeight: 1.5 }}>{tryOnError}</span>
                    </motion.div>
                  )}

                  {/* Try-On Button */}
                  {!tryOnResult && (
                    <motion.button
                      onClick={runTryOn}
                      disabled={!personPhotoFile || tryOnStatus === "loading"}
                      whileHover={!personPhotoFile || tryOnStatus === "loading" ? {} : { scale: 1.02 }}
                      whileTap={!personPhotoFile || tryOnStatus === "loading" ? {} : { scale: 0.98 }}
                      style={{
                        width: "100%", padding: "14px", marginBottom: 12,
                        fontFamily: "DM Sans", fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600,
                        background: !personPhotoFile || tryOnStatus === "loading" ? `${BURGUNDY}4D` : BURGUNDY,
                        color: "#FFFFFF", border: "none", borderRadius: 8, cursor: !personPhotoFile ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                    >
                      {tryOnStatus === "loading" ? (
                        <>
                          <RefreshCw size={14} className={reduced ? "" : "animate-spin"} /> Styling your look…
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> Try It On
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Preview Result */}
                  {tryOnStatus === "done" && tryOnResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
                        <img src={tryOnResult} alt="Try-on result" style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} />
                      </div>
                      <motion.button
                        onClick={orderViaWhatsApp}
                        whileHover={reduced ? {} : { scale: 1.02 }}
                        whileTap={reduced ? {} : { scale: 0.98 }}
                        style={{
                          width: "100%", padding: "14px", marginBottom: 10,
                          fontFamily: "DM Sans", fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600,
                          background: "#25D366", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                      >
                        <Send size={14} /> Order on WhatsApp
                      </motion.button>
                      <button
                        onClick={() => {
                          setPersonPhotoPreview(null);
                          setPersonPhotoFile(null);
                          setTryOnResult(null);
                          setTryOnStatus("idle");
                        }}
                        style={{
                          width: "100%", padding: "12px",
                          fontFamily: "DM Sans", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600,
                          background: "transparent", color: BURGUNDY, border: `1px solid ${BURGUNDY}4D`, borderRadius: 8, cursor: "pointer",
                        }}
                      >
                        Try Another Photo
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedProductForDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 12,
                maxWidth: 600,
                maxHeight: "90vh",
                overflow: "auto",
                width: "100%",
              }}
            >
              <div style={{ position: "sticky", top: 0, padding: 20, background: "white", borderBottom: `1px solid ${BURG_ALPHA}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
                <h2 style={{ fontFamily: CORMORANT, fontSize: 28, fontWeight: 700, color: BURGUNDY, margin: 0 }}>
                  {selectedProductForDetail.title}
                </h2>
                <motion.button
                  onClick={() => setDetailModalOpen(false)}
                  whileHover={reduced ? {} : { scale: 1.1 }}
                  whileTap={reduced ? {} : { scale: 0.95 }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 8,
                    color: BURGUNDY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div style={{ padding: 20 }}>
                {/* Image Gallery */}
                <div style={{ marginBottom: 24, borderRadius: 8, overflow: "hidden", aspectRatio: "3/4", background: "#F5F5F5", position: "relative" }}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={getCarouselIndex(selectedProductForDetail.id)}
                      src={selectedProductForDetail.images[getCarouselIndex(selectedProductForDetail.id)]}
                      alt={selectedProductForDetail.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </AnimatePresence>

                  {selectedProductForDetail.images.length > 1 && (
                    <>
                      <motion.button
                        onClick={() => prevImage(selectedProductForDetail.id, selectedProductForDetail.images.length)}
                        whileHover={reduced ? {} : { scale: 1.1 }}
                        whileTap={reduced ? {} : { scale: 0.95 }}
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10,
                          color: BURGUNDY,
                        }}
                      >
                        <ChevronLeft size={20} />
                      </motion.button>

                      <motion.button
                        onClick={() => nextImage(selectedProductForDetail.id, selectedProductForDetail.images.length)}
                        whileHover={reduced ? {} : { scale: 1.1 }}
                        whileTap={reduced ? {} : { scale: 0.95 }}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10,
                          color: BURGUNDY,
                        }}
                      >
                        <ChevronRight size={20} />
                      </motion.button>
                    </>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: "DM Sans", fontSize: 11, color: BURGUNDY, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 8px 0", opacity: 0.6 }}>
                    {selectedProductForDetail.subtitle}
                  </p>
                  <p style={{ fontFamily: "DM Sans", fontSize: 14, letterSpacing: "2px", textTransform: "uppercase", color: BURGUNDY, margin: "0 0 12px 0", fontWeight: 600 }}>
                    {selectedProductForDetail.badge}
                  </p>

                  {/* Top / Pants / Both toggle — the modal previously always
                      showed the base Top Only price with no way to select
                      Pants or the Set, so opening a card's detail view and
                      adding to cart from there silently ignored whatever
                      combination the shopper actually wanted. Same toggle,
                      same three options, as the grid card. */}
                  {selectedProductForDetail.purchaseOptions ? (
                    <>
                      <div style={{ display: "flex", border: `1px solid ${BURG_ALPHA}`, borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                        {(["topOnly", "pantsOnly", "both"] as const).map((opt) => {
                          const opts = selectedProductForDetail.purchaseOptions!;
                          const available = Boolean(opts[opt]);
                          const active = modalPurchaseOption === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => available && setModalPurchaseOption(opt)}
                              disabled={!available}
                              style={{
                                flex: 1, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, letterSpacing: "0.5px",
                                padding: "10px 6px", border: "none", cursor: available ? "pointer" : "not-allowed", transition: "all 0.15s",
                                background: active ? BURGUNDY : "transparent",
                                color: active ? GOLD : DARK_TEXT,
                                opacity: available ? 1 : 0.3,
                                fontWeight: active ? 600 : 400,
                              }}
                            >{AJOGUN_OPTION_LABEL[opt]}</button>
                          );
                        })}
                      </div>
                      {(() => {
                        const price = selectedProductForDetail.purchaseOptions[modalPurchaseOption]
                          ?? selectedProductForDetail.purchaseOptions.topOnly
                          ?? { NGN: selectedProductForDetail.priceNGN, USD: selectedProductForDetail.priceUSD };
                        return (
                          <div style={{ marginBottom: 20 }}>
                            <span style={{ fontFamily: CORMORANT, fontSize: 28, fontWeight: 700, color: BURGUNDY }}>
                              {currency === "NGN" ? `₦${price.NGN.toLocaleString()}` : `$${price.USD}`}
                            </span>
                            <span style={{ fontFamily: "DM Sans", fontSize: 11, color: `rgba(110,0,37,0.5)`, marginLeft: 12 }}>
                              {currency === "NGN" ? `/ $${price.USD}` : `/ ₦${price.NGN.toLocaleString()}`}
                            </span>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div style={{ marginBottom: 20 }}>
                      <span style={{ fontFamily: CORMORANT, fontSize: 28, fontWeight: 700, color: BURGUNDY }}>
                        {currency === "NGN" ? `₦${selectedProductForDetail.priceNGN.toLocaleString()}` : `$${selectedProductForDetail.priceUSD}`}
                      </span>
                      <span style={{ fontFamily: "DM Sans", fontSize: 11, color: `rgba(110,0,37,0.5)`, marginLeft: 12 }}>
                        {currency === "NGN" ? `/ $${selectedProductForDetail.priceUSD}` : `/ ₦${selectedProductForDetail.priceNGN.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: BURGUNDY, marginBottom: 8 }}>About This Piece</h3>
                  <p style={{ fontFamily: "DM Sans", fontSize: 14, lineHeight: 1.7, color: DARK_TEXT, margin: 0, marginBottom: 16 }}>
                    {(selectedProductForDetail as any).fullDesc || selectedProductForDetail.desc}
                  </p>
                </div>

                {/* Materials */}
                {(selectedProductForDetail as any).materials && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: BURGUNDY, marginBottom: 8 }}>Materials</h3>
                    <p style={{ fontFamily: "DM Sans", fontSize: 14, lineHeight: 1.7, color: DARK_TEXT, margin: 0, marginBottom: 16 }}>
                      {(selectedProductForDetail as any).materials}
                    </p>
                  </div>
                )}

                {/* Care Instructions */}
                {(selectedProductForDetail as any).care && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: BURGUNDY, marginBottom: 8 }}>Care Instructions</h3>
                    <p style={{ fontFamily: "DM Sans", fontSize: 14, lineHeight: 1.7, color: DARK_TEXT, margin: 0, marginBottom: 16 }}>
                      {(selectedProductForDetail as any).care}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 12 }}>
                  <motion.button
                    onClick={() => {
                      if (selectedProductForDetail.purchaseOptions) {
                        const opts = selectedProductForDetail.purchaseOptions;
                        const price = opts[modalPurchaseOption] ?? opts.topOnly
                          ?? { NGN: selectedProductForDetail.priceNGN, USD: selectedProductForDetail.priceUSD };
                        addToCart(selectedProductForDetail, {
                          key: modalPurchaseOption,
                          label: `${selectedProductForDetail.title} · ${AJOGUN_OPTION_LABEL[modalPurchaseOption]}`,
                          priceNGN: price.NGN,
                          priceUSD: price.USD,
                        });
                      } else {
                        addToCart(selectedProductForDetail);
                      }
                      setDetailModalOpen(false);
                    }}
                    whileHover={reduced ? {} : { scale: 1.02 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      fontFamily: "DM Sans",
                      fontSize: 12,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      background: BURGUNDY,
                      color: GOLD,
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    + Add to Cart
                  </motion.button>
                  <motion.button
                    onClick={() => openTryOnModal(selectedProductForDetail)}
                    whileHover={reduced ? {} : { scale: 1.02 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      fontFamily: "DM Sans",
                      fontSize: 12,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      background: "transparent",
                      color: BURGUNDY,
                      border: `1.5px solid ${BURGUNDY}`,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <Sparkles size={12} style={{ display: "inline", marginRight: 6 }} /> Try On
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          FLOATING WHATSAPP — persistent route to a human
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {/* Withdrawn whenever a layer owns the screen. A button floating over
            an open cart or modal is clutter competing with the task the
            customer is already doing. */}
        {!cartOpen && !detailModalOpen && !tryOnModalOpen && (
          <motion.a
            key="whatsapp-fab"
            href={whatsappLink("Hi VIVA! I have a question about the Batya collection.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with VIVA on WhatsApp"
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            whileHover={reduced ? {} : { scale: 1.06 }}
            whileTap={reduced ? {} : { scale: 0.94 }}
            style={{
              position: "fixed",
              right: "clamp(16px, 4vw, 28px)",
              // Sits clear of the mobile tab bar (56px + the device's own safe
              // area, per the clearance rule in index.css). The lg breakpoint
              // is exactly where that bar stops being rendered.
              bottom: isDesktop
                ? "clamp(20px, 3vw, 32px)"
                : "calc(56px + env(safe-area-inset-bottom, 0px) + 16px)",
              // Above page content, below the cart drawer and modals (1000).
              zIndex: 80,
              width: 56,
              height: 56,
              borderRadius: "50%",
              // WhatsApp's own green — this is a recognised affordance, and
              // dressing it in brand gold would cost more in recognition than
              // it gained in consistency.
              background: "#25D366",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              boxShadow: "0 6px 22px rgba(37,211,102,0.36), 0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <MessageCircle size={26} strokeWidth={1.9} />
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VIVAPage;
