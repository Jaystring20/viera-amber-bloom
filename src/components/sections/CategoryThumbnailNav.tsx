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
  // Fashion Illustration
  {
    id: "fashion-collections",
    name: "Fashion Collections",
    umbrella: "fashion",
    image: "artwork_0001.webp",
    pieceCount: 12,
  },
  {
    id: "bridal-designs",
    name: "Bridal Designs",
    umbrella: "fashion",
    image: "artwork_0002.webp",
    pieceCount: 8,
  },
  {
    id: "jewelry",
    name: "Jewelry",
    umbrella: "fashion",
    image: "artwork_0003.webp",
    pieceCount: 6,
  },
  {
    id: "shoes",
    name: "Shoes",
    umbrella: "fashion",
    image: "artwork_0004.webp",
    pieceCount: 5,
  },
  {
    id: "bags",
    name: "Bags",
    umbrella: "fashion",
    image: "artwork_0005.webp",
    pieceCount: 7,
  },
  // Lifestyle Illustration
  {
    id: "birthday",
    name: "Birthday Illustrations",
    umbrella: "lifestyle",
    image: "artwork_0010.webp",
    pieceCount: 4,
  },
  {
    id: "wedding-couple",
    name: "Wedding/Couple Illustrations",
    umbrella: "lifestyle",
    image: "artwork_0011.webp",
    pieceCount: 9,
  },
  {
    id: "book-covers",
    name: "Book Covers",
    umbrella: "lifestyle",
    image: "artwork_0012.webp",
    pieceCount: 3,
  },
  {
    id: "bridal-showers",
    name: "Bridal Showers",
    umbrella: "lifestyle",
    image: "artwork_0013.webp",
    pieceCount: 5,
  },
  {
    id: "wedding-programs",
    name: "Wedding Programs",
    umbrella: "lifestyle",
    image: "artwork_0014.webp",
    pieceCount: 6,
  },
];

interface CategoryThumbnailNavProps {
  onCategorySelect?: (category: CategoryThumbnail) => void;
  selectedId?: string;
}

export const CategoryThumbnailNav = ({ onCategorySelect, selectedId }: CategoryThumbnailNavProps) => {
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
                  border: selectedId === category.id ? "2px solid #111111" : "1px solid #EBEBEB",
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
