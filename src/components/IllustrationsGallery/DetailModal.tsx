import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Artwork } from "./types";
import { COLORS, TYPOGRAPHY, MOTION } from "./constants";

interface DetailModalProps {
  artwork: Artwork | null;
  allArtworks: Artwork[];
  onClose: () => void;
  onNavigate: (next: boolean) => void;
}

export const DetailModal = ({
  artwork,
  allArtworks,
  onClose,
  onNavigate,
}: DetailModalProps) => {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!artwork) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        onNavigate(true);
      } else if (e.key === "ArrowLeft") {
        onNavigate(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [artwork, onClose, onNavigate]);

  if (!artwork) return null;

  const currentIndex = allArtworks.findIndex((a) => a.id === artwork.id);
  const total = allArtworks.length;

  return (
    <AnimatePresence>
      {artwork && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            backgroundColor: `rgba(110, 0, 37, 0.95)`,
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduced ? 0 : MOTION.modalExit.duration,
          }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={artwork.title}
        >
          {/* Close button */}
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Close detail view"
            className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={28} color={COLORS.cream} />
          </motion.button>

          {/* Previous button */}
          {currentIndex > 0 && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(false);
              }}
              aria-label="Previous artwork"
              className="absolute left-4 md:left-8 z-10 w-12 h-12 flex items-center justify-center hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={32} color={COLORS.cream} />
            </motion.button>
          )}

          {/* Next button */}
          {currentIndex < total - 1 && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(true);
              }}
              aria-label="Next artwork"
              className="absolute right-4 md:right-8 z-10 w-12 h-12 flex items-center justify-center hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={32} color={COLORS.cream} />
            </motion.button>
          )}

          {/* Content container */}
          <motion.div
            className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 20 }}
            transition={{
              duration: reduced ? 0 : MOTION.modalEnter.duration,
            }}
          >
            {/* Image */}
            <div
              style={{
                flex: "1 1 auto",
                maxHeight: "72vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={artwork.image_url}
                alt={artwork.title}
                loading="eager"
                style={{
                  maxHeight: "72vh",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "2px",
                }}
              />
            </div>

            {/* Metadata */}
            <div
              style={{
                flex: "0 1 300px",
                color: COLORS.cream,
              }}
            >
              {/* Sequence and count */}
              <p
                style={{
                  fontFamily: TYPOGRAPHY.body,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: COLORS.gold,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "0 0 16px 0",
                }}
              >
                #{String(artwork.seq).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>

              {/* Title */}
              {artwork.title && (
                <h3
                  style={{
                    fontFamily: TYPOGRAPHY.display,
                    fontSize: TYPOGRAPHY.sizes.h2,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: COLORS.cream,
                    margin: "0 0 16px 0",
                    lineHeight: TYPOGRAPHY.lineHeights.tight,
                  }}
                >
                  {artwork.title}
                </h3>
              )}

              {/* Medium */}
              {artwork.medium && (
                <p
                  style={{
                    fontFamily: TYPOGRAPHY.body,
                    fontSize: "13px",
                    fontWeight: 500,
                    color: COLORS.gold,
                    margin: "0 0 12px 0",
                  }}
                >
                  {artwork.medium}
                </p>
              )}

              {/* Story/Description */}
              {artwork.story && (
                <p
                  style={{
                    fontFamily: TYPOGRAPHY.body,
                    fontSize: "14px",
                    fontWeight: 400,
                    color: COLORS.cream,
                    opacity: 0.85,
                    lineHeight: TYPOGRAPHY.lineHeights.normal,
                    margin: 0,
                  }}
                >
                  {artwork.story}
                </p>
              )}

              {/* Navigation hint for mobile */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${COLORS.burgundyAlpha}`,
                }}
              >
                <p
                  style={{
                    fontFamily: TYPOGRAPHY.body,
                    fontSize: "11px",
                    color: COLORS.cream,
                    opacity: 0.6,
                    margin: 0,
                  }}
                >
                  {currentIndex < total - 1
                    ? "Next →"
                    : "Last artwork"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
