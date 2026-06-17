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

  const panelVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 90,
        damping: 20,
        delay: d(0.2),
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
    <>
      {/*
        Responsive object-position:
        - Desktop (≥1024px): image is width-constrained (portrait img in landscape viewport).
          The hat brim tip sits at ~12% from top of the original image.
          With cover at 1280px wide → scaled height ≈1638px; container ≈ 800px.
          object-position Y=22% pushes the "center" of the image window to 22% of overflow
          from the top → hat brim aligns at the navbar level.
        - Tablet (768–1023px): similar but slightly less crop needed → 16%
        - Mobile (<768px): image becomes height-constrained (portrait fills full height).
          No vertical crop; horizontal center keeps the face. Use top-biased Y=5% so
          the brim is still the first thing seen below the nav.
      */}
      <style>{`
        .hero-artwork {
          object-position: center 22%;
        }
        @media (max-width: 1023px) {
          .hero-artwork {
            object-position: center 16%;
          }
        }

        /* ── Mobile: zoom into face+shoulders, hide JACQUELINE watermark ── */
        @media (max-width: 767px) {
          .hero-container {
            align-items: flex-end;
            padding-bottom: 4rem;
          }
          .hero-artwork {
            object-position: 58% 12%;
            transform: scale(1.45);
            transform-origin: 58% 30%;
          }
          .hero-bottom-fade {
            height: 42% !important;
          }
          .hero-scroll-indicator {
            display: none;
          }
        }
        @media (max-width: 479px) {
          .hero-container {
            padding-bottom: 3rem;
          }
          .hero-artwork {
            object-position: 60% 12%;
            transform: scale(1.5);
            transform-origin: 60% 30%;
          }
          .hero-bottom-fade {
            height: 45% !important;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        className="hero-container relative w-full min-h-dvh overflow-hidden flex items-center justify-center px-4 sm:px-6"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        {/* ── Jacqueline B&W artwork ─────────────────────────────────────────
            Using <img> + object-fit:cover so object-position precisely controls
            which slice of the portrait is visible inside this landscape container.
            Hat-brim tip aligns with the navbar (top of viewport) at desktop sizes.
        ─────────────────────────────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <img
            src="/artworks/artwork_0064.webp"
            alt=""
            draggable={false}
            className="hero-artwork w-full h-full select-none"
            style={{
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.18) brightness(0.92) saturate(0)",
            }}
          />
        </div>

        {/* ── Edge vignette — keeps eye on the centre ──────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.58) 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Bottom fade — transitions into next section cleanly ───────────── */}
        <div
          aria-hidden="true"
          className="hero-bottom-fade absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "28%",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.9) 100%)",
            zIndex: 2,
          }}
        />

        {/* ── Top fade — softens the hat brim / nav boundary ───────────────── */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: "12%",
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.45) 0%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <motion.div
          className="relative flex flex-col items-center text-center w-full max-w-2xl mx-auto"
          style={{ gap: 20, zIndex: 10 }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Frosted glass panel — Apple editorial card */}
          <motion.div
            variants={panelVariants}
            className="w-full"
            style={{
              background: "rgba(8, 8, 8, 0.52)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 3,
              padding: "clamp(28px, 4vw, 52px) clamp(28px, 6vw, 72px) clamp(24px, 3.5vw, 44px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "clamp(12px, 1.8vw, 20px)",
            }}
          >
            {/* Est. label */}
            <motion.p
              variants={labelVariants}
              className="m-0"
              style={{
                fontSize: 11,
                color: "#D97706",
                letterSpacing: "0.45em",
                fontWeight: 500,
                fontFamily: "var(--font-body, sans-serif)",
                textTransform: "uppercase",
              }}
            >
              EST. 2013
            </motion.p>

            {/* Wordmark logo */}
            <motion.h1 variants={logoVariants} className="m-0" style={{ lineHeight: 1 }}>
              <span className="sr-only">Viera Amber</span>
              <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="select-none"
                style={{
                  width: "clamp(180px, 36vw, 480px)",
                  height: "auto",
                  display: "block",
                }}
              />
            </motion.h1>

            {/* Gold divider */}
            <motion.div
              variants={dividerVariants}
              aria-hidden="true"
              style={{
                width: 44,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent 0%, #D97706 50%, transparent 100%)",
                transformOrigin: "center",
              }}
            />

            {/* Tagline */}
            <motion.p
              variants={textVariants}
              className="m-0"
              style={{
                fontSize: "clamp(13px, 1.5vw, 17px)",
                color: "rgba(255,255,255,0.82)",
                maxWidth: 420,
                lineHeight: 1.75,
                fontWeight: 300,
                fontFamily: "var(--font-body, sans-serif)",
              }}
            >
              A creative &amp; impact-driven ecosystem for feminine empowerment.
            </motion.p>
          </motion.div>

          {/* "For her, by her." — Apple editorial pull-quote outside the card */}
          <motion.p
            variants={taglineVariants}
            className="m-0"
            style={{
              fontSize: "clamp(16px, 2vw, 24px)",
              background: "linear-gradient(135deg, #D97706 0%, #ED155D 80%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 400,
              fontFamily: "var(--font-display, serif)",
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}
          >
            For her, by her.
          </motion.p>

          {/* CTA */}
          <motion.div variants={ctaVariants}>
            <button
              type="button"
              className="rounded-full px-8 py-3 font-body uppercase tracking-widest text-xs min-h-[44px] bg-brand-gold text-brand-dark hover:opacity-90 transition-opacity"
              onClick={handleScroll}
              aria-label="Scroll down to explore the Viera Amber ecosystem"
            >
              Explore the Ecosystem ↓
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={reduced ? undefined : { y: [0, 9, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" as const }}
            className="absolute"
            style={{ bottom: "-4rem", left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <div
              style={{
                width: 22,
                height: 38,
                border: "1.5px solid rgba(217,119,6,0.35)",
                borderRadius: 11,
                display: "flex",
                justifyContent: "center",
                paddingTop: 7,
              }}
            >
              <motion.div
                animate={reduced ? undefined : { opacity: [1, 0.2, 1], y: [0, 8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" as const }}
                style={{
                  width: 2,
                  height: 6,
                  background: "#D97706",
                  borderRadius: 1,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default HeroSection;
