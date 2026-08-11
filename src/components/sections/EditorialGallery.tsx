import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import {
  ARTWORKS as STATIC_ARTWORKS,
  CHAPTERS as STATIC_CHAPTERS,
  COLLECTIONS as STATIC_COLLECTIONS,
  type Artwork,
  type Chapter,
  type ChapterId,
  type IllustrationCollection,
  type Medium,
} from "@/lib/gallery-data";
import { supabase } from "@/lib/supabase";
import { ILLUSTRATION_CATEGORIES, scrollToCategory } from "@/lib/illustration-categories";

const GOLD = "#D97706";

// ─── Lightbox ─────────────────────────────────────────────────────────────
const Lightbox = ({
  items,
  index,
  onClose,
  onNav,
}: {
  items: Artwork[];
  index: number;
  onClose: () => void;
  onNav: (next: number) => void;
}) => {
  const reduced = useReducedMotion();
  const art = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onClose, onNav]);

  if (!art) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={art.title}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 z-10 grid place-items-center text-brand-text hover:text-brand-gold transition-colors"
        style={{ width: 44, height: 44 }}
      >
        <X size={26} />
      </button>

      <button
        type="button"
        aria-label="Previous artwork"
        onClick={(e) => {
          e.stopPropagation();
          onNav((index - 1 + items.length) % items.length);
        }}
        className="absolute left-2 md:left-6 z-10 grid place-items-center text-brand-text hover:text-brand-gold transition-colors"
        style={{ width: 44, height: 44 }}
      >
        <ChevronLeft size={34} />
      </button>

      <button
        type="button"
        aria-label="Next artwork"
        onClick={(e) => {
          e.stopPropagation();
          onNav((index + 1) % items.length);
        }}
        className="absolute right-2 md:right-6 z-10 grid place-items-center text-brand-text hover:text-brand-gold transition-colors"
        style={{ width: 44, height: 44 }}
      >
        <ChevronRight size={34} />
      </button>

      <motion.figure
        key={art.id}
        className="flex flex-col md:flex-row items-center gap-6 md:gap-10 max-w-[1100px] w-full m-0"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" as const }}
      >
        <img
          src={art.image}
          alt={art.title}
          className="object-contain"
          style={{ maxHeight: "72vh", maxWidth: "100%", borderRadius: 2 }}
          loading="eager"
        />
        <figcaption className="md:max-w-[300px] text-center md:text-left">
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 10,
              color: GOLD,
              letterSpacing: "3px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            {art.medium} · {String(index + 1).padStart(2, "0")} / {items.length}
          </p>
          <h3
            className="font-display"
            style={{
              fontStyle: "italic",
              fontSize: "clamp(24px, 3vw, 34px)",
              color: "#FAFAFA",
              margin: "0 0 14px",
              lineHeight: 1.15,
            }}
          >
            {art.title}
          </h3>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontWeight: 300,
              fontSize: 15,
              color: "#A0A0A0",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {art.story}
          </p>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
};

// ─── Tile (used in mosaic + rail) ───────────────────────────────────────────
const Tile = ({
  art,
  onOpen,
  className,
  rail,
}: {
  art: Artwork;
  onOpen: () => void;
  className?: string;
  rail?: boolean;
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`View ${art.title}`}
      className={`group relative overflow-hidden block w-full p-0 border-0 cursor-pointer ${className ?? ""}`}
      style={{
        backgroundColor: "#111",
        borderRadius: 3,
        breakInside: rail ? undefined : "avoid",
      }}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" as const }}
      whileHover={reduced ? {} : { y: -4 }}
    >
      <img
        src={art.image}
        alt={art.title}
        loading="lazy"
        className="w-full h-full object-cover"
        style={{
          display: "block",
          transition: "transform 0.5s ease, filter 0.4s ease",
          aspectRatio: rail ? "3 / 4" : undefined,
        }}
      />
      <div
        className="absolute inset-0 flex flex-col justify-end p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
          transition: "opacity 0.4s ease",
        }}
      >
        <span
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: 9,
            color: GOLD,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {art.medium}
        </span>
        <p
          className="font-display"
          style={{
            fontStyle: "italic",
            fontSize: 16,
            color: "#FAFAFA",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {art.title}
        </p>
      </div>
    </motion.button>
  );
};

