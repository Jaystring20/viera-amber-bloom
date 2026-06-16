import { useRef, useEffect, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  School,
  Globe,
  Target,
  Palette,
  Droplets,
  Flower2,
  Shield,
  Sparkles,
  HeartPulse,
  Handshake,
  Gift,
  ArrowRight,
  Heart,
  Scale,
  BookOpen,
  Layers,
  Network,
  BadgeCheck,
  PenLine,
  Mic2,
  Music,
  Brush,
  Camera,
  MapPin,
  Mail,
  Instagram,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import {
  fadeSlideUp,
  fadeIn,
  staggerContainer,
  cardItem,
  slideInLeft,
  slideInRight,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

const PINK = "#ED155D";
const PURPLE = "#62017F";
const PURPLE_LIGHT = "#C77DFF";
const PINK_LIGHT = "#F472B6";

// ─── Count-up hook ────────────────────────────────────────────────────────────
const useCountUp = (target: number, inView: boolean, duration = 2000): number => {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setCount(target); return; }
    let start: number | null = null;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - (1 - p) * (1 - p);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, reduced]);
  return count;
};

// ─── Reusable eyebrow + heading ───────────────────────────────────────────────
const SectionHead = ({
  eyebrow, heading, body, inView, reduced,
}: { eyebrow: string; heading: string; body?: string; inView: boolean; reduced: boolean }) => {
  const headV = useReducedVariants(fadeSlideUp);
  const fadeV = useReducedVariants(fadeIn);
  return (
    <div className="flex flex-col items-center text-center mb-12" style={{ gap: 16 }}>
      <motion.p
        variants={fadeV} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PINK, letterSpacing: "4px", textTransform: "uppercase", fontWeight: 400, margin: 0 }}
      >{eyebrow}</motion.p>
      <motion.h2
        variants={headV} initial="hidden" animate={inView ? "visible" : "hidden"}
        transition={{ delay: reduced ? 0 : 0.1 }}
        className="font-display"
        style={{ fontSize: "clamp(26px, 4vw, 48px)", fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: 1.12, maxWidth: 760 }}
      >{heading}</motion.h2>
      {body && (
        <motion.p
          variants={fadeV} initial="hidden" animate={inView ? "visible" : "hidden"}
          transition={{ delay: reduced ? 0 : 0.2 }}
          style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(250,250,250,0.6)", maxWidth: 600, lineHeight: 1.75, margin: 0 }}
        >{body}</motion.p>
      )}
    </div>
  );
};

// ─── Infinite carousel ────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  { src: "/vagin-images/vagin_team_01.webp", alt: "VAGIN team member at community event", location: "Nigeria" },
  { src: "/vagin-images/vagin_malawi_01.webp", alt: "VAGIN community session in Malawi", location: "Malawi" },
  { src: "/vagin-images/vagin_page_08_img_3.webp", alt: "Girls in community workshop", location: "Nigeria" },
  { src: "/vagin-images/vagin_malawi_02.webp", alt: "Reaching girls across Malawi", location: "Malawi" },
  { src: "/vagin-images/vagin_team_02.webp", alt: "Community outreach — two women making a difference", location: "Nigeria" },
  { src: "/vagin-images/vagin_malawi_03.webp", alt: "SRHR education session, Malawi", location: "Malawi" },
  { src: "/vagin-images/vagin_page_05_img_2.webp", alt: "Girls' gathering, VAGIN initiative", location: "Nigeria" },
  { src: "/vagin-images/vagin_malawi_04.webp", alt: "Girls empowered through art and education, Malawi", location: "Malawi" },
  { src: "/vagin-images/vagin_team_03.webp", alt: "VAGIN team at Clegg Girls Senior High School", location: "Nigeria" },
  { src: "/vagin-images/vagin_page_06_img_1.webp", alt: "Active session — girls participating in SRHR education", location: "Malawi" },
];

