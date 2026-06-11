import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  fadeSlideUp,
  fadeIn,
  staggerContainer,
  cardItem,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

// ─── Count-up hook ────────────────────────────────────────────────────────────
const useCountUp = (
  target: number,
  inView: boolean,
  duration = 2000
): number => {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setCount(target);
      return;
    }
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, reduced]);

  return count;
};

// ─── Impact stat ──────────────────────────────────────────────────────────────
interface StatProps {
  value: number | null;
  staticLabel?: string;
  label: string;
  inView: boolean;
  last?: boolean;
}

const ImpactStat = ({ value, staticLabel, label, inView, last }: StatProps) => {
  const count = useCountUp(value ?? 0, inView);

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        padding: "0 clamp(20px, 4vw, 48px)",
        borderRight: last ? "none" : "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 700,
          color: "#ED155D",
          lineHeight: 1,
          display: "block",
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {staticLabel ?? `${count.toLocaleString()}+`}
      </span>
      <span
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 11,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "rgba(250,250,250,0.5)",
          marginTop: 8,
          display: "block",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const VAGINSection = () => {
  const reduced = useReducedMotion();

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, inViewProps);
  const statsInView = useInView(statsRef, inViewProps);
  const programsInView = useInView(programsRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      style={{ backgroundColor: "#1A0025", position: "relative" }}
      className="w-full py-20"
    >
      {/* Left accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: "linear-gradient(to bottom, #62017F, #ED155D)",
        }}
      />

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
              fontSize: 11,
              color: "#ED155D",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 400,
              margin: 0,
            }}
          >
            VAGIN — Girls' Initiative
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
              color: "#FAFAFA",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            One girl at a time.
          </motion.h2>

          <motion.p
            variants={fadeVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            transition={{ delay: reduced ? 0 : 0.2 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 15,
              color: "rgba(250,250,250,0.65)",
              maxWidth: 540,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            The Viera Amber Girls' Initiative targets sexual and reproductive
            health and rights for young girls in underserved communities across
            Africa. 3,000+ lives changed — one girl at a time.
          </motion.p>
        </div>

        {/* ── Impact Bar ───────────────────────────────────────────── */}
        <motion.div
          ref={statsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          className="flex justify-center mb-12"
        >
          <motion.div
            variants={cardVariants}
            className="flex flex-wrap justify-center"
          >
            <ImpactStat
              value={3000}
              label="Girls Impacted"
              inView={statsInView}
            />
            <ImpactStat
              value={null}
              staticLabel="SDG 3 & 5"
              label="Goals Targeted"
              inView={statsInView}
            />
            <ImpactStat
              value={null}
              staticLabel="2022"
              label="Founded"
              inView={statsInView}
              last
            />
          </motion.div>
        </motion.div>

        {/* ── Programs Grid ────────────────────────────────────────── */}
        <motion.div
          ref={programsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={programsInView ? "visible" : "hidden"}
          className="grid gap-4 mb-10"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {/* VaginART */}
          <motion.div
            variants={cardVariants}
            whileHover={reduced ? {} : { y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              padding: "28px 24px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "block",
                width: 32,
                height: 2,
                backgroundColor: "#62017F",
                marginBottom: 16,
              }}
            />
            <h3
              className="font-display"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#FAFAFA",
                marginBottom: 10,
              }}
            >
              VaginART
            </h3>
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 13,
                color: "rgba(250,250,250,0.6)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Digital illustration and visual templates as stigma-free tools to
              teach adolescent girls about puberty, hygiene, and personal
              wellness with clarity and dignity.
            </p>
          </motion.div>

          {/* PAD KOLO */}
          <motion.div
            variants={cardVariants}
            whileHover={reduced ? {} : { y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              padding: "28px 24px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "block",
                width: 32,
                height: 2,
                backgroundColor: "#ED155D",
                marginBottom: 16,
              }}
            />
            <h3
              className="font-display"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#FAFAFA",
                marginBottom: 10,
              }}
            >
              PAD KOLO Project
            </h3>
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 13,
                color: "rgba(250,250,250,0.6)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Tackling period poverty through menstrual health support and
              micro-savings. WhatsApp-enabled school distribution tracked via an
              impact dashboard — one pad at a time.
            </p>
          </motion.div>
        </motion.div>

        {/* ── CTAs ─────────────────────────────────────────────────── */}
        <div className="flex justify-center gap-3 flex-wrap">
          <motion.button
            type="button"
            onClick={() => scrollTo("contact")}
            whileHover={reduced ? {} : { opacity: 0.85 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 400,
              backgroundColor: "#62017F",
              color: "#FAFAFA",
              border: "1px solid #62017F",
              borderRadius: 2,
              padding: "11px 28px",
              cursor: "pointer",
            }}
          >
            Join the Mission
          </motion.button>

          <motion.button
            type="button"
            onClick={() => scrollTo("contact")}
            whileHover={reduced ? {} : { opacity: 0.85 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 400,
              backgroundColor: "transparent",
              color: "#ED155D",
              border: "1px solid #ED155D",
              borderRadius: 2,
              padding: "11px 28px",
              cursor: "pointer",
            }}
          >
            Become a Sponsor →
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default VAGINSection;
