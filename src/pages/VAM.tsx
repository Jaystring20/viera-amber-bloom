import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Palette, Briefcase, Monitor, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import {
  fadeIn,
  fadeSlideUp,
  staggerContainer,
  cardItem,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";
import { supabase } from "@/lib/supabase";

const GOLD = "#D97706";
const GOLD_DIM = "rgba(217,119,6,0.08)";
const DARK = "#0A0A0A";

const PILLARS = [
  {
    num: "01",
    icon: Monitor,
    title: "Digital Design Systems",
    body: "Procreate, Adobe, and visual language mastery. Build the technical foundation every serious creative needs to produce professional-grade work.",
    includes: ["Procreate fundamentals + advanced", "Adobe Illustrator & Photoshop", "Digital colour theory", "Building a visual style guide"],
  },
  {
    num: "02",
    icon: Palette,
    title: "Fashion Illustration",
    body: "Figure, fabric, colour, composition. Learn to illustrate the way Viera Amber does — with soul and structure in every stroke.",
    includes: ["Fashion figure & croquis", "Fabric rendering techniques", "Colour palette construction", "From concept to final illustration"],
  },
  {
    num: "03",
    icon: Briefcase,
    title: "Business of Creativity",
    body: "Pricing, clientwork, digital product creation. Turn your art into a career — not just a passion. Build the income your talent deserves.",
    includes: ["Pricing your creative work", "Client management & contracts", "Digital product creation & sales", "Building your creative brand online"],
  },
];

const WHAT_YOU_GET = [
  "12 weeks of structured content",
  "Live critique sessions with Viera Amber",
  "Private student community",
  "Resource library (templates, references, palettes)",
  "Certificate of completion",
  "Lifetime access to course recordings",
];

const FOR_WHO = [
  "Aspiring fashion illustrators",
  "Brand creatives & visual designers",
  "Art students ready to go pro",
  "Self-taught designers seeking structure",
  "Anyone turning creativity into income",
];

const FAQS = [
  {
    q: "When does the first cohort start?",
    a: "We're announcing cohort dates to the waitlist first. Join to secure early-bird pricing and first access.",
  },
  {
    q: "Do I need prior experience?",
    a: "No. The masterclass is designed to take you from foundations to professional output. Intermediate students will also find depth in the later modules.",
  },
  {
    q: "What tools do I need?",
    a: "An iPad with Procreate and/or a laptop with Adobe Creative Cloud. We recommend both. A physical sketchbook is encouraged.",
  },
  {
    q: "Is this self-paced or live?",
    a: "Blended. Pre-recorded modules you work through at your pace, with scheduled live critique sessions twice a month.",
  },
];

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.97)",
  border: "1px solid #E8E8E8",
  borderRadius: 6,
  padding: "12px 14px",
  color: "#0A0A0A",
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: 13,
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const VAMPage = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const pillarsRef = useRef<HTMLDivElement>(null);
  const includesRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const pillarsInView = useInView(pillarsRef, inViewProps);
  const includesInView = useInView(includesRef, inViewProps);
  const waitlistInView = useInView(waitlistRef, inViewProps);
  const faqInView = useInView(faqRef, inViewProps);

  const fadeVariants = useReducedVariants(fadeIn);
  const slideUpVariants = useReducedVariants(fadeSlideUp);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  const d = (s: number) => (reduced ? 0 : s);

  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("loading");
    try {
      const { error } = await supabase.from("vam_waitlist").insert({
        name: form.name,
        email: form.email,
      });
      if (error) throw error;
      // Fire-and-forget email notification
      supabase.functions.invoke("notify-admin", {
        body: { type: "vam_waitlist", data: form },
      }).catch(() => {});
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)`,
          paddingTop: 120,
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grain texture */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 700,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(217,119,6,0.07) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div className="mx-auto px-6 relative" style={{ maxWidth: 1100, zIndex: 1 }}>
          <motion.button
            type="button"
            onClick={() => navigate("/")}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-1.5 mb-10"
            style={{
              background: "none",
              border: "none",
              color: "rgba(217,119,6,0.55)",
              cursor: "pointer",
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: 0,
            }}
            whileHover={reduced ? {} : { color: GOLD }}
          >
            <ArrowLeft size={13} /> Back
          </motion.button>

          <div className="flex flex-col items-center text-center" style={{ gap: 16 }}>
            <motion.p
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.1) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: GOLD,
                letterSpacing: "5px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              VAM — Viera Amber Masterclass
            </motion.p>

            <motion.h1
              className="font-display"
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.2) }}
              style={{
                fontSize: "clamp(32px, 6vw, 68px)",
                fontWeight: 700,
                color: "#111111",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Your art is a skill.
              <br />
              <span style={{ color: GOLD }}>Your skill is a business.</span>
            </motion.h1>

            <motion.p
              className="font-display"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.35) }}
              style={{
                fontStyle: "italic",
                fontSize: "clamp(16px, 2vw, 22px)",
                color: "rgba(17,17,17,0.6)",
                maxWidth: 440,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              "We teach both."
            </motion.p>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.5) }}
              className="flex flex-wrap justify-center gap-2 mt-2"
            >
              {FOR_WHO.map((label) => (
                <span
                  key={label}
                  style={{
                    border: "1px solid rgba(217,119,6,0.25)",
                    color: "rgba(17,17,17,0.65)",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 999,
                    display: "inline-block",
                  }}
                >
                  {label}
                </span>
              ))}
            </motion.div>

            <motion.a
              href="#vam-waitlist"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("vam-waitlist")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
              }}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.65) }}
              whileHover={reduced ? {} : { opacity: 0.9, scale: 1.02 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 500,
                background: GOLD,
                color: DARK,
                border: "none",
                borderRadius: 6,
                padding: "14px 36px",
                cursor: "pointer",
                marginTop: 12,
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              Join the Waitlist →
            </motion.a>
          </div>
        </div>
      </section>

      {/* ── Curriculum Pillars ───────────────────────────────────────── */}
      <section className="w-full py-20" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col items-center text-center mb-14" style={{ gap: 10 }}>
            <p style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11, color: GOLD,
              letterSpacing: "4px", textTransform: "uppercase", margin: 0,
            }}>
              The Curriculum
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.15,
            }}>
              Three pillars. One complete education.
            </h2>
          </div>

          <motion.div
            ref={pillarsRef}
            variants={staggerVariants}
            initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            className="grid gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
          >
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.num}
                  variants={cardVariants}
                  whileHover={reduced ? {} : { y: -3, borderColor: GOLD }}
                  transition={{ type: "spring" as const, stiffness: 320, damping: 22 }}
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid #EBEBEB",
                    borderTop: `3px solid ${GOLD}`,
                    borderRadius: 6,
                    padding: "28px 24px",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 700, fontSize: 10,
                      color: GOLD, letterSpacing: "3px",
                    }}>
                      {pillar.num}
                    </span>
                    <Icon size={15} color={GOLD} strokeWidth={1.5} />
                  </div>

                  <h3 className="font-display" style={{
                    fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 10,
                  }}>
                    {pillar.title}
                  </h3>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontWeight: 300, fontSize: 13, color: "#555",
                    lineHeight: 1.75, margin: "0 0 16px 0",
                  }}>
                    {pillar.body}
                  </p>

                  <ul className="flex flex-col" style={{ gap: 6, margin: 0, padding: 0, listStyle: "none" }}>
                    {pillar.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check size={11} color={GOLD} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span style={{
                          fontFamily: "DM Sans, system-ui, sans-serif",
                          fontSize: 12, color: "#666",
                        }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── What You Get ─────────────────────────────────────────────── */}
      <section className="w-full py-20" style={{ background: "#F8F8F8" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <motion.div
            ref={includesRef}
            variants={staggerVariants}
            initial="hidden"
            animate={includesInView ? "visible" : "hidden"}
            className="grid gap-12 items-center"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
          >
            <motion.div variants={cardVariants}>
              <p style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11, color: GOLD, letterSpacing: "4px",
                textTransform: "uppercase", margin: "0 0 12px 0",
              }}>
                What's Included
              </p>
              <h2 className="font-display" style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700, color: DARK, margin: "0 0 16px 0", lineHeight: 1.2,
              }}>
                Everything you need to level up.
              </h2>
              <p style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 14, fontWeight: 300,
                color: "#666", lineHeight: 1.75, margin: 0,
              }}>
                VAM is structured to give you the full picture — not just skills,
                but the confidence, community, and career foundation that comes with them.
              </p>
            </motion.div>

            <motion.ul
              variants={staggerVariants}
              className="flex flex-col"
              style={{ gap: 14, margin: 0, padding: 0, listStyle: "none" }}
            >
              {WHAT_YOU_GET.map((item) => (
                <motion.li
                  key={item}
                  variants={cardVariants}
                  className="flex items-center gap-3"
                  style={{
                    padding: "14px 18px",
                    background: "rgba(217,119,6,0.05)",
                    border: "1px solid rgba(217,119,6,0.15)",
                    borderRadius: 6,
                  }}
                >
                  <div style={{
                    width: 24, height: 24,
                    borderRadius: "50%",
                    background: GOLD_DIM,
                    border: `1px solid rgba(217,119,6,0.3)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Check size={11} color={GOLD} strokeWidth={2.5} />
                  </div>
                  <span style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13, color: "#333",
                  }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* ── Waitlist ─────────────────────────────────────────────────── */}
      <section
        id="vam-waitlist"
        className="w-full py-20"
        style={{ background: "#FFFFFF" }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 560 }}>
          <motion.div
            ref={waitlistRef}
            variants={staggerVariants}
            initial="hidden"
            animate={waitlistInView ? "visible" : "hidden"}
            className="flex flex-col items-center text-center"
            style={{ gap: 0 }}
          >
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11, color: GOLD,
                letterSpacing: "4px", textTransform: "uppercase",
                margin: "0 0 12px 0",
              }}
            >
              First Cohort
            </motion.p>
            <motion.h2
              className="font-display"
              variants={slideUpVariants}
              style={{
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 700, color: DARK, margin: "0 0 10px 0", lineHeight: 1.2,
              }}
            >
              Join the Waitlist
            </motion.h2>
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 14, fontWeight: 300,
                color: "#666", lineHeight: 1.75,
                margin: "0 0 32px 0", maxWidth: 400,
              }}
            >
              First cohort launching soon. Waitlist members get early access and first-look pricing before anyone else.
            </motion.p>

            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.5 }}
                  className="flex flex-col items-center"
                  style={{ gap: 12 }}
                  aria-live="polite"
                >
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: "50%",
                    border: `1.5px solid ${GOLD}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: GOLD, fontSize: 22,
                  }}>
                    ✓
                  </div>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: 0 }}>
                    You're on the list.
                  </p>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13, fontWeight: 300, color: "#888", margin: 0,
                  }}>
                    We'll reach out when the cohort opens. Watch your inbox.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleWaitlist}
                  className="flex flex-col w-full"
                  style={{ gap: 12, maxWidth: 400 }}
                  aria-label="VAM Masterclass waitlist"
                >
                  <div className="flex flex-col" style={{ gap: 5 }}>
                    <label htmlFor="vam-name" style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11, color: "#888",
                      letterSpacing: "2px", textTransform: "uppercase", textAlign: "left",
                    }}>
                      Full Name *
                    </label>
                    <input
                      id="vam-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}
                    />
                  </div>

                  <div className="flex flex-col" style={{ gap: 5 }}>
                    <label htmlFor="vam-email-input" style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11, color: "#888",
                      letterSpacing: "2px", textTransform: "uppercase", textAlign: "left",
                    }}>
                      Email Address *
                    </label>
                    <input
                      id="vam-email-input"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}
                    />
                  </div>

                  {status === "error" && (
                    <p style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 12, color: "#EF4444", textAlign: "left", margin: 0,
                    }}>
                      Something went wrong. Email us directly at admin@vieraamber.com
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={reduced ? {} : { opacity: 0.9, scale: 1.01 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11, letterSpacing: "2px",
                      textTransform: "uppercase", fontWeight: 500,
                      background: status === "loading" ? "rgba(217,119,6,0.5)" : GOLD,
                      color: DARK,
                      border: "none",
                      borderRadius: 6,
                      padding: "14px",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      width: "100%",
                      boxShadow: `0 4px 16px rgba(217,119,6,0.2)`,
                    }}
                  >
                    {status === "loading" ? "Saving..." : "Secure My Spot →"}
                  </motion.button>

                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 11, color: "#AAAAAA",
                    margin: 0, textAlign: "center",
                  }}>
                    No spam. Unsubscribe anytime.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="w-full py-20" style={{ background: "#F5F4F2" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 720 }}>
          <div className="flex flex-col items-center text-center mb-12" style={{ gap: 10 }}>
            <p style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11, color: GOLD, letterSpacing: "4px",
              textTransform: "uppercase", margin: 0,
            }}>
              FAQ
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 700, color: DARK, margin: 0,
            }}>
              Questions answered.
            </h2>
          </div>

          <motion.div
            ref={faqRef}
            variants={staggerVariants}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            className="flex flex-col"
            style={{ gap: 8 }}
          >
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E8E8E8",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between"
                  style={{
                    padding: "18px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  aria-expanded={openFaq === i}
                >
                  <span style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 14, fontWeight: 500, color: DARK,
                  }}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                  >
                    <ChevronDown size={16} color={GOLD} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.25, ease: "easeInOut" as const }}
                      style={{ overflow: "hidden" }}
                    >
                      <p style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: 13, fontWeight: 300,
                        color: "#555", lineHeight: 1.75,
                        padding: "0 20px 18px 20px", margin: 0,
                      }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        background: "#FAFAFA",
        borderTop: "1px solid #EFEFEF",
        padding: "28px 24px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 12, color: "#888", margin: 0, letterSpacing: "1px",
        }}>
          © {new Date().getFullYear()} Viera Amber. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default VAMPage;
