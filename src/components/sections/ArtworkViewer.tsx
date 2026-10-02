import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ARTWORKS_103, SECTIONS } from "@/lib/gallery-data";
import { ARTWORK_DIMENSIONS } from "@/lib/artwork-dimensions";

interface ArtworkViewerProps {
  startSeq: number;
  onClose: () => void;
}

const sectionFor = (seq: number) =>
  SECTIONS.find((s) => s.seq_start > 0 && seq >= s.seq_start && seq <= s.seq_end);

/** Full-screen swipe gallery, like flicking through photos on a phone. */
export const ArtworkViewer = ({ startSeq, onClose }: ArtworkViewerProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const startIndex = Math.max(0, ARTWORKS_103.findIndex((a) => a.seq === startSeq));
  const [index, setIndex] = useState(startIndex);
  const frame = useRef(0);

  // Open on the tapped artwork, lock the page behind, close on Escape.
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = startIndex * track.clientWidth;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") track?.scrollBy({ left: track.clientWidth, behavior: "smooth" });
      if (e.key === "ArrowLeft") track?.scrollBy({ left: -track.clientWidth, behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const next = Math.round(track.scrollLeft / track.clientWidth);
      setIndex((prev) => (prev === next ? prev : next));
    });
  };

  const artwork = ARTWORKS_103[index];
  const section = artwork ? sectionFor(artwork.seq) : undefined;
  const caption = artwork?.title || section?.name || "";
  const detail = artwork?.story || (!artwork?.title ? section?.description : "") || "";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Illustration gallery"
      className="fixed inset-0 z-[100] flex flex-col bg-[#0B0B0C] text-white"
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-end px-4 pb-6 pt-[max(12px,env(safe-area-inset-top))] bg-gradient-to-b from-black/70 to-transparent">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 active:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <X size={22} />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x pinch-zoom" }}
      >
        {ARTWORKS_103.map((a, i) => {
          const near = Math.abs(i - index) <= 2;
          const dims = ARTWORK_DIMENSIONS[a.seq];
          return (
            <div
              key={a.id}
              className="flex h-full w-full shrink-0 snap-center snap-always items-center justify-center px-2 pb-28 pt-16"
            >
              {near && (
                <img
                  src={a.image}
                  alt={a.title || sectionFor(a.seq)?.name || `Illustration ${i + 1}`}
                  width={dims?.[0]}
                  height={dims?.[1]}
                  decoding="async"
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain"
                />
              )}
            </div>
          );
        })}
      </div>

      {(caption || detail) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-12">
          {caption && <p className="font-display text-lg font-bold leading-snug">{caption}</p>}
          {detail && <p className="mt-1 text-sm leading-relaxed text-white/80">{detail}</p>}
        </div>
      )}
    </div>,
    document.body
  );
};

export default ArtworkViewer;
