import { motion, useReducedMotion } from "framer-motion";
import {
  Palette,
  HeartHandshake,
  Shirt,
  GraduationCap,
  ShoppingBag,
  type LucideIcon,
  ArrowRight,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   BRAND COLORS — Each arm has a distinct identity
   ════════════════════════════════════════════════════════════════════════ */
const BRAND_COLORS = {
  illustrations: { accent: "#D97706" }, // Gold
  vagin: { accent: "#62017F" }, // Purple
  viva: { accent: "#6E0025" }, // Burgundy (center, primary)
  vam: { accent: "#888888" }, // Gray
  vash: { accent: "#0B7B8C" }, // Teal
};

type Arm = {
  number: string;
  title: string;
  accent: string;
  tag: string;
  blurb: string;
  narrative: string; // Longer story text
  target: string;
  Icon: LucideIcon;
  x: number;
  y: number;
  side: "top" | "bottom";
  scale: number;
};

const ARMS: Arm[] = [
  {
    number: "01",
    title: "Illustrations & Designs",
    accent: BRAND_COLORS.illustrations.accent,
    tag: "Creative",
    blurb: "Narrative fashion illustration — art that heals, inspires, and sells.",
    narrative: "Hand-crafted illustrations that tell stories. From editorial campaigns to bespoke brand identity, we create visual narratives that make impossible look inevitable.",
    target: "illustrations",
    Icon: Palette,
    x: 12,
    y: 28,
    side: "top",
    scale: 0.85,
  },
  {
    number: "02",
    title: "VAGIN",
    accent: BRAND_COLORS.vagin.accent,
    tag: "Impact",
    blurb: "Girls' Initiative — SRHR for 3,000+ girls. SDG 3 & 5.",
    narrative: "Sexual and Reproductive Health & Rights for teenage girls across Nigeria. We believe knowledge is power. Education transforms lives.",
    target: "vagin",
    Icon: HeartHandshake,
    x: 31,
    y: 72,
    side: "bottom",
    scale: 0.85,
  },
  {
    number: "03",
    title: "VIVA",
    accent: BRAND_COLORS.viva.accent,
    tag: "Fashion",
    blurb: "Structured yet fluid wearable art for the modern woman.",
    narrative: "Made-to-measure fashion where precision meets poetry. Each piece is a conversation between architect and dreamer. For women who refuse to choose.",
    target: "viva",
    Icon: Shirt,
    x: 50,
    y: 28,
    side: "top",
    scale: 1,
  },
  {
    number: "04",
    title: "VAM",
    accent: BRAND_COLORS.vam.accent,
    tag: "Education",
    blurb: "Masterclass turning creative ideas into independent careers.",
    narrative: "Learn from Faith. Design thinking, illustration, business fundamentals. We teach you how to turn creative passion into sustainable income.",
    target: "vam",
    Icon: GraduationCap,
    x: 69,
    y: 72,
    side: "bottom",
    scale: 0.85,
  },
  {
    number: "05",
    title: "VASH",
    accent: BRAND_COLORS.vash.accent,
    tag: "Commerce",
    blurb: "The shop — wearable art, brushes, references. The commercial engine.",
    narrative: "Curated tools for creators. Premium Procreate brushes, pose references, design assets, wearable art. Where art becomes accessible and sustainable.",
    target: "shop",
    Icon: ShoppingBag,
    x: 88,
    y: 28,
    side: "top",
    scale: 0.85,
  },
];

const FLOW_PATH =
  "M12,28 C20,28 23,72 31,72 C39,72 42,28 50,28 C58,28 61,72 69,72 C77,72 80,28 88,28";

const EcosystemSection = () => {
  const reduced = useReducedMotion();
  const d = (s: number) => (reduced ? 0 : s);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const headerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: d(0.1), delayChildren: d(0.1) },
    },
  };

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.6), ease: "easeOut" as const },
    },
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", paddingBottom: "clamp(100px, 12vw, 160px)" }}
      aria-label="The Viera Amber Ecosystem"
    >
      {/* Ambient brand wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(0,0,0,0.03) 0%, transparent 70%)",
        }}
      />

      <style>{`
        .eco-flow-desktop { display: none; }
        .eco-flow-cards   { display: grid; }
        @media (min-width: 1100px) {
          .eco-flow-desktop { display: block; }
          .eco-flow-cards   { display: none; }
        }
      `}</style>

      <div
        className="relative mx-auto"
        style={{ maxWidth: 1400, padding: "clamp(100px, 12vw, 160px) clamp(24px, 5vw, 64px) 0" }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center text-center"
          style={{ gap: 24 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <motion.p
            variants={fadeUp}
            className="font-body uppercase m-0"
            style={{
              fontSize: 11,
              color: "#0A0A0A",
              letterSpacing: "0.5em",
              fontWeight: 600,
            }}
          >
            The Ecosystem
          </motion.p>

          <motion.h2
            variants={{
              initial: { opacity: 0, y: 40 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { duration: d(0.8), ease: "easeOut" as const },
              },
            }}
            className="font-display m-0"
            style={{
              fontSize: "clamp(32px, 5.5vw, 64px)",
              color: "#0A0A0A",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              maxWidth: 900,
            }}
          >
            One brand. Five expressions.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-body m-0"
            style={{
              fontSize: "clamp(15px, 1.8vw, 19px)",
              color: "#333333",
              fontWeight: 400,
              maxWidth: 700,
              lineHeight: 1.8,
              letterSpacing: "0.3px",
            }}
          >
            Art. Impact. Fashion. Education. Commerce. One flowing current, all rooted in the
            same conviction: creativity is the most powerful form of empowerment.
          </motion.p>
        </motion.div>

        {/* ── SERPENTINE WITH CARDS (DESKTOP) ──────────────────────────────────── */}
        <motion.div
          className="eco-flow-desktop relative"
          style={{ marginTop: 100 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ initial: {}, animate: { transition: { staggerChildren: d(0.15), delayChildren: d(0.2) } } }}
        >
          {/* Serpentine SVG */}
          <div style={{ height: "clamp(400px, 35vw, 500px)", marginBottom: 80 }}>
            <svg
              className="absolute inset-0"
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              <path
                d={FLOW_PATH}
                fill="none"
                stroke="#0A0A0A"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.08}
              />
              <motion.path
                d={FLOW_PATH}
                fill="none"
                stroke="#0A0A0A"
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: reduced ? 1 : 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: d(2.4), ease: "easeInOut" as const }}
              />
            </svg>

            {ARMS.map((arm) => (
              <FlowNode key={arm.number} arm={arm} reduced={reduced} onActivate={scrollTo} />
            ))}
          </div>

          {/* Cards below serpentine */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginTop: 60 }}>
            {ARMS.map((arm) => (
              <EcosystemCard key={arm.number} arm={arm} onActivate={scrollTo} reduced={reduced} />
            ))}
          </div>
        </motion.div>

        {/* ── CARD GRID (MOBILE/TABLET) ──────────────────────────────────── */}
        <motion.div
          className="eco-flow-cards"
          style={{
            gridTemplateColumns: "1fr",
            gap: 32,
            marginTop: 60,
          }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ initial: {}, animate: { transition: { staggerChildren: d(0.14), delayChildren: d(0.15) } } }}
        >
          {ARMS.map((arm) => (
            <EcosystemCard key={arm.number} arm={arm} onActivate={scrollTo} reduced={reduced} />
          ))}
        </motion.div>

        {/* ── SCROLL CUE ──────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center"
          style={{ marginTop: 80, gap: 16 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: d(0.6), delay: d(0.3), ease: "easeOut" as const }}
        >
          <motion.div
            animate={reduced ? { height: 48 } : { height: [48, 68, 48] }}
            transition={reduced ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const }}
            style={{ width: 1.5, backgroundColor: "#0A0A0A" }}
            aria-hidden="true"
          />
          <p
            className="font-body uppercase m-0"
            style={{
              fontSize: 11,
              color: "#0A0A0A",
              letterSpacing: "0.2em",
              fontWeight: 600,
            }}
          >
            ↓ Explore each world
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   FLOW NODE — Desktop serpentine dot
   ════════════════════════════════════════════════════════════════════════ */
const FlowNode = ({
  arm,
  reduced,
  onActivate,
}: {
  arm: Arm;
  reduced: boolean;
  onActivate: (id: string) => void;
}) => {
  const { Icon } = arm;
  const dotSize = arm.scale === 1 ? 48 : 40;
  const iconSize = arm.scale === 1 ? 24 : 20;

  return (
    <motion.button
      type="button"
      onClick={() => onActivate(arm.target)}
      aria-label={`${arm.title}. Jump to section.`}
      className="absolute bg-transparent border-0 p-0 cursor-pointer"
      style={{ left: `${arm.x}%`, top: `${arm.y}%`, width: 0, height: 0, overflow: "visible" }}
      variants={{
        initial: { opacity: 0, scale: 0.3 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: { type: "spring" as const, stiffness: 150, damping: 25 },
        },
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: dotSize + 16,
          height: dotSize + 16,
          left: -(dotSize + 16) / 2,
          top: -(dotSize + 16) / 2,
          borderRadius: "50%",
          border: `1.5px solid ${arm.accent}`,
          opacity: 0.2,
        }}
        whileHover={{ opacity: 0.4 }}
      />

      <div
        style={{
          position: "absolute",
          width: dotSize,
          height: dotSize,
          left: -dotSize / 2,
          top: -dotSize / 2,
          borderRadius: "50%",
          backgroundColor: arm.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${arm.accent}33`,
        }}
      >
        <Icon size={iconSize} color="#FFFFFF" strokeWidth={2.2} />
      </div>
    </motion.button>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   ECOSYSTEM CARD — Full narrative card with all text visible
   ════════════════════════════════════════════════════════════════════════ */
const EcosystemCard = ({
  arm,
  onActivate,
  reduced,
}: {
  arm: Arm;
  onActivate: (id: string) => void;
  reduced: boolean;
}) => {
  const { Icon } = arm;

  return (
    <motion.div
      onClick={() => onActivate(arm.target)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onActivate(arm.target);
      }}
      className="cursor-pointer"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 150, damping: 25 },
        },
      }}
      whileHover={{ y: -8 }}
      style={{
        padding: 32,
        borderRadius: 12,
        border: `2px solid ${arm.accent}20`,
        backgroundColor: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "border-color 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = arm.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${arm.accent}20`;
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: arm.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color="#FFFFFF" strokeWidth={2} />
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#0A0A0A",
              letterSpacing: "0.2em",
              fontWeight: 800,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {arm.tag}
          </p>
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "clamp(18px, 1.6vw, 24px)",
          color: "#0A0A0A",
          fontWeight: 800,
          margin: "0",
          fontFamily: "var(--font-display, serif)",
          letterSpacing: "-0.015em",
          lineHeight: 1.2,
        }}
      >
        {arm.title}
      </h3>

      {/* Narrative — the story */}
      <p
        style={{
          fontSize: 15,
          color: "#333333",
          fontWeight: 400,
          lineHeight: 1.7,
          margin: "0",
        }}
      >
        {arm.narrative}
      </p>

      {/* CTA */}
      <motion.div
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}
        whileHover={{ gap: 12 }}
      >
        <span
          style={{
            fontSize: 12,
            color: arm.accent,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Explore
        </span>
        <ArrowRight size={16} color={arm.accent} strokeWidth={2.5} />
      </motion.div>
    </motion.div>
  );
};

export default EcosystemSection;
