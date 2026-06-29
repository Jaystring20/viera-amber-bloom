import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, School, Globe, Target, Palette, Droplets, ArrowRight } from "lucide-react";
import {
  fadeSlideUp,
  fadeIn,
  staggerContainer,
  cardItem,
  slideInLeft,
  slideInRight,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

const PINK = "#ED155D";
const PURPLE = "#62017F";
const PURPLE_LIGHT = "#C77DFF";
const PURPLE_MEDIUM = "#6B2C91";
const PINK_LIGHT = "#F472B6";
const PINK_VERY_LIGHT = "#FFB6D9";

// ─── Count-up hook ────────────────────────────────────────────────────────────
const useCountUp = (target: number, inView: boolean, duration = 2000): number => {
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
      const eased = 1 - (1 - progress) * (1 - progress); // easeOutQuad
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, reduced]);

  return count;
};

// ─── Impact stat tile ─────────────────────────────────────────────────────────
interface StatTileProps {
  Icon: typeof Users;
  value: number;
  suffix?: string;
  label: string;
  inView: boolean;
}

const StatTile = ({ Icon, value, suffix = "", label, inView }: StatTileProps) => {
  const count = useCountUp(value, inView);
  return (
    <motion.div
      variants={useReducedVariants(cardItem)}
      className="flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(237,21,93,0.18)",
        borderRadius: 12,
        padding: "20px 18px",
        gap: 10,
      }}
    >
      <span
        aria-hidden="true"
        className="flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${PINK}1F`,
          border: `1px solid ${PINK}4D`,
        }}
      >
        <Icon size={19} color={PINK_LIGHT} strokeWidth={1.75} />
      </span>
      <span
        className="font-display"
        style={{ fontSize: "clamp(28px, 3.4vw, 40px)", fontWeight: 700, color: PINK, lineHeight: 1 }}
        aria-live="polite"
        aria-atomic="true"
      >
        {count.toLocaleString()}
        {suffix}
      </span>
      <span
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 11,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "rgba(250,250,250,0.55)",
        }}
      >
        {label}
      </span>
    </motion.div>
  );
};

// ─── Program card ─────────────────────────────────────────────────────────────
interface ProgramProps {
  Icon: typeof Users;
  accent: string;
  title: string;
  body: string;
  onLearn: () => void;
  reduced: boolean;
}

const ProgramCard = ({ Icon, accent, title, body, onLearn, reduced }: ProgramProps) => (
  <motion.button
    type="button"
    onClick={onLearn}
    variants={useReducedVariants(cardItem)}
    whileHover={reduced ? {} : { y: -4 }}
    whileTap={reduced ? {} : { scale: 0.985 }}
    transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
    className="group text-left cursor-pointer flex flex-col"
    style={{
      backgroundColor: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderTop: `3px solid ${accent}`,
      borderRadius: 12,
      padding: "28px 24px",
    }}
  >
    <span
      aria-hidden="true"
      className="flex items-center justify-center"
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: `${accent}22`,
        border: `1px solid ${accent}55`,
        marginBottom: 16,
      }}
    >
      <Icon size={22} color="#FAFAFA" strokeWidth={1.75} />
    </span>
    <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#FAFAFA", marginBottom: 10 }}>
      {title}
    </h3>
    <p
      style={{
        fontFamily: "DM Sans, system-ui, sans-serif",
        fontWeight: 300,
        fontSize: 13,
        color: "rgba(250,250,250,0.6)",
        lineHeight: 1.65,
        margin: 0,
        flex: 1,
        marginBottom: 16,
      }}
    >
      {body}
    </p>
    <span
      className="font-body inline-flex items-center"
      style={{ gap: 6, fontSize: 12, color: "#F472B6", fontWeight: 600, letterSpacing: "0.04em" }}
    >
      Learn more
      <ArrowRight size={14} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
    </span>
  </motion.button>
);

