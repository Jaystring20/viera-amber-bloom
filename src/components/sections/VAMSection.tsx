import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  fadeSlideUp,
  fadeIn,
  staggerContainer,
  cardItem,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    num: "01",
    title: "Digital Design Systems",
    body: "Procreate and illustration mastery. Build the technical foundation every serious creative needs to produce professional illustrations.",
  },
  {
    num: "02",
    title: "Fashion Illustration",
    body: "Figure, fabric, colour, composition. Learn to illustrate the way Viera Amber does, with soul and structure in every stroke.",
  },
  {
    num: "03",
    title: "Business of Creativity",
    body: "Pricing, clientwork, digital product creation. Turn your art into a career, not just a passion. Build the income your talent deserves.",
  },
];

const AUDIENCE_PILLS = [
  "Aspiring fashion illustrators",
  "Brand creatives",
  "Art students",
  "Self-taught designers",
];

// ─── Main Section ─────────────────────────────────────────────────────────────
const VAMSection = () => {
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, inViewProps);
  const pillarsInView = useInView(pillarsRef, inViewProps);
  const audienceInView = useInView(audienceRef, inViewProps);
  const waitlistInView = useInView(waitlistRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div
      style={{ backgroundColor: "#FAFAFA" }}
      className="w-full py-20"
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div
          ref={headerRef}
          className="flex flex-col items-center text-center mb-12"
          style={{ gap: 16 }}
        >
          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 13,
              color: "#D97706",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 600,
              margin: 0,
            }}
          >
            VAM — Viera Amber Masterclass
          </motion.p>

          <motion.h2
            variants={headerVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            transition={{ delay: reduced ? 0 : 0.1 }}
            className="font-display"
            style={{
              fontSize: "clamp(26px, 4vw, 48px)",
              fontWeight: 700,
              color: "#0A0A0A",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Your art is a skill.
            <br />
            Your skill is a business.
          </motion.h2>

          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            transition={{ delay: reduced ? 0 : 0.2 }}
            className="font-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.9vw, 21px)",
              color: "#444444",
              maxWidth: 420,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            "We teach both."
          </motion.p>
        </div>

        {/* ── Pillars Grid ─────────────────────────────────────────── */}
        <motion.div
          ref={pillarsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={pillarsInView ? "visible" : "hidden"}
          className="grid gap-5 mb-10"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          {PILLARS.map((pillar) => (
            <motion.div
              key={pillar.num}
              variants={cardVariants}
              whileHover={
                reduced
                  ? {}
                  : { y: -3, borderColor: "#D97706" }
              }
              transition={{ type: "spring" as const, stiffness: 350, damping: 20 }}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8E8",
                borderTop: "3px solid #D97706",
                borderRadius: 4,
                padding: "28px 24px",
              }}
            >
              <span
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  color: "#D97706",
                  letterSpacing: "3px",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                {pillar.num}
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  marginBottom: 10,
                }}
              >
                {pillar.title}
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 300,
                  fontSize: 13,
                  color: "#666666",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Audience Pills ───────────────────────────────────────── */}
        <motion.div
          ref={audienceRef}
          variants={staggerVariants}
          initial="hidden"
          animate={audienceInView ? "visible" : "hidden"}
          className="flex flex-col items-center mb-10"
          style={{ gap: 16 }}
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "#888888",
              letterSpacing: "3px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Who it's for
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {AUDIENCE_PILLS.map((label) => (
              <motion.span
                key={label}
                variants={cardVariants}
                style={{
                  border: "1px solid #E8E8E8",
                  color: "#666666",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 12,
                  padding: "7px 16px",
                  borderRadius: 999,
                  display: "inline-block",
                }}
              >
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ── Waitlist Box ─────────────────────────────────────────── */}
        <motion.div
          ref={waitlistRef}
          variants={fadeVariants}
          initial="hidden"
          animate={waitlistInView ? "visible" : "hidden"}
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: 4,
            padding: "clamp(28px, 5vw, 40px)",
            border: "1px solid #EBEBEB",
          }}
          className="flex flex-col items-center text-center"
        >
          <h3
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0A0A0A",
              marginBottom: 8,
            }}
          >
            Join the Waitlist
          </h3>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 13,
              color: "#555555",
              marginBottom: 20,
            }}
          >
            First cohort launching soon. Secure your spot.
          </p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
                onSubmit={handleSubmit}
                aria-label="Join VAM Masterclass waitlist"
                className="flex gap-2 w-full"
                style={{ maxWidth: 400 }}
              >
                <label htmlFor="vam-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="vam-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    borderRadius: 2,
                    padding: "10px 14px",
                    color: "#0A0A0A",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13,
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "#D97706")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "#EBEBEB")
                  }
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 11,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    backgroundColor: "#D97706",
                    color: "#0A0A0A",
                    border: "none",
                    borderRadius: 2,
                    padding: "10px 20px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Notify Me →
                </button>
              </motion.form>
            ) : (
              <motion.p
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.4 }}
                aria-live="polite"
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 14,
                  color: "#D97706",
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                ✓ You're on the list. We'll be in touch.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default VAMSection;
