import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Volume2 } from "lucide-react";

const SRC = "/vagin/pad-kolo-explainer.mp4";
const POSTER = "/vagin/pad-kolo-explainer-poster.webp";

/* PAD KOLO explainer on /vagin.
   Client brief: it should start the moment someone hovers it, with no wait.

   - Buffering starts as the section approaches the viewport (rootMargin), so
     by the time the pointer arrives the first frames are already local.
   - Browsers refuse to start audible playback without a click/tap (hover is
     not a user gesture), so preview playback is muted, with a "Tap for
     sound" button. Unmuting restarts from 0 so the story is heard whole.
   - Hover devices: plays on pointer enter, pauses on leave while still in
     muted preview. Touch devices (no hover): plays muted once it is mostly
     on screen.
   - Reduced motion: plain click-to-play, nothing starts on its own. */
const PadKoloVideo = () => {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [preload, setPreload] = useState<"none" | "auto">("none");
  const [muted, setMuted] = useState(!reduced);
  const [playing, setPlaying] = useState(false);
  const engaged = !muted; // the visitor chose sound: stop treating it as a preview

  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  // Start buffering ahead of arrival; on touch devices also autoplay muted
  // once the video is mostly visible.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduced) return;
    const nearby = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setPreload("auto"); nearby.disconnect(); } },
      { rootMargin: "800px 0px" },
    );
    nearby.observe(el);

    let visible: IntersectionObserver | undefined;
    if (!canHover) {
      visible = new IntersectionObserver(
        ([entry]) => {
          const v = videoRef.current;
          if (!v) return;
          if (entry.isIntersecting) v.play().catch(() => {});
          else if (v.muted) v.pause();
        },
        { threshold: 0.6 },
      );
      visible.observe(el);
    }
    return () => { nearby.disconnect(); visible?.disconnect(); };
  }, [reduced, canHover]);

  const onEnter = () => {
    if (reduced || !canHover) return;
    setPreload("auto");
    videoRef.current?.play().catch(() => {});
  };
  const onLeave = () => {
    if (reduced || !canHover || engaged) return;
    videoRef.current?.pause();
  };
  const turnOnSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    setMuted(false);
    v.play().catch(() => {});
  };

  return (
    <div
      ref={wrapRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative"
      style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(217,119,6,0.28)", background: "#0A0A0A", aspectRatio: "3 / 2", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}
    >
      <video
        ref={videoRef}
        src={SRC}
        poster={POSTER}
        controls
        playsInline
        muted={muted}
        preload={reduced ? "none" : preload}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        title="PAD KOLO explainer: how VAGIN keeps girls in school during their period"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AnimatePresence>
        {playing && muted && (
          <motion.button
            type="button"
            onClick={turnOnSound}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="absolute inline-flex items-center"
            style={{
              top: 14, right: 14, gap: 8, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
              background: "rgba(10,10,10,0.72)", border: "1px solid rgba(217,119,6,0.55)", color: "#FAFAFA",
              fontFamily: "Poppins, system-ui, sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <Volume2 size={15} color="#D97706" /> Tap for sound
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PadKoloVideo;
