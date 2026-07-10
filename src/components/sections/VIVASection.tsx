import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeIn, scaleXRule, inViewProps, useReducedVariants } from "@/lib/animations";

const GOLD = "#D4AF37";
const GOLD_BORDER = "rgba(212,175,55,0.28)";

const LOOKS = [
  { src: "/viva/look-1.webp", name: "The Heritage", tag: "01", mood: "Power & Craft" },
  { src: "/viva/look-2.webp", name: "The Bold",     tag: "02", mood: "Vivid Authority" },
  { src: "/viva/look-3.webp", name: "The Artist",   tag: "03", mood: "Chromatic Freedom" },
];

const VIVASection = () => {
  const reduced   = useReducedMotion();
  const navigate  = useNavigate();
  const heroRef   = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const heroInView    = useInView(heroRef,   inViewProps);
  const pillarsInView = useInView(pillarsRef, inViewProps);

  const fadeVariants = useReducedVariants(fadeIn);
  const ruleVariants = useReducedVariants(scaleXRule);
  const d = (s: number) => (reduced ? 0 : s);

  return (
    <div
      id="viva"
      style={{
        backgroundColor: "#6E0025",
        position: "relative",
        // overflow: visible lets photo 3 bleed into the next section
        overflow: "visible",
        paddingTop: 80,
        paddingBottom: 60,
      }}
    >
      {/* Crosshatch texture */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 10px)",
      }} />

      {/* ── Hero copy (compact, centered) ────────────────────── */}
      <div ref={heroRef} style={{ textAlign: "center", position: "relative", zIndex: 2, marginBottom: 0 }}>
        <motion.p
          variants={fadeVariants} initial="hidden"
          animate={heroInView ? "visible" : "hidden"} transition={{ delay: d(0.1) }}
          style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(212,175,55,0.5)", letterSpacing: "6px", textTransform: "uppercase", margin: "0 0 14px 0" }}
        >By Viera Amber</motion.p>

        <motion.img
          src="/viva-logo.svg" alt="VIVA by Viera Amber"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.88 }}
          animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: d(0.9), ease: "easeOut" as const, delay: d(0.2) }}
          style={{ height: "clamp(52px, 8.5vw, 100px)", width: "auto", filter: "drop-shadow(0 0 22px rgba(212,175,55,0.2))", marginBottom: 18, display: "block", margin: "0 auto 18px" }}
          draggable={false}
        />

        <motion.div
          variants={ruleVariants} initial="hidden"
          animate={heroInView ? "visible" : "hidden"} transition={{ delay: d(0.9) }}
          style={{ width: 36, height: 1, background: GOLD_BORDER, transformOrigin: "center", margin: "0 auto 16px" }}
        />

        <motion.p
          variants={fadeVariants} initial="hidden"
          animate={heroInView ? "visible" : "hidden"} transition={{ delay: d(0.95) }}
          style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(250,245,246,0.65)", fontWeight: 500, margin: "0 auto 4px" }}
        >The Maiden Collection</motion.p>

        <motion.p
          className="font-display" variants={fadeVariants} initial="hidden"
          animate={heroInView ? "visible" : "hidden"} transition={{ delay: d(1.0) }}
          style={{ fontStyle: "italic", fontSize: "clamp(15px, 2vw, 22px)", color: "rgba(250,245,246,0.82)", fontWeight: 400, margin: "0 auto 10px", maxWidth: 340 }}
        >Batya: Daughters of Adonai</motion.p>

        <motion.p
          variants={fadeVariants} initial="hidden"
          animate={heroInView ? "visible" : "hidden"} transition={{ delay: d(1.1) }}
          style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(250,245,246,0.4)", maxWidth: 300, lineHeight: 1.7, margin: "0 auto 22px" }}
        >Structured tailoring meets fluid artistic silhouettes.</motion.p>

        <motion.button
          type="button" onClick={() => navigate("/viva")}
          variants={fadeVariants} initial="hidden"
          animate={heroInView ? "visible" : "hidden"} transition={{ delay: d(1.3) }}
          whileHover={reduced ? {} : { opacity: 0.82, scale: 1.03 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, letterSpacing: "2.5px",
            textTransform: "uppercase", fontWeight: 500,
            backgroundColor: "transparent", color: GOLD,
            border: `1px solid ${GOLD}`, borderRadius: 3,
            padding: "9px 24px", cursor: "pointer",
          }}
        >View the Collection →</motion.button>
      </div>

      {/* ── Mobile: clean stack ─────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-5 px-5 mt-10" style={{ alignItems: "center" }}>
        {LOOKS.map((look) => (
          <div
            key={look.name}
            onClick={() => navigate("/viva")}
            style={{ width: "100%", maxWidth: 320, border: `1px solid ${GOLD_BORDER}`, borderRadius: 3, overflow: "hidden", cursor: "pointer" }}
          >
            <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
              <img src={look.src} alt={look.name} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div style={{ padding: "11px 14px", background: "rgba(0,0,0,0.38)" }}>
              <p style={{ fontFamily: "DM Sans", fontSize: 8, color: GOLD, opacity: 0.55, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 3px 0" }}>Look {look.tag}</p>
              <h3 className="font-display" style={{ fontSize: 15, color: "#FAF9F6", margin: 0 }}>{look.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: editorial scattered tableau ────────────── */}
      {/*
          Three cards in a flex-row (align-items: flex-start).
          Each card's Framer `y` value is the visual offset from layout position.
          Photo 1: rotates -1.8deg, stays near top
          Photo 2: tallest, no rotation, y:-20 (pulls into hero zone)
          Photo 3: rotates +1.8deg, y:110 → bleeds ~110px past the section edge
          The section overflow:visible + large paddingBottom absorbs the bleed.
      */}
      <div
        className="hidden md:flex"
        style={{ alignItems: "flex-start", gap: "1.5%", position: "relative", zIndex: 1, overflow: "visible", marginTop: 32 }}
      >
        {/* Look 01 — left, tilted left, bleeds off left edge */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 60, rotate: 0 }}
          whileInView={{ opacity: 1, y: 20, rotate: -1.8 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: d(0.9), delay: d(0.08), ease: [0.16, 1, 0.3, 1] }}
          whileHover={reduced ? {} : { y: 10, rotate: -0.4, transition: { duration: 0.3 } }}
          onClick={() => navigate("/viva")}
          style={{
            flexShrink: 0, width: "clamp(180px, 27%, 280px)",
            marginLeft: "-16px", marginTop: 80,
            cursor: "pointer", border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 3, overflow: "hidden",
            boxShadow: "12px 24px 64px rgba(0,0,0,0.6)",
            transformOrigin: "center center", zIndex: 2,
          }}
        >
          <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
            <img src={LOOKS[0].src} alt={LOOKS[0].name} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.6s ease" }}
              onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
            />
          </div>
          <div style={{ padding: "10px 13px", background: "rgba(0,0,0,0.48)" }}>
            <p style={{ fontFamily: "DM Sans", fontSize: 8, color: GOLD, opacity: 0.5, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 2px 0" }}>Look {LOOKS[0].tag}</p>
            <h3 className="font-display" style={{ fontSize: 13, color: "#FAF9F6", margin: 0 }}>{LOOKS[0].name}</h3>
          </div>
        </motion.div>

        {/* Look 02 — center, tallest, pulled up into hero zone */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 60 }}
          whileInView={{ opacity: 1, y: -20 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: d(0.9), delay: d(0.22), ease: [0.16, 1, 0.3, 1] }}
          whileHover={reduced ? {} : { y: -30, transition: { duration: 0.3 } }}
          onClick={() => navigate("/viva")}
          style={{
            flex: "1 1 auto", maxWidth: "clamp(240px, 40%, 400px)",
            margin: "0 auto",
            cursor: "pointer", border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 3, overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            zIndex: 3, position: "relative",
          }}
        >
          <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
            <img src={LOOKS[1].src} alt={LOOKS[1].name} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.6s ease" }}
              onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
            />
          </div>
          <div style={{ padding: "12px 15px", background: "rgba(0,0,0,0.48)" }}>
            <p style={{ fontFamily: "DM Sans", fontSize: 8, color: GOLD, opacity: 0.5, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 2px 0" }}>Look {LOOKS[1].tag}</p>
            <h3 className="font-display" style={{ fontSize: 14, color: "#FAF9F6", margin: 0 }}>{LOOKS[1].name}</h3>
          </div>
        </motion.div>

        {/* Look 03 — right, tilted right, y:110 bleeds below section */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 60, rotate: 0 }}
          whileInView={{ opacity: 1, y: 110, rotate: 1.8 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: d(0.9), delay: d(0.38), ease: [0.16, 1, 0.3, 1] }}
          whileHover={reduced ? {} : { y: 100, rotate: 0.4, transition: { duration: 0.3 } }}
          onClick={() => navigate("/viva")}
          style={{
            flexShrink: 0, width: "clamp(180px, 27%, 280px)",
            marginRight: "-16px", marginTop: 30,
            cursor: "pointer", border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 3, overflow: "hidden",
            boxShadow: "-12px 24px 64px rgba(0,0,0,0.6)",
            transformOrigin: "center center", zIndex: 2,
          }}
        >
          <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
            <img src={LOOKS[2].src} alt={LOOKS[2].name} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", transition: "transform 0.6s ease" }}
              onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
            />
          </div>
          <div style={{ padding: "10px 13px", background: "rgba(0,0,0,0.48)" }}>
            <p style={{ fontFamily: "DM Sans", fontSize: 8, color: GOLD, opacity: 0.5, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 2px 0" }}>Look {LOOKS[2].tag}</p>
            <h3 className="font-display" style={{ fontSize: 13, color: "#FAF9F6", margin: 0 }}>{LOOKS[2].name}</h3>
          </div>
        </motion.div>
      </div>

      {/* ── Brand Pillars (desktop) — pushed down to clear the floating cards ── */}
      <motion.div
        ref={pillarsRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: reduced ? 0 : 0.15 } }, hidden: {} }}
        className="hidden md:grid gap-8"
        style={{
          maxWidth: 860, margin: "0 auto", padding: "0 24px",
          marginTop: 340, // clears the bleed area of photo 3
          position: "relative", zIndex: 1,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {[
          { title: "Structured Fluidity", body: "Tailored lines paired with flowing fabrics. Precision and grace in one silhouette — the garments hold shape and invite movement at once." },
          { title: "Artistic Agency", body: "VIVA translates internal confidence into a vivid exterior statement. Every touchpoint is deliberate, curated, gallery-grade." },
        ].map((p) => (
          <motion.div key={p.title}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5 } } }}
            style={{ borderTop: "1px solid rgba(212,175,55,0.16)", paddingTop: 20 }}
          >
            <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#FAF9F6", marginBottom: 10 }}>{p.title}</h3>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,245,246,0.4)", lineHeight: 1.75, margin: 0 }}>{p.body}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Brand Pillars (mobile) */}
      <div className="md:hidden px-5 mt-12 flex flex-col gap-6">
        {[
          { title: "Structured Fluidity", body: "Tailored lines paired with flowing fabrics. Precision and grace in one silhouette." },
          { title: "Artistic Agency", body: "VIVA translates internal confidence into a vivid exterior statement." },
        ].map((p) => (
          <div key={p.title} style={{ borderTop: "1px solid rgba(212,175,55,0.16)", paddingTop: 18 }}>
            <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#FAF9F6", marginBottom: 8 }}>{p.title}</h3>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,245,246,0.4)", lineHeight: 1.75, margin: 0 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VIVASection;
