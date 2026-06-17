import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  fadeIn,
  fadeSlideUp,
  staggerContainer,
  cardItem,
  scaleXRule,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.15)";
const GOLD_BORDER = "rgba(212,175,55,0.3)";

const LOOKS = [
  {
    src: "/viva/look-1.jpeg",
    name: "The Heritage",
    tag: "Look 01",
    desc: "Olive woven kimono · Wide-leg pleated denim · Gold cuffs",
  },
  {
    src: "/viva/look-2.jpeg",
    name: "The Bold",
    tag: "Look 02",
    desc: "Hot-pink structured crop · Wide-leg pleated denim · Statement earrings",
  },
  {
    src: "/viva/look-3.jpeg",
    name: "The Artist",
    tag: "Look 03",
    desc: "Chartreuse palazzo · Structured pink crop · Layered gold jewellery",
  },
];

const VIVASection = () => {
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const looksRef  = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const looksInView   = useInView(looksRef,   inViewProps);
  const pillarsInView = useInView(pillarsRef, inViewProps);

  const fadeVariants   = useReducedVariants(fadeIn);
  const slideUp        = useReducedVariants(fadeSlideUp);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants   = useReducedVariants(cardItem);
  const ruleVariants   = useReducedVariants(scaleXRule);

  const d = (s: number) => (reduced ? 0 : s);

  return (
    <div
      id="viva"
      style={{ backgroundColor: "#6E0025", position: "relative", overflow: "hidden" }}
      className="w-full py-20"
    >
      {/* Diagonal texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 10px)",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      <div className="mx-auto px-6 relative" style={{ maxWidth: 1100, zIndex: 1 }}>

        {/* ── Hero block ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center" style={{ gap: 18 }}>

          {/* Super label */}
          <motion.p
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(0.15) }}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(212,175,55,0.6)", letterSpacing: "6px", textTransform: "uppercase", fontWeight: 400, margin: 0 }}
          >
            By Viera Amber
          </motion.p>

          {/* VIVA logo */}
          <motion.img
            src="/viva-logo.svg"
            alt="VIVA by Viera Amber"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: d(0.9), ease: "easeOut", delay: d(0.25) }}
            style={{
              height: "clamp(64px, 11vw, 120px)",
              width: "auto",
              filter: "drop-shadow(0 0 24px rgba(212,175,55,0.25))",
            }}
            draggable={false}
          />

          {/* Rule */}
          <motion.div
            variants={ruleVariants} initial="hidden" animate="visible"
            transition={{ delay: d(0.9) }}
            aria-hidden="true"
            style={{ width: 48, height: 1, backgroundColor: GOLD_BORDER, transformOrigin: "left center" }}
          />

          {/* Collection name */}
          <motion.p
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(1.0) }}
            className="font-display"
            style={{ fontStyle: "italic", fontSize: "clamp(18px, 2.5vw, 28px)", color: "rgba(250,245,246,0.88)", fontWeight: 400, margin: 0 }}
          >
            'Batya' — Daughters of Adonai
          </motion.p>

          {/* Sub-copy */}
          <motion.p
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(1.2) }}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(250,245,246,0.5)", maxWidth: 420, lineHeight: 1.75, margin: 0 }}
          >
            Structured tailoring meets fluid artistic silhouettes. High-end wearable art
            for the modern woman who wears her confidence out loud.
          </motion.p>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={() => navigate("/viva")}
            variants={fadeVariants} initial="hidden" animate="visible"
            transition={{ delay: d(1.4) }}
            whileHover={reduced ? {} : { opacity: 0.85, scale: 1.03 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, letterSpacing: "2px",
              textTransform: "uppercase", fontWeight: 500,
              backgroundColor: "transparent", color: GOLD,
              border: `1px solid ${GOLD}`, borderRadius: 3,
              padding: "12px 32px", cursor: "pointer", marginTop: 4,
            }}
          >
            View the Collection →
          </motion.button>
        </div>

        {/* ── Lookbook row ─────────────────────────────────────────── */}
        <motion.div
          ref={looksRef}
          variants={staggerVariants}
          initial="hidden"
          animate={looksInView ? "visible" : "hidden"}
          className="grid gap-5 mt-16"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {LOOKS.map((look) => (
            <motion.div
              key={look.name}
              variants={cardVariants}
              whileHover={reduced ? {} : { y: -6, borderColor: GOLD }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{
                border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 6,
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() => navigate("/viva")}
            >
              {/* Photo */}
              <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                <img
                  src={look.src}
                  alt={look.name}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                    display: "block",
                    transition: "transform 0.55s ease",
                  }}
                  onMouseEnter={(e) => { if (!reduced) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
                {/* Subtle vignette at bottom */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
                    background: "linear-gradient(to top, rgba(70,0,20,0.55) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                />
                {/* Look tag */}
                <span style={{
                  position: "absolute", top: 14, left: 14,
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 9, letterSpacing: "3px", textTransform: "uppercase",
                  color: "rgba(250,250,250,0.85)",
                  background: "rgba(110,0,37,0.75)",
                  border: `1px solid ${GOLD_BORDER}`,
                  borderRadius: 2, padding: "4px 10px",
                  backdropFilter: "blur(6px)",
                }}>
                  {look.tag}
                </span>
              </div>

              {/* Caption */}
              <div
                style={{
                  padding: "16px 18px 18px",
                  background: "rgba(0,0,0,0.28)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#FAF9F6", margin: "0 0 5px 0" }}>
                  {look.name}
                </h3>
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(250,245,246,0.5)", margin: 0, lineHeight: 1.6 }}>
                  {look.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Brand Pillars ────────────────────────────────────────── */}
        <motion.div
          ref={pillarsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={pillarsInView ? "visible" : "hidden"}
          className="grid gap-8 mt-14"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          {[
            {
              title: "Structured Fluidity",
              body: "Tailored lines paired with flowing fabrics. Precision and grace in one silhouette — the garments hold shape and invite movement at once.",
            },
            {
              title: "Artistic Agency",
              body: "VIVA translates internal confidence into a vivid exterior statement. Every touchpoint is deliberate, curated, gallery-grade — the wardrobe as manifesto.",
            },
          ].map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={cardVariants}
              style={{ borderTop: `2px solid ${GOLD_DIM}`, paddingTop: 24 }}
            >
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#FAF9F6", marginBottom: 10 }}>
                {pillar.title}
              </h3>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,245,246,0.5)", lineHeight: 1.75, margin: 0 }}>
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default VIVASection;
