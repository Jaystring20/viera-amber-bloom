import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import logoSrc from "@/assets/viera-amber-logo.png";
import { Button } from "@/components/ui";

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

  // Unified orchestration: single 1.2s entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: d(1.2) },
    },
  };

  // Establishment date
  const labelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.5), delay: d(0.1), ease: "easeOut" },
    },
  };

  // Logo: spring physics entrance
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

  // Text animations
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.6), delay: d(0.3), ease: "easeOut" },
    },
  };

  // Divider
  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: d(0.6), ease: "easeOut", delay: d(0.4) },
    },
  };

  // CTA
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
      style={{
        backgroundColor: "#0A0A0A",
        background: "linear-gradient(135deg, #1A0025 0%, #0F172A 100%)",
      }}
    >
      {/* Artwork_0064 "Jacqueline" — pure B&W, full bleed, no overlay hiding it */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: "url('/artworks/artwork_0064.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(100%) contrast(1.25) brightness(0.7) saturate(0)",
          zIndex: 0,
        }}
      />

      {/* Very subtle dark vignette only at edges — lets the artwork breathe */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)",
          zIndex: 1,
        }}
      />

      {/* Bottom fade to dark so page content below flows in cleanly */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "30%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.8) 100%)",
          zIndex: 2,
        }}
      />

      {/* Content — glass panel behind text, Apple style */}
      <motion.div
        className="relative flex flex-col items-center text-center max-w-3xl mx-auto px-6"
        style={{ gap: 20, zIndex: 10 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Frosted glass card wrapping logo + tagline */}
        <motion.div
          variants={logoVariants}
          style={{
            background: "rgba(10, 10, 10, 0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 4,
            padding: "40px 56px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Est label */}
          <motion.p
            variants={labelVariants}
            className="font-body uppercase tracking-widest m-0"
            style={{ fontSize: 11, color: "#D97706", letterSpacing: "6px", fontWeight: 500 }}
          >
            EST. 2013
          </motion.p>

          {/* Logo */}
          <h1 className="m-0" style={{ lineHeight: 1 }}>
            <span className="sr-only">Viera Amber</span>
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="select-none"
              style={{ width: "clamp(220px, 40vw, 540px)", height: "auto", display: "block" }}
            />
          </h1>

          {/* Divider */}
          <motion.div
            variants={dividerVariants}
            style={{
              width: 48,
              height: 1,
              background: "linear-gradient(90deg, transparent, #D97706, transparent)",
              transformOrigin: "center",
            }}
            aria-hidden="true"
          />

          {/* Tagline */}
          <motion.p
            variants={textVariants}
            className="font-body m-0"
            style={{
              fontSize: "clamp(14px, 1.6vw, 18px)",
              color: "rgba(255,255,255,0.85)",
              maxWidth: 460,
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            A creative & impact-driven ecosystem for feminine empowerment.
          </motion.p>
        </motion.div>

        {/* "For her, by her" sits outside the glass card, Apple editorial style */}
        <motion.p
          variants={textVariants}
          className="font-display italic m-0"
          style={{
            fontSize: "clamp(18px, 2.2vw, 26px)",
            background: "linear-gradient(135deg, #D97706 0%, #ED155D 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 400,
          }}
        >
          For her, by her.
        </motion.p>

        {/* CTA */}
        <motion.div variants={ctaVariants}>
          <Button
            variant="secondary"
            ecosystemArm="illustrations"
            className="rounded-full px-8 py-3 font-body uppercase tracking-widest text-xs"
            onClick={handleScroll}
            aria-label="Discover the full ecosystem"
          >
            Explore the Ecosystem ↓
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          aria-hidden="true"
        >
          <div style={{
            width: 24,
            height: 40,
            border: "2px solid rgba(217, 119, 6, 0.4)",
            borderRadius: 12,
            display: "flex",
            justifyContent: "center",
            paddingTop: 8,
          }}>
            <div style={{
              width: 2,
              height: 6,
              background: "#D97706",
              borderRadius: 1,
            }} />
          </div>
        </motion.div>
      </motion.div>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          /* Reduce image opacity on mobile for better text readability */
          [style*="grayscale"] {
            opacity: 0.15 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
