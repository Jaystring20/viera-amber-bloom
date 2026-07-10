import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import vieraAmberLogo from "@/assets/viera-amber-logo.png";

const QUICK_LINKS = [
  { label: "Illustrations", href: "/illustrations" },
  { label: "VAGIN", href: "/vagin" },
  { label: "VIVA", href: "/viva" },
  { label: "VAM", href: "/vam" },
  { label: "VASH", href: "/vash" },
  { label: "Contact", href: "#contact" },
];

// Per sub-page footer brand mark. Image logos exist for Viera Amber, VAGIN, and
// VIVA; VAM and VASH have no logo asset yet, so they render as wordmarks.
const getFooterBrand = (pathname: string) => {
  // startsWith so sub-routes inherit the brand (e.g. /viva/try-on, /vagin-dashboard).
  if (pathname.startsWith("/vagin")) return { kind: "img" as const, src: "/vagin-logo.webp", alt: "VAGIN — Viera Amber's Girls' Initiative", height: 58 };
  if (pathname.startsWith("/viva")) return { kind: "img" as const, src: "/viva-logo.svg", alt: "VIVA — Fashion & Wearable Art", height: 46 };
  if (pathname.startsWith("/vam")) return { kind: "text" as const, text: "VAM", sub: "Viera Amber Masterclass" };
  if (pathname.startsWith("/vash")) return { kind: "text" as const, text: "VASH", sub: "Viera Amber Shop" };
  // Home + Illustrations + any other route
  return { kind: "img" as const, src: vieraAmberLogo, alt: "Viera Amber", height: 50 };
};

const Footer = () => {
  const reduced = useReducedMotion();
  const footerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.3 });
  const location = useLocation();
  const footerBrand = getFooterBrand(location.pathname);
  const d = (s: number) => (reduced ? 0 : s);

  const itemVariants: import("framer-motion").Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.5), ease: "easeOut" as const },
    },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: d(0.1), delayChildren: d(0.1) },
    },
  };

  return (
    <footer
      ref={footerRef}
      className="relative border-t"
      style={{ borderColor: "#D97706", backgroundColor: "#0A0A0A" }}
    >
      {/* Top glow effect */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.12 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: d(0.8) }}
        className="absolute top-0 left-1/2 pointer-events-none"
        style={{
          width: "80%",
          height: 120,
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse 100% 50% at 50% 0%, #D97706 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <div
        className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 py-16 grid gap-12 md:grid-cols-3"
        style={{
          background: "rgba(10, 10, 10, 0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 12,
          margin: "0 auto",
        }}
      >
        {/* Brand column */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {footerBrand.kind === "img" ? (
            <motion.img
              variants={itemVariants}
              src={footerBrand.src}
              alt={footerBrand.alt}
              style={{ height: footerBrand.height, width: "auto", objectFit: "contain", display: "block" }}
            />
          ) : (
            <motion.div variants={itemVariants}>
              <div
                className="font-display"
                style={{ fontSize: 30, letterSpacing: "3px", fontWeight: 800, color: "#FAFAFA", lineHeight: 1 }}
              >
                {footerBrand.text}
              </div>
              <div
                style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#C0B5A0", marginTop: 6 }}
              >
                {footerBrand.sub}
              </div>
            </motion.div>
          )}
          <motion.p
            variants={itemVariants}
            className="mt-4 italic font-display"
            style={{ fontSize: 16, color: "#D97706", margin: 0 }}
          >
            For her, by her.
          </motion.p>
        </motion.div>

        {/* Explore column */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h4
            variants={itemVariants}
            className="uppercase mb-4"
            style={{ fontSize: 12, letterSpacing: "2px", color: "#D97706", margin: 0, fontWeight: 600 }}
          >
            Explore
          </motion.h4>
          <motion.ul
            className="space-y-2"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: { staggerChildren: d(0.05), delayChildren: d(0.2) },
              },
            }}
          >
            {QUICK_LINKS.map((l) => (
              <motion.li key={l.href} variants={itemVariants}>
                <a
                  href={l.href}
                  className="transition-colors duration-200"
                  style={{ fontSize: 14, color: "#C0B5A0" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#D97706";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#C0B5A0";
                  }}
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Connect column */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h4
            variants={itemVariants}
            className="uppercase mb-4"
            style={{ fontSize: 12, letterSpacing: "2px", color: "#D97706", margin: 0, fontWeight: 600 }}
          >
            Connect
          </motion.h4>
          <motion.ul
            className="space-y-2"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: { staggerChildren: d(0.05), delayChildren: d(0.2) },
              },
            }}
            style={{ fontSize: 14 }}
          >
            <motion.li variants={itemVariants}>
              <a
                href="mailto:admin@vieraamber.com"
                className="transition-colors duration-200"
                style={{ color: "#C0B5A0" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#D97706";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#C0B5A0";
                }}
              >
                admin@vieraamber.com
              </a>
            </motion.li>
            <motion.li variants={itemVariants} style={{ color: "#888888" }}>
              18 Ajose Street, Maryland, Lagos
            </motion.li>
            <motion.li variants={itemVariants}>
              <a
                href="https://instagram.com/viera_amber"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-200"
                style={{ color: "#C0B5A0" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#D97706";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#C0B5A0";
                }}
              >
                @viera_amber
              </a>
            </motion.li>
            <motion.li variants={itemVariants}>
              <a
                href="https://instagram.com/vieraamberva"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-200"
                style={{ color: "#C0B5A0" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#D97706";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#C0B5A0";
                }}
              >
                @vieraamberva
              </a>
            </motion.li>
          </motion.ul>
        </motion.div>
      </div>

      {/* Copyright section */}
      <motion.div
        className="border-t"
        style={{ borderColor: "#3A3A3A" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: d(0.6), delay: d(0.3) }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6" style={{ fontSize: 12, color: "#888888" }}>
          © 2026 Viera Amber. All rights reserved.
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
