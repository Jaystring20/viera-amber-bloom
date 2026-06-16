import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  fadeIn,
  staggerContainer,
  cardItem,
  scaleXRule,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

const VIVASection = () => {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const pillarsRef = useRef<HTMLDivElement>(null);
  const pillarsInView = useInView(pillarsRef, inViewProps);

  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);
  const ruleVariants = useReducedVariants(scaleXRule);

  const d = (s: number) => (reduced ? 0 : s);

  return (
    <div
      style={{ backgroundColor: "#6E0025", position: "relative", overflow: "hidden" }}
      className="w-full py-20"
    >
      {/* Subtle texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 10px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="mx-auto px-6 relative"
        style={{ maxWidth: 1100, zIndex: 1 }}
      >
        {/* ── Hero Block ───────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center text-center"
          style={{ gap: 20 }}
        >
          {/* Super label */}
          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: d(0.2) }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "rgba(212,175,55,0.65)",
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontWeight: 400,
              margin: 0,
            }}
          >
            By Viera Amber
          </motion.p>

          {/* VIVA wordmark — letter-spacing animation */}
          <motion.h2
            className="font-display"
            initial={{
              opacity: 0,
              letterSpacing: reduced ? "14px" : "4px",
            }}
            animate={{
              opacity: 1,
              letterSpacing: "14px",
            }}
            transition={{
              opacity: { duration: d(0.6), delay: d(0.3) },
              letterSpacing: { duration: d(1.4), ease: "easeOut", delay: d(0.3) },
            }}
            style={{
              fontSize: "clamp(60px, 10vw, 108px)",
              fontWeight: 700,
              color: "#D4AF37",
              lineHeight: 1,
              margin: 0,
            }}
          >
            VIVA
          </motion.h2>

          {/* Byline */}
          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: d(0.8) }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 10,
              color: "rgba(212,175,55,0.45)",
              letterSpacing: "8px",
              textTransform: "uppercase",
              fontWeight: 400,
              margin: 0,
            }}
          >
            By Viera Amber
          </motion.p>

          {/* Gold rule */}
          <motion.div
            variants={ruleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: d(1.0) }}
            aria-hidden="true"
            style={{
              width: 48,
              height: 1,
              backgroundColor: "rgba(212,175,55,0.4)",
              transformOrigin: "left center",
            }}
          />

          {/* Collection name */}
          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: d(1.1) }}
            className="font-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(18px, 2.5vw, 28px)",
              color: "rgba(250,245,246,0.88)",
              fontWeight: 400,
              margin: 0,
            }}
          >
            'Batya' — Daughters of Adonai
          </motion.p>

          {/* Sub-copy */}
          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: d(1.3) }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 14,
              color: "rgba(250,245,246,0.55)",
              maxWidth: 420,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Structured tailoring meets fluid artistic silhouettes. High-end
            wearable art for the modern woman who wears her confidence out loud.
          </motion.p>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={() => navigate("/viva")}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: d(1.5) }}
            whileHover={reduced ? {} : { opacity: 0.75 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 400,
              backgroundColor: "transparent",
              color: "#D4AF37",
              border: "1px solid #D4AF37",
              borderRadius: 2,
              padding: "11px 28px",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            View the Collection →
          </motion.button>
        </div>

        {/* ── Brand Pillars ────────────────────────────────────────── */}
        <motion.div
          ref={pillarsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={pillarsInView ? "visible" : "hidden"}
          className="grid gap-8 mt-16"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {[
            {
              title: "Structured Fluidity",
              body: "Tailored lines paired with flowing fabrics. The garments lean on sharp structure meeting expansive movement — precision and grace in one silhouette.",
            },
            {
              title: "Artistic Agency",
              body: "VIVA translates internal confidence into a vivid exterior statement. Every touchpoint is deliberate, curated, gallery-grade — the wardrobe as manifesto.",
            },
          ].map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={cardVariants}
              style={{
                borderTop: "2px solid rgba(212,175,55,0.3)",
                paddingTop: 24,
              }}
            >
              <h3
                className="font-display"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#FAF9F6",
                  marginBottom: 10,
                }}
              >
                {pillar.title}
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 300,
                  fontSize: 13,
                  color: "rgba(250,245,246,0.55)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
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
