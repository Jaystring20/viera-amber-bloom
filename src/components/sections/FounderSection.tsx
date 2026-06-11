import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  slideInLeft,
  slideInRight,
  staggerContainer,
  fadeIn,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

const AWARDS = [
  "Heineken Design Week — Recognized Excellence",
  "GTCO — Award-Winning Brand",
  "DesignFashionAfrica — Fashion & Art Illustration",
];

const FounderSection = () => {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, inViewProps);

  const leftVariants = useReducedVariants(slideInLeft);
  const rightVariants = useReducedVariants(slideInRight);
  const staggerVariants = useReducedVariants(staggerContainer);
  const fadeVariants = useReducedVariants(fadeIn);

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid #1A1A1A",
      }}
      className="w-full py-20"
    >
      <div
        ref={sectionRef}
        className="mx-auto px-6"
        style={{ maxWidth: 1100 }}
      >
        <div
          className="grid gap-12 items-center"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {/* ── Left — Image placeholder ─────────────────────────── */}
          <motion.div
            variants={leftVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <div
              style={{
                aspectRatio: "3 / 4",
                backgroundColor: "#111111",
                border: "1px solid #2A2A2A",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "#444444",
                  margin: 0,
                }}
              >
                Faith Adigwe — Founder
              </p>
            </div>
          </motion.div>

          {/* ── Right — Content ──────────────────────────────────── */}
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-col"
            style={{ gap: 20 }}
          >
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "#C8A96E",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 400,
                margin: 0,
              }}
            >
              Meet Our Founder
            </motion.p>

            <motion.h2
              variants={rightVariants}
              className="font-display"
              style={{
                fontSize: "clamp(26px, 3.5vw, 42px)",
                fontWeight: 700,
                color: "#FAFAFA",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Faith Adigwe
            </motion.h2>

            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: "#888888",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              An award-winning fashion designer, pharmacist and public health
              specialist, digital illustrator, and social entrepreneur. Blending
              global health metrics with creative storytelling, Faith has
              pioneered structural methods that turn artwork into impactful
              public advocacy.
            </motion.p>

            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: "#888888",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Her visionary direction has driven Viera Amber from an aesthetic
              passion project in 2013 into a holistic mother brand that champions
              female rights, medical education, and financial freedom for
              adolescent girls and women globally.
            </motion.p>

            {/* Awards */}
            <motion.div
              variants={staggerVariants}
              className="flex flex-col"
              style={{ gap: 8 }}
            >
              {AWARDS.map((award) => (
                <motion.p
                  key={award}
                  variants={fadeVariants}
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 12,
                    color: "#C8A96E",
                    margin: 0,
                  }}
                >
                  <span style={{ color: "#444444" }}>— </span>
                  {award}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FounderSection;