// ─── Feature band (large parallax piece) ─────────────────────────────────────
const FeatureBand = ({ art, onOpen }: { art: Artwork; onOpen: () => void }) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <motion.div
      ref={ref}
      className="relative w-full overflow-hidden cursor-pointer my-3"
      style={{ borderRadius: 4, aspectRatio: "16 / 10", backgroundColor: "#0D0D0D" }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`View ${art.title}`}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" as const }}
    >
      <motion.img
        src={art.image}
        alt={art.title}
        loading="lazy"
        className="absolute inset-0 w-full object-cover"
        style={{ height: "120%", top: "-10%", y }}
      />
      <div
        className="absolute inset-0 flex flex-col justify-end p-6 md:p-10"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
        }}
      >
        <span
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: 10,
            color: GOLD,
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Featured · {art.medium}
        </span>
        <h3
          className="font-display"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "#FAFAFA",
            margin: "0 0 10px",
            lineHeight: 1.1,
          }}
        >
          {art.title}
        </h3>
        <p
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 15,
            color: "#C8C8C8",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: 0,
          }}
        >
          {art.story}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Chapter intro ──────────────────────────────────────────────────────────
// tagline/description are optional now — the client's category list uses
// plain names with no poetic subtitle (see gallery-data.ts CHAPTERS), so
// both are rendered only when actually present rather than leaving empty
// italic/paragraph gaps.
const ChapterIntro = ({ chapter }: { chapter: Chapter }) => {
  const reduced = useReducedMotion();
  return (
    <div className="mb-8 md:mb-10">
      <motion.div
        className="flex items-baseline gap-4"
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" as const }}
      >
        <span
          className="font-display"
          style={{ fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 700, color: "rgba(200,169,110,0.18)", lineHeight: 0.8 }}
        >
          {chapter.index}
        </span>
        <div>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(24px, 3.4vw, 40px)", fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: 1.05 }}
          >
            {chapter.name}
          </h2>
          {chapter.tagline && (
            <p
              className="font-display"
              style={{ fontStyle: "italic", fontSize: "clamp(14px, 1.6vw, 18px)", color: GOLD, margin: "4px 0 0" }}
            >
              {chapter.tagline}
            </p>
          )}
        </div>
      </motion.div>
      {chapter.description && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.15 }}
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 300,
            fontSize: 15,
            color: "#888",
            lineHeight: 1.75,
            maxWidth: 600,
            margin: "16px 0 0",
            paddingLeft: 2,
          }}
        >
          {chapter.description}
        </motion.p>
      )}
      <div aria-hidden className="mt-6" style={{ width: 56, height: 2, backgroundColor: GOLD, opacity: 0.5 }} />
    </div>
  );
};

