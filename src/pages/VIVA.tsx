import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShoppingBag, X, Plus, Minus, CreditCard, Sparkles, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { fadeIn, fadeSlideUp, staggerContainer, cardItem, scaleXRule, inViewProps, useReducedVariants } from "@/lib/animations";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    PaystackPop: {
      setup(opts: {
        key: string; email: string; amount: number; currency: string; ref?: string;
        callback(r: { reference: string }): void;
        onClose(): void;
      }): { openIframe(): void };
    };
  }
}

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

const SHOP_PRODUCTS = [
  { id: "heritage", title: "The Heritage",  subtitle: "Look 01 · Batya Collection",        type: "garment" as const, badge: "Made to Order", photo: "/viva/look-1.webp", priceNGN: 180000, priceUSD: 115, desc: "Olive woven kimono · wide-leg pleated denim · gold cuffs. Bespoke fit, made to your measurements." },
  { id: "bold",     title: "The Bold",      subtitle: "Look 02 · Batya Collection",        type: "garment" as const, badge: "Limited",       photo: "/viva/look-2.webp", priceNGN: 195000, priceUSD: 126, desc: "Hot-pink structured crop · wide-leg denim · statement earrings. Confidence, personalised." },
  { id: "artist",   title: "The Artist",    subtitle: "Look 03 · Batya Collection",        type: "garment" as const, badge: "Made to Order", photo: "/viva/look-3.webp", priceNGN: 188000, priceUSD: 121, desc: "Chartreuse palazzo · structured crop · layered gold jewellery. Chromatic freedom in fabric." },
  { id: "print-01", title: "Batya No.1",    subtitle: "Fashion Illustration · A3 Giclée", type: "print"   as const, badge: "Edition / 30", photo: "/viva/look-4.jpeg", priceNGN: 35000,  priceUSD: 22,  desc: "Archival giclée on 300gsm cotton rag. Signed + numbered. Ships in a protective tube." },
  { id: "print-02", title: "Heritage Print",subtitle: "Fashion Illustration · A3 Giclée", type: "print"   as const, badge: "Edition / 30", photo: "/viva/look-1.webp", priceNGN: 35000,  priceUSD: 22,  desc: "The Heritage silhouette in ink and gouache. Signed by Viera Amber. Edition of 30." },
] as const;

