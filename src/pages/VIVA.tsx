import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { fadeIn, fadeSlideUp, staggerContainer, cardItem, scaleXRule, inViewProps, useReducedVariants } from "@/lib/animations";
import { supabase } from "@/lib/supabase";

// TODO: Export hero images from Lovable and place in /public/viva/
// Then uncomment these paths:
// const vivaHeroLeft = "/viva/hero-left.png";
// const vivaHeroRight = "/viva/hero-right.png";

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
  { title: "The Heritage", mood: "Power & Craft",     photo: "/viva/look-1.jpeg", desc: "Olive woven kimono · Wide-leg pleated denim · Gold cuffs" },
  { title: "The Bold",     mood: "Vivid Authority",   photo: "/viva/look-2.jpeg", desc: "Hot-pink structured crop · Wide-leg denim · Statement earrings" },
  { title: "The Artist",   mood: "Chromatic Freedom", photo: "/viva/look-3.jpeg", desc: "Chartreuse palazzo · Structured crop · Layered gold jewellery" },
];

// Upcoming pieces (no photo yet)
const COMING = [
  { title: "Coronation",  mood: "Divine Right",   desc: "There is a moment when a woman stops asking permission. Coronation is that moment, dressed." },
  { title: "Golden Hour", mood: "Warmth & Light", desc: "The hour when everything you've built is lit from the right angle. Warm, burnished, yours." },
];

const PILLARS = [
  { heading: "Structured Fluidity",  body: "Tailored lines paired with flowing fabrics. Precision and grace in one silhouette — the garments hold shape and invite movement at once." },
  { heading: "Artistic Agency",       body: "VIVA translates internal confidence into a vivid exterior statement. Every touchpoint is deliberate, curated, gallery-grade — the wardrobe as manifesto." },
  { heading: "Sacred Identity",       body: "The 'Batya' collection draws from spiritual lineage. Garments that say: I know who I am and whose I am." },
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
  const enquiryRef  = useRef<HTMLDivElement>(null);

  const pillarsInView  = useInView(pillarsRef,  inViewProps);
  const lookbookInView = useInView(lookbookRef, inViewProps);
  const enquiryInView  = useInView(enquiryRef,  inViewProps);

  const fadeVariants    = useReducedVariants(fadeIn);
  const slideUpVariants = useReducedVariants(fadeSlideUp);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants    = useReducedVariants(cardItem);
  const ruleVariants    = useReducedVariants(scaleXRule);

  const d = (s: number) => (reduced ? 0 : s);

  const [form, setForm] = useState({ name: "", email: "", interest: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

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
          HERO — deep burgundy, Daughters of Adonai centred portrait
          ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", background: BURGUNDY, minHeight: "clamp(900px, 115vh, 1240px)" }}>
        {/* Subtle crosshatch grain */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 12px)",
        }} />
        {/* Gold glow from top — warmth */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 90% 45% at 50% -2%, rgba(212,175,55,0.14) 0%, transparent 65%)",
        }} />

        {/* Editorial flanking models — COMMENTED OUT: waiting for Lovable image exports */}
        {/* TODO: Replace with actual image paths once exported from Lovable
        <motion.img
          src="/viva/hero-left.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{ opacity: 0, x: reduced ? 0 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: d(1.2), delay: d(0.35), ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block"
          style={{
            position: "absolute", left: "-4%", bottom: 0,
            height: "clamp(820px, 120vh, 1180px)", width: "auto",
            objectFit: "contain", objectPosition: "bottom left",
            transform: "scaleX(-1)",
            transformOrigin: "bottom left",
            pointerEvents: "none", userSelect: "none",
            zIndex: 1,
            filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.4))",
          }}
        />
        <motion.img
          src="/viva/hero-right.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{ opacity: 0, x: reduced ? 0 : 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: d(1.2), delay: d(0.35), ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block"
          style={{
            position: "absolute", right: "-4%", bottom: 0,
            height: "clamp(820px, 120vh, 1180px)", width: "auto",
            objectFit: "contain", objectPosition: "bottom right",
            transformOrigin: "bottom right",
            pointerEvents: "none", userSelect: "none",
            zIndex: 1,
            filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.4))",
          }}
        />
        */}

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

            {/* Collection name */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.1) }}
              style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontSize: "clamp(18px, 2.5vw, 28px)",
                color: `rgba(250,249,246,0.82)`,
                fontWeight: 400,
                margin: 0,
              }}
            >'Batya' — Daughters of Adonai</motion.p>

            {/* Body */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.22) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: `rgba(250,249,246,0.42)`,
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

            {/* Stats strip */}
            <motion.div
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.5) }}
              style={{ display: "flex", gap: 36, marginTop: 8 }}
            >
              {[["Selective", "Commissions"], ["Bespoke", "Garments"], ["48hr", "Response"]].map(([val, lbl]) => (
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
          PILLARS — warm cream contrast break
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full py-20" style={{ background: CREAM, position: "relative", overflow: "hidden" }}>
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
            style={{ fontFamily: CORMORANT, fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: DARK_TEXT, marginBottom: 52, lineHeight: 1.15 }}
          >
            She wears her confidence out loud.
          </motion.h2>

          <motion.div
            ref={pillarsRef}
            variants={staggerVariants} initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            className="grid gap-10"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            {PILLARS.map((p, i) => (
              <motion.div key={p.heading} variants={cardVariants}
                style={{ borderTop: `2px solid ${BURGUNDY}`, paddingTop: 22 }}
              >
                <span style={{ fontFamily: "DM Sans", fontSize: 9, color: BURGUNDY, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.65 }}>0{i + 1}</span>
                <h3 style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: DARK_TEXT, margin: "8px 0 12px" }}>{p.heading}</h3>
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13.5, color: `rgba(34,26,26,0.62)`, lineHeight: 1.8, margin: 0 }}>{p.body}</p>
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
