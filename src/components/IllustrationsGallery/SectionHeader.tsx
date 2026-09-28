import { motion, useReducedMotion } from "framer-motion";
import { COLORS, TYPOGRAPHY, MOTION } from "./constants";

interface SectionHeaderProps {
  number: number;
  name: string;
  index?: number;
}

export const SectionHeader = ({
  number,
  name,
  index = 0,
}: SectionHeaderProps) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      style={{
        textAlign: "center",
        paddingTop: "80px",
        paddingBottom: "40px",
        borderTop: `1px solid ${COLORS.burgundyAlpha}`,
      }}
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: reduced ? 0 : MOTION.fadeIn.duration,
        delay: reduced ? 0 : index * 0.05,
      }}
    >
      {/* Section label */}
      <p
        style={{
          fontFamily: TYPOGRAPHY.body,
          fontSize: TYPOGRAPHY.sizes.small,
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: COLORS.darkText,
          opacity: 0.6,
          margin: "0 0 16px 0",
        }}
      >
        SECTION {number}
      </p>

      {/* Section name */}
      <h2
        style={{
          fontFamily: TYPOGRAPHY.display,
          fontSize: TYPOGRAPHY.sizes.h2,
          fontStyle: "italic",
          fontWeight: 400,
          color: COLORS.darkText,
          margin: "0 0 0 0",
          lineHeight: TYPOGRAPHY.lineHeights.tight,
        }}
      >
        {name}
      </h2>
    </motion.div>
  );
};
