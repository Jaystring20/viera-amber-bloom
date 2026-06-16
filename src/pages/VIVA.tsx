import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import {
  fadeIn,
  fadeSlideUp,
  staggerContainer,
  cardItem,
  scaleXRule,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";
import { supabase } from "@/lib/supabase";

const BURGUNDY = "#6E0025";
const GOLD = "#D4AF37";
const GOLD_DIM = "rgba(212,175,55,0.2)";
const GOLD_BORDER = "rgba(212,175,55,0.3)";

const LOOKBOOK = [
  { title: "Hatmaker", mood: "Power & Craft", desc: "A woman who shapes her own crown. The Hatmaker speaks of quiet authority and inherited skill." },
  { title: "Jacqueline", mood: "Grace Under Fire", desc: "Elegance that has survived something. Structured, soft — a silhouette that has learned when to bend and when to hold." },
  { title: "Ada Set", mood: "Regal Certainty", desc: "For the woman who needs no introduction. Tailored with the confidence of a name already known." },
  { title: "Ibari Set", mood: "Cultural Reverence", desc: "Where tradition meets a new vocabulary. Ibari honours the garment as memory, as lineage, as pride." },
  { title: "Coronation", mood: "Divine Right", desc: "There is a moment when a woman stops asking permission. Coronation is that moment, dressed." },
  { title: "Golden Hour", mood: "Warmth & Light", desc: "The hour when everything you've built is lit from the right angle. Warm, burnished, yours." },
];

const PILLARS = [
  { heading: "Structured Fluidity", body: "Tailored lines paired with flowing fabrics. Precision and grace in one silhouette." },
  { heading: "Artistic Agency", body: "VIVA translates internal confidence into a vivid exterior statement. Every touchpoint is deliberate — gallery-grade." },
  { heading: "Sacred Identity", body: "The 'Batya' collection draws from spiritual lineage. Garments that say: I know who I am and whose I am." },
];

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${GOLD_BORDER}`,
  borderRadius: 6,
  padding: "12px 14px",
  color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: 13,
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const VIVAPage = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const pillarsRef = useRef<HTMLDivElement>(null);
  const lookbookRef = useRef<HTMLDivElement>(null);
  const enquiryRef = useRef<HTMLDivElement>(null);

  const pillarsInView = useInView(pillarsRef, inViewProps);
  const lookbookInView = useInView(lookbookRef, inViewProps);
  const enquiryInView = useInView(enquiryRef, inViewProps);

  const fadeVariants = useReducedVariants(fadeIn);
  const slideUpVariants = useReducedVariants(fadeSlideUp);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);
  const ruleVariants = useReducedVariants(scaleXRule);

  const d = (s: number) => (reduced ? 0 : s);

  const [form, setForm] = useState({ name: "", email: "", interest: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name,
        email: form.email,
        subject: `VIVA Enquiry: ${form.interest || "General"}`,
        message: form.message,
      });
      if (error) throw error;
      // Fire-and-forget email notification
      supabase.functions.invoke("notify-admin", {
        body: { type: "contact", data: { ...form, subject: `VIVA Enquiry: ${form.interest || "General"}` } },
      }).catch(() => {});
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ backgroundColor: BURGUNDY, minHeight: "100vh" }}>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{ position: "relative", overflow: "hidden", paddingTop: 120, paddingBottom: 80 }}
      >
        {/* Diagonal texture */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 10px)",
            pointerEvents: "none",
          }}
        />
        {/* Radial gold glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="mx-auto px-6 relative" style={{ maxWidth: 1100, zIndex: 1 }}>
          {/* Back link */}
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
              color: "rgba(212,175,55,0.6)",
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

          <div className="flex flex-col items-center text-center" style={{ gap: 20 }}>
            <motion.p
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.1) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "rgba(212,175,55,0.6)",
                letterSpacing: "6px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              By Viera Amber
            </motion.p>

            <motion.h1
              className="font-display"
              initial={{ opacity: 0, letterSpacing: reduced ? "14px" : "4px" }}
              animate={{ opacity: 1, letterSpacing: "14px" }}
              transition={{
                opacity: { duration: d(0.7), delay: d(0.2) },
                letterSpacing: { duration: d(1.5), ease: "easeOut", delay: d(0.2) },
              }}
              style={{
                fontSize: "clamp(64px, 12vw, 120px)",
                fontWeight: 700,
                color: GOLD,
                lineHeight: 1,
                margin: 0,
              }}
            >
              VIVA
            </motion.h1>

            <motion.div
              variants={ruleVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.9) }}
              aria-hidden="true"
              style={{ width: 56, height: 1, background: GOLD_BORDER, transformOrigin: "left center" }}
            />

            <motion.p
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(1.0) }}
              className="font-display"
              style={{
                fontStyle: "italic",
                fontSize: "clamp(20px, 3vw, 32px)",
                color: "rgba(250,245,246,0.9)",
                fontWeight: 400,
                margin: 0,
              }}
            >
              'Batya' — Daughters of Adonai
            </motion.p>

            <motion.p
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(1.2) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: "rgba(250,245,246,0.55)",
                maxWidth: 480,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Structured tailoring meets fluid artistic silhouettes. High-end wearable art
              for the modern woman who wears her confidence out loud.
            </motion.p>

            <motion.a
              href="#viva-enquiry"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("viva-enquiry")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
              }}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(1.4) }}
              whileHover={reduced ? {} : { opacity: 0.8, scale: 1.02 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 500,
                background: GOLD,
                color: BURGUNDY,
                border: "none",
                borderRadius: 4,
                padding: "13px 32px",
                cursor: "pointer",
                marginTop: 8,
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              Enquire About a Commission
            </motion.a>
          </div>
        </div>
      </section>

      {/* ── Brand Pillars ─────────────────────────────────────────────── */}
      <section className="w-full py-16" style={{ borderTop: `1px solid ${GOLD_BORDER}` }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <motion.div
            ref={pillarsRef}
            variants={staggerVariants}
            initial="hidden"
            animate={pillarsInView ? "visible" : "hidden"}
            className="grid gap-8"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            {PILLARS.map((p) => (
              <motion.div
                key={p.heading}
                variants={cardVariants}
                style={{ borderTop: `2px solid ${GOLD_DIM}`, paddingTop: 24 }}
              >
                <h3
                  className="font-display"
                  style={{ fontSize: 19, fontWeight: 700, color: "#FAF9F6", marginBottom: 10 }}
                >
                  {p.heading}
                </h3>
                <p style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 300,
                  color: "rgba(250,245,246,0.55)",
                  lineHeight: 1.75,
                  margin: 0,
                }}>
                  {p.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Lookbook ─────────────────────────────────────────────────── */}
      <section className="w-full py-16" style={{ borderTop: `1px solid ${GOLD_BORDER}` }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate={lookbookInView ? "visible" : "hidden"}
            className="flex flex-col items-center text-center mb-12"
            style={{ gap: 12 }}
          >
            <p style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11,
              color: "rgba(212,175,55,0.6)",
              letterSpacing: "5px",
              textTransform: "uppercase",
              margin: 0,
            }}>
              The Collection
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 700,
              color: "#FAF9F6",
              margin: 0,
              lineHeight: 1.2,
            }}>
              Batya Lookbook
            </h2>
          </motion.div>

          <motion.div
            ref={lookbookRef}
            variants={staggerVariants}
            initial="hidden"
            animate={lookbookInView ? "visible" : "hidden"}
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {LOOKBOOK.map((piece, i) => (
              <motion.div
                key={piece.title}
                variants={cardVariants}
                whileHover={reduced ? {} : { y: -4, borderColor: GOLD }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  border: `1px solid ${GOLD_BORDER}`,
                  borderRadius: 4,
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                {/* Artwork placeholder — gradient art */}
                <div
                  aria-hidden="true"
                  style={{
                    height: 220,
                    background: `linear-gradient(${135 + i * 20}deg,
                      rgba(110,0,37,0.9) 0%,
                      rgba(60,0,20,0.95) 40%,
                      rgba(${80 + i * 8},${30 + i * 5},${10 + i * 3},0.8) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at ${30 + i * 10}% ${40 + i * 8}%, rgba(212,175,55,0.12) 0%, transparent 60%)`,
                  }} />
                  <span className="font-display" style={{
                    fontSize: 13,
                    color: "rgba(212,175,55,0.5)",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    zIndex: 1,
                  }}>
                    {piece.title}
                  </span>
                </div>

                <div style={{ padding: "18px 20px", background: "rgba(0,0,0,0.25)" }}>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 10,
                    color: "rgba(212,175,55,0.65)",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    margin: "0 0 6px 0",
                  }}>
                    {piece.mood}
                  </p>
                  <h3 className="font-display" style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#FAF9F6",
                    margin: "0 0 8px 0",
                  }}>
                    {piece.title}
                  </h3>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 300,
                    color: "rgba(250,245,246,0.5)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    {piece.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Enquiry Form ─────────────────────────────────────────────── */}
      <section
        id="viva-enquiry"
        className="w-full py-20"
        style={{ borderTop: `1px solid ${GOLD_BORDER}` }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 680 }}>
          <motion.div
            ref={enquiryRef}
            variants={staggerVariants}
            initial="hidden"
            animate={enquiryInView ? "visible" : "hidden"}
            className="flex flex-col"
            style={{ gap: 0 }}
          >
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "rgba(212,175,55,0.6)",
                letterSpacing: "5px",
                textTransform: "uppercase",
                margin: "0 0 12px 0",
              }}
            >
              Commission Enquiry
            </motion.p>
            <motion.h2
              variants={slideUpVariants}
              className="font-display"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                color: "#FAF9F6",
                margin: "0 0 10px 0",
                lineHeight: 1.2,
              }}
            >
              Own a piece of VIVA.
            </motion.h2>
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 300,
                color: "rgba(250,245,246,0.5)",
                lineHeight: 1.75,
                margin: "0 0 32px 0",
              }}
            >
              Commissions are taken on a selective basis. Tell us about what you have in mind — garment, illustration, or bespoke collaboration — and we'll be in touch within 48 hours.
            </motion.p>

            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.5 }}
                  className="flex flex-col items-center text-center"
                  style={{ gap: 12, padding: "40px 0" }}
                  aria-live="polite"
                >
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: "50%",
                    border: `1px solid ${GOLD}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: GOLD,
                  }}>
                    ✓
                  </div>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#FAF9F6", margin: 0 }}>
                    Enquiry received.
                  </p>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 14, fontWeight: 300,
                    color: "rgba(250,245,246,0.5)", margin: 0,
                  }}>
                    We'll be in touch within 48 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleEnquiry}
                  className="flex flex-col"
                  style={{ gap: 12 }}
                  aria-label="VIVA commission enquiry form"
                >
                  <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="flex flex-col" style={{ gap: 6 }}>
                      <label htmlFor="viva-name" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>Name *</label>
                      <input
                        id="viva-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = GOLD_BORDER)}
                      />
                    </div>
                    <div className="flex flex-col" style={{ gap: 6 }}>
                      <label htmlFor="viva-email" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>Email *</label>
                      <input
                        id="viva-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = GOLD_BORDER)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col" style={{ gap: 6 }}>
                    <label htmlFor="viva-interest" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>I'm interested in</label>
                    <select
                      id="viva-interest"
                      value={form.interest}
                      onChange={(e) => setForm({ ...form, interest: e.target.value })}
                      style={{
                        ...inputStyle,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        color: form.interest ? "#FAFAFA" : "rgba(250,250,250,0.4)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = GOLD_BORDER)}
                    >
                      <option value="" style={{ color: "#888" }}>Select an option...</option>
                      <option value="Bespoke Garment" style={{ color: "#0A0A0A" }}>Bespoke Garment</option>
                      <option value="Fashion Illustration Commission" style={{ color: "#0A0A0A" }}>Fashion Illustration Commission</option>
                      <option value="Brand Collaboration" style={{ color: "#0A0A0A" }}>Brand Collaboration</option>
                      <option value="Editorial / Lookbook" style={{ color: "#0A0A0A" }}>Editorial / Lookbook</option>
                      <option value="General Enquiry" style={{ color: "#0A0A0A" }}>General Enquiry</option>
                    </select>
                  </div>

                  <div className="flex flex-col" style={{ gap: 6 }}>
                    <label htmlFor="viva-message" style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(212,175,55,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>Tell us more *</label>
                    <textarea
                      id="viva-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your vision, timeline, and any specific references..."
                      style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = GOLD_BORDER)}
                    />
                  </div>

                  {status === "error" && (
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "#EF4444", margin: 0 }}>
                      Something went wrong. Please email us directly at admin@vieraamber.com
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={reduced ? {} : { opacity: 0.9, scale: 1.01 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    className="flex items-center justify-center gap-2"
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11,
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      background: status === "loading" ? "rgba(212,175,55,0.6)" : GOLD,
                      color: BURGUNDY,
                      border: "none",
                      borderRadius: 6,
                      padding: "14px",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      width: "100%",
                    }}
                  >
                    {status === "loading" ? "Sending..." : (
                      <>Send Enquiry <Send size={12} /></>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${GOLD_BORDER}`,
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <p style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: 12,
          color: "rgba(212,175,55,0.35)",
          margin: 0,
          letterSpacing: "1px",
        }}>
          © {new Date().getFullYear()} Viera Amber. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default VIVAPage;