const InfiniteCarousel = () => {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) setTrackWidth(trackRef.current.scrollWidth / 2);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (paused || reduced) return;
    const speed = 60; // px/s
    let next = baseX.get() - (delta / 1000) * speed;
    if (trackWidth > 0 && next <= -trackWidth) next += trackWidth;
    baseX.set(next);
  });

  const doubled = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  return (
    <div
      style={{
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        ref={trackRef}
        className="flex"
        style={{ x: baseX, gap: 14 }}
      >
        {doubled.map((img, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden group"
            whileHover={reduced ? {} : { scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              flexShrink: 0,
              width: "clamp(260px, 28vw, 390px)",
              aspectRatio: "4/3",
              borderRadius: 14,
              border: "1px solid rgba(237,21,93,0.18)",
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(to top, rgba(98,1,127,0.7) 0%, transparent 55%)" }}
            />
            {img.location && (
              <div
                className="absolute bottom-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ transform: "translateY(4px)" }}
              >
                <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.85)", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500 }}>
                  {img.location}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const CURRICULUM = [
  { Icon: Flower2, title: "Puberty Basics", desc: "Understanding the body's changes with clarity — no shame, no myths.", color: PINK },
  { Icon: Shield, title: "Physical Safety", desc: "Protecting yourself with knowledge, boundaries, and confidence.", color: PURPLE_LIGHT },
  { Icon: Sparkles, title: "Hygiene & Wellness", desc: "Daily care practices for lifelong health and self-respect.", color: PINK },
  { Icon: HeartPulse, title: "Mental Health", desc: "Building confidence, self-love, and emotional resilience.", color: PURPLE_LIGHT },
];

const CORE_VALUES = [
  { Icon: Heart, title: "Faith", desc: "Rooted in Christian principles, we are guided by love, integrity, and service — upholding the dignity of every individual.", color: PINK },
  { Icon: Scale, title: "Equity & Justice", desc: "Fair treatment and opportunities for all, ensuring marginalized voices — especially adolescent girls — are uplifted and heard.", color: PURPLE_LIGHT },
  { Icon: BookOpen, title: "Empowerment", desc: "Equipping girls with the knowledge, skills, and resources to make informed decisions about their health and futures.", color: PINK },
  { Icon: Layers, title: "Inclusivity", desc: "Embracing every individual's uniqueness and creating safe, inclusive spaces where all girls can thrive.", color: PURPLE_LIGHT },
  { Icon: Network, title: "Community-Centered", desc: "Believing in collective action — involving families, communities, and local stakeholders to advance girls' health and rights.", color: PINK },
  { Icon: BadgeCheck, title: "Integrity", desc: "Committed to transparency, ethical conduct, and responsible stewardship — ensuring trust in all our partnerships.", color: PURPLE_LIGHT },
];

const ART_METHODS = [
  { Icon: PenLine, title: "Illustrations & Comics", desc: "Simple drawings and comics make puberty, menstruation, and consent relatable — shareable as printed handouts." },
  { Icon: Mic2, title: "Drama & Skits", desc: "Short role-plays help girls explore SRHR topics hands-on — peer pressure, consent, and health decision-making." },
  { Icon: Music, title: "Songs & Poetry", desc: "Music and spoken word resonate deeply. Girls create pieces reflecting their thoughts on self-respect and body autonomy." },
  { Icon: Brush, title: "Murals & Wall Art", desc: "School walls become ongoing SRHR resources — created with students, reinforcing health messages every day." },
  { Icon: Camera, title: "Photo Campaigns", desc: "Students capture what health and equality mean to them. Displayed in common areas, these foster pride and ownership." },
];

const VAGINPage = () => {
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const involveRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const missionInView = useInView(missionRef, inViewProps);
  const impactInView = useInView(impactRef, inViewProps);
  const programsInView = useInView(programsRef, inViewProps);
  const curriculumInView = useInView(curriculumRef, inViewProps);
  const involveInView = useInView(involveRef, inViewProps);

  const fadeV = useReducedVariants(fadeIn);
  const headV = useReducedVariants(fadeSlideUp);
  const staggerV = useReducedVariants(staggerContainer);
  const cardV = useReducedVariants(cardItem);
  const leftV = useReducedVariants(slideInLeft);
  const rightV = useReducedVariants(slideInRight);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      <NavBar />
      <main>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          aria-label="VAGIN — Girls' Initiative"
          className="relative w-full overflow-hidden flex flex-col items-center justify-center"
          style={{
            minHeight: "92vh",
            paddingTop: 110,
            paddingBottom: 0,
            background: "linear-gradient(160deg, #0D0015 0%, #1A0025 40%, #2C003E 70%, #0A0A0A 100%)",
          }}
        >
          {/* Backgrounds */}
          <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(237,21,93,0.015) 40px, rgba(237,21,93,0.015) 41px)", pointerEvents: "none" }} />
          <div aria-hidden="true" className="absolute" style={{ width: 640, height: 640, left: -200, top: -180, borderRadius: "50%", background: "radial-gradient(circle, rgba(98,1,127,0.5) 0%, transparent 65%)", filter: "blur(2px)", pointerEvents: "none" }} />
          <div aria-hidden="true" className="absolute" style={{ width: 500, height: 500, right: -130, bottom: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(237,21,93,0.3) 0%, transparent 65%)", filter: "blur(4px)", pointerEvents: "none" }} />

          {/* ── SPLIT HERO CONTENT ── */}
          <div
            className="relative mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-center justify-between"
            style={{ maxWidth: 1180, width: "100%", zIndex: 1, gap: "clamp(32px, 5vw, 72px)", paddingBottom: 80 }}
          >

            {/* ─ LEFT: text column ─ */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left" style={{ flex: "1 1 55%", gap: 26 }}>

              {/* LOCKUP: Logo | divider | Headline */}
              <div className="flex flex-col md:flex-row items-center" style={{ gap: 0 }}>

                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, x: reduced ? 0 : -28 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reduced ? 0 : -28 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24 }}
                  className="flex-shrink-0 flex items-center justify-center"
                >
                  <img
                    src="/vagin-logo.png"
                    alt="VAGIN — Viera Amber Girls' Initiative"
                    style={{
                      height: "clamp(80px, 10vw, 115px)",
                      width: "auto",
                      objectFit: "contain",
                      filter: "drop-shadow(0 0 28px rgba(237,21,93,0.5)) drop-shadow(0 2px 10px rgba(0,0,0,0.8))",
                    }}
                  />
                </motion.div>

                {/* Vertical divider — md+ */}
                <motion.div
                  className="hidden md:block flex-shrink-0"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={heroInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.55, ease: "easeOut", delay: 0.16 }}
                  style={{
                    width: 1,
                    height: "clamp(64px, 8vw, 100px)",
                    margin: "0 clamp(20px, 3.5vw, 44px)",
                    background: `linear-gradient(to bottom, transparent, ${PINK}, ${PURPLE}, transparent)`,
                    transformOrigin: "center",
                  }}
                />

                {/* Horizontal divider — mobile only */}
                <motion.div
                  className="block md:hidden"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={heroInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut", delay: 0.16 }}
                  style={{ width: 48, height: 1, margin: "16px 0", background: `linear-gradient(90deg, transparent, ${PINK}, transparent)`, transformOrigin: "center" }}
                />

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, x: reduced ? 0 : 28 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reduced ? 0 : 28 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24, delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  <h1
                    className="font-display m-0"
                    style={{ fontSize: "clamp(30px, 4.5vw, 56px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.04 }}
                  >
                    One girl<br />at a time.
                  </h1>
                </motion.div>
              </div>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 16 }}
                transition={reduced ? { duration: 0 } : { duration: 0.65, ease: "easeOut", delay: 0.28 }}
                className="m-0"
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(13px, 1.4vw, 16px)",
                  color: "rgba(250,250,250,0.62)",
                  maxWidth: 500,
                  lineHeight: 1.82,
                }}
              >
                The Viera Amber Girls' Initiative (VAGIN) uses art-powered sexual and reproductive
                health rights (SRHR) education to reach adolescent girls in underserved communities
                across Nigeria and Malawi — closing the gap between what girls need to know and what
                they are actually taught, keeping them informed, protected, and in school.
              </motion.p>

              {/* Impact chips */}
              <motion.div
                variants={fadeV}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                transition={{ delay: reduced ? 0 : 0.38 }}
                className="flex flex-wrap justify-center lg:justify-start"
                style={{ gap: 8 }}
              >
                {[
                  { v: "1,500+", l: "Girls Reached" },
                  { v: "2", l: "Countries" },
                  { v: "March 2022", l: "Founded" },
                ].map((c) => (
                  <span
                    key={c.l}
                    className="inline-flex items-baseline"
                    style={{
                      gap: 6,
                      background: "rgba(10,10,10,0.5)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(237,21,93,0.28)",
                      borderRadius: 999,
                      padding: "8px 16px",
                    }}
                  >
                    <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: PINK }}>{c.v}</span>
                    <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,250,0.52)" }}>{c.l}</span>
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={fadeV}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                transition={{ delay: reduced ? 0 : 0.46 }}
                className="flex flex-wrap justify-center lg:justify-start"
                style={{ gap: 12 }}
              >
                <button
                  type="button"
                  onClick={() => { const el = document.getElementById("get-involved"); if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }}
                  className="inline-flex items-center"
                  style={{
                    gap: 8, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, letterSpacing: "1px",
                    textTransform: "uppercase", fontWeight: 600,
                    background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 100%)`,
                    color: "#FAFAFA", border: "none", borderRadius: 999, padding: "13px 28px", cursor: "pointer", minHeight: 44,
                  }}
                >
                  Join the Mission <ArrowRight size={14} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, letterSpacing: "1px",
                    textTransform: "uppercase", fontWeight: 500, background: "transparent", color: PINK,
                    border: `1px solid ${PINK}`, borderRadius: 999, padding: "13px 28px", cursor: "pointer", minHeight: 44,
                  }}
                >
                  ← Back to Ecosystem
                </button>
              </motion.div>

              {/* ── Mobile photo strip (hidden on lg+) ── */}
              <motion.div
                variants={fadeV}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                transition={{ delay: reduced ? 0 : 0.55 }}
                className="flex lg:hidden w-full"
                style={{ gap: 10, marginTop: 8 }}
              >
                {[
                  { src: "/vagin-images/vagin_team_01.webp", alt: "VAGIN community event" },
                  { src: "/vagin-images/vagin_team_02.webp", alt: "Community outreach" },
                  { src: "/vagin-images/vagin_team_03.webp", alt: "Clegg Girls School" },
                ].map((img) => (
                  <div
                    key={img.src}
                    className="relative overflow-hidden"
                    style={{ flex: "1 1 0", borderRadius: 12, aspectRatio: "1/1", border: "1px solid rgba(237,21,93,0.2)" }}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(98,1,127,0.4) 0%, transparent 55%)" }} />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ─ RIGHT: photo cluster — desktop only ─ */}
            <div
              className="relative hidden lg:block flex-shrink-0"
              style={{
                flex: "0 0 44%", height: 540, alignSelf: "center",
                /* CSS mask fades cluster alpha into the background — no dark color overlay */
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 100%)",
                maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 100%)",
              }}
            >
              {/* Deep ambient bloom — sits behind all photos */}
              <div aria-hidden="true" className="absolute" style={{ left: "28%", top: "50%", width: 400, height: 400, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(237,21,93,0.22) 0%, rgba(98,1,127,0.14) 45%, transparent 70%)", filter: "blur(36px)", pointerEvents: "none", zIndex: 0 }} />

              {/* Photo 1 — tall portrait, starts 24px from left so the fade doesn't clip it */}
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 32 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 32 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 22, delay: 0.22 }}
                className="absolute overflow-hidden group"
                style={{ left: 24, top: 16, width: "54%", height: "74%", borderRadius: 20, border: "1.5px solid rgba(237,21,93,0.4)", transform: "rotate(-2deg)", boxShadow: "0 28px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(237,21,93,0.1), 0 0 48px rgba(98,1,127,0.25)", zIndex: 2 }}
              >
                <img src="/vagin-images/vagin_team_01.webp" alt="VAGIN girls celebrating at community event" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: "center 25%" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(13,0,21,0.55) 100%)" }} />
              </motion.div>

              {/* Photo 2 — Malawi, top right, CW tilt */}
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : -24 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : -24 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 22, delay: 0.38 }}
                className="absolute overflow-hidden group"
                style={{ right: 0, top: 0, width: "43%", height: "46%", borderRadius: 16, border: "1.5px solid rgba(237,21,93,0.28)", transform: "rotate(2.5deg)", boxShadow: "0 18px 52px rgba(0,0,0,0.65)", zIndex: 2 }}
              >
                <img src="/vagin-images/vagin_malawi_04.webp" alt="VAGIN girls in Malawi" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(13,0,21,0.45) 100%)" }} />
                <div className="absolute bottom-2.5 left-2.5" style={{ background: "rgba(10,10,10,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(191,127,217,0.4)", borderRadius: 6, padding: "4px 9px" }}>
                  <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, color: "#CF9FE8", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Malawi</span>
                </div>
              </motion.div>

              {/* Photo 3 — Nigeria, bottom right, slight CCW */}
              <motion.div
                initial={{ opacity: 0, x: reduced ? 0 : 24 }}
                animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reduced ? 0 : 24 }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 22, delay: 0.52 }}
                className="absolute overflow-hidden group"
                style={{ right: 0, bottom: 8, width: "43%", height: "47%", borderRadius: 16, border: "1.5px solid rgba(98,1,127,0.4)", transform: "rotate(-1.5deg)", boxShadow: "0 18px 52px rgba(0,0,0,0.65)", zIndex: 2 }}
              >
                <img src="/vagin-images/vagin_team_03.webp" alt="VAGIN team at Clegg Girls Senior High School" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(98,1,127,0.5) 0%, transparent 55%)" }} />
                <div className="absolute bottom-3 left-3" style={{ background: "rgba(10,10,10,0.72)", backdropFilter: "blur(8px)", border: "1px solid rgba(237,21,93,0.35)", borderRadius: 6, padding: "5px 10px" }}>
                  <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 9, color: PINK, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Lagos, Nigeria</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── GALLERY CAROUSEL ──────────────────────────────────────────────── */}
        <section
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid rgba(237,21,93,0.1)" }}
          aria-label="Community Impact Gallery"
        >
          <div className="mx-auto px-6 mb-10" style={{ maxWidth: 1200 }}>
            <motion.div
              variants={fadeSlideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <p className="font-body uppercase m-0" style={{ fontSize: 11, color: PINK, letterSpacing: "0.4em", marginBottom: 12 }}>See the Impact</p>
              <h2 className="font-display m-0" style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.15, marginBottom: 8 }}>
                Girls changing their stories
              </h2>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.5)", margin: 0 }}>
                Hover to pause · More photos being added
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <InfiniteCarousel />
          </motion.div>
        </section>

        {/* ── MISSION ────────────────────────────────────────────────────── */}
        <section
          ref={missionRef}
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A" }}
          aria-label="The Mission"
        >
          <div className="mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center" style={{ maxWidth: 1100 }}>
            <motion.div variants={leftV} initial="hidden" animate={missionInView ? "visible" : "hidden"}>
              <p className="font-body uppercase m-0" style={{ fontSize: 11, color: PINK, letterSpacing: "0.3em", marginBottom: 16 }}>The Mission</p>
              <h2 className="font-display m-0" style={{ fontSize: "clamp(24px, 3.4vw, 40px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.15, marginBottom: 18 }}>
                Health, dignity, and rights — for every girl.
              </h2>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(250,250,250,0.65)", lineHeight: 1.8, margin: 0, marginBottom: 14 }}>
                Across underserved communities, too many girls miss school, opportunity, and
                confidence for one reason: a lack of knowledge, products, and support around
                their own bodies. Period poverty and stigma keep them behind.
              </p>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(250,250,250,0.65)", lineHeight: 1.8, margin: 0 }}>
                VAGIN exists to change that — pairing stigma-free, illustration-led education
                with practical menstrual support, so every girl can stay in school and in
                control of her future.
              </p>
              <div className="flex flex-wrap" style={{ gap: 10, marginTop: 22 }}>
                <span className="inline-flex items-center" style={{ gap: 8, background: "rgba(98,1,127,0.18)", border: `1px solid ${PURPLE_LIGHT}66`, borderRadius: 999, padding: "8px 16px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: PURPLE_LIGHT, fontWeight: 600 }}>
                  <Target size={15} strokeWidth={2} /> SDG 3 &amp; 5
                </span>
                <span className="inline-flex items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "8px 16px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.7)", fontWeight: 500 }}>
                  Founded March 2022
                </span>
              </div>
            </motion.div>

            {/* visual panel */}
            <motion.div
              variants={rightV}
              initial="hidden"
              animate={missionInView ? "visible" : "hidden"}
              className="relative overflow-hidden group"
              style={{ borderRadius: 18, minHeight: 360, border: "1px solid rgba(237,21,93,0.2)" }}
            >
              <img
                src="/vagin-images/vagin_team_02.webp"
                alt="VAGIN community outreach"
                className="w-full h-full object-cover"
                style={{ minHeight: 360 }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,0.1) 0%, rgba(98,1,127,0.45) 100%)" }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <span aria-hidden="true" className="flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: 22, background: "rgba(237,21,93,0.15)", border: "1px solid rgba(237,21,93,0.4)", marginBottom: 20, backdropFilter: "blur(8px)" }}>
                  <Users size={36} color={PINK_LIGHT} strokeWidth={1.5} />
                </span>
                <p className="font-display" style={{ fontSize: 24, color: "#FAFAFA", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Real girls. Real change.</p>
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13.5, color: "rgba(250,250,250,0.72)", marginTop: 10, maxWidth: 340, lineHeight: 1.65 }}>
                  Operating in Nigeria and Malawi, reaching one classroom at a time.
                </p>
              </div>
              <div className="absolute" style={{ left: 18, bottom: 18, background: "rgba(10,10,10,0.65)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "8px 16px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.06em", color: "#FAFAFA", fontWeight: 500 }}>
                <span style={{ color: PINK, fontWeight: 700 }}>1,500+</span> lives changed
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WHY SRHR ───────────────────────────────────────────────────── */}
        <section
          className="w-full py-20"
          style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #0F0018 60%, #0A0A0A 100%)", borderTop: "1px solid rgba(237,21,93,0.1)" }}
          aria-label="Why SRHR?"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <motion.div
              variants={fadeSlideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-14"
            >
              <p className="font-body uppercase m-0" style={{ fontSize: 11, color: PINK, letterSpacing: "0.4em", marginBottom: 12 }}>The Problem</p>
              <h2 className="font-display m-0" style={{ fontSize: "clamp(26px, 4vw, 48px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.12, maxWidth: 700, margin: "0 auto", marginBottom: 16 }}>
                Why SRHR matters right now.
              </h2>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 15, color: "rgba(250,250,250,0.6)", maxWidth: 580, margin: "0 auto", lineHeight: 1.75 }}>
                The numbers demand urgency. For adolescent girls in low-resourced settings,
                access to SRHR information is not optional — it is the difference between
                reaching their full potential or facing a future of limited choices.
              </p>
            </motion.div>

            {/* Stat cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14"
            >
              {[
                {
                  stat: "50%",
                  body: "of married women globally lack autonomy over their Sexual and Reproductive Health and Rights.",
                  source: "UN SDG Report, 2023",
                  accent: PINK,
                },
                {
                  stat: "300 years",
                  body: "is how long it will take to end child marriage at the current pace — if nothing changes.",
                  source: "UN SDG Report, 2023",
                  accent: PURPLE_LIGHT,
                },
              ].map((s) => (
                <motion.div
                  key={s.stat}
                  variants={cardItem}
                  className="flex flex-col"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.accent}33`, borderLeft: `3px solid ${s.accent}`, borderRadius: 14, padding: "32px 28px", gap: 14 }}
                >
                  <span className="font-display" style={{ fontSize: "clamp(44px, 6vw, 68px)", fontWeight: 700, color: s.accent, lineHeight: 1 }}>{s.stat}</span>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(250,250,250,0.8)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                  <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Source: {s.source}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Barriers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="p-7 rounded-xl"
              style={{ background: "rgba(237,21,93,0.06)", border: "1px solid rgba(237,21,93,0.18)" }}
            >
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PINK, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14, margin: 0, marginBottom: 12 }}>
                What girls in low-resourced settings face
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["Cultural Stigma", "Silence and shame around reproductive health keep girls from seeking help or asking questions."],
                  ["Lack of Education", "Without accurate information, girls cannot protect themselves or advocate for their own wellbeing."],
                  ["Limited Healthcare", "Early pregnancy, forced marriage, and reproductive illness fill the gaps where education and access are absent."],
                ].map(([title, desc]) => (
                  <div key={title}>
                    <p className="font-display m-0" style={{ fontSize: 14, fontWeight: 700, color: "#FAFAFA", marginBottom: 6 }}>{title}</p>
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,250,250,0.6)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WHY ART ────────────────────────────────────────────────────── */}
        <section
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid rgba(98,1,127,0.15)" }}
          aria-label="Why Art?"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
              {/* Left: explanation + research */}
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <p className="font-body uppercase m-0" style={{ fontSize: 11, color: PURPLE_LIGHT, letterSpacing: "0.4em", marginBottom: 14 }}>The Method</p>
                <h2 className="font-display m-0" style={{ fontSize: "clamp(26px, 4vw, 46px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.12, marginBottom: 20 }}>
                  Why art is the right tool for this work.
                </h2>
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(250,250,250,0.65)", lineHeight: 1.8, marginBottom: 18 }}>
                  Research confirms what we've always believed: art-based teaching methodology
                  for SRHR education <em style={{ color: "rgba(250,250,250,0.85)", fontStyle: "normal", fontWeight: 500 }}>increases participation and recall</em> among young women.
                  Art does what lectures and pamphlets cannot — it makes difficult conversations safe,
                  engaging, and memorable.
                </p>
                <div className="flex flex-col" style={{ gap: 10 }}>
                  {[
                    { cite: "Hartley et al., 2023", finding: "Art-based SRHR teaching increases participation and recall in young women." },
                    { cite: "Widarini et al., 2019", finding: "Art improved adolescents' knowledge and attitudes towards premarital sex and health decision-making." },
                  ].map((r) => (
                    <div key={r.cite} style={{ background: "rgba(98,1,127,0.12)", border: "1px solid rgba(199,125,255,0.2)", borderRadius: 10, padding: "14px 18px" }}>
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PURPLE_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, margin: 0, marginBottom: 4 }}>{r.cite}</p>
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13.5, color: "rgba(250,250,250,0.75)", lineHeight: 1.6, margin: 0 }}>{r.finding}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: 5 art methods */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex flex-col"
                style={{ gap: 10 }}
              >
                {ART_METHODS.map((m, i) => (
                  <motion.div
                    key={m.title}
                    variants={cardItem}
                    className="flex items-start"
                    style={{ gap: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "18px 20px" }}
                  >
                    <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 10, background: i % 2 === 0 ? `${PINK}1A` : `${PURPLE}33`, border: `1px solid ${i % 2 === 0 ? PINK : PURPLE_LIGHT}44` }}>
                      <m.Icon size={18} color={i % 2 === 0 ? PINK : PURPLE_LIGHT} strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="font-display m-0" style={{ fontSize: 15, fontWeight: 700, color: "#FAFAFA", marginBottom: 4 }}>{m.title}</p>
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,250,250,0.6)", lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── IMPACT band ────────────────────────────────────────────────── */}
        <section
          ref={impactRef}
          className="w-full py-20"
          style={{ background: "linear-gradient(135deg, #1A0025 0%, #0F172A 100%)", borderTop: "1px solid rgba(237,21,93,0.12)", borderBottom: "1px solid rgba(237,21,93,0.12)" }}
          aria-label="Our Impact"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1000 }}>
            <SectionHead
              eyebrow="Our Impact"
              heading="Measured in futures, not numbers."
              inView={impactInView}
              reduced={!!reduced}
            />
            <motion.div
              variants={staggerV}
              initial="hidden"
              animate={impactInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { Icon: Users, val: 1500, suffix: "+", label: "Girls Reached (Current)" },
                { Icon: School, val: 2, suffix: "", label: "Countries Operating" },
                { Icon: Globe, val: 2022, suffix: "", label: "Founded" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  variants={cardV}
                  className="flex flex-col items-center text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(237,21,93,0.18)", borderRadius: 14, padding: "32px 20px", gap: 12 }}
                >
                  <span aria-hidden="true" className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(237,21,93,0.12)", border: "1px solid rgba(237,21,93,0.3)" }}>
                    <s.Icon size={22} color={PINK_LIGHT} strokeWidth={1.75} />
                  </span>
                  <span className="font-display" style={{ fontSize: "clamp(34px, 4vw, 46px)", fontWeight: 700, color: PINK, lineHeight: 1 }} aria-live="polite">
                    {s.val.toLocaleString()}{s.suffix}
                  </span>
                  <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(250,250,250,0.55)" }}>{s.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Project 2029 */}
            <motion.div
              variants={fadeV}
              initial="hidden"
              animate={impactInView ? "visible" : "hidden"}
              transition={{ delay: reduced ? 0 : 0.35 }}
              className="mt-8 p-6 rounded-xl"
              style={{ background: "rgba(237,21,93,0.07)", border: "1px solid rgba(237,21,93,0.22)" }}
            >
              <p className="m-0" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PINK, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>
                Project 2029 — Our 5-Year Vision
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[["50K+", "Girls by 2029"], ["5", "Countries"], ["2K+", "Girls/Year"]].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="font-display m-0" style={{ fontSize: 28, fontWeight: 700, color: "#FAFAFA", marginBottom: 4 }}>{val}</p>
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.7)", margin: 0 }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── PROGRAMS ───────────────────────────────────────────────────── */}
        <section
          ref={programsRef}
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A" }}
          aria-label="The Programs"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <SectionHead
              eyebrow="The Programs"
              heading="Two ways we change the story."
              body="Education and access, working together — one teaches, one equips."
              inView={programsInView}
              reduced={!!reduced}
            />
            <motion.div
              variants={staggerV}
              initial="hidden"
              animate={programsInView ? "visible" : "hidden"}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <ProgramBlock
                Icon={Palette}
                accent={PURPLE}
                accentText={PURPLE_LIGHT}
                tag="Education"
                title="VaginART"
                body="Stigma-free digital illustration and visual templates that teach adolescent girls about puberty, hygiene, and personal wellness — with clarity, warmth, and dignity. Art does what lectures can't: it makes the conversation safe."
                cardV={cardV}
              />
              <ProgramBlock
                Icon={Droplets}
                accent={PINK}
                accentText={PINK_LIGHT}
                tag="Access"
                title="PAD KOLO Project"
                body="Tackling period poverty head-on through menstrual health support paired with micro-savings. WhatsApp-enabled school distribution, tracked via an impact dashboard — keeping girls in school, one pad at a time."
                cardV={cardV}
              />
            </motion.div>
          </div>
        </section>

        {/* ── VAGINART CURRICULUM ────────────────────────────────────────── */}
        <section
          ref={curriculumRef}
          className="w-full py-20"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #1A0025 100%)", borderTop: "1px solid rgba(217,119,6,0.08)" }}
          aria-label="VaginART Curriculum"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <SectionHead
              eyebrow="VaginART Curriculum"
              heading="What every girl deserves to know."
              body="A visual-first curriculum that turns hard conversations into clear, beautiful learning."
              inView={curriculumInView}
              reduced={!!reduced}
            />
            <motion.div
              variants={staggerV}
              initial="hidden"
              animate={curriculumInView ? "visible" : "hidden"}
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}
            >
              {CURRICULUM.map((c) => (
                <motion.div
                  key={c.title}
                  variants={cardV}
                  whileHover={reduced ? {} : { y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "26px 22px" }}
                >
                  <span aria-hidden="true" className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 12, background: `${c.color}1F`, border: `1px solid ${c.color}55`, marginBottom: 16 }}>
                    <c.Icon size={22} color={c.color} strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#FAFAFA", marginBottom: 8 }}>{c.title}</h3>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,250,250,0.6)", lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CORE VALUES ────────────────────────────────────────────────── */}
        <section
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid rgba(237,21,93,0.08)" }}
          aria-label="Our Core Values"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <motion.div
              variants={fadeSlideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <p className="font-body uppercase m-0" style={{ fontSize: 11, color: PINK, letterSpacing: "0.4em", marginBottom: 12 }}>What We Stand For</p>
              <h2 className="font-display m-0" style={{ fontSize: "clamp(26px, 4vw, 48px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.12 }}>
                Our core values.
              </h2>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}
            >
              {CORE_VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  variants={cardItem}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderTop: `3px solid ${v.color}`,
                    borderRadius: 14,
                    padding: "26px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <span className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 11, background: `${v.color}1A`, border: `1px solid ${v.color}44` }}>
                    <v.Icon size={21} color={v.color} strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display m-0" style={{ fontSize: 17, fontWeight: 700, color: "#FAFAFA", marginBottom: 7 }}>{v.title}</h3>
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(250,250,250,0.62)", lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── GET INVOLVED ───────────────────────────────────────────────── */}
        <section
          id="get-involved"
          ref={involveRef}
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A" }}
          aria-label="Get Involved"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <SectionHead
              eyebrow="Get Involved"
              heading="Change a girl's story with us."
              body="Whether you give, partner, or volunteer — every contribution keeps a girl in school."
              inView={involveInView}
              reduced={!!reduced}
            />
            <motion.div
              variants={staggerV}
              initial="hidden"
              animate={involveInView ? "visible" : "hidden"}
              className="grid gap-4 mb-12"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
            >
              {[
                { Icon: Gift, title: "Become a Sponsor", desc: "Fund pads, curricula, and school programs that reach girls directly." },
                { Icon: Handshake, title: "Partner With Us", desc: "Schools, NGOs, and brands — let's scale impact across more communities." },
                { Icon: Users, title: "Volunteer", desc: "Lend your skills — illustration, teaching, logistics, or storytelling." },
              ].map((c) => (
                <motion.div
                  key={c.title}
                  variants={cardV}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "28px 24px" }}
                >
                  <span aria-hidden="true" className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(237,21,93,0.14)", border: "1px solid rgba(237,21,93,0.35)", marginBottom: 16 }}>
                    <c.Icon size={22} color={PINK_LIGHT} strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display" style={{ fontSize: 19, fontWeight: 700, color: "#FAFAFA", marginBottom: 10 }}>{c.title}</h3>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 13.5, color: "rgba(250,250,250,0.6)", lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/#contact")}
                className="inline-flex items-center"
                style={{
                  gap: 8, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, letterSpacing: "1px",
                  textTransform: "uppercase", fontWeight: 600, background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 100%)`,
                  color: "#FAFAFA", border: "none", borderRadius: 999, padding: "15px 36px", cursor: "pointer", minHeight: 44,
                }}
              >
                Talk to the Team <ArrowRight size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>
        {/* ── CONTACT ────────────────────────────────────────────────────── */}
        <section
          className="w-full py-20"
          style={{ background: "linear-gradient(135deg, #0D0015 0%, #1A0025 60%, #0A0A0A 100%)", borderTop: "1px solid rgba(237,21,93,0.12)" }}
          aria-label="Contact VAGIN"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 900 }}>
            <motion.div
              variants={fadeSlideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-12"
            >
              <p className="font-body uppercase m-0" style={{ fontSize: 11, color: PINK, letterSpacing: "0.4em", marginBottom: 12 }}>Reach Us</p>
              <h2 className="font-display m-0" style={{ fontSize: "clamp(26px, 4vw, 46px)", fontWeight: 700, color: "#FAFAFA", lineHeight: 1.12, marginBottom: 14 }}>
                Let's connect.
              </h2>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 15, color: "rgba(250,250,250,0.6)", lineHeight: 1.75, margin: 0 }}>
                Whether you want to partner, volunteer, donate, or just learn more —
                we'd love to hear from you.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                {
                  Icon: MapPin,
                  label: "Address",
                  value: "18 Ajose Street,\nMaryland, Lagos",
                  href: undefined,
                  color: PINK,
                },
                {
                  Icon: Mail,
                  label: "Email",
                  value: "vieraambergirlsinitiative\n@vieraamber.com",
                  href: "mailto:vieraambergirlsinitiative@vieraamber.com",
                  color: PURPLE_LIGHT,
                },
                {
                  Icon: Instagram,
                  label: "Instagram",
                  value: "@viera_amber_girls_initiative",
                  href: "https://instagram.com/viera_amber_girls_initiative",
                  color: PINK,
                },
              ].map((c) => (
                <motion.div
                  key={c.label}
                  variants={cardItem}
                  className="flex flex-col items-center text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "28px 20px", gap: 12 }}
                >
                  <span className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 13, background: `${c.color}1A`, border: `1px solid ${c.color}44` }}>
                    <c.Icon size={22} color={c.color} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: c.color, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, margin: 0, marginBottom: 6 }}>{c.label}</p>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13.5, color: "rgba(250,250,250,0.85)", lineHeight: 1.55, textDecoration: "none", whiteSpace: "pre-wrap" }}
                        className="hover:underline"
                      >{c.value}</a>
                    ) : (
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13.5, color: "rgba(250,250,250,0.85)", lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap" }}>{c.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

// ─── Program detail block ─────────────────────────────────────────────────────
const ProgramBlock = ({
  Icon, accent, accentText, tag, title, body, cardV,
}: {
  Icon: typeof Users;
  accent: string;
  accentText: string;
  tag: string;
  title: string;
  body: string;
  cardV: ReturnType<typeof useReducedVariants>;
}) => (
  <motion.div
    variants={cardV}
    className="flex flex-col"
    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderTop: `3px solid ${accent}`, borderRadius: 16, padding: "34px 30px" }}
  >
    <div className="flex items-center" style={{ gap: 14, marginBottom: 18 }}>
      <span aria-hidden="true" className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, background: `${accent}22`, border: `1px solid ${accentText}55` }}>
        <Icon size={26} color="#FAFAFA" strokeWidth={1.75} />
      </span>
      <span className="font-body uppercase" style={{ fontSize: 10, color: accentText, letterSpacing: "0.16em", border: `1px solid ${accentText}`, borderRadius: 999, padding: "3px 11px", fontWeight: 600 }}>
        {tag}
      </span>
    </div>
    <h3 className="font-display" style={{ fontSize: 26, fontWeight: 700, color: "#FAFAFA", marginBottom: 12 }}>{title}</h3>
    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontWeight: 300, fontSize: 14.5, color: "rgba(250,250,250,0.65)", lineHeight: 1.75, margin: 0 }}>{body}</p>
  </motion.div>
);

export default VAGINPage;
