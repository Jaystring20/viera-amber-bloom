import { useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { GraduationCap, ShoppingBag } from "lucide-react";
import logoSrc from "@/assets/viera-amber-logo.png";

/* ════════════════════════════════════════════════════════════════════════
   HERO LAB — temporary comparison page. NOT linked in nav, NOT the live
   Hero. Route: /hero-lab. Delete this file once a direction is chosen
   and folded into HeroSection.tsx.

   Four image-free Hero directions, each keeping the established brand
   system (Ink #0A0A0A / Paper #FAFAFA, Playfair Display + DM Sans) fixed
   and varying structure + a single muted accent per the "wide net" method:
   generate several real candidates, compare on one screen, then converge.

   Guardrails held across all four: no purple gradients, no Inter/system
   font, no forced dark-crush filters, no card-grid/hero-metric template,
   no gradient text, no glass-as-decoration, no hard offset shadows, no
   emoji icons, no loud/saturated color blocks — see impeccable craft-floor.
   ════════════════════════════════════════════════════════════════════════ */

const INK = "#0A0A0A";
const PAPER = "#FAFAFA";

const LabTag = ({ label }: { label: string }) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      top: 20,
      left: 20,
      zIndex: 20,
      fontFamily: "DM Sans, system-ui, sans-serif",
      fontSize: 10,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 600,
      color: INK,
      background: "rgba(255,255,255,0.82)",
      border: `1px solid ${INK}22`,
      borderRadius: 4,
      padding: "5px 10px",
    }}
  >
    Review only — {label}
  </div>
);

/* ─────────────────────────── V1 — Editorial Ink ──────────────────────────
   Pure typographic hero. One authored motion: the headline reveals through
   a clip-path wipe (not the site's usual fade+y stagger) — a distinct
   signature for this direction. Restrained color strategy: Warm Grey only. */
const GREY = "#78716C";

const EditorialInk = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative w-full min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: PAPER }}
    >
      <LabTag label="1 · Editorial Ink · Warm Grey" />
      <div className="flex flex-col items-center text-center" style={{ maxWidth: 760, gap: "clamp(18px, 2.4vw, 30px)" }}>
        <motion.h1
          className="font-display m-0"
          initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
          animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(44px, 8.5vw, 128px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: INK,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
          }}
        >
          For her, by her.
        </motion.h1>
        <motion.p
          className="m-0"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.5 }}
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(14px, 1.5vw, 18px)",
            color: "rgba(10,10,10,0.6)",
            maxWidth: 480,
            lineHeight: 1.8,
          }}
        >
          A creative ecosystem built for feminine empowerment.
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.7, ease: "easeOut" as const }}
          style={{ width: 56, height: 1, backgroundColor: GREY, transformOrigin: "center" }}
        />
        <motion.a
          href="#ecosystem"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.85 }}
          className="inline-flex items-center"
          style={{
            gap: 8,
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: INK,
            textDecoration: "none",
            borderBottom: `1px solid ${INK}55`,
            paddingBottom: 2,
          }}
        >
          Explore the ecosystem →
        </motion.a>
      </div>

      {/* Byline, not an eyebrow — quiet corner colophon */}
      <p
        className="absolute"
        style={{
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: `${GREY}99`,
        }}
      >
        Viera Amber · Est. 2013
      </p>
    </div>
  );
};

/* ─────────────────────────── V2 — The Current ─────────────────────────────
   Fused pass, built from the dual critique (see /impeccable critique):
   the layered warm field is real craft but was pure mood — nothing tied it
   to Viera Amber specifically, and it shared zero visual language with the
   Ecosystem section's serpentine 5-arm connector directly below it. This
   version keeps the field's depth but gives it a mechanism: a single ink
   line — one founder, one creative practice — descends through the field
   and forks into five thin colored threads (the exact five arm accents
   from EcosystemSection's BRAND_COLORS, same left-to-right order), each
   ending in a small dot that previews the nodes waiting below. The old
   oversized logo watermark is removed — it was generic AND, per the
   detector agent, silently broken (opacity stuck at 0). This replaces a
   weak decorative device with a specific, working one. */
const GOLD = "#C8A96E";      // Champagne — field wash only; 2.15:1 on paper,
                             // never used for text or a load-bearing mark.
