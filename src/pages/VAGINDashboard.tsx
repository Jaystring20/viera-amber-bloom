import { useEffect, useState, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

interface DashboardSection {
  id: string;
  title: string;
  subtitle: string;
  color: string;
}

const SECTIONS: DashboardSection[] = [
  {
    id: "welcome",
    title: "Welcome to VAGIN",
    subtitle: "One girl at a time",
    color: "#62017F",
  },
  {
    id: "vaginart",
    title: "VaginART",
    subtitle: "Learn with dignity",
    color: "#62017F",
  },
  {
    id: "pad-kolo",
    title: "PAD KOLO",
    subtitle: "Menstrual health & micro-savings",
    color: "#ED155D",
  },
  {
    id: "resources",
    title: "Resources & Learning",
    subtitle: "Knowledge hub for girls",
    color: "#62017F",
  },
  {
    id: "impact",
    title: "Our Impact",
    subtitle: "Tracking change across Africa",
    color: "#D97706",
  },
];

// ─── Welcome Section ──────────────────────────────────────────────────────────
const WelcomeSection = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1A0025 0%, #0F172A 100%)",
      }}
    >
      {/* Gradient accent */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.08 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, #62017F 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto px-6 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "#ED155D",
              letterSpacing: "4px",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 16,
            }}
          >
            VAGIN Initiative
          </p>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(40px, 8vw, 72px)",
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            One Girl at a Time
          </h1>

          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 300,
              color: "rgba(250,250,250,0.7)",
              margin: 0,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Access free resources on sexual and reproductive health rights. Learn, grow, and join a community of girls empowering each other.
          </p>

          <motion.button
            whileHover={reduced ? {} : { scale: 1.05 }}
            whileTap={reduced ? {} : { scale: 0.95 }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 500,
              background: "#62017F",
              color: "#FAFAFA",
              border: "none",
              borderRadius: 8,
              padding: "14px 32px",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(98, 1, 127, 0.3)",
            }}
          >
            Get Started →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// ─── VaginART Section ─────────────────────────────────────────────────────────
const VaginARTSection = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const topics = [
    { icon: "🌸", title: "Puberty Basics", desc: "Understanding your body changes" },
    { icon: "🛡️", title: "Physical Safety", desc: "Protecting yourself with knowledge" },
    { icon: "✨", title: "Hygiene & Wellness", desc: "Daily care practices for health" },
    { icon: "💪", title: "Mental Health", desc: "Building confidence and self-love" },
  ];

  return (
    <div
      ref={ref}
      className="relative w-full py-24"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1A0025 100%)",
        borderTop: "1px solid rgba(217, 119, 6, 0.1)",
      }}
    >
      <div className="mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "#D97706",
              letterSpacing: "4px",
              textTransform: "uppercase",
              margin: 0,
              marginBottom: 12,
            }}
          >
            Visual Learning
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
              marginBottom: 12,
            }}
          >
            VaginART Curriculum
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 15,
              color: "rgba(250,250,250,0.6)",
              margin: 0,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Stigma-free digital illustrations designed to teach adolescent girls about their bodies, health, and rights with absolute clarity and dignity.
          </p>
        </motion.div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {topics.map((topic, i) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={reduced ? {} : { y: -4, scale: 1.02 }}
              style={{
                background: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217, 119, 6, 0.15)",
                borderRadius: 12,
                padding: 24,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{topic.icon}</div>
              <h3
                className="font-display"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#FAFAFA",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                {topic.title}
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "rgba(250,250,250,0.5)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {topic.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PAD KOLO Section ──────────────────────────────────────────────────────────
const PadKoloSection = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div
      ref={ref}
      className="relative w-full py-24"
      style={{
        background: "linear-gradient(135deg, #1A0025 0%, #0F172A 100%)",
      }}
    >
      <div className="mx-auto px-6 max-w-6xl">
        <div className="grid gap-12" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "#ED155D",
                letterSpacing: "4px",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 12,
              }}
            >
              Menstrual Health
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#FAFAFA",
                margin: 0,
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              PAD KOLO Project
            </h2>
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 15,
                color: "rgba(250,250,250,0.6)",
                margin: 0,
                lineHeight: 1.8,
                marginBottom: 20,
              }}
            >
              We tackle period poverty head-on. Free menstrual pads combined with micro-savings programs keep girls in school and in control of their bodies.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Remove affordability barriers", "Increase school attendance", "Build financial independence"].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  style={{ display: "flex", gap: 12, alignItems: "center" }}
                >
                  <span style={{ color: "#ED155D", fontSize: 20 }}>✓</span>
                  <span style={{ color: "rgba(250,250,250,0.7)", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14 }}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "rgba(237, 21, 93, 0.1)",
              border: "1px solid rgba(237, 21, 93, 0.2)",
              borderRadius: 12,
              padding: 32,
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
              {["3000+", "50+", "17"]} {" Girls"}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#ED155D" }}>
                  3000+
                </span>
                <span style={{ fontSize: 12, color: "rgba(250,250,250,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Girls Reached
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#ED155D", display: "block" }}>
                  50+
                </span>
                <span style={{ fontSize: 12, color: "rgba(250,250,250,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Schools
                </span>
              </div>
              <div>
                <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#ED155D", display: "block" }}>
                  17
                </span>
                <span style={{ fontSize: 12, color: "rgba(250,250,250,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Countries
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const VAGINDashboard = () => {
  const reduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />

      <main>
        {/* Welcome Hero */}
        <WelcomeSection />

        {/* VaginART */}
        <VaginARTSection />

        {/* PAD KOLO */}
        <PadKoloSection />

        {/* Resources Section Placeholder */}
        <div
          className="w-full py-20"
          style={{
            backgroundColor: "#0A0A0A",
            borderTop: "1px solid rgba(217, 119, 6, 0.1)",
          }}
        >
          <div className="mx-auto px-6 text-center" style={{ maxWidth: 560 }}>
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "#D97706",
                letterSpacing: "4px",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 12,
              }}
            >
              Resources
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#FAFAFA",
                margin: 0,
                marginBottom: 12,
              }}
            >
              Knowledge Hub
            </h2>
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 14,
                color: "rgba(250,250,250,0.6)",
                margin: 0,
              }}
            >
              Coming soon — downloadable resources, guides, and community forum.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VAGINDashboard;
