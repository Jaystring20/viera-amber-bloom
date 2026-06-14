import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type Arm = {
  number: string;
  title: string;
  accent: string;
  description: string;
  cta: string;
  target: string;
  tag: string;
};

const ARMS: Arm[] = [
  {
    number: "01",
    title: "Illustrations & Designs",
    accent: "#D97706",
    description:
      "Vibrant, narrative-driven fashion illustrations celebrating women's diverse experiences. Commercial art that heals, inspires, and sells.",
    cta: "Enter the Studio →",
    target: "illustrations",
    tag: "Creative",
  },
  {
    number: "02",
    title: "VAGIN — Girls' Initiative",
    accent: "#62017F",
    description:
      "Corporate social responsibility targeting SRHR for young girls in underserved communities. 3,000+ girls impacted. SDG 3 & 5.",
    cta: "Join the Mission →",
    target: "vagin",
    tag: "Impact",
  },
  {
    number: "03",
    title: "VIVA",
    accent: "#6E0025",
    description:
      "An amalgamation of Viera Amber and Diva — high-end, structured yet fluid wearable art for the modern woman.",
    cta: "View the Collection →",
    target: "viva",
    tag: "Fashion",
  },
  {
    number: "04",
    title: "VAM — Masterclass",
    accent: "#888888",
    description:
      "Training young creatives to master digital design systems and fashion illustration — turning personal creative ideas into independent careers.",
    cta: "Join the Waitlist →",
    target: "vam",
    tag: "Education",
  },
  {
    number: "05",
    title: "VASH — Shop",
    accent: "#D97706",
    description:
      "Wearable art, premium Procreate brushes, pose references, and customized design products. The commercial engine of the ecosystem.",
    cta: "Shop Now →",
    target: "shop",
    tag: "Commerce",
  },
];

