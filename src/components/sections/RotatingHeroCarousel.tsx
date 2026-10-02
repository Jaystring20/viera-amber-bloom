import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ILLUSTRATION_CATEGORIES, type IllustrationCategory } from "@/lib/illustration-categories";

export type HeroCategory = IllustrationCategory;
export const HERO_CATEGORIES: HeroCategory[] = ILLUSTRATION_CATEGORIES;

const SCROLL_WORDS = [
  "Couture",
  "Bridal",
  "Heritage",
  "Wearable",
  "Movement",
  "Story",
  "Artistry",
  "Soul",
  "Vision",
  "Craft",
  "Culture",
  "Expression",
];

const AUTOPLAY_MS = 3000;
const ACCENT = "#C2610A";


interface RotatingHeroCarouselProps {
  onCategorySelect?: (category: HeroCategory) => void;
}

export const RotatingHeroCarousel = ({ onCategorySelect }: RotatingHeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hoveringText, setHoveringText] = useState(false);
  const reduced = useReducedMotion();
  const count = HERO_CATEGORIES.length;
  const current = HERO_CATEGORIES[currentIndex];
  const playing = !reduced && !focused && !hoveringText;

  const goTo = (index: number) => setCurrentIndex((index + count) % count);

  // Every change (automatic or manual) waits a full 3s before the next advance,
  // so clicking an arrow never stops the slider and never double-skips.
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (!document.hidden) setCurrentIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [currentIndex, playing, count]);

  // Warm the next slide's image so the swap is instant.
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = `/artworks/${HERO_CATEGORIES[(currentIndex + 1) % count].image}`;
  }, [currentIndex, count]);

  const fade = reduced ? { duration: 0 } : { duration: 0.3 };
  const arrowClass =
    "flex h-12 w-12 items-center justify-center rounded-full border border-[#111] bg-white text-[#111] shadow-[0_6px_20px_rgba(17,17,17,0.14)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Illustration categories"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: `hsl(${current.hue} ${Math.min(current.sat, 55)}% 95%)`,
        transition: reduced ? "none" : "background-color 600ms ease",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="relative z-10">
        {/* Side arrows: at the edges of the slide area, in view without scrolling */}
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          aria-label="Previous category"
          className={`${arrowClass} absolute left-3 top-[34%] z-20 md:left-6 md:top-1/2 md:-translate-y-1/2`}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={() => goTo(currentIndex + 1)}
          aria-label="Next category"
          className={`${arrowClass} absolute right-3 top-[34%] z-20 md:right-6 md:top-1/2 md:-translate-y-1/2`}
        >
          <ChevronRight size={22} />
        </button>

        <div
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 pb-2 pt-10 md:min-h-[600px] md:grid-cols-[1fr_auto] md:gap-12 md:px-24"
          role="group"
          aria-roledescription="slide"
          aria-label={`${currentIndex + 1} of ${count}: ${current.name}`}
        >
          {/* Artwork: whole and sharp, never cropped or stretched */}
          <div className="relative flex items-center justify-center md:order-2">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: `hsl(${current.hue} ${Math.min(current.sat, 60)}% 86%)`,
                transition: reduced ? "none" : "background-color 600ms ease",
              }}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`img-${current.id}`}
                src={`/artworks/${current.image}`}
                alt={`${current.name} illustration`}
                width={600}
                height={800}
                decoding="async"
                {...{ fetchpriority: currentIndex === 0 ? "high" : "auto" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="relative h-auto w-auto max-w-full max-h-[46vh] object-contain md:max-h-[min(720px,76vh)] md:max-w-[40vw]"
                style={{
                  boxShadow: "0 30px 70px rgba(17,17,17,0.28), 0 3px 8px rgba(17,17,17,0.12)",
                  border: "12px solid #FFFFFF",
                }}
              />
            </AnimatePresence>
          </div>

          {/* Title block */}
          <div
            className="text-center md:order-1 md:text-left"
            onMouseEnter={() => setHoveringText(true)}
            onMouseLeave={() => setHoveringText(false)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`text-${current.id}`}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="flex flex-col items-center md:items-start"
              >
                <p
                  className="mb-5 text-xs font-semibold uppercase"
                  style={{ fontFamily: "Montserrat, system-ui, sans-serif", letterSpacing: "3px", color: ACCENT }}
                >
                  {current.umbrella === "fashion" ? "Fashion Illustration" : "Lifestyle Illustration"}
                </p>
                <h1
                  className="font-display max-w-[20ch] pb-1"
                  style={{
                    fontSize: "clamp(38px, 4.6vw, 64px)",
                    fontWeight: 700,
                    color: "#111111",
                    lineHeight: 1.05,
                    letterSpacing: "-1px",
                  }}
                >
                  {current.name}
                </h1>
                <button
                  type="button"
                  onClick={() => onCategorySelect?.(current)}
                  className="group mt-8 inline-flex min-h-[52px] items-center gap-3 whitespace-nowrap rounded-full bg-[#111] px-8 text-xs font-semibold uppercase tracking-[1.5px] text-white transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                  style={{ fontFamily: "Montserrat, system-ui, sans-serif", cursor: "pointer" }}
                >
                  Explore Collection
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots: the active one fills over 3s so the timing is visible */}
        <div className="flex items-center justify-center pb-4">
          {HERO_CATEGORIES.map((c, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Go to ${c.name}`}
                aria-current={active}
                className="flex h-11 items-center justify-center px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#111]"
                style={{ cursor: "pointer", background: "none", border: "none" }}
              >
                <span
                  className="relative block h-2 overflow-hidden rounded"
                  style={{
                    width: active ? 36 : 8,
                    background: "rgba(17,17,17,0.22)",
                    transition: reduced ? "none" : "width 300ms",
                  }}
                >
                  {active && (
                    <motion.span
                      key={`fill-${currentIndex}-${playing}`}
                      className="absolute inset-0 origin-left rounded"
                      style={{ background: "#111111" }}
                      initial={{ scaleX: playing ? 0 : 1 }}
                      animate={{ scaleX: 1 }}
                      transition={playing ? { duration: AUTOPLAY_MS / 1000, ease: "linear" } : { duration: 0 }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Word scroll ticker */}
      <div
        aria-hidden="true"
        className="relative"
        style={{ backgroundColor: "#FFFFFF", padding: "24px 0", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB", overflow: "hidden" }}
      >
        <motion.div
          animate={reduced ? { x: 0 } : { x: [0, -2000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", gap: 32, whiteSpace: "nowrap", paddingLeft: 24 }}
        >
          {[...SCROLL_WORDS, ...SCROLL_WORDS].map((word, idx) => (
            <span
              key={idx}
              style={{
                fontFamily: "Montserrat, system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#111111",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {word} •
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default RotatingHeroCarousel;
