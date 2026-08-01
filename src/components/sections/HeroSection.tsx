import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, ShoppingBag } from "lucide-react";
import logoSrc from "@/assets/viera-amber-logo.png";

/* ════════════════════════════════════════════════════════════════════════
   HERO — "The Current"

   THESIS: one creative practice, five expressions. The Hero does not
   describe that, it draws it: a single ink line descends through a warm
   amber field, forks at the ∧ taken from the VIERA∧AMBER wordmark, and
   lands on five plates — real windows into Illustrations, VAGIN, VIVA,
   VAM and VASH, in the same five accent colours the Ecosystem map uses
   directly below. The line a visitor half-notices here is the line doing
   the work in the next section.

   What this replaced, and why:
   - A full-bleed portrait crushed to grayscale/brightness(0.6) under three
     black overlays, purely so white type stayed legible. It fought its own
     colour story and read as a mood, not an idea.
   - Then an image-free amber field, which was better craft but still pure
     atmosphere: nothing in it could only be Viera Amber.

   GUARDRAILS: no forced desaturation of brand art, no dark overlay stack,
   no purple gradient, no auto-rotating carousel, no perpetual ambient
   motion beyond the slow field drift, no eyebrow above the headline.
   Champagne #C8A96E measures 2.15:1 on paper, so it is confined to the
   background wash — every mark that touches type uses #D97706 (3.05:1).
   ════════════════════════════════════════════════════════════════════════ */

const INK = "#0A0A0A";
const PAPER = "#FAFAFA";
const GOLD = "#C8A96E";     // Champagne — field wash only, never type.
const GOLD_INK = "#D97706"; // Warm gold — clears AA for large text.

/* Where one current becomes five. Shared by the SVG and the plate layer so
   both stay locked in a single 0–100 coordinate space. */
const FORK = { x: 68, y: 82 };

/* `drape` hangs each plate lower the further its thread runs from the fork,
   the way real thread sags — it is what stops the fan reading as a flat,
   evenly spaced diagram. */
const ARMS = [
  { color: "#D97706", x: 10, drape: 9, label: "Illustrations", tag: "Art",       target: "illustrations", image: "/artworks/artwork_0022.webp",      rotate: -6 },
  { color: "#62017F", x: 30, drape: 5, label: "VAGIN",         tag: "Impact",    target: "vagin",         image: "/vagin-images/vagin_team_01.webp", rotate: 4 },
  { color: "#6E0025", x: 50, drape: 2, label: "VIVA",          tag: "Fashion",   target: "viva",          image: "/viva/hero-left.webp",            rotate: -3 },
  { color: "#888888", x: 70, drape: 0, label: "VAM",           tag: "Education", target: "vam",           Icon: GraduationCap,                      rotate: 5 },
  { color: "#0B7B8C", x: 90, drape: 3, label: "VASH",          tag: "Commerce",  target: "shop",          Icon: ShoppingBag,                        rotate: -4 },
];

const TRUNK = `M 18,0 C 44,0 26,34 52,40 C 70,44 58,72 ${FORK.x},${FORK.y}`;

