import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ILLUSTRATION_CATEGORIES, type IllustrationCategory } from "@/lib/illustration-categories";

// Was a hardcoded 6-item list here (Couture Gowns, Bridal Designs, Lagos
// Icons, Conceptual Bags, Jacqueline Portraits, #SOROSOKE Campaign) whose
// ids mostly didn't match anything real — see illustration-categories.ts
// for the full story. HeroCategory is now just an alias so downstream code
// (slide index math, onCategorySelect prop) didn't need reshaping.
export type HeroCategory = IllustrationCategory;
export const HERO_CATEGORIES: HeroCategory[] = ILLUSTRATION_CATEGORIES;

const SCROLL_WORDS = [
  "Couture",
  "Bridal",
  "Heritage",
  "Wearable",
  "Movement",
  "Story",
  "Artistry",
  "Soul",
  "Vision",
  "Craft",
  "Culture",
  "Expression",
];

interface RotatingHeroCarouselProps {
  onCategorySelect?: (category: HeroCategory) => void;
}

export const RotatingHeroCarousel = ({ onCategorySelect }: RotatingHeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduced = useReducedMotion();
  const autoplayRef = useRef<NodeJS.Timeout>();

  const current = HERO_CATEGORIES[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next >= HERO_CATEGORIES.length) next = 0;
      if (next < 0) next = HERO_CATEGORIES.length - 1;
      return next;
    });
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (reduced) return;

    autoplayRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % HERO_CATEGORIES.length);
    }, 5000);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [reduced]);

  const handleNavClick = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "800px",
        backgroundColor: "#FAFAFA",
      }}
    >
      {/* Featured image - full background */}
      <motion.div
        key={`hero-bg-${currentIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(/artworks/${current.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* Strong dark overlay - sophisticated contrast */}
      <motion.div
        key={`overlay-${currentIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content - centered text overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6" style={{ minHeight: "700px" }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`carousel-${currentIndex}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div style={{ maxWidth: 800 }}>
              {/* Theme label - subtle, black on white, minimal */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  marginBottom: 20,
                  opacity: 0.8,
                }}
              >
                {current.umbrella === "fashion" ? "Fashion Illustration" : "Lifestyle Illustration"}
              </motion.p>

              {/* Category name - stark white, elegant serif */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display"
                style={{
                  fontSize: "clamp(48px, 8vw, 84px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginBottom: 32,
                  lineHeight: 1.05,
                  letterSpacing: "-1px",
                }}
              >
                {current.name}
              </motion.h1>

              {/* CTA button - strict black */}
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                onClick={() => onCategorySelect?.(current)}
                whileHover={reduced ? {} : { scale: 1.05, y: -2 }}
                whileTap={reduced ? {} : { scale: 0.95 }}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "14px 44px",
                  background: "#111111",
                  color: "#FFFFFF",
                  border: "2px solid #111111",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Explore Collection
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Word scroll carousel - below hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-5"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "24px 0",
          borderTop: "1px solid #EBEBEB",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <motion.div
            animate={{ x: [0, -2000] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              display: "flex",
              gap: 32,
              whiteSpace: "nowrap",
              paddingLeft: 24,
            }}
          >
            {/* First set of words */}
            {SCROLL_WORDS.map((word, idx) => (
              <motion.span
                key={`word-1-${idx}`}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111111",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  minWidth: "auto",
                }}
              >
                {word} {idx < SCROLL_WORDS.length - 1 && "•"}
              </motion.span>
            ))}
            {/* Second set for seamless loop */}
            {SCROLL_WORDS.map((word, idx) => (
              <motion.span
                key={`word-2-${idx}`}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111111",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  minWidth: "auto",
                }}
              >
                {word} {idx < SCROLL_WORDS.length - 1 && "•"}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation arrows - minimal black/white */}
      <motion.button
        onClick={() => {
          handleNavClick();
          paginate(-1);
        }}
        aria-label="Previous category"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-colors"
        style={{
          background: "#FFFFFF",
          border: "1px solid #111111",
          color: "#111111",
          cursor: "pointer",
        }}
        whileHover={reduced ? {} : { scale: 1.1, backgroundColor: "#111111", color: "#FFFFFF" }}
        whileTap={reduced ? {} : { scale: 0.95 }}
      >
        <ChevronLeft size={20} />
      </motion.button>

      <motion.button
        onClick={() => {
          handleNavClick();
          paginate(1);
        }}
        aria-label="Next category"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-colors"
        style={{
          background: "#FFFFFF",
          border: "1px solid #111111",
          color: "#111111",
          cursor: "pointer",
        }}
        whileHover={reduced ? {} : { scale: 1.1, backgroundColor: "#111111", color: "#FFFFFF" }}
        whileTap={reduced ? {} : { scale: 0.95 }}
      >
        <ChevronRight size={20} />
      </motion.button>

      {/* Dot indicators - black */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_CATEGORIES.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              handleNavClick();
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            animate={{
              width: idx === currentIndex ? 28 : 8,
              background: idx === currentIndex ? "#111111" : "#CCCCCC",
            }}
            transition={{ duration: 0.3 }}
            style={{
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={`Go to category ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RotatingHeroCarousel;
