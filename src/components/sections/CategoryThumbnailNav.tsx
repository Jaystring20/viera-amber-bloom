import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CategoryThumbnail {
  id: string;
  name: string;
  umbrella: "fashion" | "lifestyle";
  image: string;
  pieceCount?: number;
}

export const CATEGORY_THUMBNAILS: CategoryThumbnail[] = [
  // Fashion Illustration collections
  {
    id: "couture-gowns",
    name: "Couture Gowns",
    umbrella: "fashion",
    image: "artwork_0001.webp",
    pieceCount: 20,
  },
  {
    id: "bridal-designs",
    name: "Bridal Designs",
    umbrella: "fashion",
    image: "artwork_0036.webp",
    pieceCount: 5,
  },
  {
    id: "lagos-culture",
    name: "Lagos Icons",
    umbrella: "fashion",
    image: "artwork_0029.webp",
    pieceCount: 13,
  },
  {
    id: "conceptual-bags",
    name: "Conceptual Bags",
    umbrella: "fashion",
    image: "artwork_0028.webp",
    pieceCount: 3,
  },
  // Lifestyle Illustration collections
  {
    id: "jacqueline-portraits",
    name: "Jacqueline Portraits",
    umbrella: "lifestyle",
    image: "artwork_0024.webp",
    pieceCount: 4,
  },
  {
    id: "#sorosoke-campaign",
    name: "#SOROSOKE Campaign",
    umbrella: "lifestyle",
    image: "artwork_0052.webp",
    pieceCount: 12,
  },
];

interface CategoryThumbnailNavProps {
  onCategorySelect?: (category: CategoryThumbnail) => void;
}

export const CategoryThumbnailNav = ({ onCategorySelect }: CategoryThumbnailNavProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 320; // Width of card + gap
    const newPosition = direction === "left"
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: reduced ? "auto" : "smooth",
    });
    setScrollPosition(newPosition);
  };

  return (
    <section
      className="w-full py-16"
      style={{
        backgroundColor: "#FAFAFA",
        borderTop: "1px solid #EBEBEB",
        borderBottom: "1px solid #EBEBEB",
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        {/* Section header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p
              style={{
                fontFamily: "Montserrat, system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#111111",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Browse by Category
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 700,
                color: "#111111",
                margin: 0,
              }}
            >
              Explore Our Collections
            </h2>
          </div>

          {/* Navigation arrows */}
          <div className="flex gap-2 ml-4">
            <motion.button
              onClick={() => scroll("left")}
              whileHover={reduced ? {} : { scale: 1.1 }}
              whileTap={reduced ? {} : { scale: 0.95 }}
              aria-label="Scroll categories left"
              className="p-2 rounded-full transition-colors"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBEBEB",
                color: "#111111",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#111111";
                e.currentTarget.style.background = "#F5F4F2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EBEBEB";
                e.currentTarget.style.background = "#FFFFFF";
              }}
            >
              <ChevronLeft size={20} />
            </motion.button>

            <motion.button
              onClick={() => scroll("right")}
              whileHover={reduced ? {} : { scale: 1.1 }}
              whileTap={reduced ? {} : { scale: 0.95 }}
              aria-label="Scroll categories right"
              className="p-2 rounded-full transition-colors"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBEBEB",
                color: "#111111",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#111111";
                e.currentTarget.style.background = "#F5F4F2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EBEBEB";
                e.currentTarget.style.background = "#FFFFFF";
              }}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {/* Horizontally scrollable category cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none", // Firefox
          }}
        >
          <style>{`
            div::-webkit-scrollbar { display: none; } /* Chrome/Safari */
          `}</style>

          {CATEGORY_THUMBNAILS.map((category, idx) => (
            <motion.button
              key={category.id}
              onClick={() => onCategorySelect?.(category)}
              whileHover={reduced ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: 280 }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                  aspectRatio: "1",
                  marginBottom: 12,
                  border: "1px solid #EBEBEB",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Category image */}
                <img
                  src={`/artworks/${category.image}`}
                  alt={category.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  className="group-hover:opacity-90"
                />

                {/* Category badge - top right */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: category.umbrella === "fashion" ? "#6B2C91" : "#0B7B8C",
                    color: "#FFFFFF",
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontFamily: "Montserrat, system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    zIndex: 5,
                  }}
                >
                  {category.umbrella === "fashion" ? "Fashion" : "Lifestyle"}
                </div>

                {/* Overlay on hover */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    opacity: 0,
                    transition: "opacity 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                >
                  <p
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "Montserrat, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    View All
                  </p>
                </div>
              </div>

              {/* Category label */}
              <div>
                <h3
                  style={{
                    fontFamily: "Montserrat, system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111111",
                    margin: "0 0 4px 0",
                  }}
                >
                  {category.name}
                </h3>
                <p
                  style={{
                    fontFamily: "Montserrat, system-ui, sans-serif",
                    fontSize: 11,
                    color: "#888888",
                    margin: 0,
                  }}
                >
                  {category.pieceCount} pieces
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryThumbnailNav;
