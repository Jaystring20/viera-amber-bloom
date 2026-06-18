import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import logoSrc from "@/assets/viera-amber-logo.png";

const INK = "#0A0A0A";
const PAPER = "#FFFFFF";
const MUTED = "#444444";

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
    <>
      <style>{`
        .hero-artwork {
          object-position: center 22%;
        }
        @media (max-width: 1023px) {
          .hero-artwork {
            object-position: center 16%;
          }
        }
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
        style={{ backgroundColor: PAPER }}
      >
        {/* ── Jacqueline portrait — high-contrast B&W, multiply-blended onto white paper ── */}
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
              filter: "grayscale(100%) contrast(1.28) brightness(1.02) saturate(0)",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* ── Soft white bottom fade — dissolves into the next white section ── */}
        <div
          aria-hidden="true"
          className="hero-bottom-fade absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "32%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
            zIndex: 2,
          }}
        />

        {/* ── Top fade — softens transition under the nav ── */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: "14%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)",
            zIndex: 2,
          }}
        />

        {/* ── Content (editorial type on paper, no card) ── */}
        <motion.div
          className="relative flex flex-col items-center text-center w-full max-w-2xl mx-auto"
          style={{ gap: "clamp(14px, 1.8vw, 22px)", zIndex: 10 }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
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
            }}
          >
            EST. 2013
          </motion.p>

          {/* Wordmark logo — forced to pure black */}
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
                filter: "brightness(0) saturate(0)",
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
              transformOrigin: "center",
            }}
          />

          {/* Tagline */}
          <motion.p
            variants={textVariants}
            className="m-0"
            style={{
              fontSize: "clamp(13px, 1.5vw, 17px)",
              color: MUTED,
              maxWidth: 420,
              lineHeight: 1.75,
              fontWeight: 300,
              fontFamily: "var(--font-body, sans-serif)",
            }}
          >
            A creative &amp; impact-driven ecosystem for feminine empowerment.
          </motion.p>

          {/* "For her, by her." — solid ink, Playfair italic */}
          <motion.p
            variants={taglineVariants}
            className="m-0"
            style={{
              fontSize: "clamp(16px, 2vw, 24px)",
              color: INK,
              fontWeight: 400,
              fontFamily: "var(--font-display, serif)",
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}
          >
            For her, by her.
          </motion.p>

          {/* CTA — black pill, white text */}
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

          {/* Scroll indicator */}
          <motion.div
            animate={reduced ? undefined : { y: [0, 9, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" as const }}
            className="hero-scroll-indicator absolute"
            style={{ bottom: "-4rem", left: "50%", transform: "translateX(-50%)" }}
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
                opacity: 0.55,
              }}
            >
              <motion.div
                animate={reduced ? undefined : { opacity: [1, 0.2, 1], y: [0, 8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" as const }}
                style={{
                  width: 2,
                  height: 6,
                  background: INK,
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