const GOLD_INK = "#D97706";  // Warm gold — the accent that touches type and
                             // linework. 3.05:1 on paper, clears AA for large
                             // text, and it is the Illustrations arm colour:
                             // the art practice everything else grew out of.

/* The fork point — where one current becomes five. Shared by the SVG threads
   and the card layer so they stay locked together in one coordinate space. */
const FORK = { x: 68, y: 82 };

/* `drape` hangs each card lower the further its thread travels from the fork,
   the way a real thread sags under its own weight. Physical, not arbitrary —
   it's what stops the fan reading as a flat, evenly-spaced diagram. */
const ARM_THREADS = [
  { color: "#D97706", x: 10, drape: 9, label: "Illustrations", tag: "Art",       href: "#illustrations", image: "/artworks/artwork_0022.webp",     rotate: -6 },
  { color: "#62017F", x: 30, drape: 5, label: "VAGIN",         tag: "Impact",    href: "#vagin",         image: "/vagin-images/vagin_team_01.webp", rotate: 4 },
  { color: "#6E0025", x: 50, drape: 2, label: "VIVA",          tag: "Fashion",   href: "#viva",          image: "/viva/hero-left.webp",            rotate: -3 },
  { color: "#888888", x: 70, drape: 0, label: "VAM",           tag: "Education", href: "#vam",           Icon: GraduationCap,                      rotate: 5 },
  { color: "#0B7B8C", x: 90, drape: 3, label: "VASH",          tag: "Commerce",  href: "#shop",          Icon: ShoppingBag,                        rotate: -4 },
];

