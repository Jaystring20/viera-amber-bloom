import { motion, useReducedMotion } from "framer-motion";
import { COLORS, TYPOGRAPHY, MOTION } from "./constants";

interface CategorySelectorProps {
  activeCategory: "fashion" | "lifestyle";
  onCategoryChange: (category: "fashion" | "lifestyle") => void;
}

export const CategorySelector = ({
  activeCategory,
  onCategoryChange,
}: CategorySelectorProps) => {
  const reduced = useReducedMotion();

  return (
    <motion.section
      className="w-full text-center"
      style={{
        backgroundColor: COLORS.alabaster,
        paddingTop: "80px",
        paddingBottom: "96px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : MOTION.fadeIn.duration }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: "1100px" }}>
        {/* Headline */}
        <motion.h1
          style={{
            fontFamily: TYPOGRAPHY.display,
            fontSize: TYPOGRAPHY.sizes.heroHeadline,
            fontWeight: 300,
            fontStyle: "italic",
            color: COLORS.darkText,
            margin: 0,
            marginBottom: "24px",
            lineHeight: TYPOGRAPHY.lineHeights.tight,
          }}
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0 : 0.5,
            delay: reduced ? 0 : 0.1,
          }}
        >
          Explore Our Collections
        </motion.h1>

        {/* Subheading */}
        <motion.p
          style={{
            fontFamily: TYPOGRAPHY.body,
            fontSize: "14px",
            fontWeight: 400,
            color: COLORS.darkText,
            opacity: 0.7,
            margin: 0,
            marginBottom: "56px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{
            duration: reduced ? 0 : 0.5,
            delay: reduced ? 0 : 0.2,
          }}
        >
          103 Curated Illustrations Organized Across 21 Sections
        </motion.p>

        {/* Category Buttons */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "fashion", label: "Fashion Illustration" },
            { id: "lifestyle", label: "Lifestyle Illustration" },
          ].map((category) => (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id as "fashion" | "lifestyle")}
              style={{
                flex: "1 1 auto",
                minWidth: "200px",
                maxWidth: "280px",
                fontFamily: TYPOGRAPHY.body,
                fontSize: "16px",
                fontWeight: 500,
                padding: "20px 40px",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              className="group"
              initial={{ opacity: 0, y: reduced ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : 0.3 + (category.id === "lifestyle" ? 0.05 : 0),
              }}
              whileHover={
                reduced
                  ? {}
                  : {
                      scale: 1.02,
                    }
              }
            >
              {/* Background */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor:
                    activeCategory === category.id ? COLORS.burgundy : "transparent",
                  borderBottom:
                    activeCategory === category.id
                      ? "none"
                      : `2px solid ${COLORS.gold}`,
                  zIndex: -1,
                }}
                initial={false}
                animate={{
                  backgroundColor:
                    activeCategory === category.id ? COLORS.burgundy : "transparent",
                  borderBottom:
                    activeCategory === category.id
                      ? "none"
                      : `2px solid ${COLORS.gold}`,
                }}
                transition={{
                  duration: reduced ? 0 : MOTION.tabSwitch.duration,
                }}
              />

              {/* Text */}
              <motion.span
                style={{
                  color: activeCategory === category.id ? COLORS.cream : COLORS.darkText,
                  display: "block",
                  position: "relative",
                  zIndex: 1,
                }}
                initial={false}
                animate={{
                  color: activeCategory === category.id ? COLORS.cream : COLORS.darkText,
                }}
                transition={{
                  duration: reduced ? 0 : MOTION.tabSwitch.duration,
                }}
              >
                {category.label}
              </motion.span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
