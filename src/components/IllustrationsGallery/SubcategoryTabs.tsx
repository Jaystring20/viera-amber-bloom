import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS, TYPOGRAPHY, MOTION, SUBCATEGORY_LABELS, MAIN_CATEGORIES } from "./constants";

interface SubcategoryTabsProps {
  activeCategory: "fashion" | "lifestyle";
  activeSubcategory: string;
  onSubcategoryChange: (subcategory: string) => void;
}

export const SubcategoryTabs = ({
  activeCategory,
  activeSubcategory,
  onSubcategoryChange,
}: SubcategoryTabsProps) => {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const subcategories =
    MAIN_CATEGORIES[activeCategory].subcategories;

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, activeCategory]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: reduced ? "auto" : "smooth",
      });
      setTimeout(checkScroll, 100);
    }
  };

  return (
    <motion.section
      style={{
        backgroundColor: COLORS.alabaster,
        paddingTop: TYPOGRAPHY.sizes.small,
        paddingBottom: TYPOGRAPHY.sizes.small,
        borderBottom: `1px solid ${COLORS.burgundyAlpha}`,
      }}
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : MOTION.fadeIn.duration }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: "1100px" }}>
        <div className="flex items-center gap-3">
          {/* Left scroll arrow */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll tabs left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  backgroundColor: COLORS.burgundy,
                  color: COLORS.cream,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                whileHover={reduced ? {} : { scale: 1.05 }}
              >
                <ChevronLeft size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Tabs container */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
            onScroll={checkScroll}
            className="scrollbar-hide"
          >
            {subcategories.map((subcategoryId) => (
              <motion.button
                key={subcategoryId}
                type="button"
                onClick={() => onSubcategoryChange(subcategoryId)}
                style={{
                  fontFamily: TYPOGRAPHY.body,
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: `${TYPOGRAPHY.sizes.small} ${TYPOGRAPHY.sizes.small}`,
                  border: "none",
                  borderRadius: "0px",
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  scrollSnapAlign: "start",
                  position: "relative",
                  backgroundColor:
                    activeSubcategory === subcategoryId
                      ? COLORS.burgundy
                      : "transparent",
                  color:
                    activeSubcategory === subcategoryId
                      ? COLORS.gold
                      : COLORS.darkText,
                  opacity: activeSubcategory === subcategoryId ? 1 : 0.6,
                  transition: reduced ? "none" : "all 200ms ease-out",
                }}
                whileHover={
                  reduced
                    ? {}
                    : {
                        backgroundColor:
                          activeSubcategory === subcategoryId
                            ? COLORS.burgundy
                            : COLORS.burgundyAlpha08,
                        scale: 1.02,
                      }
                }
                aria-current={
                  activeSubcategory === subcategoryId ? "true" : undefined
                }
              >
                {SUBCATEGORY_LABELS[subcategoryId]}
              </motion.button>
            ))}
          </div>

          {/* Right scroll arrow */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll tabs right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  backgroundColor: COLORS.burgundy,
                  color: COLORS.cream,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                whileHover={reduced ? {} : { scale: 1.05 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
};
