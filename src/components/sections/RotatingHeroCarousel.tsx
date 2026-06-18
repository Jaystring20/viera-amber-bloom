import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroCategory {
  id: string;
  name: string;
  subcategories: string[];
  image: string;
  type: "fashion" | "lifestyle";
}

export const HERO_CATEGORIES: HeroCategory[] = [
  {
    id: "couture-gowns",
    name: "Couture Gowns",
    subcategories: [],
    image: "artwork_0001.webp",
    type: "fashion",
  },
  {
    id: "bridal-designs",
    name: "Bridal Designs",
    subcategories: [],
    image: "artwork_0036.webp",
    type: "fashion",
  },
  {
    id: "lagos-culture",
    name: "Lagos Icons",
    subcategories: [],
    image: "artwork_0029.webp",
    type: "fashion",
  },
  {
    id: "conceptual-bags",
    name: "Conceptual Bags",
    subcategories: [],
    image: "artwork_0028.webp",
    type: "fashion",
  },
  {
    id: "jacqueline-portraits",
    name: "Jacqueline Portraits",
    subcategories: [],
    image: "artwork_0024.webp",
    type: "lifestyle",
  },
  {
    id: "#sorosoke-campaign",
    name: "#SOROSOKE Campaign",
    subcategories: [],
    image: "artwork_0052.webp",
    type: "lifestyle",
  },
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
  const isLastFashion = currentIndex === 4; // Last fashion category
  const isLastLifestyle = currentIndex === HERO_CATEGORIES.length - 1; // Last lifestyle

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
        minHeight: "700px",
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

      {/* Gradient overlay - bottom to top for text contrast */}
      <motion.div
        key={`overlay-${currentIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content - centered text overlay */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
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
            <div style={{ maxWidth: 700 }}>
              {/* Category type label */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: current.type === "fashion" ? "#FFB6D9" : "#7FE8D8",
                  marginBottom: 16,
                }}
              >
                {current.type === "fashion" ? "Fashion Illustration" : "Lifestyle Illustration"}
              </motion.p>

              {/* Category name - white for contrast on dark overlay */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display"
                style={{
                  fontSize: "clamp(44px, 7vw, 72px)",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginBottom: 28,
                  lineHeight: 1.1,
                }}
              >
                {current.name}
              </motion.h1>

              {/* CTA button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                onClick={() => onCategorySelect?.(current)}
                whileHover={reduced ? {} : { scale: 1.05, y: -3 }}
                whileTap={reduced ? {} : { scale: 0.95 }}
                style={{
                  fontFamily: "Montserrat, system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "16px 48px",
                  background: current.type === "fashion" ? "#6B2C91" : "#0B7B8C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                  transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Explore {current.name}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => {
          handleNavClick();
          paginate(-1);
        }}
        aria-label="Previous category"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-colors"
        style={{
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.3)",
          color: "#111111",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.2)";
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={() => {
          handleNavClick();
          paginate(1);
        }}
        aria-label="Next category"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full transition-colors"
        style={{
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.3)",
          color: "#111111",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.2)";
        }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_CATEGORIES.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              handleNavClick();
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            animate={{
              width: idx === currentIndex ? 24 : 8,
              background: idx === currentIndex ? "#111111" : "rgba(17,17,17,0.3)",
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