// ─── Main Section ─────────────────────────────────────────────────────────────
const VAGINSection = () => {
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const headerRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, inViewProps);
  const missionInView = useInView(missionRef, inViewProps);
  const programsInView = useInView(programsRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const leftVariants = useReducedVariants(slideInLeft);
  const rightVariants = useReducedVariants(slideInRight);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div style={{ backgroundColor: "#FAFAFA", position: "relative" }} className="w-full">
      {/* Smooth transition band from previous section */}
      <div
        aria-hidden="true"
        style={{
          height: 80,
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(250,250,250,0.4) 50%, rgba(250,250,250,1) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Left accent bar — stronger visual presence */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 6,
          height: "100%",
          background: "linear-gradient(180deg, #62017F 0%, #6B2C91 25%, #ED155D 75%, #ED155D 100%)",
          boxShadow: "4px 0 16px rgba(98,1,127,0.15)",
        }}
      />

      {/* Top accent gradient — visual distinction marker */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(237,21,93,0.3) 25%, rgba(237,21,93,0.3) 75%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div className="mx-auto px-6" style={{ maxWidth: 1160, paddingTop: 40, paddingBottom: 80 }}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div ref={headerRef} className="flex flex-col items-center text-center mb-16" style={{ gap: 20 }}>

          {/* VAGIN Logo — white logo on a brand badge so it reads on the light section */}
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 42px",
              borderRadius: 28,
              background: "linear-gradient(135deg, #62017F 0%, #6B2C91 50%, #ED155D 100%)",
              boxShadow: "0 24px 64px rgba(98,1,127,0.24), 0 0 0 1px rgba(237,21,93,0.2)",
            }}
          >
            <img
              src="/vagin-logo.webp"
              alt="VAGIN — Girls' Initiative"
              style={{ height: 100, width: "auto", objectFit: "contain" }}
            />
          </motion.div>

          {/* Pink divider — visual rhythm */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headerInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" as const, delay: 0.12 }}
            style={{ width: 56, height: 2.5, background: "linear-gradient(90deg, transparent 0%, #ED155D 25%, #ED155D 75%, transparent 100%)", transformOrigin: "center", borderRadius: 2 }}
          />

          <motion.h2
            variants={headerVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            transition={{ delay: reduced ? 0 : 0.15 }}
            className="font-display"
            style={{ fontSize: "clamp(28px, 4.2vw, 52px)", fontWeight: 800, color: "#0A0A0A", margin: 0, lineHeight: 1.15, letterSpacing: "-0.01em" }}
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
              fontWeight: 400,
              fontSize: 15,
              color: "#333333",
              maxWidth: 560,
              lineHeight: 1.7,
              margin: 0,
              letterSpacing: "0.3px",
            }}
          >
            The Viera Amber Girls' Initiative champions sexual and reproductive health and rights
            for young girls in underserved communities across Africa — through art,
            education, and practical support.
          </motion.p>
        </div>

        {/* ── Mission block: visual + impact stats ─────────────────── */}
        <div ref={missionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-14">
          {/* Visual panel — featured community photo */}
          <motion.div
            variants={leftVariants}
            initial="hidden"
            animate={missionInView ? "visible" : "hidden"}
            className="relative overflow-hidden group"
            style={{
              borderRadius: 16,
              minHeight: 340,
              border: "1px solid rgba(237,21,93,0.2)",
            }}
          >
            <img
              src="/vagin-images/vagin_page_08_img_3.webp"
              alt="Girls initiative workshop in Nigeria"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(250,250,250,0.05) 0%, rgba(98,1,127,0.2) 100%)",
              }}
            />
            {/* centered motif */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <span
                aria-hidden="true"
                className="flex items-center justify-center"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: "rgba(237,21,93,0.15)",
                  border: "1px solid rgba(237,21,93,0.4)",
                  marginBottom: 18,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Users size={34} color="#F472B6" strokeWidth={1.5} />
              </span>
              <p
                className="font-display"
                style={{ fontSize: 22, color: "#111111", fontWeight: 700, margin: 0, lineHeight: 1.3 }}
              >
                Real girls. Real change.
              </p>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "rgba(17,17,17,0.8)",
                  marginTop: 8,
                  maxWidth: 320,
                  lineHeight: 1.6,
                }}
              >
                Operating in Nigeria and Malawi, reached one classroom at a time.
              </p>
            </div>
            {/* bottom glass chip */}
            <div
              className="absolute"
              style={{
                left: 18,
                bottom: 18,
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${PINK}33`,
                borderRadius: 999,
                padding: "8px 16px",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "0.06em",
                color: "#111111",
                fontWeight: 500,
              }}
            >
              <span style={{ color: PINK, fontWeight: 700 }}>1,500+</span> lives changed
            </div>
          </motion.div>

          {/* Impact stats */}
          <motion.div
            variants={rightVariants}
            initial="hidden"
            animate={missionInView ? "visible" : "hidden"}
            className="flex flex-col justify-center"
            style={{ gap: 18 }}
          >
            <p
              className="font-body uppercase"
              style={{ fontSize: 11, color: PINK, letterSpacing: "0.3em", fontWeight: 500, margin: 0, marginTop: 8 }}
            >
              Our Impact
            </p>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              animate={missionInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <StatTile Icon={Users} value={1500} suffix="+" label="Girls Reached" inView={missionInView} />
              <StatTile Icon={Globe} value={2} suffix="" label="Countries" inView={missionInView} />
            </motion.div>

            {/* SDG + Founded badges */}
            <div className="flex flex-wrap gap-3" style={{ marginTop: 4 }}>
              <span
                className="inline-flex items-center"
                style={{
                  gap: 8,
                  background: `${PURPLE_LIGHT}2E`,
                  border: `1px solid ${PURPLE_LIGHT}66`,
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 12,
                  color: PURPLE_LIGHT,
                  fontWeight: 600,
                }}
              >
                <Target size={15} strokeWidth={2} /> SDG 3 &amp; 5
              </span>
              <span
                className="inline-flex items-center"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 12,
                  color: "rgba(250,250,250,0.7)",
                  fontWeight: 500,
                }}
              >
                Founded 2022
              </span>
            </div>

            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 13.5,
                color: "rgba(17,17,17,0.7)",
                lineHeight: 1.7,
                margin: 0,
                marginTop: 4,
              }}
            >
              Two flagship programs power the mission — stigma-free health education and
              practical menstrual support that keeps girls in school.
            </p>
          </motion.div>
        </div>

        {/* ── Programs ─────────────────────────────────────────────── */}
        <motion.div
          ref={programsRef}
          variants={staggerVariants}
          initial="hidden"
          animate={programsInView ? "visible" : "hidden"}
          className="grid gap-4 mb-12"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          <ProgramCard
            Icon={Palette}
            accent={PURPLE}
            title="VaginART"
            body="Digital illustration and visual templates as stigma-free tools to teach adolescent girls about puberty, hygiene, and personal wellness with clarity and dignity."
            onLearn={() => navigate("/vagin")}
            reduced={!!reduced}
          />
          <ProgramCard
            Icon={Droplets}
            accent={PINK}
            title="PAD KOLO Project"
            body="Tackling period poverty through menstrual health support and micro-savings. WhatsApp-enabled school distribution tracked via an impact dashboard — one pad at a time."
            onLearn={() => navigate("/vagin")}
            reduced={!!reduced}
          />
        </motion.div>

        {/* ── CTAs ─────────────────────────────────────────────────── */}
        <div className="flex justify-center gap-3 flex-wrap">
          <motion.button
            type="button"
            onClick={() => navigate("/vagin")}
            whileHover={reduced ? {} : { scale: 1.03 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
            className="inline-flex items-center"
            style={{
              gap: 8,
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 600,
              background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 100%)`,
              color: "#FAFAFA",
              border: "none",
              borderRadius: 999,
              padding: "13px 30px",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Explore VAGIN
            <ArrowRight size={15} strokeWidth={2.2} />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => scrollTo("contact")}
            whileHover={reduced ? {} : { opacity: 0.85 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 500,
              backgroundColor: "transparent",
              color: PINK,
              border: `1px solid ${PINK}`,
              borderRadius: 999,
              padding: "13px 30px",
              cursor: "pointer",
              minHeight: 44,
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
