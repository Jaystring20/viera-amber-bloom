import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShoppingBag, X, Plus, Minus, CreditCard } from "lucide-react";
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

const ALABASTER  = "#FAF9F6";
const CREAM      = "#F5EDE6";
const BURGUNDY   = "#6E0025";
const GOLD       = "#D4AF37";
const DARK_TEXT  = "#221A1A";
const CORMORANT  = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const GOLD_ALPHA = "rgba(212,175,55,0.3)";
const BURG_ALPHA = "rgba(110,0,37,0.14)";

const LOOKBOOK = [
  { title: "The Heritage",        mood: "Power & Craft",     photo: "/viva/look-1.jpeg", desc: "Olive woven kimono · Wide-leg pleated denim · Gold cuffs" },
  { title: "The Bold",            mood: "Vivid Authority",   photo: "/viva/look-2.jpeg", desc: "Hot-pink structured crop · Wide-leg denim · Statement earrings" },
  { title: "The Artist",          mood: "Chromatic Freedom", photo: "/viva/look-3.jpeg", desc: "Chartreuse palazzo · Structured crop · Layered gold jewellery" },
  { title: "Daughters of Adonai", mood: "Divine Right",      photo: "/viva/look-4.jpeg", desc: "The 'Batya' statement — worn with absolute conviction." },
];

const SHOP_PRODUCTS = [
  { id: "heritage", title: "The Heritage",  subtitle: "Look 01 · Batya Collection",        type: "garment" as const, badge: "Made to Order", photo: "/viva/look-1.jpeg", priceNGN: 180000, priceUSD: 115, desc: "Olive woven kimono · wide-leg pleated denim · gold cuffs. Bespoke fit, made to your measurements." },
  { id: "bold",     title: "The Bold",      subtitle: "Look 02 · Batya Collection",        type: "garment" as const, badge: "Limited",       photo: "/viva/look-2.jpeg", priceNGN: 195000, priceUSD: 126, desc: "Hot-pink structured crop · wide-leg denim · statement earrings. Confidence, personalised." },
  { id: "artist",   title: "The Artist",    subtitle: "Look 03 · Batya Collection",        type: "garment" as const, badge: "Made to Order", photo: "/viva/look-3.jpeg", priceNGN: 188000, priceUSD: 121, desc: "Chartreuse palazzo · structured crop · layered gold jewellery. Chromatic freedom in fabric." },
  { id: "print-01", title: "Batya No.1",    subtitle: "Fashion Illustration · A3 Giclée", type: "print"   as const, badge: "Edition / 30", photo: "/viva/look-4.jpeg", priceNGN: 35000,  priceUSD: 22,  desc: "Archival giclée on 300gsm cotton rag. Signed + numbered. Ships in a protective tube." },
  { id: "print-02", title: "Heritage Print",subtitle: "Fashion Illustration · A3 Giclée", type: "print"   as const, badge: "Edition / 30", photo: "/viva/look-1.jpeg", priceNGN: 35000,  priceUSD: 22,  desc: "The Heritage silhouette in ink and gouache. Signed by Viera Amber. Edition of 30." },
] as const;

type ShopProduct = typeof SHOP_PRODUCTS[number];
type CartItem = { product: ShopProduct; qty: number };

