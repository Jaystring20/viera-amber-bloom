import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { fadeIn, fadeSlideUp, staggerContainer, cardItem, scaleXRule, inViewProps, useReducedVariants } from "@/lib/animations";
import { supabase } from "@/lib/supabase";

const ALABASTER = "#FAF9F6";
const CREAM     = "#F5EDE6";
const BURGUNDY  = "#6E0025";
const GOLD      = "#D4AF37";
const DARK_TEXT = "#221A1A";
const CORMORANT = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const GOLD_BORDER   = "rgba(212,175,55,0.35)";
const BURG_BORDER   = "rgba(110,0,37,0.14)";

const LOOKBOOK = [
  { title: "The Heritage", mood: "Power & Craft",      photo: "/viva/look-1.jpeg", desc: "Olive woven kimono · Wide-leg pleated denim · Gold cuffs" },
  { title: "The Bold",     mood: "Vivid Authority",    photo: "/viva/look-2.jpeg", desc: "Hot-pink structured crop · Wide-leg denim · Statement earrings" },
  { title: "The Artist",   mood: "Chromatic Freedom",  photo: "/viva/look-3.jpeg", desc: "Chartreuse palazzo · Structured crop · Layered gold jewellery" },
  { title: "Daughters",    mood: "Sacred Identity",    photo: "/viva/look-4.jpeg", desc: "The graphic tee that started a conversation. 'Daughters of Adonai' — identity as a statement, thread as testimony." },
  { title: "Coronation",   mood: "Divine Right",       desc: "There is a moment when a woman stops asking permission. Coronation is that moment, dressed." },
  { title: "Golden Hour",  mood: "Warmth & Light",     desc: "The hour when everything you've built is lit from the right angle. Warm, burnished, yours." },
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
  const navigate = useNavigate();
  const reduced  = useReducedMotion();

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

  return (
    <div style={{ backgroundColor: ALABASTER, minHeight: "100vh" }}>
      <NavBar />

      {/* ═══════════════════════════════════════════════════════
          HERO — centered, warm editorial, brand board aligned
          ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "92vh", background: ALABASTER }}>
        {/* Warm radial glow from top — mimics sand/taupe from brand board */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 150% 80% at 50% -5%, #E5CEAD 0%, rgba(250,249,246,0) 62%)",
        }} />

        {/* Flanking photo — left, desktop only */}
        <div
          className="hidden md:block"
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 0, left: 0,
            width: "20%", height: "66%",
            overflow: "hidden",
          }}
        >
          <img src="/viva/look-1.jpeg" alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
          />
          {/* Fade right into page */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 0%, rgba(250,249,246,0.92) 88%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "28%", background: `linear-gradient(to top, ${ALABASTER} 0%, transparent 100%)` }} />
        </div>

        {/* Flanking photo — right, desktop only */}
        <div
          className="hidden md:block"
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 0, right: 0,
            width: "20%", height: "78%",
            overflow: "hidden",
          }}
        >
          <img src="/viva/look-3.jpeg" alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
          />
          {/* Fade left into page */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 0%, rgba(250,249,246,0.92) 88%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "28%", background: `linear-gradient(to top, ${ALABASTER} 0%, transparent 100%)` }} />
        </div>

        {/* ── Center content ── */}
        <div
          className="relative mx-auto px-6"
          style={{ maxWidth: 640, zIndex: 1 }}
        >
          <div
            className="flex flex-col items-center"
            style={{ paddingTop: 140, paddingBottom: 72, gap: 18, textAlign: "center" }}
          >
            {/* Back */}
            <motion.button
              type="button" onClick={() => navigate("/")}
              variants={fadeVariants} initial="hidden" animate="visible"
              style={{
                background: "none", border: "none",
                color: `rgba(110,0,37,0.4)`, cursor: "pointer",
                fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11,
                letterSpacing: "1.5px", textTransform: "uppercase", padding: 0,
                display: "flex", alignItems: "center", gap: 6,
                alignSelf: "flex-start",
              }}
              whileHover={reduced ? {} : { color: BURGUNDY }}
            >
              <ArrowLeft size={13} /> Back
            </motion.button>

            {/* VIVA logo — centered, prominent */}
            <motion.img
              src="/viva-logo.svg"
              alt="VIVA by Viera Amber"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: d(0.9), ease: "easeOut", delay: d(0.2) }}
              style={{
                height: "clamp(100px, 14vw, 186px)",
                width: "auto",
                display: "block",
                margin: "4px auto 0",
                filter: "drop-shadow(0 2px 28px rgba(110,0,37,0.13)) brightness(0.9) sepia(0.08)",
              }}
              draggable={false}
            />

            {/* "For her, by her." tagline */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(0.75) }}
              style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontSize: "clamp(16px, 2vw, 22px)",
                color: BURGUNDY,
                margin: 0,
                letterSpacing: "0.3px",
                opacity: 0.9,
              }}
            >For her, by her.</motion.p>

            {/* Rule */}
            <motion.div
              variants={ruleVariants} initial="hidden" animate="visible"
              transition={{ delay: d(0.9) }}
              style={{ width: 44, height: 1, background: `rgba(110,0,37,0.22)`, transformOrigin: "center" }}
            />

            {/* Collection name */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.0) }}
              style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontSize: "clamp(20px, 3vw, 34px)",
                color: DARK_TEXT,
                fontWeight: 400,
                margin: 0,
              }}
            >'Batya' — Daughters of Adonai</motion.p>

            {/* Body */}
            <motion.p
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.15) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: `rgba(34,26,26,0.52)`,
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 360,
              }}
            >
              Structured tailoring meets fluid artistic silhouettes. High-end wearable art
              for the modern woman who wears her confidence out loud.
            </motion.p>

            {/* CTA */}
            <motion.a
              href="#viva-enquiry"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("viva-enquiry")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
              }}
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.3) }}
              whileHover={reduced ? {} : { opacity: 0.84, scale: 1.02 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontWeight: 500,
                background: BURGUNDY,
                color: ALABASTER,
                border: "none",
                borderRadius: 3,
                padding: "13px 30px",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-block",
                marginTop: 4,
              }}
            >Enquire About a Commission</motion.a>

            {/* Stat strip */}
            <motion.div
              variants={fadeVariants} initial="hidden" animate="visible"
              transition={{ delay: d(1.5) }}
              style={{ display: "flex", gap: 36, marginTop: 10 }}
            >
              {[["Selective", "Commissions"], ["Bespoke", "Garments"], ["48hr", "Response"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 700, color: BURGUNDY, margin: 0, lineHeight: 1 }}>{val}</p>
                  <p style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(34,26,26,0.38)`, margin: "5px 0 0 0", letterSpacing: "1.8px", textTransform: "uppercase" }}>{lbl}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile: photo strip below copy */}
        <div
          className="md:hidden"
          style={{ height: "62vw", overflow: "hidden", position: "relative" }}
        >
          <img src="/viva/look-2.jpeg" alt="VIVA look"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 12%", display: "block" }}
          />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "32%", background: `linear-gradient(to bottom, ${ALABASTER} 0%, transparent 100%)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "32%", background: `linear-gradient(to top, ${ALABASTER} 0%, transparent 100%)` }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PILLARS — warm cream
          ═══════════════════════════════════════════════════════ */}
      <section className="w-full py-20" style={{ background: CREAM, position: "relative", overflow: "hidden" }}>
        {/* Burgundy accent top line */}
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
          LOOKBOOK — alabaster background, editorial asymmetric
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
            {/* Top row: look-1 tall left | look-2 + look-3 stacked right */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>

              {/* Look 1 — tall left */}
              <motion.div
                variants={cardVariants}
                whileHover={reduced ? {} : { y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                style={{ border: `1px solid ${BURG_BORDER}`, borderRadius: 4, overflow: "hidden", cursor: "pointer" }}
                onClick={() => document.getElementById("viva-enquiry")?.scrollIntoView({ behavior: "smooth" })}
              >
                <div style={{ position: "relative", height: "100%", minHeight: 480, overflow: "hidden" }}>
                  <img
                    src={LOOKBOOK[0].photo!}
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

              {/* Right: Look 2 + Look 3 stacked */}
              <div className="flex flex-col gap-4">
                {[LOOKBOOK[1], LOOKBOOK[2]].map((piece, i) => (
                  <motion.div
                    key={piece.title}
                    variants={cardVariants}
                    whileHover={reduced ? {} : { y: -5 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    style={{ border: `1px solid ${BURG_BORDER}`, borderRadius: 4, overflow: "hidden", cursor: "pointer", flex: 1 }}
                    onClick={() => document.getElementById("viva-enquiry")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <div style={{ position: "relative", minHeight: 228, overflow: "hidden" }}>
                      <img
                        src={piece.photo!}
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
              style={{ textAlign: "center", padding: "44px 20px", borderTop: `1px solid ${BURG_BORDER}`, borderBottom: `1px solid ${BURG_BORDER}`, margin: "0 0 32px 0" }}
            >
              <p style={{ fontFamily: CORMORANT, fontStyle: "italic", fontSize: "clamp(18px, 3vw, 30px)", color: BURGUNDY, fontWeight: 400, margin: 0, maxWidth: 600, display: "inline-block", opacity: 0.82 }}>
                "She knows exactly who she is — the clothes are just the evidence."
              </p>
            </motion.div>

            {/* Bottom row: look-4 + editorial placeholders */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {LOOKBOOK.slice(3).map((piece, i) => (
                <motion.div
                  key={piece.title}
                  variants={cardVariants}
                  whileHover={reduced ? {} : { y: -5 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  style={{ border: `1px solid ${BURG_BORDER}`, borderRadius: 4, overflow: "hidden" }}
                >
                  {piece.photo ? (
                    <div style={{ position: "relative", overflow: "hidden" }}>
                      <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                        <img
                          src={piece.photo}
                          alt={piece.title}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.6s ease" }}
                          onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                        />
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", background: "linear-gradient(to top, rgba(10,0,5,0.82) 0%, transparent 100%)" }} />
                      <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                        <p style={{ fontFamily: "DM Sans", fontSize: 9, color: "rgba(212,175,55,0.8)", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 4px 0" }}>Look 0{i + 4} · {piece.mood}</p>
                        <h3 style={{ fontFamily: CORMORANT, fontSize: 20, color: ALABASTER, margin: 0, fontStyle: "italic" }}>{piece.title}</h3>
                      </div>
                    </div>
                  ) : (
                    /* Editorial placeholder — warm sand gradient */
                    <div style={{
                      padding: "38px 20px 28px",
                      display: "flex", flexDirection: "column", gap: 12, minHeight: 220,
                      background: `linear-gradient(${145 + i * 22}deg, rgba(212,175,55,0.07) 0%, rgba(229,198,157,0.18) 45%, rgba(250,249,246,0.95) 100%)`,
                    }}>
                      <span style={{ fontFamily: "DM Sans", fontSize: 9, color: `rgba(110,0,37,0.5)`, letterSpacing: "3px", textTransform: "uppercase" }}>Look 0{i + 4} · {piece.mood}</span>
                      <h3 style={{ fontFamily: CORMORANT, fontSize: 22, color: DARK_TEXT, margin: 0, fontWeight: 700 }}>{piece.title}</h3>
                      <p style={{ fontFamily: "DM Sans", fontWeight: 300, fontSize: 12, color: `rgba(34,26,26,0.5)`, lineHeight: 1.75, margin: 0 }}>{piece.desc}</p>
                      <span style={{
                        marginTop: "auto",
                        fontFamily: "DM Sans", fontSize: 9, letterSpacing: "2px",
                        textTransform: "uppercase", color: `rgba(110,0,37,0.45)`,
                        border: `1px solid rgba(110,0,37,0.18)`, borderRadius: 2,
                        padding: "4px 10px", width: "fit-content",
                      }}>Coming Soon</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ENQUIRY — burgundy accent section (dark used intentionally)
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
      <footer style={{ borderTop: `1px solid rgba(250,249,246,0.08)`, padding: "24px", textAlign: "center", background: "#1A0808" }}>
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: `rgba(212,175,55,0.28)`, margin: 0, letterSpacing: "1px" }}>
          © {new Date().getFullYear()} Viera Amber. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default VIVAPage;
