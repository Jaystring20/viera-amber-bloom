import { useReducedMotion, Variants } from "framer-motion";

// ─── Reduced-motion safe transition helper ───────────────────────────────────
// Usage: transition={{ duration: d(0.6), delay: d(0.2) }}
export const useMotionDuration = () => {
  const reduced = useReducedMotion();
  return (s: number) => (reduced ? 0 : s);
};

// ─── Shared scroll-trigger helper ────────────────────────────────────────────
export const inViewProps = { once: true, amount: 0.15 } as const;

// ─── Variants ────────────────────────────────────────────────────────────────

/** Fade + slide up — primary entrance for headings & body text */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/** Fade only — for sub-copy, labels, rules */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/** Scale reveal — for cards, images */
export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/** Stagger container — wrap around lists of cards */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Stagger container — slower stagger for large grids */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/** Card item — used as child of staggerContainer */
export const cardItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/** Scale X from left — for horizontal rule reveals */
export const scaleXRule: Variants = {
  hidden: { scaleX: 0, opacity: 1 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/** Overlay fade — for hover overlays on artwork cards */
export const overlayFade: Variants = {
  rest: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

/** Card hover lift — spring physics */
export const cardHover = {
  scale: 1.03,
  transition: { type: "spring" as const, stiffness: 300, damping: 22 },
};

/** Subtle card lift — for less dramatic hover */
export const cardHoverSubtle = {
  y: -3,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

// ─── Reduced-motion variant override ─────────────────────────────────────────
// Wraps any variant to zero-duration if prefers-reduced-motion is active.
// Usage in component: const variants = useReducedVariants(fadeSlideUp)
export const useReducedVariants = (variants: Variants): Variants => {
  const reduced = useReducedMotion();
  if (!reduced) return variants;
  // Override all transitions to instant
  const instant: Variants = {};
  for (const key of Object.keys(variants)) {
    const state = variants[key];
    if (typeof state === "object" && state !== null) {
      instant[key] = {
        ...(state as object),
        transition: { duration: 0 },
      };
    }
  }
  return instant;
};
