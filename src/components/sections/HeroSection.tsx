import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import logoSrc from "@/assets/viera-amber-logo.png";

/* ════════════════════════════════════════════════════════════════════════
   AESTHETIC: "Warm Editorial" — a light, magazine-cover hero.

   The portrait (Jacqueline) has its own warm coral/terracotta palette and
   gold/emerald detail. The previous treatment forced grayscale + brightness
   0.6 onto it, then stacked three black overlays on top just to keep white
   text legible — which crushed the art into a moody dark silhouette that
   fought its own color story (the "black hat" problem).

   Fix: stop asking the image to double as a dark backdrop. Put it in a
   contained, full-color editorial frame instead, and let the type live in
   its own paper-light column where it never has to fight the artwork for
   contrast. Ambient glow is a soft gold wash (Illustrations arm accent,
   see EcosystemSection BRAND_COLORS) behind the frame, not a black scrim.

   GUARDRAILS: no forced grayscale/desaturation of brand art, no full-bleed
   dark overlay stack, no generic ink-panel-on-purple-gradient default.
   ════════════════════════════════════════════════════════════════════════ */
const INK = "#0A0A0A";
const PAPER = "#FAFAFA";
const MUTED = "rgba(10,10,10,0.62)";
const GOLD = "#D97706"; // Illustrations arm accent — matches the artwork's own warmth

const HeroSection = () => {
  const reduced = useReducedMotion();
  const d = (s: number) => (reduced ? 0 : s);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("ecosystem");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: d(1.4),
        staggerChildren: d(0.1),
        delayChildren: d(0.3),
      },
    },
  };

  const labelVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.5), ease: "easeOut" as const },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.93 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 110,
        damping: 18,
        delay: d(0.1),
      },
    },
  };

  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: d(0.7), ease: "easeOut" as const, delay: d(0.15) },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.6), ease: "easeOut" as const, delay: d(0.2) },
    },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.6), ease: "easeOut" as const, delay: d(0.4) },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 22,
        delay: d(0.5),
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="hero-container relative w-full min-h-dvh overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10"
      style={{ backgroundColor: PAPER, paddingTop: 96, paddingBottom: 72 }}
    >
      {/* ── Ambient gold wash behind the portrait — depth without a dark scrim ── */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          right: "6%",
          top: "18%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}22 0%, transparent 68%)`,
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />

      <motion.div
        className="relative w-full flex flex-col-reverse lg:flex-row items-center"
        style={{ maxWidth: 1180, gap: "clamp(36px, 5vw, 76px)", zIndex: 1 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Text column ── */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left" style={{ flex: "1 1 48%", gap: "clamp(14px, 1.8vw, 22px)" }}>
          {/* Est. label */}
          <motion.p
            variants={labelVariants}
            className="m-0"
            style={{
              fontSize: 11,
              color: INK,
              letterSpacing: "0.45em",
              fontWeight: 500,
              fontFamily: "var(--font-body, sans-serif)",
              textTransform: "uppercase",
              opacity: 0.55,
            }}
          >
            EST. 2013
          </motion.p>

          {/* Wordmark logo — solid ink, no invert needed on a light ground */}
          <motion.h1 variants={logoVariants} className="m-0" style={{ lineHeight: 1 }}>
            <span className="sr-only">Viera Amber</span>
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="select-none"
              style={{
                width: "clamp(170px, 24vw, 400px)",
                height: "auto",
                display: "block",
                filter: "brightness(0)",
              }}
            />
          </motion.h1>

          {/* Hairline divider */}
          <motion.div
            variants={dividerVariants}
            aria-hidden="true"
            style={{
              width: 44,
              height: 1,
              backgroundColor: INK,
              opacity: 0.3,
              transformOrigin: "center",
            }}
          />

          {/* Tagline */}
          <motion.p
            variants={textVariants}
            className="m-0"
            style={{
              fontSize: "clamp(14px, 1.7vw, 19px)",
              color: MUTED,
              maxWidth: 460,
              lineHeight: 1.8,
              fontWeight: 400,
              fontFamily: "var(--font-body, sans-serif)",
              letterSpacing: "0.2px",
            }}
          >
            A creative ecosystem built for feminine empowerment.
          </motion.p>

          {/* "For her, by her." — bold Playfair italic */}
          <motion.p
            variants={taglineVariants}
            className="m-0"
            style={{
              fontSize: "clamp(18px, 2.5vw, 32px)",
              color: INK,
              fontWeight: 500,
              fontFamily: "var(--font-display, serif)",
              fontStyle: "italic",
              letterSpacing: "-0.015em",
            }}
          >
            For her, by her.
          </motion.p>

          {/* CTA — ink pill, paper text */}
          <motion.div variants={ctaVariants}>
            <button
              type="button"
              className="rounded-full px-8 py-3 font-body uppercase tracking-widest text-xs min-h-[44px] transition-opacity hover:opacity-85"
              style={{ backgroundColor: INK, color: PAPER }}
              onClick={handleScroll}
              aria-label="Scroll down to explore the Viera Amber ecosystem"
            >
              Explore the Ecosystem ↓
            </button>
          </motion.div>
        </div>

        {/* ── Image column — full-color editorial frame, not a full-bleed backdrop ── */}
        <motion.div
          variants={logoVariants}
          className="relative overflow-hidden"
          style={{
            flex: "1 1 44%",
            width: "100%",
            maxWidth: 420,
            aspectRatio: "4 / 5",
            borderRadius: 20,
            border: "1px solid rgba(10,10,10,0.08)",
            boxShadow: "0 32px 70px rgba(217,119,6,0.16), 0 12px 28px rgba(10,10,10,0.1)",
          }}
        >
          <img
            src="/artworks/artwork_0064.webp"
            alt="Illustrated fashion portrait of Jacqueline, a Viera Amber original"
            draggable={false}
            className="w-full h-full select-none"
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator — static, ink on paper */}
      <div
        className="hero-scroll-indicator relative"
        style={{ marginTop: "clamp(28px, 4vw, 48px)" }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 22,
            height: 38,
            border: `1.5px solid ${INK}`,
            borderRadius: 11,
            display: "flex",
            justifyContent: "center",
            paddingTop: 7,
            opacity: 0.4,
          }}
        >
          <div
            style={{
              width: 2,
              height: 6,
              background: INK,
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
