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
      {/* Hero Background Image - Black & White with Ecosystem Colors */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: "url('/artworks/artwork_0025.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(0.85) contrast(1.15) brightness(0.95)",
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      {/* Gradient Overlay with Ecosystem Colors */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(26, 0, 37, 0.85) 0%, rgba(15, 23, 42, 0.85) 100%),
            linear-gradient(90deg, rgba(217, 119, 6, 0.05) 0%, rgba(98, 1, 127, 0.05) 100%)
          `,
          zIndex: 1,
        }}
      />

      {/* Ambient glow with ecosystem colors */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduced ? 0 : 0.06 }}
        transition={{ duration: d(2) }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, #D97706 0%, transparent 70%)",
          filter: "blur(100px)",
          zIndex: 1,
        }}
      />

      {/* Content Container */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        style={{ gap: 28 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Establishment Date Label */}
        <motion.p
          variants={labelVariants}
          className="font-body uppercase tracking-widest"
          style={{
            fontSize: 12,
            color: "#D97706",
            letterSpacing: "5px",
            fontWeight: 500,
            margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}
        >
          FOUNDED 2013
        </motion.p>

        {/* Logo */}
        <motion.h1
          variants={logoVariants}
          className="m-0"
          style={{
            lineHeight: 1,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
          }}
        >
          <span className="sr-only">Viera Amber</span>
          <img
            src={logoSrc}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="select-none"
            style={{
              width: "clamp(260px, 50vw, 680px)",
              height: "auto",
              display: "block",
            }}
          />
        </motion.h1>

        {/* Primary Tagline */}
        <motion.p
          variants={textVariants}
          className="font-body"
          style={{
            fontSize: "clamp(16px, 2vw, 24px)",
            color: "#FAFAFA",
            maxWidth: 600,
            lineHeight: 1.6,
            fontWeight: 300,
            margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}
        >
          A creative & impact-driven ecosystem for feminine empowerment.
        </motion.p>

        {/* Divider with Ecosystem Color */}
        <motion.div
          variants={dividerVariants}
          style={{
            width: 60,
            height: 2,
            background: "linear-gradient(90deg, transparent 0%, #D97706 50%, transparent 100%)",
            transformOrigin: "center",
            boxShadow: "0 0 12px rgba(217, 119, 6, 0.4)"
          }}
          aria-hidden="true"
        />

        {/* Secondary Tagline with Accent Color */}
        <motion.p
          variants={textVariants}
          className="font-display italic"
          style={{
            fontSize: "clamp(18px, 2.2vw, 28px)",
            background: "linear-gradient(135deg, #D97706 0%, #ED155D 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 400,
            margin: 0,
          }}
        >
          For her, by her.
        </motion.p>

        {/* CTA Button with Ecosystem Color */}
        <motion.div
          variants={ctaVariants}
        >
          <Button
            variant="primary"
            ecosystemArm="illustrations"
            className="rounded-lg px-8 py-3 font-body uppercase tracking-wider"
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