const EcosystemSection = () => {
  const reduced = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 });
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const footerInView = useInView(footerRef, { once: true, amount: 0.5 });

  const d = (s: number) => (reduced ? 0 : s);

  // Stagger animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: d(0.1), delayChildren: d(0.2) },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: d(0.6), ease: "easeOut" },
    },
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0F172A" }}
      aria-label="The Viera Amber Ecosystem"
    >
      {/* Subtle gradient background for depth */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.06 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: d(0.8) }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #D97706 0%, #78716C 50%, #0F172A 100%)",
          opacity: 0.04,
        }}
      />

      <div
        className="relative mx-auto"
        style={{
          maxWidth: 1400,
          padding: "clamp(60px, 8vw, 80px) clamp(24px, 4vw, 40px)",
        }}
      >
        {/* Header with parallax-like effect */}
        <motion.div
          ref={headerRef}
          className="flex flex-col items-center text-center"
          style={{ gap: 20 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { staggerChildren: d(0.1), delayChildren: d(0.1) },
            },
          }}
        >
          <motion.p
            variants={itemVariants}
            className="font-body uppercase"
            style={{ fontSize: 11, color: "#D97706", letterSpacing: "4px", margin: 0, fontWeight: 400 }}
          >
            The Ecosystem
          </motion.p>

          <motion.h2
            variants={{
              initial: { opacity: 0, y: 40 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { duration: d(0.7), ease: "easeOut" },
              },
            }}
            className="font-display"
            style={{
              fontSize: "clamp(28px, 4vw, 52px)",
              color: "#FAFAFA",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: 800,
            }}
          >
            One brand. Five expressions.
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="font-body"
            style={{
              fontSize: 16,
              color: "#C0B5A0",
              fontWeight: 300,
              maxWidth: 560,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Art. Impact. Fashion. Education. Commerce. All rooted in the same conviction: creativity is the most powerful form of empowerment.
          </motion.p>
        </motion.div>

        {/* Cards grid — top row */}
        <motion.div
          ref={gridRef}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="mt-16 grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {ARMS.slice(0, 3).map((arm) => (
            <ArmCard key={arm.number} arm={arm} reduced={!!reduced} onScroll={scrollTo} />
          ))}
        </motion.div>

        {/* Cards grid — bottom row */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { staggerChildren: d(0.1), delayChildren: d(0.3) },
            },
          }}
          className="mt-6 grid gap-6 mx-auto"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            maxWidth: 820,
          }}
        >
          {ARMS.slice(3).map((arm) => (
            <ArmCard key={arm.number} arm={arm} reduced={!!reduced} onScroll={scrollTo} />
          ))}
        </motion.div>

        {/* Bottom element — scroll indicator */}
        <motion.div
          ref={footerRef}
          className="flex flex-col items-center"
          style={{ marginTop: 48, gap: 16 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.5 }}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { duration: d(0.6), delay: d(0.4), ease: "easeOut" },
            },
          }}
        >
          <motion.div
            animate={
              reduced
                ? { height: 48 }
                : { height: [48, 64, 48] }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            style={{ width: 1, backgroundColor: "#D97706" }}
            aria-hidden="true"
          />
          <motion.p
            animate={
              reduced
                ? { opacity: 0.6 }
                : { opacity: [0.6, 1, 0.6] }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            className="font-body uppercase"
            style={{ fontSize: 12, color: "#D97706", letterSpacing: "2px", margin: 0, fontWeight: 400 }}
          >
            ↓ Scroll to explore each world
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

const ArmCard = ({
  arm,
  reduced,
  onScroll,
}: {
  arm: Arm;
  reduced: boolean;
  onScroll: (id: string) => void;
}) => {
  return (
    <motion.article
      variants={{
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.6, ease: "easeOut" } },
      }}
      whileHover={
        reduced
          ? undefined
          : {
              scale: 1.03,
              y: -4,
              transition: { type: "spring", stiffness: 350, damping: 25, duration: 0.3 },
            }
      }
      whileTap={reduced ? undefined : { scale: 0.98 }}
      className="group relative flex flex-col cursor-pointer"
      style={{
        background: "rgba(26, 26, 26, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid rgba(217, 119, 6, 0.15)`,
        borderRadius: 12,
        padding: "32px 28px",
        maxWidth: 380,
        width: "100%",
        justifySelf: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(217, 119, 6, 0.4)`;
        e.currentTarget.style.background = "rgba(26, 26, 26, 0.75)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(217, 119, 6, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(217, 119, 6, 0.15)";
        e.currentTarget.style.background = "rgba(26, 26, 26, 0.6)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
      }}
    >
      {/* Tag */}
      <span
        className="font-body uppercase absolute"
        style={{
          top: 16,
          right: 16,
          fontSize: 9,
          letterSpacing: "2px",
          color: arm.accent,
          border: `1px solid ${arm.accent}`,
          borderRadius: 999,
          padding: "3px 10px",
          fontWeight: 400,
        }}
      >
        {arm.tag}
      </span>

      {/* Number */}
      <span
        aria-hidden="true"
        className="font-body block"
        style={{
          fontSize: 12,
          color: arm.accent,
          letterSpacing: "3px",
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {arm.number}
      </span>

      {/* Title */}
      <h3
        className="font-display"
        style={{
          fontSize: 18,
          color: "#FAFAFA",
          fontWeight: 700,
          margin: 0,
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        {arm.title}
      </h3>

      {/* Description */}
      <p
        className="font-body"
        style={{
          fontSize: 14,
          color: "#888888",
          fontWeight: 300,
          lineHeight: 1.6,
          margin: 0,
          marginBottom: 24,
          flex: 1,
        }}
      >
        {arm.description}
      </p>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onScroll(arm.target)}
        className="font-body text-left self-start cursor-pointer bg-transparent border-0 p-0 hover:underline"
        style={{
          fontSize: 12,
          color: arm.accent,
          letterSpacing: "1px",
          fontWeight: 400,
          transition: "opacity 0.2s ease",
        }}
      >
        {arm.cta}
      </button>
    </motion.article>
  );
};

export default EcosystemSection;
