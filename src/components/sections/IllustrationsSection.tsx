import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  staggerContainerSlow,
  cardItem,
  overlayFade,
  fadeIn,
  fadeSlideUp,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Artwork {
  id: string;
  title: string;
  tag: string;
  story: string;
  bg: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ARTWORKS: Artwork[] = [
  {
    id: "hatmaker",
    title: "The Hatmaker",
    tag: "Wearable Confidence",
    story:
      "She chose the hat before she chose the room. This is a woman who decided long ago that presence was not something you asked for — it was something you wore.",
    bg: "#1A1A1A",
  },
  {
    id: "circuit-bloom",
    title: "Circuit Bloom",
    tag: "Tech & Femininity",
    story:
      "Where technology meets tenderness. She moves through data and dusk with equal grace — magenta against the architecture of her own mind.",
    bg: "#0D0D0D",
  },
  {
    id: "barbie-lagos",
    title: "Barbie in Lagos",
    tag: "Cultural Identity",
    story:
      "Pink does not mean soft. In her hands, it means unbothered, unapologetic, and absolutely unforgettable. Afro wide. Chin up. Arriving.",
    bg: "#111111",
  },
  {
    id: "ancestors-gown",
    title: "The Ancestor's Gown",
    tag: "Heritage",
    story:
      "The fabric remembers what history tried to erase. She wears her lineage as evening wear — and the room goes quiet.",
    bg: "#161616",
  },
];

// ─── Artwork Card ─────────────────────────────────────────────────────────────
const ArtworkCard = ({ artwork }: { artwork: Artwork }) => {
  const reduced = useReducedMotion();
  const overlayVariants = useReducedVariants(overlayFade);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <motion.article
      variants={cardItem}
      role="article"
      aria-label={artwork.title}
      className="relative overflow-hidden cursor-pointer"
      style={{
        backgroundColor: artwork.bg,
        borderRadius: 2,
        aspectRatio: "3 / 4",
      }}
      whileHover={reduced ? {} : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      initial="rest"
      whileHover-parent="hover"
    >
      {/* Tag — always visible */}
      <div
        className="absolute top-4 left-4 z-20"
        style={{
          border: "1px solid #C8A96E",
          color: "#C8A96E",
          borderRadius: 999,
          padding: "3px 10px",
          fontSize: 8,
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontWeight: 400,
          opacity: 0.65,
        }}
        aria-hidden="true"
      >
        {artwork.tag}
      </div>

      {/* Title — always visible bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        <p
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            fontStyle: "italic",
            fontSize: 15,
            color: "rgba(250,250,250,0.7)",
            margin: 0,
          }}
        >
          {artwork.title}
        </p>
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-end p-5"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }}
        variants={overlayVariants}
        initial="rest"
        whileHover="hover"
        // Re-trigger from parent card hover
      >
        {/* Tag on overlay */}
        <span
          style={{
            display: "inline-block",
            border: "1px solid #C8A96E",
            color: "#C8A96E",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 8,
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontFamily: "DM Sans, system-ui, sans-serif",
            marginBottom: 12,
            alignSelf: "flex-start",
          }}
        >
          {artwork.tag}
        </span>

        {/* Story — always in DOM for screen readers */}
        <p
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 13,
            color: "#FAFAFA",
            lineHeight: 1.65,
            marginBottom: 10,
            margin: "0 0 10px 0",
          }}
        >
          {artwork.story}
        </p>

        <button
          type="button"
          onClick={() => scrollTo("contact")}
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: 11,
            color: "#C8A96E",
            letterSpacing: "1px",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Commission this piece →
        </button>
      </motion.div>
    </motion.article>
  );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const IllustrationsSection = () => {
  const reduced = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, inViewProps);
  const gridInView = useInView(gridRef, inViewProps);
  const bottomInView = useInView(bottomRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const gridVariants = useReducedVariants(staggerContainerSlow);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      style={{ backgroundColor: "#000000" }}
      className="w-full py-20"
    >
      <div
        className="mx-auto px-6"
        style={{ maxWidth: 1100 }}
      >
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
              color: "#C8A96E",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Illustrations & Designs
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
            Art that wears itself.
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
              color: "#888888",
              maxWidth: 520,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Every piece begins with a woman — her confidence, her defiance, her
            joy. We illustrate what she already knows about herself.
          </motion.p>
        </div>

        {/* ── Portfolio Grid ───────────────────────────────────────── */}
        <motion.div
          ref={gridRef}
          variants={gridVariants}
          initial="hidden"
          animate={gridInView ? "visible" : "hidden"}
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          {ARTWORKS.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </motion.div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <motion.div
          ref={bottomRef}
          variants={fadeVariants}
          initial="hidden"
          animate={bottomInView ? "visible" : "hidden"}
          className="flex flex-col items-center mt-14"
          style={{ gap: 16 }}
        >
          <div
            aria-hidden="true"
            style={{ width: 48, height: 1, backgroundColor: "#C8A96E" }}
          />

          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 13,
              color: "#888888",
              margin: 0,
            }}
          >
            50+ illustrations available for commission and licensing
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
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
                fontWeight: 500,
                backgroundColor: "#C8A96E",
                color: "#0A0A0A",
                border: "none",
                borderRadius: 2,
                padding: "11px 28px",
                cursor: "pointer",
              }}
            >
              Commission a Piece
            </motion.button>

            <motion.button
              type="button"
              onClick={() => scrollTo("contact")}
              whileHover={reduced ? {} : { opacity: 0.75 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 400,
                backgroundColor: "transparent",
                color: "#C8A96E",
                border: "1px solid #C8A96E",
                borderRadius: 2,
                padding: "11px 28px",
                cursor: "pointer",
              }}
            >
              View Full Portfolio →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IllustrationsSection;
