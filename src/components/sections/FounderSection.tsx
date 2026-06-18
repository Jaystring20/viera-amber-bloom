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
        backgroundColor: "#FAFAFA",
        borderTop: "1px solid #EBEBEB",
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
          {/* ── Left — Founder portrait ──────────────────────────── */}
          <motion.div
            variants={leftVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
          >
            {/* subtle gold glow behind */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 2,
                background: "radial-gradient(ellipse at 60% 30%, rgba(217,119,6,0.18) 0%, transparent 70%)",
                filter: "blur(24px)",
                transform: "scale(1.08)",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                aspectRatio: "3 / 4",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(217,119,6,0.25)",
              }}
            >
              <img
                src="/faith-adigwe-founder.webp"
                alt="Faith Adigwe — Founder, Viera Amber"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
              />
              {/* name chip */}
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                  background: "rgba(10,10,10,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(217,119,6,0.3)",
                  borderRadius: 4,
                  padding: "8px 14px",
                }}
              >
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "#D97706", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, fontWeight: 500 }}>Founder</p>
                <p className="font-display" style={{ fontSize: 14, color: "#FAFAFA", margin: 0, fontWeight: 600, marginTop: 2 }}>Faith Adigwe</p>
              </div>
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
                color: "#D97706",
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
                color: "#0A0A0A",
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
                color: "#555555",
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
                color: "#555555",
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
                    color: "#D97706",
                    margin: 0,
                  }}
                >
                  <span style={{ color: "#555555" }}>— </span>
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