const HeroSection = () => {
  const reduced = useReducedMotion();
  const d = (s: number) => (reduced ? 0 : s);
  const [activeArm, setActiveArm] = useState<string | null>(null);

  /* The Hero owns the top of the page, so it animates on mount rather than
     waiting to scroll into view. */
  const TRUNK_DURATION = d(1.3);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      className="relative w-full min-h-dvh overflow-hidden flex items-center px-6 lg:px-16"
      style={{ backgroundColor: PAPER, paddingTop: 104, paddingBottom: 64 }}
    >
      {/* ── Layered amber field: two washes drifting at their own rates, a
           vignette for body, and fine grain for tactility ── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        initial={{ scale: 1 }}
        animate={reduced ? {} : { scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" as const }}
        style={{ background: `radial-gradient(ellipse 62% 70% at 22% 42%, ${GOLD}42 0%, ${GOLD}1c 45%, transparent 74%)` }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        initial={{ x: 0, y: 0 }}
        animate={reduced ? {} : { x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" as const }}
        style={{ background: "radial-gradient(ellipse 46% 50% at 78% 30%, #E8D2A855 0%, transparent 68%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(10,10,10,0.05) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.55,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          THE CURRENT — desktop. Two layers: a decorative SVG (aria-hidden)
          and a real, focusable link layer. The plates look clickable, so
          they are clickable.
          ══════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute select-none hidden lg:block"
        style={{ right: "0%", top: "1%", width: "clamp(540px, 52vw, 760px)", height: "70%" }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="hero-current-depth" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.1" stdDeviation="1.1" floodColor="#0A0A0A" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Ghost trunk — the path exists before it is drawn */}
          <path d={TRUNK} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.07} />

          {/* The trunk — one founder, one creative practice */}
          <motion.path
            d={TRUNK}
            fill="none"
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#hero-current-depth)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.88 }}
            transition={{ duration: TRUNK_DURATION, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Five threads, ending on each plate's draped position */}
          {ARMS.map((t, i) => {
            const endY = 96 + t.drape;
            const dim = activeArm !== null && activeArm !== t.label;
            return (
              <motion.path
                key={t.color}
                d={`M ${FORK.x},${FORK.y} Q ${(FORK.x + t.x) / 2},${(FORK.y + endY) / 2 + 6} ${t.x},${endY}`}
                fill="none"
                stroke={t.color}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                filter="url(#hero-current-depth)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: dim ? 0.28 : 0.95, strokeWidth: activeArm === t.label ? 4 : 2.5 }}
                transition={{
                  pathLength: { duration: d(0.62), delay: TRUNK_DURATION + d(i * 0.09), ease: "easeOut" as const },
                  opacity: { duration: 0.3 },
                  strokeWidth: { duration: 0.3 },
                }}
              />
            );
          })}

          {/* The ∧ from the wordmark, marking where the brand divides */}
          <motion.path
            d={`M ${FORK.x - 3.4},${FORK.y + 2.4} L ${FORK.x},${FORK.y - 2.2} L ${FORK.x + 3.4},${FORK.y + 2.4}`}
            fill="none"
            stroke={GOLD_INK}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: TRUNK_DURATION - d(0.1), type: "spring" as const, stiffness: 300, damping: 16 }}
            style={{ transformOrigin: `${FORK.x}px ${FORK.y}px` }}
          />
        </svg>

        {/* Plate layer — real links, real states */}
        {ARMS.map((t, i) => {
          const isActive = activeArm === t.label;
          const dim = activeArm !== null && !isActive;
          return (
            <motion.a
              key={`plate-${t.label}`}
              href={`#${t.target}`}
              onClick={scrollTo(t.target)}
              aria-label={`${t.label} — ${t.tag}. Jump to section.`}
              className="absolute flex flex-col items-center"
              style={{
                left: `${t.x}%`,
                top: `${96 + t.drape}%`,
                gap: 9,
                translate: "-50% 0",
                textDecoration: "none",
                zIndex: isActive ? 3 : 2,
              }}
              onMouseEnter={() => setActiveArm(t.label)}
              onMouseLeave={() => setActiveArm(null)}
              onFocus={() => setActiveArm(t.label)}
              onBlur={() => setActiveArm(null)}
              initial={{ opacity: 0, y: 16, scale: 0.86, rotate: t.rotate }}
              animate={{
                opacity: dim ? 0.45 : 1,
                y: isActive ? -8 : 0,
                scale: isActive ? 1.09 : 1,
                rotate: isActive ? 0 : t.rotate,
              }}
              transition={{
                default: { type: "spring" as const, stiffness: 300, damping: 22, delay: TRUNK_DURATION + d(i * 0.09) + d(0.3) },
                y: { type: "spring" as const, stiffness: 400, damping: 26 },
                scale: { type: "spring" as const, stiffness: 400, damping: 26 },
                rotate: { type: "spring" as const, stiffness: 400, damping: 26 },
                opacity: { duration: 0.3 },
              }}
            >
              <div
                className="overflow-hidden flex items-center justify-center"
                style={{
                  width: "clamp(60px, 6.2vw, 88px)",
                  height: "clamp(60px, 6.2vw, 88px)",
                  borderRadius: 11,
                  border: `2px solid ${PAPER}`,
                  /* Contact shadow grounds the plate, ambient shadow gives it air */
                  boxShadow: isActive
                    ? `0 3px 6px rgba(10,10,10,0.12), 0 20px 44px rgba(10,10,10,0.22), 0 0 0 1px ${t.color}`
                    : `0 2px 4px rgba(10,10,10,0.10), 0 12px 30px rgba(10,10,10,0.14), 0 0 0 1px ${t.color}55`,
                  background: t.image ? "#fff" : `${t.color}12`,
                  transition: "box-shadow 0.3s ease",
                }}
              >
                {t.image ? (
                  <img
                    src={t.image}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="eager"
                    style={{
                      filter: isActive ? "saturate(1.05)" : "saturate(0.88)",
                      transition: "filter 0.3s ease, transform 0.4s ease",
                      transform: isActive ? "scale(1.06)" : "scale(1)",
                    }}
                  />
                ) : t.Icon ? (
                  <t.Icon size={27} color={t.color} strokeWidth={1.75} />
                ) : null}
              </div>

              <div className="flex flex-col items-center" style={{ gap: 2 }}>
                <span
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 9.5,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: t.color,
                    background: PAPER,
                    padding: "2px 8px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 3px rgba(10,10,10,0.07)",
                  }}
                >
                  {t.label}
                </span>
                {/* The discipline, revealed on approach */}
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -3 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 8.5,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    color: "rgba(10,10,10,0.5)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.tag}
                </motion.span>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* ── Content column ── */}
      <div className="relative w-full mx-auto" style={{ maxWidth: 1180, zIndex: 1 }}>
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left" style={{ maxWidth: 640, gap: "clamp(18px, 2.2vw, 26px)" }}>
          {/* Masthead. The wordmark is a hairline-outline asset, so scale alone
              leaves it faint — three stacked zero-offset shadows in its own ink
              dilate the strokes so it holds against the headline below. */}
          <motion.div
            className="flex flex-col items-center lg:items-start"
            style={{ gap: 12 }}
            initial={{ opacity: 0, y: d(6) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.7), ease: "easeOut" as const }}
          >
            <h1 className="m-0" style={{ lineHeight: 1 }}>
              <span className="sr-only">Viera Amber</span>
              <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{
                  width: "clamp(178px, 17vw, 268px)",
                  height: "auto",
                  display: "block",
                  filter:
                    "brightness(0) drop-shadow(0 0 0.55px #0A0A0A) drop-shadow(0 0 0.55px #0A0A0A) drop-shadow(0 0 0.55px #0A0A0A)",
                }}
              />
            </h1>
            <div className="flex items-center" style={{ gap: 12 }}>
              <div style={{ width: 26, height: 1, background: `${INK}40` }} aria-hidden="true" />
              {/* At 11px this needs 4.5:1, which no gold in the palette reaches
                  on paper — ink at 62% clears it and reads quieter. */}
              <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(10,10,10,0.62)", fontWeight: 600 }}>
                Est. 2013
              </span>
            </div>
          </motion.div>

          {/* Display ceiling 96px; tracking -0.035em sits just inside the
              -0.04em floor, where Playfair's italic closes up without
              colliding. The full stop carries the brand's gold. */}
          <motion.p
            className="font-display m-0"
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: d(1), delay: d(0.15), ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(42px, 6.4vw, 96px)",
              fontWeight: 700,
              fontStyle: "italic",
              color: INK,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              textWrap: "balance",
            }}
          >
            For her, by her<span style={{ color: GOLD_INK }}>.</span>
          </motion.p>

          <motion.p
            className="m-0"
            initial={{ opacity: 0, y: d(8) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.7), delay: d(0.55) }}
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 16,
              color: "rgba(10,10,10,0.64)",
              maxWidth: 440,
              lineHeight: 1.85,
            }}
          >
            A creative ecosystem built for feminine empowerment.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: d(0.6), delay: d(0.7), ease: "easeOut" as const }}
            style={{ width: 44, height: 1.5, backgroundColor: GOLD_INK, transformOrigin: "left center" }}
            aria-hidden="true"
          />

          <motion.div
            className="flex flex-wrap items-center justify-center lg:justify-start"
            style={{ gap: 22, marginTop: 4 }}
            initial={{ opacity: 0, y: d(8) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.6), delay: d(0.82) }}
          >
            <a
              href="#ecosystem"
              onClick={scrollTo("ecosystem")}
              className="inline-flex items-center"
              style={{
                gap: 8,
                minHeight: 48,
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: PAPER,
                background: INK,
                borderRadius: 999,
                padding: "14px 32px",
                textDecoration: "none",
                boxShadow: `0 14px 34px ${GOLD}45`,
              }}
            >
              Explore the ecosystem ↓
            </a>
            {/* The underline lives on an inner span so the link can carry a
                44px touch target without an oversized visible rule. */}
            <a
              href="#founder"
              onClick={scrollTo("founder")}
              className="inline-flex items-center"
              style={{
                minHeight: 44,
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: INK,
                textDecoration: "none",
              }}
            >
              <span style={{ borderBottom: `1px solid ${INK}40`, paddingBottom: 2 }}>
                Meet the founder →
              </span>
            </a>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════
              THE CURRENT — mobile. Not the desktop graphic shrunk: re-cut
              for a portrait screen, so phone visitors get the same idea
              rather than a bare gradient. Five equal flex columns centre on
              10/30/50/70/90%, exactly where the threads terminate.
              ══════════════════════════════════════════════════════════════ */}
          <motion.div
            className="lg:hidden w-full"
            style={{ marginTop: 30, maxWidth: 340 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: d(0.5), delay: d(0.9) }}
          >
            <svg aria-hidden="true" viewBox="0 0 100 34" preserveAspectRatio="none" className="w-full" style={{ height: 62, display: "block" }}>
              <motion.path
                d="M 50,0 L 50,11"
                fill="none"
                stroke={INK}
                strokeWidth={2.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: d(0.5), delay: d(1.0) }}
              />
              <motion.path
                d="M 46.5,15 L 50,10.5 L 53.5,15"
                fill="none"
                stroke={GOLD_INK}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: d(1.3), type: "spring" as const, stiffness: 300, damping: 16 }}
                style={{ transformOrigin: "50px 13px" }}
              />
              {ARMS.map((t, i) => (
                <motion.path
                  key={`m-${t.color}`}
                  d={`M 50,14 Q ${(50 + t.x) / 2},26 ${t.x},34`}
                  fill="none"
                  stroke={t.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: d(0.5), delay: d(1.35 + i * 0.07), ease: "easeOut" as const }}
                />
              ))}
            </svg>

            <div className="flex items-start justify-between w-full">
              {ARMS.map((t, i) => (
                <motion.a
                  key={`m-plate-${t.label}`}
                  href={`#${t.target}`}
                  onClick={scrollTo(t.target)}
                  aria-label={`${t.label} — ${t.tag}. Jump to section.`}
                  className="flex flex-col items-center"
                  style={{
                    flex: "1 1 0",
                    gap: 5,
                    textDecoration: "none",
                    minHeight: 44,
                    WebkitTapHighlightColor: "transparent",
                  }}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: d(1.5 + i * 0.07), type: "spring" as const, stiffness: 320, damping: 22 }}
                >
                  <div
                    className="overflow-hidden flex items-center justify-center"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 9,
                      border: `2px solid ${PAPER}`,
                      boxShadow: `0 2px 4px rgba(10,10,10,0.10), 0 8px 20px rgba(10,10,10,0.13), 0 0 0 1px ${t.color}55`,
                      background: t.image ? "#fff" : `${t.color}12`,
                    }}
                  >
                    {t.image ? (
                      <img src={t.image} alt="" className="w-full h-full object-cover" draggable={false} />
                    ) : t.Icon ? (
                      <t.Icon size={21} color={t.color} strokeWidth={1.9} />
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 8.5,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: t.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.label}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