const AmberField = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [activeArm, setActiveArm] = useState<string | null>(null);
  const TRUNK_DURATION = reduced ? 0 : 1.3;

  return (
    <div
      ref={ref}
      className="relative w-full min-h-dvh flex items-center overflow-hidden px-6 lg:px-16"
      style={{ backgroundColor: PAPER }}
    >
      <LabTag label="2 · The Current · fused from critique" />

      {/* ── Layered field: base wash + offset highlight drifting independently ── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        initial={{ scale: 1 }}
        animate={reduced ? {} : { scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" as const }}
        style={{
          background: `radial-gradient(ellipse 62% 70% at 22% 42%, ${GOLD}42 0%, ${GOLD}1c 45%, transparent 74%)`,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        initial={{ x: 0, y: 0 }}
        animate={reduced ? {} : { x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" as const }}
        style={{
          background: `radial-gradient(ellipse 46% 50% at 78% 30%, #E8D2A855 0%, transparent 68%)`,
        }}
      />
      {/* Vignette — deepens the corners just enough to give the field body */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(10,10,10,0.05) 100%)`,
        }}
      />
      {/* Fine grain — tactile, not decorative-shiny */}
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
          THE CURRENT — one line, five real doors into the ecosystem.
          Desktop only: five tilted plates need room, and on a phone this
          becomes clutter rather than an idea.

          Two stacked layers, deliberately separated:
            1. SVG (decorative, aria-hidden, pointer-events-none) — trunk,
               threads, and the ∧ vertex.
            2. Card layer (real anchors, focusable, keyboard-operable) —
               these LOOK clickable, so they must BE clickable. Previously
               they were inert inside an aria-hidden wrapper: an affordance
               that lied, and invisible to screen readers.
          Both share one 0–100 coordinate space so a thread always lands
          exactly on its plate.
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
          {/* Cast shadow under the trunk — offset + blur, so the current sits
              ABOVE the field rather than being printed flat onto it. */}
          <defs>
            <filter id="current-depth" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.1" stdDeviation="1.1" floodColor="#0A0A0A" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Ghost trunk — the path already exists before it is drawn */}
          <path
            d={`M 18,0 C 44,0 26,34 52,40 C 70,44 58,72 ${FORK.x},${FORK.y}`}
            fill="none"
            stroke={INK}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.07}
          />

          {/* The trunk — one founder, one creative practice */}
          <motion.path
            d={`M 18,0 C 44,0 26,34 52,40 C 70,44 58,72 ${FORK.x},${FORK.y}`}
            fill="none"
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#current-depth)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 0.88 } : {}}
            transition={{ duration: TRUNK_DURATION, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Five threads. Each ends on its plate's draped position, so the
              fan sags like real thread instead of reading as a flat diagram.
              Hovering a plate lifts its own thread and recedes the others. */}
          {ARM_THREADS.map((t, i) => {
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
                filter="url(#current-depth)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  inView
                    ? { pathLength: 1, opacity: dim ? 0.28 : 0.95, strokeWidth: activeArm === t.label ? 4 : 2.5 }
                    : {}
                }
                transition={{
                  pathLength: { duration: reduced ? 0 : 0.62, delay: reduced ? 0 : TRUNK_DURATION + i * 0.09, ease: "easeOut" as const },
                  opacity: { duration: 0.3 },
                  strokeWidth: { duration: 0.3 },
                }}
              />
            );
          })}

          {/* The vertex — the ∧ from the VIERA∧AMBER wordmark, sitting exactly
              where one current becomes five. The brand's own mark marking the
              moment the brand divides. */}
          <motion.path
            d={`M ${FORK.x - 3.4},${FORK.y + 2.4} L ${FORK.x},${FORK.y - 2.2} L ${FORK.x + 3.4},${FORK.y + 2.4}`}
            fill="none"
            stroke={GOLD_INK}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              delay: reduced ? 0 : TRUNK_DURATION - 0.1,
              type: "spring" as const,
              stiffness: 300,
              damping: 16,
            }}
            style={{ transformOrigin: `${FORK.x}px ${FORK.y}px` }}
          />
        </svg>

        {/* ── Plate layer — real links, real states ── */}
        {ARM_THREADS.map((t, i) => {
          const isActive = activeArm === t.label;
          const dim = activeArm !== null && !isActive;
          return (
            <motion.a
              key={`plate-${t.label}`}
              href={t.href}
              aria-label={`${t.label} — ${t.tag}. Jump to section.`}
              className="absolute flex flex-col items-center group"
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
              animate={
                inView
                  ? {
                      opacity: dim ? 0.45 : 1,
                      y: isActive ? -8 : 0,
                      scale: isActive ? 1.09 : 1,
                      rotate: isActive ? 0 : t.rotate,
                    }
                  : {}
              }
              transition={{
                opacity: { duration: 0.3, delay: inView && !isActive && activeArm === null ? (reduced ? 0 : TRUNK_DURATION + i * 0.09 + 0.3) : 0 },
                default: { type: "spring" as const, stiffness: 300, damping: 22, delay: reduced ? 0 : TRUNK_DURATION + i * 0.09 + 0.3 },
                y: { type: "spring" as const, stiffness: 400, damping: 26 },
                scale: { type: "spring" as const, stiffness: 400, damping: 26 },
                rotate: { type: "spring" as const, stiffness: 400, damping: 26 },
              }}
            >
              <div
                className="overflow-hidden flex items-center justify-center"
                style={{
                  width: "clamp(60px, 6.2vw, 88px)",
                  height: "clamp(60px, 6.2vw, 88px)",
                  borderRadius: 11,
                  border: `2px solid ${PAPER}`,
                  /* Two-part elevation: a tight contact shadow that grounds
                     the plate, plus a wide ambient one that gives it air. */
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
                    style={{
                      /* Unhovered plates sit a half-step back in saturation,
                         so the hovered one comes forward in depth, not just
                         in size. */
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
                {/* The discipline, revealed on approach — detail that rewards
                    attention without crowding the resting state. */}
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

      {/* ── Content — asymmetric, left-anchored within the frame ── */}
      <div className="relative w-full mx-auto" style={{ maxWidth: 1180, zIndex: 1 }}>
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left" style={{ maxWidth: 640, gap: "clamp(18px, 2.2vw, 26px)" }}>
          {/* ── Masthead ──────────────────────────────────────────────────
              The wordmark is a hairline-outline asset, so at small sizes it
              dissolves into the warm field. Two levers fix that without
              touching the artwork: real scale, and three stacked zero-offset
              drop-shadows in its own ink — each pass dilates the glyph edge
              by a fraction of a pixel, so the thin strokes gain weight and
              hold their own against the 96px headline below.
              The date drops to its own line so the mark is never crowded. */}
          <motion.div
            className="flex flex-col items-center lg:items-start"
            style={{ gap: 12 }}
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reduced ? 0 : 0.7, ease: "easeOut" as const }}
          >
            <img
              src={logoSrc}
              alt="Viera Amber"
              style={{
                width: "clamp(178px, 17vw, 268px)",
                height: "auto",
                filter:
                  "brightness(0) drop-shadow(0 0 0.55px #0A0A0A) drop-shadow(0 0 0.55px #0A0A0A) drop-shadow(0 0 0.55px #0A0A0A)",
              }}
              draggable={false}
            />
            <div className="flex items-center" style={{ gap: 12 }}>
              <div style={{ width: 26, height: 1, background: `${INK}40` }} aria-hidden="true" />
              {/* Colophon, not an accent: at 11px this needs 4.5:1, which no
                  gold in the palette reaches on paper. Ink at 62% clears it
                  and reads quieter — a masthead date should not compete. */}
              <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(10,10,10,0.62)", fontWeight: 600 }}>
                Est. 2013
              </span>
            </div>
          </motion.div>

          {/* Dominant headline — display ceiling is 96px (6rem) per craft
              floor; tracking sits at -0.035em, just inside the -0.04em floor,
              which is where Playfair's italic closes up without colliding.
              The full stop is gold: the smallest possible carrier of the
              brand's own colour, and the same device used in Quiet Type. */}
          <motion.h1
            className="font-display m-0"
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
            transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
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
          </motion.h1>

          <motion.p
            className="m-0"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.55 }}
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
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.7, ease: "easeOut" as const }}
            style={{ width: 44, height: 1.5, backgroundColor: GOLD_INK, transformOrigin: "left center" }}
          />

          {/* Dual CTA — primary pill with a warm soft shadow, quiet secondary link */}
          <motion.div
            className="flex flex-wrap items-center justify-center lg:justify-start"
            style={{ gap: 22, marginTop: 4 }}
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.82 }}
          >
            <a
              href="#ecosystem"
              className="inline-flex items-center"
              style={{
                gap: 8,
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
            {/* Secondary CTA. The underline is drawn as a border on an inner
                span so the link itself can carry a 44px touch target without
                a visibly oversized rule — the target grows, the ink does not. */}
            <a
              href="#founder"
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
              THE CURRENT — mobile.

              The desktop fan is hidden below lg, which previously meant the
              entire mechanism — the one idea the Hero exists to carry — was
              display:none for phone visitors, while 58% of their viewport sat
              empty. That is backwards for this audience.

              This is not the desktop graphic shrunk. It is re-cut for a
              portrait screen: the current runs straight down, forks at the
              same ∧, and lands on five 52px plates in a single thumb-width
              row. Five equal flex columns centre on 10/30/50/70/90%, which is
              exactly where the SVG threads terminate, so the two layers stay
              locked without any magic numbers.
              ══════════════════════════════════════════════════════════════ */}
          <motion.div
            className="lg:hidden w-full"
            style={{ marginTop: 30, maxWidth: 340 }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.9 }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 34"
              preserveAspectRatio="none"
              className="w-full"
              style={{ height: 62, display: "block" }}
            >
              <motion.path
                d="M 50,0 L 50,11"
                fill="none"
                stroke={INK}
                strokeWidth={2.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 0.85 } : {}}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 1.0 }}
              />
              {/* The same ∧ that marks the fork on desktop */}
              <motion.path
                d="M 46.5,15 L 50,10.5 L 53.5,15"
                fill="none"
                stroke={GOLD_INK}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: reduced ? 0 : 1.3, type: "spring" as const, stiffness: 300, damping: 16 }}
                style={{ transformOrigin: "50px 13px" }}
              />
              {ARM_THREADS.map((t, i) => (
                <motion.path
                  key={`m-${t.color}`}
                  d={`M 50,14 Q ${(50 + t.x) / 2},26 ${t.x},34`}
                  fill="none"
                  stroke={t.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: 0.9 } : {}}
                  transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 1.35 + i * 0.07, ease: "easeOut" as const }}
                />
              ))}
            </svg>

            <div className="flex items-start justify-between w-full">
              {ARM_THREADS.map((t, i) => (
                <motion.a
                  key={`m-plate-${t.label}`}
                  href={t.href}
                  aria-label={`${t.label} — ${t.tag}. Jump to section.`}
                  className="flex flex-col items-center"
                  style={{
                    flex: "1 1 0",
                    gap: 5,
                    textDecoration: "none",
                    /* Full 44px target height even though the plate reads 52px
                       wide — the whole column is tappable. */
                    minHeight: 44,
                    WebkitTapHighlightColor: "transparent",
                  }}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    delay: reduced ? 0 : 1.5 + i * 0.07,
                    type: "spring" as const,
                    stiffness: 320,
                    damping: 22,
                  }}
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

/* ─────────────────────────── V3 — Serpentine Mark ─────────────────────────
   A single authored SVG curve, drawn on load (stroke-dashoffset), echoes
   the connector already used in EcosystemSection — ties the two sections
   together visually. Restrained color strategy: Taupe only. */
const TAUPE = "#C0B5A0";

const SerpentineMark = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative w-full min-h-dvh flex items-center overflow-hidden px-6 lg:px-16"
      style={{ backgroundColor: PAPER }}
    >
      <LabTag label="3 · Serpentine Mark · Taupe" />

      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <motion.path
          d="M -50 620 C 250 720, 380 380, 650 420 S 1050 200, 1260 260"
          fill="none"
          stroke={TAUPE}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 0.55 } : {}}
          transition={{ duration: reduced ? 0 : 1.8, ease: "easeInOut" as const }}
        />
      </svg>

      <div className="relative w-full mx-auto" style={{ maxWidth: 1180, zIndex: 1 }}>
        <div className="flex flex-col items-start" style={{ maxWidth: 560, gap: "clamp(16px, 2vw, 24px)" }}>
          <motion.p
            className="m-0"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: reduced ? 0 : 0.6 }}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: `${TAUPE}` , fontWeight: 600 }}
          >
            Est. 2013
          </motion.p>
          <motion.h1
            className="font-display m-0"
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.15, ease: "easeOut" as const }}
            style={{ fontSize: "clamp(36px, 5.5vw, 76px)", fontWeight: 800, fontStyle: "italic", color: INK, lineHeight: 1.02, letterSpacing: "-0.02em" }}
          >
            For her, by her.
          </motion.h1>
          <motion.p
            className="m-0"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.35 }}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(10,10,10,0.65)", lineHeight: 1.85, maxWidth: 440 }}
          >
            A creative ecosystem built for feminine empowerment — the same
            current that carries into every arm below.
          </motion.p>
          <motion.a
            href="#ecosystem"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.55 }}
            className="inline-flex items-center"
            style={{
              gap: 8,
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: INK,
              border: `1px solid ${INK}`,
              borderRadius: 999,
              padding: "13px 28px",
              textDecoration: "none",
            }}
          >
            Follow the current ↓
          </motion.a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── V4 — Quiet Type ──────────────────────────────
   Maximum restraint. Wordmark, tagline, one hairline, one small gold dot
   standing in as the sentence's own full stop — the only color in the
   frame. Motion: a single slow fade, deliberately unhurried. */
const QuietType = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative w-full min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: PAPER }}
    >
      <LabTag label="4 · Quiet Type · Grey + one gold mark" />
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: reduced ? 0 : 1.3, ease: "easeOut" as const }}
        style={{ gap: "clamp(20px, 2.6vw, 32px)" }}
      >
        <img
          src={logoSrc}
          alt="Viera Amber"
          style={{ width: "clamp(150px, 20vw, 300px)", height: "auto", filter: "brightness(0)" }}
          draggable={false}
        />
        <div style={{ width: 32, height: 1, backgroundColor: `${GREY}66` }} aria-hidden="true" />
        <p
          className="font-display m-0"
          style={{
            fontSize: "clamp(18px, 2.2vw, 26px)",
            fontStyle: "italic",
            fontWeight: 500,
            color: INK,
            letterSpacing: "-0.01em",
          }}
        >
          For her, by her
          <span aria-hidden="true" style={{ color: GOLD_INK }}>.</span>
        </p>
      </motion.div>
      <p
        className="absolute"
        style={{
          bottom: 24,
          margin: 0,
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: `${GREY}88`,
        }}
      >
        Est. 2013
      </p>
    </div>
  );
};

const HeroLab = () => {
  return (
    <div>
      <EditorialInk />
      <div style={{ height: 1, background: `${INK}14` }} />
      <AmberField />
      <div style={{ height: 1, background: `${INK}14` }} />
      <SerpentineMark />
      <div style={{ height: 1, background: `${INK}14` }} />
      <QuietType />
    </div>
  );
};

export default HeroLab;
