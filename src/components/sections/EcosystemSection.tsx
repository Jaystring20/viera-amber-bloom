import React from "react";
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
  shortName: string; // Concise label shown next to the flow node
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
    shortName: "Illustrations",
    accent: BRAND_COLORS.illustrations.accent,
    tag: "Creative",
    blurb: "Narrative fashion illustration that moves people and sells.",
    narrative: "Digital illustrations that tell stories. From editorial campaigns, to custom illustrations, to bespoke brand identity, we create visual narratives that make the impossible look inevitable.",
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
    shortName: "VAGIN",
    accent: BRAND_COLORS.vagin.accent,
    tag: "Impact",
    blurb: "Girls' Initiative. SRHR for 3,000+ girls. SDG 3 & 5.",
    narrative: "Sexual and Reproductive Health & Rights for underserved adolescent girls globally. We believe knowledge is power, and education transforms lives.",
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
    shortName: "VIVA",
    accent: BRAND_COLORS.viva.accent,
    tag: "Fashion",
    blurb: "Structured yet fluid wearable art for the modern woman.",
    narrative: "Contemporary made-to-order fashion celebrating art, storytelling, and feminine identity rooted in faith. Every garment is made only after it's ordered, so nothing goes to waste.",
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
    shortName: "VAM",
    accent: BRAND_COLORS.vam.accent,
    tag: "Education",
    blurb: "Masterclass turning creative ideas into independent careers.",
    narrative: "Learn directly from founder Faith Adigwe. Master illustration, design thinking, and the business fundamentals that turn creative passion into sustainable income.",
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
    shortName: "VASH",
    accent: BRAND_COLORS.vash.accent,
    tag: "Commerce",
    blurb: "The shop for wearable art, brushes and references. The commercial engine.",
    narrative: "Curated tools for creators. Premium Procreate brushes, pose references, design assets and wearable art. Where art becomes accessible and sustainable.",
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
  const [hoveredArm, setHoveredArm] = React.useState<string | null>(null);

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
      {/* Ambient brand wash.
          Origin moved off the top edge (was `at 50% 0%`). Sitting at 0% it put
          a 3% dark wash exactly where the Hero's white fade lands, so the seam
          picked up a faint grey smudge right at the join. Starting it lower
          lets the two sections meet on clean white. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 22%, rgba(0,0,0,0.03) 0%, transparent 70%)",
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
        /* Top padding cut from 100-160px. The Hero already ends in a tall
           white fade, so this was stacking a second empty white zone on top of
           it — roughly 340px of nothing between the portrait and the first
           headline. Tightening it is most of what makes the seam read as one
           continuous page rather than two sections with a gap. */
        style={{ maxWidth: 1400, padding: "clamp(56px, 6.5vw, 96px) clamp(24px, 5vw, 64px) 0" }}
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
              fontSize: 13,
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
              fontSize: "clamp(16px, 1.9vw, 21px)",
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
          variants={{ initial: {}, animate: { transition: { staggerChildren: d(0.12), delayChildren: d(0.1) } } }}
        >
          {/* Serpentine SVG + Accent Bars */}
          <div style={{ height: "clamp(400px, 35vw, 500px)", marginBottom: 80, position: "relative" }}>
            <svg
              className="absolute inset-0"
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              {/* Main curve (background) */}
              <path
                d={FLOW_PATH}
                fill="none"
                stroke="#0A0A0A"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.08}
              />
              {/* Animated curve (foreground) */}
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

              {/* Vertical accent bars (from nodes toward cards) */}
              {ARMS.map((arm) => (
                <motion.line
                  key={`bar-${arm.number}`}
                  x1={arm.x}
                  y1={arm.y}
                  x2={arm.x}
                  y2={90}
                  stroke={arm.accent}
                  strokeWidth={2.5}
                  vectorEffect="non-scaling-stroke"
                  opacity={hoveredArm === arm.target ? 1 : 0.35}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: hoveredArm === arm.target ? 1 : 0.35 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    pathLength: { duration: d(1.2), delay: d(0.4 + Number(arm.number) * 0.12), ease: "easeOut" },
                    opacity: { duration: 0.3 },
                  }}
                  style={{ transition: "opacity 0.3s ease" }}
                />
              ))}
            </svg>

            {ARMS.map((arm, idx) => (
              <FlowNode
                key={arm.number}
                arm={arm}
                reduced={reduced}
                onActivate={scrollTo}
                isHovered={hoveredArm === arm.target}
                onHoverChange={(isHovered) => setHoveredArm(isHovered ? arm.target : null)}
                index={idx}
              />
            ))}
          </div>

          {/* Cards below serpentine */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginTop: 60 }}>
            {ARMS.map((arm, idx) => (
              <EcosystemCard
                key={arm.number}
                arm={arm}
                onActivate={scrollTo}
                reduced={reduced}
                isHovered={hoveredArm === arm.target}
                onHoverChange={(isHovered) => setHoveredArm(isHovered ? arm.target : null)}
                index={idx}
              />
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
          <div
            style={{ width: 1.5, height: 48, backgroundColor: "#0A0A0A" }}
            aria-hidden="true"
          />
          <p
            className="font-body uppercase m-0"
            style={{
              fontSize: 13,
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
   FLOW NODE — Desktop serpentine dot with halo and synchronized hover
   ════════════════════════════════════════════════════════════════════════ */
const FlowNode = ({
  arm,
  reduced,
  onActivate,
  isHovered,
  onHoverChange,
  index,
}: {
  arm: Arm;
  reduced: boolean;
  onActivate: (id: string) => void;
  isHovered: boolean;
  onHoverChange: (isHovered: boolean) => void;
  index: number;
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
          transition: { type: "spring" as const, stiffness: 150, damping: 25, delay: reduced ? 0 : index * 0.12 },
        },
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Gradient halo (background glow) */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: dotSize + 32,
          height: dotSize + 32,
          left: -(dotSize + 32) / 2,
          top: -(dotSize + 32) / 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${arm.accent}30 0%, ${arm.accent}10 60%, transparent 100%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      />

      {/* Outer ring (border) */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: dotSize + 16,
          height: dotSize + 16,
          left: -(dotSize + 16) / 2,
          top: -(dotSize + 16) / 2,
          borderRadius: "50%",
          border: `2px solid ${arm.accent}`,
          opacity: 0.2,
        }}
        animate={{ opacity: isHovered ? 0.6 : 0.2, scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Main dot with icon */}
      <motion.div
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
        animate={{
          boxShadow: isHovered
            ? `0 8px 24px ${arm.accent}66, 0 0 32px ${arm.accent}33`
            : `0 4px 12px ${arm.accent}33`,
        }}
        transition={{ duration: 0.3 }}
      >
        <Icon size={iconSize} color="#FFFFFF" strokeWidth={2.2} />
      </motion.div>

      {/* Name label — attached to the node so the map reads clearly */}
      <motion.span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: arm.side === "top" ? -(dotSize / 2 + 12) : dotSize / 2 + 12,
          transform:
            arm.side === "top" ? "translate(-50%, -100%)" : "translateX(-50%)",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-body, sans-serif)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#1A1A1A",
          backgroundColor: "rgba(255,255,255,0.88)",
          padding: "3px 9px",
          borderRadius: 6,
          boxShadow: `0 1px 6px rgba(0,0,0,0.06)`,
        }}
        animate={{ color: isHovered ? arm.accent : "#1A1A1A" }}
        transition={{ duration: 0.3 }}
      >
        {arm.shortName}
      </motion.span>
    </motion.button>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   ECOSYSTEM CARD — Full narrative card with gradient band, icon badge, and sync hover
   ════════════════════════════════════════════════════════════════════════ */
const EcosystemCard = ({
  arm,
  onActivate,
  reduced,
  isHovered = false,
  onHoverChange = () => {},
  index = 0,
}: {
  arm: Arm;
  onActivate: (id: string) => void;
  reduced: boolean;
  isHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  index?: number;
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
        initial: { opacity: 0, y: 24 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 150, damping: 25, delay: reduced ? 0 : 0.5 + index * 0.1 },
        },
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      animate={{
        y: isHovered ? -12 : 0,
        boxShadow: isHovered
          ? `0 16px 40px ${arm.accent}22`
          : `0 4px 12px ${arm.accent}11`,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        /* REQUIRED. The icon badge below is position:absolute, so without a
           positioned ancestor here it escapes the card entirely and anchors to
           the section wrapper instead — landing at top:48/right:24 of the whole
           Ecosystem section, on top of the heading. All five badges escaped to
           the same coordinate and stacked, so only the last one rendered (VASH,
           the shop bag) was ever visible as a stray. */
        position: "relative",
        padding: "0 32px 32px 32px",
        borderRadius: 12,
        border: `2px solid ${isHovered ? arm.accent : `${arm.accent}15`}`,
        backgroundColor: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
      }}
    >
      {/* Gradient band at top (echoes the node) */}
      <motion.div
        aria-hidden="true"
        style={{
          height: 8,
          background: `linear-gradient(90deg, ${arm.accent} 0%, ${arm.accent}66 100%)`,
          marginLeft: -32,
          marginRight: -32,
          marginTop: -32,
          marginBottom: 8,
        }}
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        transition={{ duration: 0.3 }}
      />
      {/* Tag badge */}
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

      {/* Icon badge (echoes the node) — positioned top-right */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 48,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: arm.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 16px ${arm.accent}33`,
          opacity: 0.8,
        }}
        animate={{ opacity: isHovered ? 1 : 0.6, scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon size={28} color="#FFFFFF" strokeWidth={2} />
      </motion.div>

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
