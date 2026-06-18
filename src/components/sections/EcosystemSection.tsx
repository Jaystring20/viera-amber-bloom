import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  Palette,
  HeartHandshake,
  Shirt,
  GraduationCap,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

type Arm = {
  number: string;
  title: string;
  accent: string; // true brand hex — used for the dot, glow, and curve
  text: string; // lightened, WCAG-legible variant — used for text, badges, borders on dark
  tag: string;
  blurb: string;
  target: string;
  Icon: LucideIcon;
  /* serpentine anchor on desktop, expressed in viewBox % (0–100) */
  x: number;
  y: number;
  /* which side the label fans toward on desktop */
  side: "top" | "bottom";
};

const ARMS: Arm[] = [
  {
    number: "01",
    title: "Illustrations & Designs",
    accent: "#0A0A0A",
    text: "#0A0A0A",
    tag: "Creative",
    blurb: "Narrative fashion illustration — art that heals, inspires, and sells.",
    target: "illustrations",
    Icon: Palette,
    x: 12,
    y: 28,
    side: "top",
  },
  {
    number: "02",
    title: "VAGIN",
    accent: "#0A0A0A",
    text: "#0A0A0A",
    tag: "Impact",
    blurb: "Girls' Initiative — SRHR for 3,000+ girls. SDG 3 & 5.",
    target: "vagin",
    Icon: HeartHandshake,
    x: 31,
    y: 72,
    side: "bottom",
  },
  {
    number: "03",
    title: "VIVA",
    accent: "#0A0A0A",
    text: "#0A0A0A",
    tag: "Fashion",
    blurb: "Structured yet fluid wearable art for the modern woman.",
    target: "viva",
    Icon: Shirt,
    x: 50,
    y: 28,
    side: "top",
  },
  {
    number: "04",
    title: "VAM",
    accent: "#0A0A0A",
    text: "#0A0A0A",
    tag: "Education",
    blurb: "Masterclass turning creative ideas into independent careers.",
    target: "vam",
    Icon: GraduationCap,
    x: 69,
    y: 72,
    side: "bottom",
  },
  {
    number: "05",
    title: "VASH",
    accent: "#0A0A0A",
    text: "#0A0A0A",
    tag: "Commerce",
    blurb: "The shop — wearable art, brushes, references. The commercial engine.",
    target: "shop",
    Icon: ShoppingBag,
    x: 88,
    y: 28,
    side: "top",
  },
];

/* Smooth serpentine through the 5 anchors (viewBox 0 0 100 100, preserveAspectRatio none). */
const FLOW_PATH =
  "M12,28 C20,28 23,72 31,72 C39,72 42,28 50,28 C58,28 61,72 69,72 C77,72 80,28 88,28";

type View = "flow" | "cards";

