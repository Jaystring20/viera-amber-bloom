import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import logoSrc from "@/assets/viera-amber-logo.png";

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

  // Unified orchestration: single 1.2s entrance, not staggered cascade
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: d(1.2) },
    },
  };

  // Establishment date: fade in with container
  const labelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.5), delay: d(0.1), ease: "easeOut" },
    },
  };

  // Logo: spring physics entrance (scale in from 0.95→1.0)
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: d(0.8),
        delay: d(0.15),
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  // Body text: fade in, overlaps with logo
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.6), delay: d(0.3), ease: "easeOut" },
    },
  };

  // Divider: scale in from center
  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: d(0.6), ease: "easeOut", delay: d(0.4) },
    },
  };

  // CTA: fade in last, no pulse animation
  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: d(0.6), delay: d(0.7), ease: "easeOut" },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center px-6"
      style={{ backgroundColor: "#050506" }}
    >
      {/* Ambient background glow (subtle depth) */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduced ? 0 : 0.08 }}
        transition={{ duration: d(2) }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, #C8A96E 0%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      {/* Background: Dual Heritage pieces blended (Coronation + Omo-Oba Regalia) */}
      <div
        aria-hidden="true"
        data-hero-grid="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          zIndex: 0,
        }}
      >
        {/* Left: Coronation (artwork_0050) */}
        <motion.img
          src="/artworks/artwork_0050.webp"
          alt=""
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.18, scale: 1 }}
          transition={{ duration: d(2), delay: d(0.1), ease: "easeOut" }}
          className="w-full h-full object-cover"
          style={{
            mixBlendMode: "screen",
          }}
          draggable={false}
        />

        {/* Right: Omo-Oba Regalia (artwork_0042) */}
        <motion.img
          src="/artworks/artwork_0042.webp"
          alt=""
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.18, scale: 1 }}
          transition={{ duration: d(2), delay: d(0.15), ease: "easeOut" }}
          className="w-full h-full object-cover"
          style={{
            mixBlendMode: "screen",
          }}
          draggable={false}
        />
      </div>

      {/* Responsive grid for mobile/tablet */}
      <style>{`
        @media (max-width: 1024px) {
          [data-hero-grid] {
            grid-template-columns: 1fr !important;
          }
          [data-hero-grid] img:last-child {
            display: none;
          }
        }
      `}</style>

      {/* Dark overlay to ensure text readability over artwork */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(5,5,6,0.72) 0%, rgba(5,5,6,0.55) 50%, rgba(5,5,6,0.72) 100%)",
          zIndex: 1,
        }}
      />

      {/* Foreground content with staggered animation */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ gap: 24 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Establishment date */}
        <motion.p
          variants={labelVariants}
          className="font-body uppercase"
          style={{ fontSize: 11, color: "#C8A96E", letterSpacing: "4px", fontWeight: 400, margin: 0 }}
        >
          EST. 2013
        </motion.p>

        {/* Logo */}
        <motion.h1
          variants={logoVariants}
          className="m-0"
          style={{ lineHeight: 1 }}
        >
          <span className="sr-only">Viera Amber</span>
          <img
            src={logoSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="select-none"
            style={{
              width: "clamp(280px, 56vw, 720px)",
              height: "auto",
              display: "block",
            }}
          />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={textVariants}
          className="font-body"
          style={{
            fontSize: "clamp(14px, 1.6vw, 20px)",
            color: "#888888",
            maxWidth: 560,
            lineHeight: 1.6,
            fontWeight: 300,
            margin: 0,
          }}
        >
          A creative & impact-driven ecosystem for feminine empowerment.
        </motion.p>

        {/* Divider line */}
        <motion.div
          variants={dividerVariants}
          style={{
            width: 48,
            height: 1,
            backgroundColor: "#C8A96E",
            transformOrigin: "center",
          }}
          aria-hidden="true"
        />

        {/* Tagline: "For her, by her" */}
        <motion.p
          variants={textVariants}
          className="font-display italic"
          style={{
            fontSize: "clamp(16px, 1.8vw, 22px)",
            color: "#D97706",
            fontWeight: 400,
            margin: 0,
          }}
        >
          For her, by her.
        </motion.p>

        {/* CTA Button: hover-only feedback, no infinite pulse */}
        <motion.button
          type="button"
          onClick={handleScroll}
          variants={ctaVariants}
          whileHover={reduced ? undefined : { scale: 1.02 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          className="font-body uppercase cursor-pointer bg-transparent border-0"
          style={{
            fontSize: 11,
            color: "#888888",
            letterSpacing: "2px",
            fontWeight: 400,
            marginTop: 8,
            transition: "color 0.2s ease",
          }}
          aria-label="Discover the full ecosystem"
        >
          <span className="flex items-center gap-1">
            Discover the Full Ecosystem
            <motion.span
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
              style={{ display: "inline-block" }}
            >
              ↓
            </motion.span>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HeroSection;
