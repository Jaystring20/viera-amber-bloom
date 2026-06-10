import { motion, useReducedMotion } from "framer-motion";
import logoAsset from "@/assets/viera-amber-logo.png.asset.json";

const HeroSection = () => {
  const reduced = useReducedMotion();
  const d = (s: number) => (reduced ? 0 : s);

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("ecosystem");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center px-6" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Watermark — actual logo, very faint, oversized */}
      <motion.img
        aria-hidden="true"
        src={logoAsset.url}
        alt=""
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.6, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 pointer-events-none select-none"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(140vw, 1800px)",
          maxWidth: "none",
          zIndex: 0,
        }}
        draggable={false}
      />

      {/* Foreground */}
      <div className="relative z-10 flex flex-col items-center text-center" style={{ gap: 24 }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d(0.5), delay: d(0.1) }}
          className="font-body uppercase"
          style={{ fontSize: 11, color: "#C8A96E", letterSpacing: "4px", fontWeight: 400 }}
        >
          EST. 2013
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d(0.9), delay: d(0.3), ease: "easeOut" }}
          className="m-0"
          style={{ lineHeight: 1 }}
        >
          <span className="sr-only">Viera Amber</span>
          <img
            src={logoAsset.url}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="select-none"
            style={{
              width: "clamp(280px, 56vw, 720px)",
              height: "auto",
              display: "block",
            }}
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d(0.6), delay: d(0.7) }}
          className="font-body"
          style={{
            fontSize: "clamp(14px, 1.6vw, 20px)",
            color: "#888888",
            maxWidth: 560,
            lineHeight: 1.6,
            fontWeight: 300,
          }}
        >
          A creative & impact-driven ecosystem for feminine empowerment.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: d(0.6), delay: d(0.9) }}
          style={{ width: 48, height: 1, backgroundColor: "#C8A96E", transformOrigin: "left center" }}
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d(0.6), delay: d(1.0) }}
          className="font-display italic"
          style={{ fontSize: "clamp(16px, 1.8vw, 22px)", color: "#C8A96E", fontWeight: 400, margin: 0 }}
        >
          For her, by her.
        </motion.p>

        <motion.button
          type="button"
          onClick={handleScroll}
          initial={{ opacity: 0 }}
          animate={
            reduced
              ? { opacity: 1 }
              : { opacity: 1, y: [0, 8, 0] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, delay: 1.3 },
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.3 },
                }
          }
          className="font-body uppercase mt-4 cursor-pointer bg-transparent border-0"
          style={{ fontSize: 11, color: "#888888", letterSpacing: "2px", fontWeight: 400 }}
          aria-label="Explore the ecosystem"
        >
          Explore the ecosystem ↓
        </motion.button>
      </div>
    </div>
  );
};

export default HeroSection;
