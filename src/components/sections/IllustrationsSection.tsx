import { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  fadeIn,
  fadeSlideUp,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";
import { CHAPTERS, ARTWORKS as ALL_ARTWORKS } from "@/lib/gallery-data";
import BrandFilm from "@/components/BrandFilm";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PreviewCard {
  id: string;
  title: string;
  chapter: string;
  story: string;
  image: string;
  tagline: string;
}

// ─── Data: Featured artworks carousel (expanded for richer preview) ─────────────
// Show multiple artworks from across chapters for more visual richness
const FEATURED_ARTWORKS = [
  // Muses: portraits with strong presence
  { id: "art-0024", artwork: ALL_ARTWORKS.find((a) => a.n === 24)! }, // The Hatmaker
  { id: "art-0064", artwork: ALL_ARTWORKS.find((a) => a.n === 64)! }, // Jacqueline

  // Atelier: fashion design mastery
  { id: "art-0036", artwork: ALL_ARTWORKS.find((a) => a.n === 36)! }, // The Ada-Set
  { id: "art-0038", artwork: ALL_ARTWORKS.find((a) => a.n === 38)! }, // The Ibari-Set

  // Lagos: iconic, witty product design
  { id: "art-0029", artwork: ALL_ARTWORKS.find((a) => a.n === 29)! }, // Danfo
  { id: "art-0030", artwork: ALL_ARTWORKS.find((a) => a.n === 30)! }, // Last Bus to Oshodi

  // Heritage: regal, ceremonial
  { id: "art-0044", artwork: ALL_ARTWORKS.find((a) => a.n === 44)! }, // Trial by Fire
  { id: "art-0050", artwork: ALL_ARTWORKS.find((a) => a.n === 50)! }, // Coronation

  // Wearable: confidence + glamour
  { id: "art-0073", artwork: ALL_ARTWORKS.find((a) => a.n === 73)! }, // The Golden Hour
  { id: "art-0001", artwork: ALL_ARTWORKS.find((a) => a.n === 1)! },  // Pink Means Business

  // #5for5: powerful activism
  { id: "art-0052", artwork: ALL_ARTWORKS.find((a) => a.n === 52)! }, // Release Them
  { id: "art-0054", artwork: ALL_ARTWORKS.find((a) => a.n === 54)! }, // Served Hot
];

const PREVIEW_CARDS: PreviewCard[] = FEATURED_ARTWORKS.map((item) => {
  const artwork = item.artwork;
  const chapter = CHAPTERS.find((c) => c.id === artwork.chapter)!;

  return {
    id: item.id,
    title: artwork.title,
    chapter: chapter.name,
    story: artwork.story,
    image: artwork.image,
    tagline: chapter.tagline,
  };
});

// ─── Video-Carousel Sync Map ────────────────────────────────────────────────────
// Maps video timestamps (seconds) to the artwork index (0-11) that should
// be shown in the carousel while that segment plays in the brand film.
//
// Artwork index reference:
//   0: The Hatmaker   1: Jacqueline     2: The Ada-Set     3: The Ibari-Set
//   4: Danfo          5: Last Bus       6: Trial by Fire   7: Coronation
//   8: The Golden Hr  9: Pink Means Biz 10: Release Them  11: Served Hot
//
// ⚠️ FILL IN: Watch public/brand-film.mp4 and replace the placeholder entries
// below with the real second-ranges when each artwork appears in the video.
// Example: { from: 12, to: 18, artworkIndex: 3 } = Ibari-Set appears 12–18s.
const FILM_ARTWORK_MAP: { from: number; to: number; artworkIndex: number }[] = [
  { from: 0, to: 8, artworkIndex: 0 },
  { from: 8, to: 15, artworkIndex: 1 },
  { from: 15, to: 22, artworkIndex: 2 },
  { from: 22, to: 29, artworkIndex: 3 },
  { from: 29, to: 36, artworkIndex: 4 },
  { from: 36, to: 43, artworkIndex: 5 },
  { from: 43, to: 50, artworkIndex: 6 },
  { from: 50, to: 57, artworkIndex: 7 },
  { from: 57, to: 63, artworkIndex: 8 },
];

function getArtworkIndexForTime(t: number): number | null {
  const entry = FILM_ARTWORK_MAP.find((e) => t >= e.from && t < e.to);
  return entry ? entry.artworkIndex : null;
}

// ─── Carousel Card Component ────────────────────────────────────────────────────
const CarouselCard = ({ card, isActive }: { card: PreviewCard; isActive: boolean }) => {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = () => {
    window.location.pathname = "/illustrations";
  };

  return (
    <motion.article
      className="relative overflow-hidden cursor-pointer h-full"
      style={{
        background: "rgba(26, 26, 26, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(217, 119, 6, 0.1)",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      }}
      onClick={handleNavigate}
      onMouseEnter={() => !reduced && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={reduced ? {} : { scale: 1.04 }}
    >
      {/* Artwork Image - positioned to show full figure including head */}
      <img
        src={card.image}
        alt={card.title}
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 1,
        }}
      />

      {/* Chapter Badge */}
      <motion.div
        className="absolute top-4 left-4 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          border: "1px solid #D97706",
          color: "#D97706",
          borderRadius: 999,
          padding: "4px 12px",
          fontSize: 9,
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontWeight: 500,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        {card.chapter.split(" ").slice(0, 2).join(" ")}
      </motion.div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-5">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            fontStyle: "italic",
            fontSize: 16,
            fontWeight: 600,
            color: "#FAFAFA",
            margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {card.title}
        </motion.p>
      </div>

      {/* Gradient Overlay */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        animate={{
          background: isHovered
            ? "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Hover Content */}
      <AnimatePresence>
        {isHovered && !reduced && (
          <motion.div
            className="absolute inset-0 z-25 flex flex-col justify-end p-5 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: "inline-block",
                border: "1px solid #D97706",
                color: "#D97706",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 9,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 500,
                marginBottom: 12,
                alignSelf: "flex-start",
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
            >
              {card.chapter}
            </motion.span>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 13,
                color: "#FAFAFA",
                lineHeight: 1.6,
                margin: "0 0 12px 0",
              }}
            >
              {card.story}
            </motion.p>

            <motion.button
              type="button"
              onClick={handleNavigate}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ x: 4 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "#D97706",
                letterSpacing: "1px",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                fontWeight: 500,
              }}
            >
              Explore this chapter →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

// ─── Carousel Container ─────────────────────────────────────────────────────────
const CarouselContainer = ({
  cards,
  forceArtworkIndex = null,
}: {
  cards: PreviewCard[];
  forceArtworkIndex?: number | null;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const reduced = useReducedMotion();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // When the brand film is playing, drive the carousel to match the current artwork
  useEffect(() => {
    if (forceArtworkIndex == null) return;
    const clamped = Math.max(0, Math.min(forceArtworkIndex, cards.length - 1));
    const slideIndex = isMobile ? clamped : Math.floor(clamped / 2);
    setCurrentIndex(slideIndex);
  }, [forceArtworkIndex, isMobile, cards.length]);

  // Responsive: 1 card on mobile, 2 on larger screens
  const cardsPerView = isMobile ? 1 : 2;
  const totalSlides = Math.ceil(cards.length / cardsPerView);

  const currentCards = isMobile
    ? [cards[currentIndex % cards.length]]
    : [
        cards[(currentIndex * 2) % cards.length],
        cards[(currentIndex * 2 + 1) % cards.length],
      ];

  // Auto-rotate (paused while film is syncing)
  useEffect(() => {
    if (!isAutoPlay || reduced || forceArtworkIndex != null) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, totalSlides, reduced, forceArtworkIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setIsAutoPlay(false);
  };

  // Resume auto-play after 8 seconds of manual interaction
  useEffect(() => {
    if (!isAutoPlay) {
      const timeout = setTimeout(() => setIsAutoPlay(true), 8000);
      return () => clearTimeout(timeout);
    }
  }, [isAutoPlay]);

  return (
    <div style={{ position: "relative" }}>
      {/* Carousel Grid: 1 column on mobile, 2 on desktop */}
      <div
        className="grid gap-4 md:gap-6"
        style={{
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          minHeight: isMobile ? "400px" : "500px",
        }}
      >
        <AnimatePresence mode="wait">
          {currentCards.map((card) => (
            <CarouselCard key={card.id} card={card} isActive={true} />
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {!reduced && (
        <>
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 top-1/2 z-40"
            style={{
              transform: "translateY(-50%)",
              background: "rgba(217, 119, 6, 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(217, 119, 6, 0.5)",
              width: 44,
              height: 44,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginLeft: -22,
              color: "#FAFAFA",
              fontSize: 20,
              fontFamily: "system-ui",
              fontWeight: 300,
            }}
            aria-label="Previous"
          >
            ←
          </motion.button>

          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 z-40"
            style={{
              transform: "translateY(-50%)",
              background: "rgba(217, 119, 6, 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(217, 119, 6, 0.5)",
              width: 44,
              height: 44,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginRight: -22,
              color: "#FAFAFA",
              fontSize: 20,
              fontFamily: "system-ui",
              fontWeight: 300,
            }}
            aria-label="Next"
          >
            →
          </motion.button>
        </>
      )}

      {/* Progress Indicators */}
      <div
        className="flex justify-center items-center gap-2 mt-6"
        style={{ gap: 8 }}
      >
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsAutoPlay(false);
            }}
            animate={{
              width: idx === currentIndex ? 28 : 8,
              backgroundColor: idx === currentIndex ? "#D97706" : "rgba(217, 119, 6, 0.3)",
            }}
            transition={{ duration: 0.3 }}
            style={{
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Section ──────────────────────────────────────────────────────────────
const IllustrationsSection = () => {
  const reduced = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Video-carousel sync state
  const [filmArtworkIndex, setFilmArtworkIndex] = useState<number | null>(null);
  const lastArtworkIndexRef = useRef<number | null>(null);

  const handleFilmTimeUpdate = (t: number) => {
    if (reduced) return;
    const idx = getArtworkIndexForTime(t);
    if (idx !== lastArtworkIndexRef.current) {
      lastArtworkIndexRef.current = idx;
      setFilmArtworkIndex(idx);
    }
  };

  const handleFilmPlayState = (playing: boolean) => {
    if (!playing) {
      lastArtworkIndexRef.current = null;
      setFilmArtworkIndex(null);
    }
  };

  const headerInView = useInView(headerRef, inViewProps);
  const carouselInView = useInView(carouselRef, { once: true, amount: 0.2 });
  const bottomInView = useInView(bottomRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);

  const navigateToIllustrations = () => {
    window.location.pathname = "/illustrations";
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
              color: "#D97706",
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

        {/* ── Brand Film (landing teaser) ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <BrandFilm
            variant="landing"
            onTimeUpdate={handleFilmTimeUpdate}
            onPlayStateChange={handleFilmPlayState}
          />
        </motion.div>

        {/* ── Animated Carousel ─────────────────────────────────────── */}
        <motion.div
          ref={carouselRef}
          initial={{ opacity: 0, y: 40 }}
          animate={carouselInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: 48 }}
        >
          <CarouselContainer cards={PREVIEW_CARDS} forceArtworkIndex={filmArtworkIndex} />
        </motion.div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <motion.div
          ref={bottomRef}
          variants={fadeVariants}
          initial="hidden"
          animate={bottomInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
          style={{ gap: 16 }}
        >
          <div
            aria-hidden="true"
            style={{ width: 48, height: 1, backgroundColor: "#D97706" }}
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
            73+ illustrations across 6+ chapters
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <motion.button
              type="button"
              onClick={navigateToIllustrations}
              whileHover={reduced ? {} : { opacity: 0.85 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 500,
                backgroundColor: "#D97706",
                color: "#0A0A0A",
                border: "none",
                borderRadius: 4,
                padding: "11px 28px",
                cursor: "pointer",
              }}
            >
              Explore All Chapters
            </motion.button>

            <motion.button
              type="button"
              onClick={navigateToIllustrations}
              whileHover={reduced ? {} : { opacity: 0.75 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 400,
                backgroundColor: "transparent",
                color: "#D97706",
                border: "1px solid #D97706",
                borderRadius: 4,
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
