import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShoppingBag, X, Plus, Minus, MessageCircle, Sparkles, Upload, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
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
const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "heritage",
    title: "The Heritage",
    subtitle: "Look 01 · Batya Collection",
    type: "garment" as const,
    badge: "Made to Order",
    images: ["/viva/look-1.webp", "/viva/look-2.webp", "/viva/look-3.webp"],
    priceNGN: 180000,
    priceUSD: 115,
    desc: "Olive woven kimono · wide-leg pleated denim · gold cuffs. Bespoke fit, made to your measurements.",
    fullDesc: "This Heritage piece combines traditional tailoring with modern sensibility. The olive woven kimono drapes beautifully over wide-leg pleated denim, finished with delicate gold cuffs. Every measurement is taken to perfection for your bespoke fit. Crafted to celebrate structured fluidity—where precision meets the body in motion.",
    materials: "100% premium cotton kimono · sustainable denim · 18k gold-plated cuffs",
    care: "Dry clean recommended. Gentle hand wash for delicate pieces. Store in cool, dry place."
  },
  {
    id: "bold",
    title: "The Bold",
    subtitle: "Look 02 · Batya Collection",
    type: "garment" as const,
    badge: "Limited",
    images: ["/viva/look-2.webp", "/viva/look-1.webp", "/viva/look-3.webp"],
    priceNGN: 195000,
    priceUSD: 126,
    desc: "Hot-pink structured crop · wide-leg denim · statement earrings. Confidence, personalised.",
    fullDesc: "The Bold is a declaration of artistic agency. The hot-pink structured crop defines your silhouette with precision tailoring, paired with comfortable wide-leg denim and statement-making earrings. This is fashion as confidence—personalised, powerful, and unapologetically you.",
    materials: "Structured cotton blend crop · premium denim · statement jewelry",
    care: "Machine wash cold. Line dry. Iron on low heat if needed."
  },
  {
    id: "artist",
    title: "The Artist",
    subtitle: "Look 03 · Batya Collection",
    type: "garment" as const,
    badge: "Made to Order",
    images: ["/viva/look-3.webp", "/viva/look-1.webp", "/viva/look-2.webp"],
    priceNGN: 188000,
    priceUSD: 121,
    desc: "Chartreuse palazzo · structured crop · layered gold jewellery. Chromatic freedom in fabric.",
    fullDesc: "Chromatic freedom is the heart of The Artist. The chartreuse palazzo pants flow with artistic fluidity, balanced by a structured crop top. Layered gold jewellery adds depth and dimension. This piece celebrates your identity as a creative force—dressed in who you are, and whose you are.",
    materials: "Linen-blend palazzo pants · structured cotton crop · layered gold jewelry",
    care: "Hand wash recommended. Lay flat to dry. Store jewelry separately."
  },
  {
    id: "print-01",
    title: "Batya No.1",
    subtitle: "Fashion Illustration · A3 Giclée",
    type: "print" as const,
    badge: "Edition / 30",
    images: ["/viva/look-4.jpeg", "/viva/look-1.webp"],
    priceNGN: 35000,
    priceUSD: 22,
    desc: "Archival giclée on 300gsm cotton rag. Signed + numbered. Ships in a protective tube.",
    fullDesc: "Batya No.1 is a limited-edition fashion illustration printed on archival-quality 300gsm cotton rag paper. Each print is hand-signed and numbered as part of the Daughters of Adonai series. Ships in a protective tube with certificate of authenticity.",
    materials: "300gsm cotton rag paper · archival pigment inks · hand-signed and numbered",
    care: "Frame under UV-protective glass. Keep away from direct sunlight to preserve colors."
  },
  {
    id: "print-02",
    title: "Heritage Print",
    subtitle: "Fashion Illustration · A3 Giclée",
    type: "print" as const,
    badge: "Edition / 30",
    images: ["/viva/look-1.webp", "/viva/look-4.jpeg"],
    priceNGN: 35000,
    priceUSD: 22,
    desc: "The Heritage silhouette in ink and gouache. Signed by Viera Amber. Edition of 30.",
    fullDesc: "The Heritage Print captures the essence of the iconic silhouette through ink and gouache artistry. This limited edition celebrates the craftsmanship and attention to detail that defines VIVA. Each piece is a gallery-worthy work created by Viera Amber herself.",
    materials: "300gsm cotton rag paper · ink and gouache · hand-signed",
    care: "Frame under glass. Avoid moisture. Display away from heat sources."
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

type CartItem = { product: ShopProduct; qty: number; size?: GarmentSize };

// Persisted shape. Only ids and choices are stored — never the product
// objects themselves, so a price or title change in the catalogue is picked
// up on the next load instead of being frozen into someone's basket.
const CART_STORAGE_KEY = "viva.cart.v1";
type StoredLine = { id: string; qty: number; size?: string };

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
      return [{ product, qty: Math.min(qty, 99), ...(size ? { size } : {}) }];
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

// ── HERO TEXT PLATES ─────────────────────────────────────────────────────
// The masthead lockup and eyebrow were floating directly on the hero scrim
// with no backing of their own, on the assumption the page-wide gradient
// would be dark enough wherever they happened to land. Measured against the
// actual video (pixel-sampled + composited with the real scrim/vignette/
// filter math, not eyeballed): against the close-portrait clip's brightest
// frame the gold wordmark hit only ~3.1:1 contrast — WCAG AA needs 4.5:1 for
// text this size, and the user's own screenshot showed exactly this failure.
//
// First pass solved the plate against a theoretical pure-white worst case
// (255,255,255), which never actually occurs in the footage — the real
// video, even at its brightest measured point, is already darkened by the
// scrim beneath the plate to roughly rgb(130-140). That over-conservative
// target (0.78 alpha) produced a near-opaque near-black card that read as
// a UI element pasted onto the photo rather than part of the composition —
// exactly what the next round of feedback flagged.
//
// Re-solved against the REAL measured pre-plate background instead of the
// theoretical extreme: 0.55 alpha held 6.4-7.1:1 for solid gold text, real
// margin, and reads meaningfully softer than the first pass. Still called
// "too dark" on review.
//
// Lowering the plate further exposed the actual bottleneck: it was never
// the plate alone doing the work. The mantra ("For her, by her.") and
// attribution ("By Viera Amber") lines are themselves semi-transparent —
// rgba(gold, 0.78) and rgba(white, 0.55) — so their EFFECTIVE color is
// already a blend toward whatever sits behind them before the contrast
// math even starts. That's what was propping the plate alpha up: two of
// five landmarks were fighting their own transparency on top of the
// plate's, and the plate had to compensate for both to keep the worst
// case (mantra) above 4.5:1.
//
// Raised those two lines toward opaque instead (0.55->0.82, 0.78->0.92) so
// each carries its own contrast rather than borrowing all of it from the
// plate, then re-solved: 0.35 alpha now holds 4.5-7.5:1 across every
// landmark on the worst film, worst case (mantra) at 4.89 — real margin
// for the frame-to-frame brightness variance actually observed during live
// verification, not a value that was merely computed and assumed. Down
// from 0.78 to 0.35 overall: less than half the original darkness.
const HERO_TEXT_PLATE: React.CSSProperties = {
  background: "rgba(18,4,10,0.35)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(212,175,55,0.12)",
  boxShadow: "0 14px 34px rgba(0,0,0,0.20)",
};
const HERO_EYEBROW_CHIP: React.CSSProperties = {
  ...HERO_TEXT_PLATE,
  borderRadius: 999,
  display: "inline-block",
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

  // Mirror the basket into storage on every change. Only ids, quantities
  // and sizes go in — see StoredLine.
  useEffect(() => {
    // Never write before restoring, or the initial empty state would
    // overwrite the very basket we are about to read back.
    if (!cartHydrated) return;
    try {
      const lines: StoredLine[] = cart.map(i => ({ id: i.product.id, qty: i.qty, ...(i.size ? { size: i.size } : {}) }));
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

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + (currency === "NGN" ? i.product.priceNGN : i.product.priceUSD) * i.qty, 0);

  const addToCart = (product: ShopProduct) => {
    setCart(prev => {
      const hit = prev.find(i => i.product.id === product.id);
      return hit ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { product, qty: 1 }];
    });
    // Adding to a basket that has already been sent starts a new order —
    // otherwise the drawer would keep showing the previous confirmation.
    setOrderStatus("idle");
    setOrderRef(null);
    setCartOpen(true);
  };

  const setLineSize = (id: string, size: GarmentSize) =>
    setCart(prev => prev.map(i => (i.product.id === id ? { ...i, size } : i)));

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const updateQty = (id: string, delta: number) =>
    setCart(prev => prev.flatMap(i => {
      if (i.product.id !== id) return [i];
      const q = i.qty + delta;
      return q < 1 ? [] : [{ ...i, qty: q }];
    }));

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
  useEffect(() => {
    if (reduced) return;
    const intervals = catalogue
      .filter(p => p.images.length > 1)
      .map(product =>
        setInterval(() => {
          nextImage(product.id, product.images.length);
        }, 2000),
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
      const unit = currency === "NGN" ? i.product.priceNGN : i.product.priceUSD;
      // Size rides on the same line as the piece, so nothing has to be
      // cross-referenced further down the message.
      const size = i.size ? ` · ${i.size}` : "";
      return `• ${i.product.title}${size} ×${i.qty} — ${money(unit * i.qty)}`;
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

          {/* Mobile scrim — graded, not a blanket. The previous wash sat at
              72-94% across the whole frame, which hid the very film it was
              protecting. Density now lives only in the lower half, under the
              copy; the upper frame stays clear so the garment reads. */}
          <div
            className="md:hidden"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(110,0,37,0.30) 0%, rgba(110,0,37,0.10) 20%, rgba(110,0,37,0.16) 32%, rgba(110,0,37,0.52) 44%, rgba(110,0,37,0.84) 56%, rgba(110,0,37,0.94) 72%, rgba(110,0,37,0.985) 100%)",
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
              First pass darkened only a narrow band around the exact
              vertical center — but the text stack (masthead, eyebrow,
              heading, description, buttons) is much taller than that band.
              Against a high-key frame (pale backdrop, light hair, a cream
              sweater filling most of the shot) the masthead at the top of
              the stack sat in the barely-tinted 10-16% zone and all but
              vanished — gold-on-white with almost no scrim under it.

              The fix is a wide plateau, not a taller spike: strong,
              near-flat density across the entire range the text actually
              occupies (roughly 10-90% of the frame), tapering only in the
              last ~10% at each true edge so the film still reads as
              full-bleed at the very top and bottom rather than under a
              dark bar. The floor never drops below ~0.30 anywhere text can
              land — a "clear window" is what caused this in the first
              place, so nothing here is allowed to go fully clear again. */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(110,0,37,0.34) 0%, rgba(110,0,37,0.44) 10%, rgba(110,0,37,0.52) 22%, rgba(110,0,37,0.62) 36%, rgba(110,0,37,0.68) 50%, rgba(110,0,37,0.62) 64%, rgba(110,0,37,0.52) 78%, rgba(110,0,37,0.44) 90%, rgba(110,0,37,0.34) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Desktop vignette — a soft ellipse centered on the text column,
              closing the frame at the left/right edges too. Ultra-wide
              monitors expose a lot of clear film either side of the copy;
              this keeps that film present without letting its brightest
              patch (the beige studio backdrop) fight the words in front
              of it. */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(68% 86% at 50% 50%, rgba(110,0,37,0.26) 0%, rgba(110,0,37,0.14) 60%, rgba(110,0,37,0) 88%)",
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

                Wrapped in the same guaranteed-contrast plate as desktop (see
                HERO_TEXT_PLATE). Mobile's bottom-loaded gradient usually
                protects this block on its own, but only once it's deep
                enough into the high-opacity zone — measured against a
                worst-case bright frame, the top of this block (where the
                gradient is still only ~0.84) held to ~4.15:1, just short of
                the 4.5:1 small text needs. The plate closes that gap. */}
            <div
              style={{
                ...HERO_TEXT_PLATE,
                borderRadius: 12,
                padding: "clamp(18px, 5vw, 24px) clamp(26px, 8vw, 36px)",
              }}
            >
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
                  // Was 0.6 — its own transparency was fighting the plate
                  // for contrast, forcing the plate darker than it needed
                  // to be. Raised so the text carries more of its own
                  // weight, which is what let the plate come down.
                  color: "rgba(255,255,255,0.82)",
                  margin: "10px 0 0 0",
                  fontWeight: 500,
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
                  // Was 0.8 — same reasoning as the attribution line above:
                  // more of this text's own opacity, less demanded of the plate.
                  color: "rgba(212,175,55,0.92)",
                  margin: 0,
                  // Descender clearance for the 'y' in "by"
                  lineHeight: 1.3,
                  paddingBottom: 2,
                }}
              >
                For her, by her.
              </motion.p>
            </div>

            {/* Eyebrow — its own small pill chip, same guaranteed-contrast
                treatment. The large gap that used to be this paragraph's own
                top margin moved to this wrapper instead. */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.54 }}
              style={{
                ...HERO_EYEBROW_CHIP,
                margin: "clamp(34px, 8vw, 48px) 0 clamp(14px, 3.4vw, 18px) 0",
                padding: "9px 22px",
              }}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "clamp(11px, 2.6vw, 12px)",
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: GOLD,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                The Maiden Collection
              </p>
            </motion.div>

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
                Wordmark, attribution and mantra read as one unit. Previously
                these floated directly on the scrim gradient with only a
                text-shadow for protection — measured against the actual
                video (see HERO_TEXT_PLATE above), that held to roughly
                3.1-4.0:1 contrast against a bright frame, short of the
                4.5:1 small text needs. A backing plate now guarantees it
                regardless of what the film is doing underneath. */}
            <div
              style={{
                ...HERO_TEXT_PLATE,
                borderRadius: 14,
                padding: "clamp(22px, 2.6vw, 30px) clamp(36px, 4.2vw, 52px)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.20, ease: "easeOut" }}
                style={{
                  fontFamily: CORMORANT,
                  fontSize: "clamp(24px, 2.2vw, 32px)",
                  fontWeight: 400,
                  letterSpacing: "0.34em",
                  lineHeight: 1,
                  color: GOLD,
                  // Optical centring: the trailing letterspace pushes the word
                  // left of true-center, same correction mobile's wordmark uses.
                  textIndent: "0.34em",
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
                  fontSize: "clamp(9px, 0.72vw, 10px)",
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  // Was 0.55 — its own transparency was fighting the plate
                  // for contrast, forcing the plate darker than it needed
                  // to be. Raised so the text carries more of its own
                  // weight, which is what let the plate come down.
                  color: "rgba(255,255,255,0.82)",
                  margin: "10px 0 0 0",
                  fontWeight: 500,
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
                  fontSize: "clamp(15px, 1.25vw, 18px)",
                  fontStyle: "italic",
                  // Was 0.78 — same reasoning as the attribution line above:
                  // more of this text's own opacity, less demanded of the plate.
                  color: "rgba(212,175,55,0.92)",
                  margin: 0,
                  // Descender clearance for the 'y' in "by"
                  lineHeight: 1.3,
                  paddingBottom: 2,
                }}
              >
                For her, by her.
              </motion.p>
            </div>

            {/* Eyebrow — its own small chip, same guaranteed-contrast
                treatment, sized as a pill rather than the masthead's card so
                the two don't read as one undifferentiated block. The large
                gap above it is what actually separates masthead from
                collection now — it moved from the old paragraph's own
                margin onto this wrapper. */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.48, ease: "easeOut" }}
              style={{
                ...HERO_EYEBROW_CHIP,
                margin: "clamp(38px, 4.4vw, 60px) 0 clamp(18px, 2vw, 26px) 0",
                padding: "10px 26px",
              }}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: "clamp(11px, 0.92vw, 13px)",
                  fontWeight: 500,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: GOLD,
                  margin: 0,
                }}
              >
                The Maiden Collection
              </p>
            </motion.div>

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
          SHOP — garments + illustration prints, WhatsApp checkout
          ═══════════════════════════════════════════════════════ */}
      <section id="viva-shop" className="w-full" style={{ background: ALABASTER, paddingTop: 80, paddingBottom: 80 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>

          {/* Header row */}
          <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: 48 }}>
            <div style={{ width: "100%" }}>
              <p style={{ fontFamily: "DM Sans", fontSize: 13, color: BURGUNDY, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px 0" }}>Maiden Collection</p>
              <h1 style={{ fontFamily: CORMORANT, fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: BURGUNDY, margin: "0 0 24px 0", lineHeight: 1.1 }}>
                Batya: Daughters of Adonai
              </h1>
              <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 700, color: BURGUNDY, margin: 0, lineHeight: 1.1 }}>
                Shop the Collection
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Currency toggle */}
              <div style={{ display: "flex", border: `1px solid ${BURG_ALPHA}`, borderRadius: 6, overflow: "hidden" }}>
                {(["NGN", "USD"] as const).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} style={{
                    fontFamily: "DM Sans", fontSize: 10, letterSpacing: "2px", fontWeight: 600,
                    padding: "8px 16px", border: "none", cursor: "pointer",
                    background: currency === c ? BURGUNDY : "transparent",
                    color: currency === c ? ALABASTER : BURGUNDY,
                    transition: "all 0.2s",
                  }}>{c}</button>
                ))}
              </div>
              {/* Cart button */}
              <button onClick={() => setCartOpen(true)} style={{
                position: "relative", background: BURGUNDY, border: "none", borderRadius: 6,
                padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                fontFamily: "DM Sans", fontSize: 10, letterSpacing: "2px", color: GOLD, textTransform: "uppercase",
              }}>
                <ShoppingBag size={14} />
                Cart
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -7, right: -7, width: 18, height: 18,
                    borderRadius: "50%", background: GOLD, color: DARK_TEXT,
                    fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Trust bar — rescued from the removed stub section. Delivery, make
              and ethics belong beside the buying decision, not in isolation. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap"
            style={{
              gap: "clamp(28px, 5vw, 56px)",
              padding: "20px 0 24px",
              borderTop: `1px solid ${BURG_ALPHA}`,
              borderBottom: `1px solid ${BURG_ALPHA}`,
              marginBottom: 48,
            }}
          >
            {[["48–72hrs", "Delivery"], ["Made to Order", "Garments"], ["SDG", "Aligned"]].map(([val, lbl]) => (
              <div key={lbl}>
                <p style={{ fontFamily: CORMORANT, fontSize: "clamp(19px, 2.2vw, 24px)", fontWeight: 700, color: BURGUNDY, margin: 0, lineHeight: 1 }}>{val}</p>
                <p style={{ fontFamily: "DM Sans", fontSize: 9, color: "rgba(110,0,37,0.5)", margin: "6px 0 0 0", letterSpacing: "1.8px", textTransform: "uppercase" }}>{lbl}</p>
              </div>
            ))}
          </motion.div>

          {/* GARMENTS */}
          <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0", borderBottom: `1px solid ${BURG_ALPHA}`, paddingBottom: 10 }}>Garments</p>
          <div ref={shopRef} className="grid gap-6 mb-16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
            {catalogue.filter(p => p.type === "garment").map((product, i) => {
              const currentImageIndex = getCarouselIndex(product.id);
              const currentImage = product.images[currentImageIndex];
              return (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={shopInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={reduced ? {} : { y: -5, transition: { duration: 0.2 } }}
                style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: `1px solid ${BURG_ALPHA}`, boxShadow: "0 2px 18px rgba(110,0,37,0.07)" }}
              >
                <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedProductForDetail(product);
                    setDetailModalOpen(true);
                  }}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImage}
                      src={currentImage}
                      alt={product.title}
                      loading="lazy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                      onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                    />
                  </AnimatePresence>
                  <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "DM Sans", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", background: "rgba(110,0,37,0.88)", color: GOLD, padding: "4px 9px", borderRadius: 2 }}>{product.badge}</span>

                  {product.images.length > 1 && (
                    <>
                      {/* Left arrow */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage(product.id, product.images.length);
                        }}
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
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10,
                          color: BURGUNDY,
                        }}
                      >
                        <ChevronLeft size={18} />
                      </motion.button>

                      {/* Right arrow */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage(product.id, product.images.length);
                        }}
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
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10,
                          color: BURGUNDY,
                        }}
                      >
                        <ChevronRight size={18} />
                      </motion.button>

                      {/* Carousel indicator */}
                      <div style={{
                        position: "absolute",
                        bottom: 12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 6,
                        zIndex: 10,
                      }}>
                        {product.images.map((_, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: idx === currentImageIndex ? BURGUNDY : "rgba(110,0,37,0.3)",
                              transition: "all 0.3s",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, opacity: 0.45, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 5px 0" }}>{product.subtitle}</p>
                  <h3 style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: DARK_TEXT, margin: "0 0 8px 0" }}>{product.title}</h3>
                  <p style={{ fontFamily: "DM Sans", fontSize: 12, color: `rgba(34,26,26,0.5)`, lineHeight: 1.65, margin: "0 0 16px 0" }}>{product.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: BURGUNDY }}>
                        {currency === "NGN" ? `₦${product.priceNGN.toLocaleString()}` : `$${product.priceUSD}`}
                      </span>
                      <span style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(110,0,37,0.35)`, marginLeft: 6 }}>
                        {currency === "NGN" ? `/ $${product.priceUSD}` : `/ ₦${product.priceNGN.toLocaleString()}`}
                      </span>
                    </div>
                    <motion.button onClick={() => addToCart(product)}
                      whileHover={reduced ? {} : { scale: 1.05 }} whileTap={reduced ? {} : { scale: 0.97 }}
                      style={{ fontFamily: "DM Sans", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, background: BURGUNDY, color: GOLD, border: "none", borderRadius: 4, padding: "9px 16px", cursor: "pointer" }}>
                      + Add
                    </motion.button>
                  </div>
                  <motion.button onClick={() => openTryOnModal(product)}
                    whileHover={reduced ? {} : { scale: 1.02 }} whileTap={reduced ? {} : { scale: 0.97 }}
                    className="w-full inline-flex items-center justify-center gap-2"
                    style={{ fontFamily: "DM Sans", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, background: "transparent", color: BURGUNDY, border: `1.5px solid ${BURGUNDY}`, borderRadius: 4, padding: "8px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                    <Sparkles size={12} /> Try On
                  </motion.button>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* PRINTS */}
          <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0", borderBottom: `1px solid ${BURG_ALPHA}`, paddingBottom: 10 }}>Illustration Prints</p>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {catalogue.filter(p => p.type === "print").map((product, i) => (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={shopInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
                whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: `1px solid ${BURG_ALPHA}`, boxShadow: "0 2px 12px rgba(110,0,37,0.06)", display: "flex" }}
              >
                <div style={{ width: 110, flexShrink: 0, overflow: "hidden" }}>
                  <img src={product.images[0]} alt={product.title} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                </div>
                <div style={{ padding: "16px 18px 18px", flex: 1 }}>
                  <span style={{ fontFamily: "DM Sans", fontSize: 7.5, letterSpacing: "2px", textTransform: "uppercase", background: `rgba(212,175,55,0.14)`, color: `rgba(110,0,37,0.75)`, padding: "3px 8px", borderRadius: 2, display: "inline-block", marginBottom: 8 }}>{product.badge}</span>
                  <h3 style={{ fontFamily: CORMORANT, fontSize: 18, fontWeight: 700, color: DARK_TEXT, margin: "0 0 4px 0" }}>{product.title}</h3>
                  <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(34,26,26,0.4)`, lineHeight: 1.5, margin: "0 0 14px 0" }}>{product.subtitle}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: CORMORANT, fontSize: 19, fontWeight: 700, color: BURGUNDY }}>
                      {currency === "NGN" ? `₦${product.priceNGN.toLocaleString()}` : `$${product.priceUSD}`}
                    </span>
                    <motion.button onClick={() => addToCart(product)}
                      whileHover={reduced ? {} : { scale: 1.05 }} whileTap={reduced ? {} : { scale: 0.97 }}
                      style={{ fontFamily: "DM Sans", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, background: BURGUNDY, color: GOLD, border: "none", borderRadius: 4, padding: "7px 13px", cursor: "pointer" }}>
                      + Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
                    {cart.map(({ product, qty, size }) => (
                      <div key={product.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 18, marginBottom: 18, borderBottom: `1px solid ${GOLD_ALPHA}` }}>
                        <div style={{ width: 66, height: 82, flexShrink: 0, borderRadius: 3, overflow: "hidden" }}>
                          <img src={product.images[0]} alt={product.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: CORMORANT, fontSize: 16, color: ALABASTER, margin: "0 0 2px 0", fontWeight: 600 }}>{product.title}</p>
                          <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(212,175,55,0.5)`, margin: "0 0 10px 0" }}>{product.subtitle}</p>

                          {/* Size — garments only. Prints have no size, and
                              asking for one would just be a question with no
                              right answer. */}
                          {product.type === "garment" && (
                            <div style={{ marginBottom: 10 }}>
                              <label htmlFor={`size-${product.id}`} style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(250,249,246,0.5)`, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                Size *
                              </label>
                              <select
                                id={`size-${product.id}`}
                                value={size ?? ""}
                                onChange={e => setLineSize(product.id, e.target.value as GarmentSize)}
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
                              <button onClick={() => updateQty(product.id, -1)}
                                style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", padding: "5px 10px", lineHeight: 1 }}>
                                <Minus size={10} />
                              </button>
                              <span style={{ fontFamily: "DM Sans", fontSize: 12, color: ALABASTER, minWidth: 18, textAlign: "center" }}>{qty}</span>
                              <button onClick={() => updateQty(product.id, 1)}
                                style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", padding: "5px 10px", lineHeight: 1 }}>
                                <Plus size={10} />
                              </button>
                            </div>
                            <span style={{ fontFamily: CORMORANT, fontSize: 17, color: GOLD, fontWeight: 700 }}>
                              {currency === "NGN" ? `₦${(product.priceNGN * qty).toLocaleString()}` : `$${product.priceUSD * qty}`}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(product.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: `rgba(250,249,246,0.2)`, padding: 2, marginTop: 2, flexShrink: 0 }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
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
                        display: "block", width: "100%", aspectRatio: personPhotoPreview ? "auto" : "4/3",
                        minHeight: 240, border: `2px dashed ${personPhotoPreview ? "transparent" : BURGUNDY}55`,
                        borderRadius: 12, background: "#FAFAFA", cursor: "pointer", overflow: "hidden",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
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
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontFamily: CORMORANT, fontSize: 28, fontWeight: 700, color: BURGUNDY }}>
                      {currency === "NGN" ? `₦${selectedProductForDetail.priceNGN.toLocaleString()}` : `$${selectedProductForDetail.priceUSD}`}
                    </span>
                    <span style={{ fontFamily: "DM Sans", fontSize: 11, color: `rgba(110,0,37,0.5)`, marginLeft: 12 }}>
                      {currency === "NGN" ? `/ $${selectedProductForDetail.priceUSD}` : `/ ₦${selectedProductForDetail.priceNGN.toLocaleString()}`}
                    </span>
                  </div>
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
                      addToCart(selectedProductForDetail);
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