const EcosystemSection = () => {
  const reduced = useReducedMotion();
  const d = (s: number) => (reduced ? 0 : s);
  const [view, setView] = useState<View>("flow");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const headerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: d(0.1), delayChildren: d(0.1) } },
  };
  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: d(0.6), ease: "easeOut" as const } },
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", paddingBottom: "clamp(60px, 8vw, 90px)" }}
      aria-label="The Viera Amber Ecosystem"
    >
      {/* Ambient brand wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(0,0,0,0.04) 0%, transparent 70%)",
        }}
      />

      <style>{`
        /* FLOW view: serpentine on desktop only (>=1100px); spine on tablet & mobile */
        .eco-flow-desktop { display: none; }
        .eco-flow-spine   { display: flex; }
        /* CARDS view: connected rows on desktop only; responsive stack below */
        .eco-cards-desktop { display: none; }
        .eco-cards-stack   { display: grid; }
        @media (min-width: 1100px) {
          .eco-flow-desktop  { display: block; }
          .eco-flow-spine    { display: none; }
          .eco-cards-desktop { display: flex; }
          .eco-cards-stack   { display: none; }
        }
        /* stack: 1-col on phones, 2-col on tablets */
        .eco-cards-stack { grid-template-columns: 1fr; }
        @media (min-width: 640px) {
          .eco-cards-stack { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div
        className="relative mx-auto"
        style={{ maxWidth: 1300, padding: "clamp(60px, 8vw, 90px) clamp(24px, 5vw, 64px) 0" }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center text-center"
          style={{ gap: 18 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <motion.p
            variants={fadeUp}
            className="font-body uppercase m-0"
            style={{ fontSize: 11, color: "#0A0A0A", letterSpacing: "0.4em", fontWeight: 500 }}
          >
            The Ecosystem
          </motion.p>
          <motion.h2
            variants={{
              initial: { opacity: 0, y: 36 },
              animate: { opacity: 1, y: 0, transition: { duration: d(0.7), ease: "easeOut" as const } },
            }}
            className="font-display m-0"
            style={{
              fontSize: "clamp(28px, 4vw, 52px)",
              color: "#0A0A0A",
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 800,
            }}
          >
            One brand. Five expressions.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-body m-0"
            style={{ fontSize: 16, color: "#555555", fontWeight: 300, maxWidth: 600, lineHeight: 1.7 }}
          >
            Art. Impact. Fashion. Education. Commerce. One flowing current, all rooted in the
            same conviction: creativity is the most powerful form of empowerment.
          </motion.p>

          {/* ── Comparison toggle (temporary A/B control) ────────────────── */}
          <ViewToggle view={view} onChange={setView} />
        </motion.div>

        {/* ── Views ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === "flow" ? (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: d(0.35), ease: "easeOut" as const }}
            >
              <FlowView reduced={!!reduced} d={d} onActivate={scrollTo} />
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: d(0.35), ease: "easeOut" as const }}
            >
              <CardsView reduced={!!reduced} d={d} onActivate={scrollTo} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer scroll cue ──────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center"
          style={{ marginTop: 48, gap: 14 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: d(0.6), delay: d(0.2), ease: "easeOut" as const }}
        >
          <motion.div
            animate={reduced ? { height: 44 } : { height: [44, 60, 44] }}
            transition={reduced ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" as const }}
            style={{ width: 1, backgroundColor: "#0A0A0A" }}
            aria-hidden="true"
          />
          <p
            className="font-body uppercase m-0"
            style={{ fontSize: 12, color: "#0A0A0A", letterSpacing: "0.18em", fontWeight: 400 }}
          >
            ↓ Scroll to explore each world
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   View toggle — segmented control to A/B the two layouts
   ════════════════════════════════════════════════════════════════════════ */
const ViewToggle = ({ view, onChange }: { view: View; onChange: (v: View) => void }) => {
  const opts: { id: View; label: string }[] = [
    { id: "flow", label: "Serpentine Flow" },
    { id: "cards", label: "Connected Cards" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Ecosystem layout"
      className="relative flex"
      style={{
        marginTop: 10,
        padding: 4,
        gap: 4,
        borderRadius: 999,
        background: "#FFFFFF",
        border: "1px solid #0A0A0A",
      }}
    >
      {opts.map((o) => {
        const active = view === o.id;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className="relative font-body uppercase cursor-pointer"
            style={{
              border: 0,
              background: "transparent",
              color: active ? "#0A0A0A" : "#555555",
              fontSize: 11,
              letterSpacing: "0.12em",
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: 999,
              minHeight: 40,
              zIndex: 1,
              transition: "color 0.25s ease",
            }}
          >
            {active && (
              <motion.span
                layoutId="ecoTogglePill"
                className="absolute inset-0"
                style={{ background: "#0A0A0A", borderRadius: 999, zIndex: -1 }}
                transition={{ type: "spring" as const, stiffness: 380, damping: 30 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   FLOW VIEW — serpentine (desktop) + vertical spine (tablet/mobile)
   ════════════════════════════════════════════════════════════════════════ */
const FlowView = ({
  reduced,
  d,
  onActivate,
}: {
  reduced: boolean;
  d: (s: number) => number;
  onActivate: (id: string) => void;
}) => {
  return (
    <>
      {/* Desktop serpentine */}
      <motion.div
        className="eco-flow-desktop relative"
        style={{ marginTop: 60, height: "clamp(500px, 40vw, 560px)" }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ initial: {}, animate: { transition: { staggerChildren: d(0.18), delayChildren: d(0.2) } } }}
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="ecoFlowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0A0A0A" />
              <stop offset="27%" stopColor="#0A0A0A" />
              <stop offset="52%" stopColor="#0A0A0A" />
              <stop offset="75%" stopColor="#0A0A0A" />
              <stop offset="100%" stopColor="#0A0A0A" />
            </linearGradient>
          </defs>
          <path
            d={FLOW_PATH}
            fill="none"
            stroke="url(#ecoFlowGrad)"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.25}
          />
          <motion.path
            d={FLOW_PATH}
            fill="none"
            stroke="url(#ecoFlowGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
            initial={{ pathLength: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: d(1.8), ease: "easeInOut" as const }}
          />
        </svg>

        {ARMS.map((arm) => (
          <FlowNode key={arm.number} arm={arm} reduced={reduced} onActivate={onActivate} />
        ))}
      </motion.div>

      {/* Tablet/mobile vertical spine */}
      <motion.ol
        className="eco-flow-spine flex-col m-0 p-0 list-none relative mx-auto"
        style={{ marginTop: 44, maxWidth: 560 }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={{ initial: {}, animate: { transition: { staggerChildren: d(0.12), delayChildren: d(0.1) } } }}
      >
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: 19,
            top: 12,
            bottom: 12,
            width: 2,
            background:
              "linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)",
            opacity: 0.5,
          }}
        />
        {ARMS.map((arm) => (
          <SpineNode key={arm.number} arm={arm} reduced={reduced} onActivate={onActivate} />
        ))}
      </motion.ol>
    </>
  );
};

/* Desktop serpentine node: glowing dot ON the curve + larger fanned label */
const FlowNode = ({
  arm,
  reduced,
  onActivate,
}: {
  arm: Arm;
  reduced: boolean;
  onActivate: (id: string) => void;
}) => {
  const labelAbove = arm.side === "top";
  const GAP = 18;
  const { Icon } = arm;

  return (
    <motion.button
      type="button"
      onClick={() => onActivate(arm.target)}
      aria-label={`${arm.title} — ${arm.tag}. Jump to section.`}
      className="absolute bg-transparent border-0 p-0 cursor-pointer"
      style={{ left: `${arm.x}%`, top: `${arm.y}%`, width: 0, height: 0, overflow: "visible" }}
      variants={{
        initial: { opacity: 0, scale: 0.6 },
        animate: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 18 } },
      }}
      whileHover={reduced ? undefined : "hover"}
      whileTap={reduced ? undefined : { scale: 0.96 }}
    >
      {/* Glowing node dot — center sits exactly on the anchor (x,y) */}
      <motion.span
        aria-hidden="true"
        variants={{ hover: reduced ? {} : { scale: 1.3 } }}
        transition={{ type: "spring" as const, stiffness: 300, damping: 18 }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%)",
          width: 22,
          height: 22,
          borderRadius: 999,
          background: arm.accent,
          border: "2px solid #FFFFFF", outline: "1px solid #0A0A0A",
          boxShadow: `0 0 16px ${arm.accent}, 0 0 34px ${arm.accent}88`,
        }}
      />

      {/* Label card — larger, fanned above/below the dot */}
      <motion.div
        variants={{ hover: reduced ? {} : { y: labelAbove ? -4 : 4 } }}
        style={{
          position: "absolute",
          left: 0,
          width: 248,
          transform: "translateX(-50%)",
          ...(labelAbove ? { bottom: GAP + 11 } : { top: GAP + 11 }),
          background: "#FFFFFF",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${arm.text}55`,
          borderRadius: 14,
          padding: "18px 20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div className="flex items-center justify-center" style={{ gap: 10, marginBottom: 10 }}>
          <span
            aria-hidden="true"
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: `${arm.accent}22`,
              border: `1px solid ${arm.text}66`,
            }}
          >
            <Icon size={18} color={arm.text} strokeWidth={1.75} />
          </span>
          <span
            className="font-body uppercase"
            style={{
              fontSize: 9,
              color: arm.text,
              letterSpacing: "0.14em",
              border: `1px solid ${arm.text}`,
              borderRadius: 999,
              padding: "2px 9px",
              fontWeight: 600,
            }}
          >
            {arm.tag}
          </span>
        </div>
        <div className="flex items-baseline justify-center" style={{ gap: 7, marginBottom: 7 }}>
          <span className="font-body" style={{ fontSize: 11, color: arm.text, fontWeight: 700, letterSpacing: "1px" }}>
            {arm.number}
          </span>
          <h3 className="font-display m-0" style={{ fontSize: 17, color: "#0A0A0A", fontWeight: 700, lineHeight: 1.25 }}>
            {arm.title}
          </h3>
        </div>
        <p className="font-body m-0" style={{ fontSize: 12.5, color: "#555555", fontWeight: 300, lineHeight: 1.5 }}>
          {arm.blurb}
        </p>
      </motion.div>
    </motion.button>
  );
};

/* Tablet/mobile spine node: dot on the spine + card to the right */
const SpineNode = ({
  arm,
  reduced,
  onActivate,
}: {
  arm: Arm;
  reduced: boolean;
  onActivate: (id: string) => void;
}) => {
  const { Icon } = arm;
  return (
    <motion.li
      variants={{
        initial: { opacity: 0, x: -16 },
        animate: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.5, ease: "easeOut" as const } },
      }}
      style={{ position: "relative", paddingLeft: 52, paddingBottom: 24 }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 11,
          top: 18,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: arm.accent,
          border: "2px solid #FFFFFF", outline: "1px solid #0A0A0A",
          boxShadow: `0 0 12px ${arm.accent}, 0 0 24px ${arm.accent}77`,
        }}
      />
      <button
        type="button"
        onClick={() => onActivate(arm.target)}
        aria-label={`${arm.title} — ${arm.tag}. Jump to section.`}
        className="text-left w-full bg-transparent border-0 cursor-pointer"
        style={{
          background: "#FFFFFF",
          border: `1px solid ${arm.text}40`,
          borderRadius: 12,
          padding: "16px 18px",
          minHeight: 44,
        }}
      >
        <div className="flex items-center" style={{ gap: 10, marginBottom: 7 }}>
          <span
            aria-hidden="true"
            className="flex items-center justify-center"
            style={{ width: 30, height: 30, borderRadius: 999, background: `${arm.accent}22`, border: `1px solid ${arm.text}55` }}
          >
            <Icon size={16} color={arm.text} strokeWidth={1.75} />
          </span>
          <span className="font-body" style={{ fontSize: 11, color: arm.text, fontWeight: 700, letterSpacing: "1px" }}>
            {arm.number}
          </span>
          <h3 className="font-display m-0" style={{ fontSize: 16, color: "#0A0A0A", fontWeight: 700, lineHeight: 1.2 }}>
            {arm.title}
          </h3>
          <span
            className="font-body uppercase"
            style={{
              marginLeft: "auto",
              fontSize: 8,
              color: arm.text,
              letterSpacing: "0.14em",
              border: `1px solid ${arm.text}`,
              borderRadius: 999,
              padding: "2px 8px",
              fontWeight: 600,
            }}
          >
            {arm.tag}
          </span>
        </div>
        <p className="font-body m-0" style={{ fontSize: 13, color: "#555555", fontWeight: 300, lineHeight: 1.55 }}>
          {arm.blurb}
        </p>
      </button>
    </motion.li>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   CARDS VIEW (Option 3) — connected cards with flow connectors
   ════════════════════════════════════════════════════════════════════════ */
const CardsView = ({
  reduced,
  d,
  onActivate,
}: {
  reduced: boolean;
  d: (s: number) => number;
  onActivate: (id: string) => void;
}) => {
  const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: d(0.1), delayChildren: d(0.15) } },
  };

  return (
    <div style={{ marginTop: 56 }}>
      {/* Desktop: 3 + 2 connected rows */}
      <motion.div
        className="eco-cards-desktop flex-col items-center"
        style={{ gap: 0 }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="flex items-stretch justify-center" style={{ gap: 0 }}>
          <EcoCard arm={ARMS[0]} reduced={reduced} onActivate={onActivate} />
          <Connector reduced={reduced} />
          <EcoCard arm={ARMS[1]} reduced={reduced} onActivate={onActivate} />
          <Connector reduced={reduced} />
          <EcoCard arm={ARMS[2]} reduced={reduced} onActivate={onActivate} />
        </div>

        <DownConnector reduced={reduced} />

        <div className="flex items-stretch justify-center" style={{ gap: 0 }}>
          <EcoCard arm={ARMS[3]} reduced={reduced} onActivate={onActivate} />
          <Connector reduced={reduced} />
          <EcoCard arm={ARMS[4]} reduced={reduced} onActivate={onActivate} />
        </div>
      </motion.div>

      {/* Tablet/mobile: responsive grid */}
      <motion.div
        className="eco-cards-stack"
        style={{ gap: 16 }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
      >
        {ARMS.map((arm) => (
          <EcoCard key={arm.number} arm={arm} reduced={reduced} onActivate={onActivate} stack />
        ))}
      </motion.div>
    </div>
  );
};

const Connector = ({ reduced }: { reduced: boolean }) => (
  <motion.div
    aria-hidden="true"
    className="flex items-center justify-center self-center"
    style={{ width: 40, flexShrink: 0 }}
    variants={{
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1, transition: { duration: reduced ? 0 : 0.4 } },
    }}
  >
    <ArrowRight size={20} color="#0A0A0A" strokeWidth={2} />
  </motion.div>
);

const DownConnector = ({ reduced }: { reduced: boolean }) => (
  <motion.div
    aria-hidden="true"
    className="flex items-center justify-center"
    style={{ height: 36 }}
    variants={{
      initial: { opacity: 0, y: -6 },
      animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.4 } },
    }}
  >
    <ChevronDown size={22} color="#0A0A0A" strokeWidth={2} />
  </motion.div>
);

const EcoCard = ({
  arm,
  reduced,
  onActivate,
  stack = false,
}: {
  arm: Arm;
  reduced: boolean;
  onActivate: (id: string) => void;
  stack?: boolean;
}) => {
  const { Icon } = arm;
  return (
    <motion.button
      type="button"
      onClick={() => onActivate(arm.target)}
      aria-label={`${arm.title} — ${arm.tag}. Jump to section.`}
      className="group text-left cursor-pointer flex flex-col"
      style={{
        width: stack ? "100%" : 268,
        background: "#FFFFFF",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${arm.text}33`,
        borderTop: `3px solid ${arm.accent}`,
        borderRadius: 14,
        padding: "24px 22px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
      variants={{
        initial: { opacity: 0, y: 26 },
        animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.55, ease: "easeOut" as const } },
      }}
      whileHover={reduced ? undefined : { y: -6, scale: 1.02, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
    >
      <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
        <span
          aria-hidden="true"
          className="flex items-center justify-center"
          style={{ width: 46, height: 46, borderRadius: 12, background: `${arm.accent}22`, border: `1px solid ${arm.text}55` }}
        >
          <Icon size={22} color={arm.text} strokeWidth={1.75} />
        </span>
        <span
          className="font-body uppercase"
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: arm.text,
            letterSpacing: "0.14em",
            border: `1px solid ${arm.text}`,
            borderRadius: 999,
            padding: "3px 10px",
            fontWeight: 600,
          }}
        >
          {arm.tag}
        </span>
      </div>

      <div className="flex items-baseline" style={{ gap: 8, marginBottom: 10 }}>
        <span className="font-body" style={{ fontSize: 12, color: arm.text, fontWeight: 700, letterSpacing: "1px" }}>
          {arm.number}
        </span>
        <h3 className="font-display m-0" style={{ fontSize: 19, color: "#0A0A0A", fontWeight: 700, lineHeight: 1.25 }}>
          {arm.title}
        </h3>
      </div>

      <p
        className="font-body m-0"
        style={{ fontSize: 13.5, color: "#555555", fontWeight: 300, lineHeight: 1.6, flex: 1, marginBottom: 18 }}
      >
        {arm.blurb}
      </p>

      <span
        className="font-body inline-flex items-center"
        style={{ gap: 6, fontSize: 12, color: arm.text, fontWeight: 600, letterSpacing: "0.04em" }}
      >
        Explore
        <ArrowRight
          size={14}
          strokeWidth={2}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </motion.button>
  );
};

export default EcosystemSection;
