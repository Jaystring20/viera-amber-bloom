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
    accent: "#C8A96E",
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
    accent: "#C8A96E",
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
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 });
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const footerInView = useInView(footerRef, { once: true, amount: 0.5 });

  const d = (s: number) => (reduced ? 0 : s);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: "#111111" }}
      aria-label="The Viera Amber Ecosystem"
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 1400,
          padding: "clamp(60px, 8vw, 80px) clamp(24px, 4vw, 40px)",
        }}
      >
        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center text-center" style={{ gap: 20 }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: d(0.5) }}
            className="font-body uppercase"
            style={{ fontSize: 11, color: "#C8A96E", letterSpacing: "4px", margin: 0 }}
          >
            The Ecosystem
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: d(0.6), delay: d(0.1), ease: "easeOut" }}
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
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: d(0.6), delay: d(0.2) }}
            className="font-body"
            style={{
              fontSize: 16,
              color: "#888888",
              fontWeight: 300,
              maxWidth: 560,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Art. Impact. Fashion. Education. Commerce. All rooted in the same conviction: creativity is the most powerful form of empowerment.
          </motion.p>
        </div>

        {/* Cards grid */}
        <motion.div
          ref={gridRef}
          initial="initial"
          animate={gridInView ? "animate" : "initial"}
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: d(0.1) } },
          }}
          className="mt-16 grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {ARMS.slice(0, 3).map((arm) => (
            <ArmCard key={arm.number} arm={arm} reduced={!!reduced} onScroll={scrollTo} />
          ))}
        </motion.div>

        <motion.div
          initial="initial"
          animate={gridInView ? "animate" : "initial"}
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: d(0.1), delayChildren: d(0.3) } },
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

        {/* Bottom element */}
        <motion.div
          ref={footerRef}
          initial={{ opacity: 0 }}
          animate={footerInView ? { opacity: 1 } : {}}
          transition={{ duration: d(0.6), delay: d(0.4) }}
          className="flex flex-col items-center"
          style={{ marginTop: 48, gap: 16 }}
        >
          <div style={{ width: 1, height: 48, backgroundColor: "#C8A96E" }} aria-hidden="true" />
          <p
            className="font-body uppercase"
            style={{ fontSize: 12, color: "#888888", letterSpacing: "2px", margin: 0 }}
          >
            ↓ Scroll to explore each world
          </p>
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
        animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5, ease: "easeOut" } },
      }}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col"
      style={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #2A2A2A",
        borderRadius: 4,
        padding: "32px 28px",
        maxWidth: 380,
        width: "100%",
        justifySelf: "center",
        transition: "border-color 0.25s ease, background-color 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = arm.accent;
        e.currentTarget.style.backgroundColor = "#222222";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2A2A2A";
        e.currentTarget.style.backgroundColor = "#1A1A1A";
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