type ShopProduct = typeof SHOP_PRODUCTS[number];
type CartItem = { product: ShopProduct; qty: number };

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

  // Shop state
  const [currency, setCurrency]           = useState<"NGN" | "USD">("NGN");
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]           = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [payStatus, setPayStatus]         = useState<"idle" | "loading" | "success" | "error">("idle");

  // Try-On Modal state
  const [tryOnModalOpen, setTryOnModalOpen]                 = useState(false);
  const [selectedGarmentForTryOn, setSelectedGarmentForTryOn] = useState<ShopProduct | null>(null);
  const [personPhotoPreview, setPersonPhotoPreview]         = useState<string | null>(null);
  const [personPhotoFile, setPersonPhotoFile]               = useState<File | null>(null);
  const [tryOnResult, setTryOnResult]                       = useState<string | null>(null);
  const [tryOnStatus, setTryOnStatus]                       = useState<"idle" | "loading" | "done" | "error">("idle");
  const [tryOnError, setTryOnError]                         = useState<string | null>(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + (currency === "NGN" ? i.product.priceNGN : i.product.priceUSD) * i.qty, 0);

  const addToCart = (product: ShopProduct) => {
    setCart(prev => {
      const hit = prev.find(i => i.product.id === product.id);
      return hit ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const updateQty = (id: string, delta: number) =>
    setCart(prev => prev.flatMap(i => {
      if (i.product.id !== id) return [i];
      const q = i.qty + delta;
      return q < 1 ? [] : [{ ...i, qty: q }];

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
      setTryOnError("Image is too large — please use one under 8MB.");
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
      const garmentImg = await urlToBase64(selectedGarmentForTryOn.photo);

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
    window.open(`https://wa.me/2348074022917/?text=${encodeURIComponent(message)}`, "_blank");
  };
    }));

  const handlePaystack = () => {
    if (!checkoutEmail || cart.length === 0) return;
    if (typeof window.PaystackPop === "undefined") {
      alert("Payment system is loading — please try again in a moment.");
      return;
    }
    setPayStatus("loading");
    const handler = window.PaystackPop.setup({
      key: "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY",
      email: checkoutEmail,
      amount: cartTotal * 100,
      currency,
      ref: `VIVA-${Date.now()}`,
      callback: (_response) => { setPayStatus("success"); setCart([]); },
      onClose: () => setPayStatus("idle"),
    });
    handler.openIframe();
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
          HERO — dominant burgundy background
          ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "visible", background: `linear-gradient(135deg, ${BURGUNDY} 0%, #8B0A3A 50%, ${BURGUNDY} 100%)`, minHeight: "clamp(900px, 115vh, 1240px)" }}>
        {/* Subtle grain */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.005) 0px, rgba(0,0,0,0.005) 1px, transparent 1px, transparent 12px)",
        }} />
        {/* Subtle gold glow from top */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 90% 45% at 50% -2%, rgba(212,175,55,0.08) 0%, transparent 65%)",
        }} />

        {/* Editorial flanking models — white bg dissolves into burgundy via multiply */}
        <motion.img
          src={vivaHeroLeft}
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{ opacity: 0, x: reduced ? 0 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: d(1.2), delay: d(0.3), ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block"
          style={{
            position: "absolute", left: "-3%", bottom: 0,
            height: "clamp(860px, 118vh, 1160px)", width: "auto",
            mixBlendMode: "multiply",
            pointerEvents: "none", userSelect: "none",
            zIndex: 1,
          }}
        />
        <motion.img
          src={vivaHeroRight}
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{ opacity: 0, x: reduced ? 0 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: d(1.2), delay: d(0.3), ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block"
          style={{
            position: "absolute", right: "-3%", bottom: 0,
            height: "clamp(860px, 118vh, 1160px)", width: "auto",
            mixBlendMode: "multiply",
            pointerEvents: "none", userSelect: "none",
            zIndex: 1,
          }}
        />

        <div className="relative mx-auto px-6" style={{ maxWidth: 680, zIndex: 2 }}>
          <div
            className="flex flex-col items-center"
            style={{ paddingTop: 120, paddingBottom: 72, gap: 16, textAlign: "center" }}
          >
            {/* Back */}
            <motion.button
              type="button" onClick={() => navigate("/")}
              variants={fadeVariants} initial="hidden" animate="visible"
              style={{
                background: "none", border: "none",
                color: `rgba(212,175,55,0.45)`, cursor: "pointer",
                fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11,
                letterSpacing: "1.5px", textTransform: "uppercase", padding: 0,
                display: "flex", alignItems: "center", gap: 6,
                alignSelf: "flex-start",
              }}
              whileHover={reduced ? {} : { color: GOLD }}
            >
              <ArrowLeft size={13} /> Back
            </motion.button>

            {/* VIVA logo — gold on burgundy */}
            <motion.img
              src="/viva-logo.svg"
              alt="VIVA by Viera Amber"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: d(0.9), ease: "easeOut" as const, delay: d(0.2) }}
              style={{
                height: "clamp(80px, 12vw, 150px)",
                width: "auto",
                display: "block",
                margin: "0 auto",
                filter: "drop-shadow(0 0 28px rgba(212,175,55,0.28))",
              }}
              draggable={false}
            />

            {/* "For her, by her." */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(0.7) }}
              style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontSize: "clamp(15px, 2vw, 21px)",
                color: GOLD,
                margin: 0,
                opacity: 0.85,
              }}
            >For her, by her.</motion.p>

            {/* Gold rule */}
            <motion.div
              variants={ruleVariants} initial="hidden" animate="visible"
              transition={{ delay: d(0.88) }}
              style={{ width: 44, height: 1, background: GOLD_ALPHA, transformOrigin: "center" }}
            />

            {/* Daughters of Adonai — centred portrait, magazine-cover style */}
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: d(0.85), delay: d(0.95), ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: "clamp(200px, 36%, 310px)",
                margin: "4px auto 0",
                overflow: "hidden",
                borderRadius: 3,
                border: `1px solid ${GOLD_ALPHA}`,
                boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
              }}
            >
              <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                <img
                  src="/viva/look-4.jpeg"
                  alt="Daughters of Adonai — VIVA 'Batya' collection"
                  loading="eager"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              </div>
            </motion.div>

            {/* Maiden collection label */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.02) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
                margin: "0 0 4px 0",
              }}
            >The Maiden Collection</motion.p>

            {/* Collection name */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.1) }}
              style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontSize: "clamp(18px, 2.5vw, 28px)",
                color: "#FFFFFF",
                fontWeight: 400,
                margin: 0,
              }}
            >Batya: Daughters of Adonai</motion.p>

            {/* Body */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.22) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: `rgba(255,255,255,0.82)`,
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 360,
              }}
            >
              Structured tailoring meets fluid artistic silhouettes. High-end wearable art
              for the modern woman who wears her confidence out loud.
            </motion.p>

            {/* CTA — gold fill */}
            <motion.a
              href="#viva-enquiry"
              onClick={scrollToEnquiry}
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.35) }}
              whileHover={reduced ? {} : { opacity: 0.85, scale: 1.02 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontWeight: 500,
                background: GOLD,
                color: DARK_TEXT,
                border: "none",
                borderRadius: 3,
                padding: "13px 30px",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-block",
                marginTop: 4,
              }}
            >Enquire About a Commission</motion.a>

            {/* Secondary CTA — Virtual Try-On */}
            <motion.button
              type="button"
              onClick={() => navigate("/viva/try-on")}
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.42) }}
              whileHover={reduced ? {} : { scale: 1.02 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontWeight: 500,
                background: "transparent",
                color: GOLD,
                border: `1px solid ${GOLD}`,
                borderRadius: 3,
                padding: "12px 28px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
                marginLeft: 12,
              }}
            >
              <Sparkles size={13} /> Try It On Virtually
            </motion.button>

            {/* Stats strip */}
            <motion.div
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.5) }}
              style={{ display: "flex", gap: 36, marginTop: 8 }}
            >
              {[["48–72hrs", "Delivery"], ["Made to Order", "Garments"], ["SDG", "Aligned"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: GOLD, margin: 0, lineHeight: 1 }}>{val}</p>
                  <p style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(212,175,55,0.38)`, margin: "5px 0 0 0", letterSpacing: "1.8px", textTransform: "uppercase" }}>{lbl}</p>
                </div>
              ))}
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
          LOOKBOOK — alabaster, look-1 / look-2 / look-3 only
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full" style={{ background: ALABASTER, paddingTop: 80, paddingBottom: 80 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>

          <motion.div
            variants={slideUpVariants} initial="hidden"
            animate={lookbookInView ? "visible" : "hidden"}
            style={{ marginBottom: 56 }}
          >
            <p style={{ fontFamily: "DM Sans", fontSize: 10, color: BURGUNDY, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 10px 0" }}>The Maiden Collection</p>
            <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 700, color: BURGUNDY, margin: 0, lineHeight: 1.1 }}>
              Batya: Daughters of Adonai Lookbook
            </h2>
          </motion.div>

          <motion.div
            ref={lookbookRef}
            initial="hidden"
            animate={lookbookInView ? "visible" : "hidden"}
            variants={staggerVariants}
          >
            {/* Asymmetric top row: look-1 tall left | look-2 + look-3 stacked right */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>

              {/* Look 1 — tall */}
              <motion.div
                variants={cardVariants}
                whileHover={reduced ? {} : { y: -6 }}
                transition={{ type: "spring" as const, stiffness: 260, damping: 22 }}
                style={{ border: `1px solid ${BURG_ALPHA}`, borderRadius: 4, overflow: "hidden", cursor: "pointer" }}
                onClick={scrollToEnquiry}
              >
                <div style={{ position: "relative", height: "100%", minHeight: 480, overflow: "hidden" }}>
                  <img
                    src={LOOKBOOK[0].photo}
                    alt={LOOKBOOK[0].title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.6s ease" }}
                    onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", background: "linear-gradient(to top, rgba(10,0,5,0.82) 0%, transparent 100%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                    <p style={{ fontFamily: "DM Sans", fontSize: 9, color: "rgba(212,175,55,0.82)", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 4px 0" }}>Look 01 · {LOOKBOOK[0].mood}</p>
                    <h3 style={{ fontFamily: CORMORANT, fontSize: 24, color: ALABASTER, margin: 0, fontWeight: 400, fontStyle: "italic" }}>{LOOKBOOK[0].title}</h3>
                  </div>
                </div>
              </motion.div>

              {/* Look 2 + Look 3 stacked */}
              <div className="flex flex-col gap-4">
                {[LOOKBOOK[1], LOOKBOOK[2]].map((piece, i) => (
                  <motion.div
                    key={piece.title}
                    variants={cardVariants}
                    whileHover={reduced ? {} : { y: -5 }}
                    transition={{ type: "spring" as const, stiffness: 260, damping: 22 }}
                    style={{ border: `1px solid ${BURG_ALPHA}`, borderRadius: 4, overflow: "hidden", cursor: "pointer", flex: 1 }}
                    onClick={scrollToEnquiry}
                  >
                    <div style={{ position: "relative", minHeight: 228, overflow: "hidden" }}>
                      <img
                        src={piece.photo}
                        alt={piece.title}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.6s ease" }}
                        onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                      />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(10,0,5,0.78) 0%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                        <p style={{ fontFamily: "DM Sans", fontSize: 9, color: "rgba(212,175,55,0.75)", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 3px 0" }}>Look 0{i + 2} · {piece.mood}</p>
                        <h3 style={{ fontFamily: CORMORANT, fontSize: 20, color: ALABASTER, margin: 0, fontStyle: "italic" }}>{piece.title}</h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pull quote */}
            <motion.div
              variants={cardVariants}
              style={{ textAlign: "center", padding: "44px 20px", borderTop: `1px solid ${BURG_ALPHA}`, borderBottom: `1px solid ${BURG_ALPHA}`, margin: "0 0 32px 0" }}
            >
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: "clamp(18px, 3vw, 30px)", color: BURGUNDY, fontWeight: 400, margin: 0, maxWidth: 600, display: "inline-block", opacity: 0.82 }}>
                "She knows exactly who she is — the clothes are just the evidence."
              </p>
            </motion.div>

            {/* Coming soon — 2-column */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {COMING.map((piece, i) => (
                <motion.div
                  key={piece.title}
                  variants={cardVariants}
                  style={{ border: `1px solid ${BURG_ALPHA}`, borderRadius: 4, overflow: "hidden" }}
                >
                  <div style={{
                    padding: "44px 28px 36px",
                    display: "flex", flexDirection: "column", gap: 14,
                    minHeight: 220,
                    background: `linear-gradient(${138 + i * 30}deg, rgba(110,0,37,0.07) 0%, rgba(212,175,55,0.04) 45%, rgba(250,249,246,0.96) 100%)`,
                  }}>
                    <span style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(110,0,37,0.5)`, letterSpacing: "3px", textTransform: "uppercase" }}>Look 0{i + 4} · {piece.mood}</span>
                    <h3 style={{ fontFamily: CORMORANT, fontSize: 26, color: DARK_TEXT, margin: 0, fontWeight: 700 }}>{piece.title}</h3>
                    <p style={{ fontFamily: "DM Sans", fontWeight: 300, fontSize: 13, color: `rgba(34,26,26,0.5)`, lineHeight: 1.78, margin: 0 }}>{piece.desc}</p>
                    <span style={{
                      marginTop: "auto",
                      fontFamily: "DM Sans", fontSize: 9, letterSpacing: "2px",
                      textTransform: "uppercase", color: `rgba(110,0,37,0.45)`,
                      border: `1px solid rgba(110,0,37,0.18)`, borderRadius: 2,
                      padding: "5px 12px", width: "fit-content",
                    }}>Coming Soon</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SHOP — garments + illustration prints, Paystack checkout
          ═══════════════════════════════════════════════════════ */}
      <section id="viva-shop" className="w-full" style={{ background: ALABASTER, paddingTop: 80, paddingBottom: 80 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>

          {/* Header row */}
          <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: 48 }}>
            <div>
              <p style={{ fontFamily: "DM Sans", fontSize: 10, color: BURGUNDY, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px 0" }}>The Shop</p>
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

          {/* GARMENTS */}
          <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0", borderBottom: `1px solid ${BURG_ALPHA}`, paddingBottom: 10 }}>Garments</p>
          <div ref={shopRef} className="grid gap-6 mb-16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
            {SHOP_PRODUCTS.filter(p => p.type === "garment").map((product, i) => (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={shopInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={reduced ? {} : { y: -5, transition: { duration: 0.2 } }}
                style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: `1px solid ${BURG_ALPHA}`, boxShadow: "0 2px 18px rgba(110,0,37,0.07)" }}
              >
                <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
                  <img src={product.photo} alt={product.title} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.55s ease" }}
                    onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }} />
                  <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "DM Sans", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", background: "rgba(110,0,37,0.88)", color: GOLD, padding: "4px 9px", borderRadius: 2 }}>{product.badge}</span>
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
            ))}
          </div>

          {/* PRINTS */}
          <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0", borderBottom: `1px solid ${BURG_ALPHA}`, paddingBottom: 10 }}>Illustration Prints</p>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {SHOP_PRODUCTS.filter(p => p.type === "print").map((product, i) => (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={shopInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
                whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: `1px solid ${BURG_ALPHA}`, boxShadow: "0 2px 12px rgba(110,0,37,0.06)", display: "flex" }}
              >
                <div style={{ width: 110, flexShrink: 0, overflow: "hidden" }}>
                  <img src={product.photo} alt={product.title} loading="lazy"
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
          CART DRAWER — slide-in from right, Paystack checkout
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
                    {cart.map(({ product, qty }) => (
                      <div key={product.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 18, marginBottom: 18, borderBottom: `1px solid ${GOLD_ALPHA}` }}>
                        <div style={{ width: 66, height: 82, flexShrink: 0, borderRadius: 3, overflow: "hidden" }}>
                          <img src={product.photo} alt={product.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: CORMORANT, fontSize: 16, color: ALABASTER, margin: "0 0 2px 0", fontWeight: 600 }}>{product.title}</p>
                          <p style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(212,175,55,0.5)`, margin: "0 0 12px 0" }}>{product.subtitle}</p>
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

              {/* Cart footer — total + Paystack */}
              {cart.length > 0 && (
                <div style={{ padding: "20px 24px", borderTop: `1px solid ${GOLD_ALPHA}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                    <span style={{ fontFamily: "DM Sans", fontSize: 10, color: `rgba(212,175,55,0.5)`, letterSpacing: "2px", textTransform: "uppercase" }}>Total</span>
                    <span style={{ fontFamily: CORMORANT, fontSize: 26, color: GOLD, fontWeight: 700 }}>
                      {currency === "NGN" ? `₦${cartTotal.toLocaleString()}` : `$${cartTotal}`}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {payStatus === "success" ? (
                      <motion.div key="pay-success"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: "center", padding: "16px 0" }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: GOLD, margin: "0 auto 12px" }}>✓</div>
                        <p style={{ fontFamily: CORMORANT, fontSize: 20, color: ALABASTER, margin: "0 0 6px 0", fontWeight: 700 }}>Payment confirmed!</p>
                        <p style={{ fontFamily: "DM Sans", fontSize: 12, color: `rgba(250,249,246,0.42)`, margin: 0 }}>Check your email for order details.</p>
                      </motion.div>
                    ) : (
                      <motion.div key="pay-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(212,175,55,0.55)`, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                            Email for receipt *
                          </label>
                          <input type="email" value={checkoutEmail}
                            onChange={(e) => setCheckoutEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{ ...enquiryInputStyle, fontSize: 12 }}
                            onFocus={(e) => (e.target.style.borderColor = GOLD)}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(250,249,246,0.22)")}
                          />
                        </div>
                        <motion.button onClick={handlePaystack}
                          disabled={!checkoutEmail || payStatus === "loading"}
                          whileHover={!checkoutEmail || payStatus === "loading" ? {} : { opacity: 0.88 }}
                          whileTap={!checkoutEmail || payStatus === "loading" ? {} : { scale: 0.98 }}
                          style={{
                            width: "100%", padding: "14px",
                            fontFamily: "DM Sans", fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600,
                            background: !checkoutEmail || payStatus === "loading" ? "rgba(212,175,55,0.38)" : GOLD,
                            color: DARK_TEXT, border: "none", borderRadius: 6,
                            cursor: !checkoutEmail ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          }}
                        >
                          <CreditCard size={13} />
                          {payStatus === "loading" ? "Opening Paystack..." : `Pay ${currency === "NGN" ? `₦${cartTotal.toLocaleString()}` : `$${cartTotal}`} via Paystack`}
                        </motion.button>
                        {payStatus === "error" && (
                          <p style={{ fontFamily: "DM Sans", fontSize: 11, color: "#FFAAAA", margin: "10px 0 0 0", textAlign: "center" }}>
                            Payment failed. Try again or email admin@vieraamber.com
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
                    <p style={{ fontFamily: "DM Sans", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: BURGUNDY, fontWeight: 600, margin: "0 0 12px 0" }}>
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
    </div>
  );
};

export default VIVAPage;
