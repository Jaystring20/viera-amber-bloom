import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface BrandFilmProps {
  /**
   * landing  → muted autoplay loop, no scrubber, click-to-unmute pill
   * page     → paused poster, centered play button, sound on, plays once
   */
  variant: "landing" | "page";
}

const BrandFilm = ({ variant }: BrandFilmProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(variant === "page");
  const reduced = useReducedMotion();

  // Landing: autoplay when 30% of the container is in view, pause when not
  useEffect(() => {
    if (variant !== "landing" || !containerRef.current) return;

    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRef.current;
        if (!vid) return;
        if (entry.isIntersecting && !reduced) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant, reduced]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  };

  const handlePagePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = false;
    setMuted(false);
    vid.play().catch(() => {});
    setShowPlayOverlay(false);
  };

  const isLanding = variant === "landing";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        background: "#000",
        overflow: "hidden",
        borderRadius: isLanding ? 10 : 0,
        cursor: isLanding ? "pointer" : "default",
        boxShadow: isLanding ? "0 12px 48px rgba(0,0,0,0.5)" : "none",
      }}
      onClick={isLanding ? toggleMute : undefined}
    >
      <video
        ref={videoRef}
        src="/brand-film.mp4"
        muted
        loop={isLanding}
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* ── Landing: mute/unmute pill ─────────────────────────────── */}
      {isLanding && (
        <motion.button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Watch with sound" : "Mute video"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "rgba(0,0,0,0.62)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(217,119,6,0.35)",
            borderRadius: 999,
            padding: "7px 16px",
            color: "#D97706",
            fontSize: 10,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            cursor: "pointer",
            zIndex: 10,
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {muted ? (
            <>
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 3L5 7H2v6h3l5 4V3zM16.5 10a6.5 6.5 0 00-1.9-4.6l-1.4 1.4A4.5 4.5 0 0114.5 10a4.5 4.5 0 01-1.3 3.2l1.4 1.4A6.5 6.5 0 0016.5 10z" />
                <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
              </svg>
              Watch with sound
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 3L5 7H2v6h3l5 4V3zM16.5 10a6.5 6.5 0 00-1.9-4.6l-1.4 1.4A4.5 4.5 0 0114.5 10a4.5 4.5 0 01-1.3 3.2l1.4 1.4A6.5 6.5 0 0016.5 10z" />
              </svg>
              Mute
            </>
          )}
        </motion.button>
      )}

      {/* ── Page: centered play overlay ───────────────────────────── */}
      <AnimatePresence>
        {!isLanding && showPlayOverlay && (
          <motion.div
            key="play-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.48)",
              zIndex: 10,
              cursor: "pointer",
            }}
            onClick={handlePagePlay}
          >
            <motion.div
              whileHover={{ scale: 1.09 }}
              whileTap={{ scale: 0.93 }}
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "rgba(217,119,6,0.9)",
                border: "2px solid rgba(217,119,6,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                boxShadow: "0 0 40px rgba(217,119,6,0.35)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden="true">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            </motion.div>
            <p
              style={{
                color: "rgba(250,250,250,0.9)",
                fontSize: 11,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                margin: 0,
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 400,
              }}
            >
              Watch the story
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page: controls bar (visible after play starts) */}
      {!isLanding && !showPlayOverlay && (
        <motion.button
          type="button"
          onClick={(e) => { e.stopPropagation(); const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); }}
          aria-label={muted ? "Unmute" : "Mute"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "6px 14px",
            color: "#FAFAFA",
            fontSize: 10,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            cursor: "pointer",
            zIndex: 10,
            fontFamily: "DM Sans, system-ui, sans-serif",
          }}
        >
          {muted ? "Unmute" : "Mute"}
        </motion.button>
      )}

      {/* Reduced-motion: static overlay so nothing plays */}
      {reduced && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "rgba(250,250,250,0.5)", fontSize: 12, fontFamily: "DM Sans, system-ui, sans-serif", letterSpacing: "1px" }}>
            Brand Film
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BrandFilm;