// ─── Chapter body layouts ─────────────────────────────────────────────────
const ChapterBody = ({
  chapter,
  items,
  openOf,
  collections = [],
}: {
  chapter: Chapter;
  items: Artwork[];
  openOf: (art: Artwork) => () => void;
  collections?: IllustrationCollection[];
}) => {
  // Only ONE piece can occupy the FeatureBand slot, so only that one is
  // excluded from the regular grid below — not every feature-flagged piece.
  // This used to be `items.filter((a) => !a.feature)`, which was correct
  // back when each chapter had at most one featured:true item, but the
  // Aug-2026 category rebuild merges several of the old poetic chapters
  // (each with its own featured piece) into single new categories — e.g.
  // fashion-illustrations now holds what used to be atelier/heritage/
  // fivefor5/wearable's featured pieces all at once. Excluding every
  // feature-flagged item silently dropped all but the first one from the
  // page entirely (confirmed missing: seq 24, 26, 44, 52, 73). Now every
  // extra featured piece just renders in the regular grid instead of
  // vanishing.
  const feature = items.find((a) => a.feature);
  const rest = items.filter((a) => a.id !== feature?.id);

  if (chapter.layout === "rail") {
    return (
      <div
        className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        role="list"
        aria-label={`${chapter.name} — scroll horizontally`}
      >
        {items.map((art) => (
          <div
            key={art.id}
            role="listitem"
            className="shrink-0"
            style={{ width: "min(60vw, 230px)", scrollSnapAlign: "start" }}
          >
            <Tile art={art} onOpen={openOf(art)} rail />
          </div>
        ))}
      </div>
    );
  }

  if (chapter.layout === "feature") {
    // Alternating editorial split rows
    return (
      <div className="flex flex-col gap-10 md:gap-14">
        {feature && <FeatureBand art={feature} onOpen={openOf(feature)} />}
        {rest.map((art, i) => (
          <div
            key={art.id}
            className={`grid gap-6 md:gap-10 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            <div className="[direction:ltr]">
              <Tile art={art} onOpen={openOf(art)} rail />
            </div>
            <div className="[direction:ltr] flex flex-col gap-3">
              <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: GOLD, letterSpacing: "3px", textTransform: "uppercase" }}>
                {art.medium}
              </span>
              <h3 className="font-display" style={{ fontStyle: "italic", fontSize: "clamp(22px, 2.6vw, 32px)", color: "#FAFAFA", margin: 0, lineHeight: 1.15 }}>
                {art.title}
              </h3>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "#888", lineHeight: 1.7, margin: 0 }}>
                {art.story}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // default: mosaic — feature band (if any) + masonry columns, optionally grouped by collection
  const collectionsInChapter = collections.filter((c) => c.categoryId === chapter.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const collectionIds = new Set(collectionsInChapter.map((c) => c.id));
  const itemsWithCollection = rest.filter((art) => art.collectionId && collectionIds.has(art.collectionId));
  const itemsWithoutCollection = rest.filter((art) => !art.collectionId || !collectionIds.has(art.collectionId));

  return (
    <div className="flex flex-col gap-12">
      {feature && <FeatureBand art={feature} onOpen={openOf(feature)} />}

      {/* Collections (with items grouped under each) */}
      {collectionsInChapter.map((collection) => {
        const collectionItems = rest.filter((art) => art.collectionId === collection.id);
        if (collectionItems.length === 0) return null;

        return (
          <div key={collection.id} className="flex flex-col gap-4">
            <div>
              <h3 className="font-display" style={{ fontSize: "clamp(18px, 2vw, 28px)", fontWeight: 600, color: "#FAFAFA", margin: 0, lineHeight: 1.1 }}>
                {collection.name}
              </h3>
              {collection.description && (
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 14, color: "#888", margin: "6px 0 0", lineHeight: 1.6 }}>
                  {collection.description}
                </p>
              )}
            </div>
            <div style={{ columnGap: "12px" }} className="[column-count:2] md:[column-count:3]">
              {collectionItems.map((art) => (
                <div key={art.id} style={{ marginBottom: 12 }}>
                  <Tile art={art} onOpen={openOf(art)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Standalone items (no collection) */}
      {itemsWithoutCollection.length > 0 && (
        <div style={{ columnGap: "12px" }} className="[column-count:2] md:[column-count:3]">
          {itemsWithoutCollection.map((art) => (
            <div key={art.id} style={{ marginBottom: 12 }}>
              <Tile art={art} onOpen={openOf(art)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Category quick-nav ─────────────────────────────────────────────────────
// Was a "Medium" filter here (All/Portrait/Couture/Fashion Design/Product/
// Footwear/Campaign) — a second taxonomy competing with the category one the
// hero and "Browse by Category" row use, and selecting one used to swap the
// whole section over to a flat grid that hid every category anchor
// underneath it (breaking the hero's scroll-to-category links whenever a
// filter was active). This is now the SAME mechanism as the hero: every pill
// scrolls to that category's own section below, using the identical
// scrollToCategory() call and #category-<id> anchors. `active` reflects
// scroll position (see the scroll-spy in the main component) rather than a
// filter selection — there's nothing left to filter, every category's
// section is always on the page.
const CategoryNav = ({ active }: { active: string | null }) => {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: reduced ? "auto" : "smooth",
      });
      setTimeout(checkScroll, 100);
    }
  };

  return (
    <div className="sticky top-20 z-30 mb-10 flex items-center gap-3">
      {/* Left arrow */}
      <motion.button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Scroll categories left"
        initial={{ opacity: 0 }}
        animate={{ opacity: canScrollLeft ? 1 : 0.3 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
        className="shrink-0 grid place-items-center transition-colors"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid #CCCCCC",
          backgroundColor: canScrollLeft ? "#FAFAFA" : "transparent",
          color: canScrollLeft ? "#111111" : "#CCCCCC",
          cursor: canScrollLeft ? "pointer" : "not-allowed",
          display: "flex",
        }}
      >
        <ChevronLeft size={18} />
      </motion.button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="-mx-6 px-6 py-3 flex gap-2 overflow-x-auto flex-1"
        style={{
          backgroundColor: "rgba(250,250,250,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #EBEBEB",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        onScroll={checkScroll}
        role="list"
        aria-label="Browse by category"
      >
        {ILLUSTRATION_CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              aria-current={isActive ? "true" : undefined}
              className="shrink-0 transition-colors"
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "9px 16px",
                minHeight: 40,
                borderRadius: 999,
                cursor: "pointer",
                border: `1px solid ${isActive ? "#111111" : "#CCCCCC"}`,
                backgroundColor: isActive ? "#111111" : "transparent",
                color: isActive ? "#FFFFFF" : "#666666",
                transition: reduced ? "none" : "all 0.25s ease",
                whiteSpace: "nowrap",
                scrollSnapAlign: "start",
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      <motion.button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Scroll categories right"
        initial={{ opacity: 0 }}
        animate={{ opacity: canScrollRight ? 1 : 0.3 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
        className="shrink-0 grid place-items-center transition-colors"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid #CCCCCC",
          backgroundColor: canScrollRight ? "#FAFAFA" : "transparent",
          color: canScrollRight ? "#111111" : "#CCCCCC",
          cursor: canScrollRight ? "pointer" : "not-allowed",
          display: "flex",
        }}
      >
        <ChevronRight size={18} />
      </motion.button>
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────
const EditorialGallery = () => {
  const reduced = useReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Scroll-spy for the CategoryNav bar — which category section is currently
  // in view, so its pill can highlight. Populated once the chapter sections
  // exist in the DOM (see the IntersectionObserver effect below).
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Live data — starts from static file (instant render) and updates when Supabase responds.
  // Drafts (no title/story yet — see gallery-data.ts) are filtered out of
  // both sources here, once, rather than at every render site downstream.
  const [artworks, setArtworks] = useState<Artwork[]>(STATIC_ARTWORKS.filter(a => !a.draft));
  const [chapters, setChapters] = useState<Chapter[]>(STATIC_CHAPTERS);
  const [collections, setCollections] = useState<IllustrationCollection[]>(STATIC_COLLECTIONS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: arts }, { data: chaps }] = await Promise.all([
          supabase.from("va_artworks").select("*").order("seq"),
          supabase.from("va_gallery_chapters").select("*").order("sort_order"),
        ]);
        if (cancelled) return;
        if (arts && arts.length > 0) {
          setArtworks(arts
            .filter((a) => !a.is_draft)
            .map((a): Artwork => ({
              id: a.id,
              n: a.seq,
              title: a.title,
              story: a.story,
              // "single-illustrations" is the catch-all bucket now — the old
              // fallback ("speaks") was a poetic chapter id that no longer exists.
              chapter: (a.chapter_id ?? "single-illustrations") as ChapterId,
              medium: a.medium as Medium,
              image: a.image_url,
              feature: a.featured,
            })));
        }
        if (chaps && chaps.length > 0) {
          setChapters(chaps.map((c): Chapter => ({
            id: c.id as ChapterId,
            index: c.index_label,
            name: c.name,
            tagline: c.tagline,
            description: c.description,
            layout: c.layout as "mosaic" | "rail" | "feature",
          })));
        }
      } catch {
        // Supabase unavailable — static data already shown
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Flat list = the current navigation order for the lightbox. There's only
  // ever one view now (the category story view), so this is just `artworks`
  // — no filter state feeds it anymore.
  const flatList = artworks;
  const indexOf = useMemo(() => {
    const map = new Map<string, number>();
    flatList.forEach((a, i) => map.set(a.id, i));
    return map;
  }, [flatList]);

  // Scroll-spy: highlight whichever category section is nearest the top of
  // the viewport in the CategoryNav bar above. Re-runs whenever the chapter
  // list changes (i.e. once real data replaces the static fallback).
  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // Nearest to the top of the viewport wins when several are visible.
        const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveCategoryId(top.target.id.replace(/^category-/, ""));
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  const openOf = useCallback(
    (art: Artwork) => () => setLightboxIndex(indexOf.get(art.id) ?? 0),
    [indexOf],
  );
  const close = useCallback(() => setLightboxIndex(null), []);

  return (
    <section
      id="gallery"
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: "#FAFAFA", borderTop: "1px solid #EBEBEB" }}
      aria-label="The Collection"
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1180 }}>
        {/* Intro */}
        <div className="text-center mb-10 flex flex-col items-center gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 0.5 }}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "#111111", letterSpacing: "4px", textTransform: "uppercase", margin: 0, fontWeight: 600 }}
          >
            The Collection
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 0.6 }}
            className="font-display"
            style={{ fontSize: "clamp(28px, 4.5vw, 54px)", fontWeight: 700, color: "#111111", margin: 0, lineHeight: 1.05, maxWidth: 720 }}
          >
            Illustrated Stories. Unlimited Artistry.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.15 }}
            style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "#666666", maxWidth: 540, lineHeight: 1.7, margin: 0 }}
          >
            Every piece begins with a woman who already knew her worth.
          </motion.p>
        </div>

        <CategoryNav active={activeCategoryId} />

        {/* One view now: every category's section, always on the page, in
            the client's own PDF order — this is what the hero carousel,
            the "Browse by Category" row, and CategoryNav above all scroll
            into. There used to be a second "flat masonry filtered by
            medium" view here that replaced this entirely when engaged,
            which is what broke the hero's scroll links whenever a filter
            was active — removed for exactly that reason. */}
        <div className="flex flex-col gap-20 md:gap-28">
          {chapters.map((chapter) => {
            const items = artworks.filter((a) => a.chapter === chapter.id);
            return (
              // id matches categoryAnchorId() in illustration-categories.ts —
              // this is what the hero carousel / "Browse by Category" row /
              // CategoryNav all scroll to when a category is selected.
              <div key={chapter.id} id={`category-${chapter.id}`}>
                <ChapterIntro chapter={chapter} />
                <ChapterBody chapter={chapter} items={items} openOf={openOf} collections={collections} />
              </div>
            );
          })}
        </div>

        {/* Closing CTA */}
        <motion.div
          className="flex flex-col items-center text-center mt-24 gap-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.6 }}
        >
          <div aria-hidden style={{ width: 48, height: 1, backgroundColor: GOLD }} />
          <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 14, color: "#888", margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
            Every piece is available for commission and licensing. Tell us which woman is yours.
          </p>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
            }}
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-85"
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 500,
              backgroundColor: GOLD,
              color: "#0A0A0A",
              border: "none",
              borderRadius: 2,
              padding: "13px 30px",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Commission a Piece <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox items={flatList} index={lightboxIndex} onClose={close} onNav={setLightboxIndex} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default EditorialGallery;