const PILLARS = [
  { heading: "Structured Fluidity" },
  { heading: "Artistic Agency" },
  { heading: "Sacred Identity" },
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
  const [currency, setCurrency]         = useState<"NGN" | "USD">("NGN");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [payStatus, setPayStatus]       = useState<"idle" | "loading" | "success" | "error">("idle");

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
      callback: (_response) => {
        setPayStatus("success");
        setCart([]);
      },
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
    <div style={{ backgroundColor: BURGUNDY, minHeight: "100vh" }}>
      <NavBar />

      {/* ═══════════════════════════════════════════════════════
          HERO — centred masthead + triangular image composition
          Look-4 apex (centre), look-1 left / look-2 right base
          Desktop: images bleed between hero ↔ pillars sections
          ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "visible", background: BURGUNDY, zIndex: 3 }}>
        {/* Grain texture */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 12px)",
        }} />
        {/* Gold warmth top-centre */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(212,175,55,0.15) 0%, transparent 65%)",
        }} />

        {/* ── Centred text header — all viewports ──────────────── */}
        <div
          className="relative mx-auto px-6"
          style={{ maxWidth: 620, zIndex: 3, textAlign: "center", paddingTop: "clamp(108px, 14vh, 148px)" }}
        >
          {/* Back */}
          <motion.button
            type="button" onClick={() => navigate("/")}
            variants={fadeVariants} initial="hidden" animate="visible"
            style={{
              background: "none", border: "none",
              color: "rgba(212,175,55,0.4)", cursor: "pointer",
              fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11,
              letterSpacing: "1.5px", textTransform: "uppercase", padding: 0,
              display: "flex", alignItems: "center", gap: 6, marginBottom: 28,
            }}
            whileHover={reduced ? {} : { color: GOLD }}
          >
            <ArrowLeft size={13} /> Back
          </motion.button>

          {/* VIVA logo */}
          <motion.img
            src="/viva-logo.svg" alt="VIVA by Viera Amber"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: d(0.85), ease: "easeOut", delay: d(0.12) }}
            style={{
              height: "clamp(72px, 12vw, 148px)", width: "auto",
              display: "block", margin: "0 auto 22px",
              filter: "drop-shadow(0 0 28px rgba(212,175,55,0.26))",
            }}
            draggable={false}
          />

          {/* "For her, by her." — large display */}
          <motion.h1
            initial={{ opacity: 0, y: reduced ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.7), delay: d(0.5), ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(36px, 8vw, 84px)",
              lineHeight: 1.02, color: "rgba(250,249,246,0.9)",
              margin: "0 0 22px 0", letterSpacing: "-0.3px",
            }}
          >For her, by her.</motion.h1>

          {/* Mobile-only: look-4 sits right below the headline */}
          <motion.div
            className="sm:hidden"
            initial={{ opacity: 0, y: reduced ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.8), delay: d(0.72), ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "clamp(172px, 68%, 244px)", margin: "0 auto 20px",
              border: `1px solid ${GOLD_ALPHA}`,
              boxShadow: "0 28px 72px rgba(0,0,0,0.6)",
              overflow: "hidden", borderRadius: 3,
            }}
          >
            <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
              <img src="/viva/look-4.jpeg" alt="Daughters of Adonai — VIVA 'Batya' collection"
                loading="eager"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
            </div>
            <div style={{ padding: "9px 12px", background: BURGUNDY, borderTop: `1px solid ${GOLD_ALPHA}` }}>
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: 13, color: GOLD, margin: 0, opacity: 0.85 }}>Daughters of Adonai</p>
            </div>
          </motion.div>

          {/* Rule */}
          <motion.div
            variants={ruleVariants} initial="hidden" animate="visible"
            transition={{ delay: d(0.86) }}
            style={{ width: 44, height: 1, background: GOLD_ALPHA, margin: "0 auto 18px", transformOrigin: "center" }}
          />

          {/* Collection tagline */}
          <motion.p
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(0.95) }}
            style={{
              fontFamily: CORMORANT, fontStyle: "italic", fontSize: "clamp(14px, 1.9vw, 20px)",
              color: GOLD, opacity: 0.78, margin: "0 0 14px 0",
            }}
          >'Batya' — Daughters of Adonai</motion.p>

          {/* Body */}
          <motion.p
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(1.06) }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13.5,
              color: "rgba(250,249,246,0.38)", lineHeight: 1.85,
              margin: "0 auto 26px", maxWidth: 360,
            }}
          >
            Structured tailoring meets fluid artistic silhouettes. High-end wearable art
            for the modern woman who wears her confidence out loud.
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#viva-enquiry" onClick={scrollToEnquiry}
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(1.2) }}
            whileHover={reduced ? {} : { opacity: 0.85, scale: 1.02 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, letterSpacing: "2.5px",
              textTransform: "uppercase", fontWeight: 500,
              background: GOLD, color: DARK_TEXT, border: "none",
              borderRadius: 3, padding: "13px 30px",
              cursor: "pointer", textDecoration: "none",
              display: "inline-block", marginBottom: 28,
            }}
          >Enquire About a Commission</motion.a>

          {/* Stats */}
          <motion.div
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(1.35) }}
            style={{ display: "flex", gap: 28, justifyContent: "center", paddingBottom: "clamp(28px, 4vh, 44px)" }}
          >
            {[["Selective", "Commissions"], ["Bespoke", "Garments"], ["48hr", "Response"]].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: CORMORANT, fontSize: 20, fontWeight: 700, color: GOLD, margin: 0, lineHeight: 1 }}>{val}</p>
                <p style={{ fontFamily: "DM Sans", fontSize: 9, color: "rgba(212,175,55,0.38)", margin: "5px 0 0 0", letterSpacing: "1.8px", textTransform: "uppercase" }}>{lbl}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── EDITORIAL MAGAZINE HERO (≥1024px) — FULL BLEED, BURSTING ── */}
        {/* Three dramatic image cards: asymmetric V-layout extending into Philosophy section */}
        <div className="hidden lg:block" style={{
          position: "relative",
          height: "860px",
          zIndex: 10,
          overflow: "visible",
          paddingBottom: "0px",
        }}>
          {/* Container for absolute positioning — NO BOUNDS */}
          <div style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, right: 0 }}>

            {/* LOOK-2 — LEFT MASSIVE IMAGE, positioned HIGH-LEFT, BURSTING */}
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 0.85, y: reduced ? 0 : -60 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: d(0.7),
                delay: d(0.0),
                type: "spring",
                stiffness: 280,
                damping: 20,
              }}
              whileHover={reduced ? {} : { scale: 1.05, transition: { duration: 0.2 } }}
              style={{
                position: "absolute",
                left: "-5%",
                top: "-40px",
                width: "clamp(380px, 38%, 520px)",
                zIndex: 12,
                cursor: "pointer",
              }}
            >
              <motion.div
                animate={reduced ? {} : { y: [0, -14, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  border: "16px solid white",
                  borderRadius: "0px",
                  overflow: "hidden",
                  boxShadow: "0 48px 120px rgba(0,0,0,0.7)",
                  aspectRatio: "2/3",
                }}
              >
                <img
                  src="/viva/look-2.jpeg"
                  alt="The Bold — Look 02"
                  loading="eager"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                    display: "block",
                    mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  }}
                />
              </motion.div>
            </motion.div>

            {/* LOOK-4 — CENTER DRAMATIC IMAGE, positioned CENTER-LOWER, BOLD ACCENT */}
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 0.80, y: reduced ? 0 : 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: d(0.8),
                delay: d(0.35),
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              whileHover={reduced ? {} : { scale: 1.08, transition: { duration: 0.2 } }}
              style={{
                position: "absolute",
                left: "50%",
                top: "280px",
                transform: "translateX(-50%)",
                width: "clamp(280px, 24%, 360px)",
                zIndex: 11,
                cursor: "pointer",
              }}
            >
              <motion.div
                animate={reduced ? {} : { y: [0, 16, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                style={{
                  border: "16px solid white",
                  borderRadius: "0px",
                  overflow: "hidden",
                  boxShadow: "0 52px 140px rgba(0,0,0,0.8)",
                  aspectRatio: "3/4",
                }}
              >
                <img
                  src="/viva/look-4.jpeg"
                  alt="Daughters of Adonai"
                  loading="eager"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center center",
                    display: "block",
                    mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  }}
                />
              </motion.div>
            </motion.div>

            {/* LOOK-1 — RIGHT MASSIVE IMAGE, positioned HIGH-RIGHT, BURSTING */}
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 0.85, y: reduced ? 0 : -60 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: d(0.7),
                delay: d(0.15),
                type: "spring",
                stiffness: 280,
                damping: 20,
              }}
              whileHover={reduced ? {} : { scale: 1.05, transition: { duration: 0.2 } }}
              style={{
                position: "absolute",
                right: "-5%",
                top: "-40px",
                width: "clamp(380px, 38%, 520px)",
                zIndex: 12,
                cursor: "pointer",
              }}
            >
              <motion.div
                animate={reduced ? {} : { y: [0, -14, 0] }}
                transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                style={{
                  border: "16px solid white",
                  borderRadius: "0px",
                  overflow: "hidden",
                  boxShadow: "0 48px 120px rgba(0,0,0,0.7)",
                  aspectRatio: "2/3",
                }}
              >
                <img
                  src="/viva/look-1.jpeg"
                  alt="The Heritage — Look 01"
                  loading="eager"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                    display: "block",
                    mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── TABLET UNCONVENTIONAL (640–1023px): stacked overlapping arrangement ── */}
        <div className="hidden sm:block lg:hidden" style={{
          position: "relative",
          padding: "24px clamp(12px, 3%, 24px) 120px",
          minHeight: "820px",
          overflow: "hidden",
        }}>
          {/* look-4 — CENTER HERO, large, positioned to overlap text */}
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: d(0.85), delay: d(0.0), ease: "easeOut" }}
            style={{
              position: "absolute",
              left: "50%", top: "140px",
              transform: "translateX(-50%)",
              width: "clamp(200px, 45%, 260px)",
              height: "580px",
              zIndex: 1,
            }}
          >
            <motion.div
              animate={reduced ? {} : { y: [0, 8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ height: "100%" }}
            >
              <img src="/viva/look-4.jpeg" alt="Daughters of Adonai — VIVA 'Batya'" loading="eager"
                style={{
                  width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
                  mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  filter: "contrast(1.06)",
                }}
              />
            </motion.div>
          </motion.div>

          {/* look-1 — LEFT ECHO, small, partially behind look-4 */}
          <motion.div
            initial={{ opacity: 0, x: reduced ? 0 : -40 }}
            whileInView={{ opacity: 0.6, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: d(0.8), delay: d(0.15), ease: "easeOut" }}
            style={{
              position: "absolute",
              left: "8%", top: "220px",
              width: "clamp(120px, 20%, 160px)",
              height: "420px",
              zIndex: 0,
            }}
          >
            <motion.div
              animate={reduced ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              style={{ height: "100%" }}
            >
              <img src="/viva/look-1.jpeg" alt="The Heritage" loading="lazy"
                style={{
                  width: "100%", height: "100%", objectFit: "cover", objectPosition: "top",
                  mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  filter: "contrast(1.08) saturate(0.85) opacity(0.7)",
                }}
              />
            </motion.div>
          </motion.div>

          {/* look-2 — RIGHT ECHO, small, partially behind look-4 */}
          <motion.div
            initial={{ opacity: 0, x: reduced ? 0 : 40 }}
            whileInView={{ opacity: 0.6, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: d(0.8), delay: d(0.3), ease: "easeOut" }}
            style={{
              position: "absolute",
              right: "8%", top: "220px",
              width: "clamp(120px, 20%, 160px)",
              height: "420px",
              zIndex: 0,
            }}
          >
            <motion.div
              animate={reduced ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              style={{ height: "100%" }}
            >
              <img src="/viva/look-2.jpeg" alt="The Bold" loading="lazy"
                style={{
                  width: "100%", height: "100%", objectFit: "cover", objectPosition: "top",
                  mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  filter: "contrast(1.08) saturate(0.85) opacity(0.7)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PILLARS — warm cream contrast break (images bleed into from above)
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full pb-20 pt-20 lg:pt-80" style={{
        background: CREAM,
        position: "relative",
        overflow: "visible",
        zIndex: 4,
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: BURGUNDY, opacity: 0.45 }} />

        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <motion.p
            variants={fadeVariants} initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: BURGUNDY, letterSpacing: "5px", textTransform: "uppercase", marginBottom: 10, opacity: 0.68 }}
          >The VIVA Philosophy</motion.p>

          <motion.h2
            variants={slideUpVariants} initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            style={{ fontFamily: CORMORANT, fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: DARK_TEXT, marginBottom: 64, lineHeight: 1.15 }}
          >
            She wears her confidence out loud.
          </motion.h2>

          <motion.div
            ref={pillarsRef}
            variants={staggerVariants} initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            className="grid gap-0"
            style={{ gridTemplateColumns: "repeat(3, 1fr)", borderTop: `2px solid ${BURGUNDY}` }}
          >
            {PILLARS.map((p, i) => (
              <motion.div key={p.heading} variants={cardVariants}
                style={{
                  padding: "32px 28px 32px",
                  borderRight: i < 2 ? `1px solid rgba(110,0,37,0.15)` : "none",
                }}
              >
                <span style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.52, display: "block", marginBottom: 14 }}>0{i + 1}</span>
                <h3 style={{ fontFamily: CORMORANT, fontSize: "clamp(26px, 3.2vw, 46px)", fontWeight: 700, color: DARK_TEXT, margin: 0, lineHeight: 1.08 }}>{p.heading}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
            <p style={{ fontFamily: "DM Sans", fontSize: 10, color: BURGUNDY, opacity: 0.55, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 10px 0" }}>The Collection</p>
            <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 700, color: DARK_TEXT, margin: 0, lineHeight: 1.1 }}>
              Batya Lookbook
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
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
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
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
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

            {/* Look 04 — Daughters of Adonai — editorial split panel before quote */}
            <motion.div variants={cardVariants} style={{ marginBottom: 32 }}>
              <div className="grid" style={{
                gridTemplateColumns: "1fr 1fr",
                minHeight: 360,
                border: `1px solid ${BURG_ALPHA}`,
                borderRadius: 4, overflow: "hidden",
              }}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <img
                    src={LOOKBOOK[3].photo}
                    alt={LOOKBOOK[3].title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                  />
                </div>
                <div style={{ padding: "40px 36px", background: DARK_TEXT, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <p style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(212,175,55,0.58)`, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 10px 0" }}>Look 04 · {LOOKBOOK[3].mood}</p>
                  <h3 style={{ fontFamily: CORMORANT, fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: ALABASTER, margin: "0 0 16px 0", lineHeight: 1.08 }}>{LOOKBOOK[3].title}</h3>
                  <p style={{ fontFamily: "DM Sans", fontWeight: 300, fontSize: 13, color: `rgba(250,249,246,0.48)`, lineHeight: 1.78, margin: 0 }}>{LOOKBOOK[3].desc}</p>
                </div>
              </div>
            </motion.div>

            {/* Pull quote */}
            <motion.div
              variants={cardVariants}
              style={{ textAlign: "center", padding: "44px 20px", borderTop: `1px solid ${BURG_ALPHA}`, borderBottom: `1px solid ${BURG_ALPHA}` }}
            >
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: "clamp(18px, 3vw, 30px)", color: BURGUNDY, fontWeight: 400, margin: 0, maxWidth: 600, display: "inline-block", opacity: 0.82 }}>
                "She knows exactly who she is — the clothes are just the evidence."
              </p>
            </motion.div>
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
              <p style={{ fontFamily: "DM Sans", fontSize: 10, color: BURGUNDY, opacity: 0.55, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 8px 0" }}>The Shop</p>
              <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 700, color: DARK_TEXT, margin: 0, lineHeight: 1.1 }}>
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
          <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, opacity: 0.45, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0", borderBottom: `1px solid ${BURG_ALPHA}`, paddingBottom: 10 }}>Garments</p>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                </div>
              </motion.div>
            ))}
          </div>

          {/* PRINTS */}
          <p style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, opacity: 0.45, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 20px 0", borderBottom: `1px solid ${BURG_ALPHA}`, paddingBottom: 10 }}>Illustration Prints</p>
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
              Commissions are taken on a selective basis. Tell us about what you have in mind — garment, illustration, or bespoke collaboration — and we'll be in touch within 48 hours.
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
      </AnimatePresence>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid rgba(212,175,55,0.1)`, padding: "24px", textAlign: "center", background: "#1A0808" }}>
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: `rgba(212,175,55,0.28)`, margin: 0, letterSpacing: "1px" }}>
          © {new Date().getFullYear()} Viera Amber. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default VIVAPage;
