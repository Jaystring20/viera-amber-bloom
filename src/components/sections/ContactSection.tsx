import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  slideInLeft,
  slideInRight,
  fadeIn,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

interface ContactDetails {
  label: string;
  value: string;
}

const CONTACT_DETAILS: ContactDetails[] = [
  { label: "Email", value: "admin@vieraamber.com" },
  { label: "Location", value: "18 Ajose Street, Maryland, Lagos" },
  { label: "Instagram", value: "@viera_amber" },
  { label: "X", value: "@vieraamberva" },
];

const INQUIRY_OPTIONS = [
  "Commission / Artwork",
  "VAGIN Sponsorship",
  "VIVA / Fashion",
  "VAM Masterclass",
  "Partnership",
  "Other",
];

const ContactSection = () => {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, inViewProps);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const leftVariants = useReducedVariants(slideInLeft);
  const rightVariants = useReducedVariants(slideInRight);
  const fadeVariants = useReducedVariants(fadeIn);

  const inputStyle: React.CSSProperties = {
    background: "rgba(17, 17, 17, 0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(217, 119, 6, 0.15)",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#FAFAFA",
    fontFamily: "DM Sans, system-ui, sans-serif",
    fontSize: 13,
    outline: "none",
    width: "100%",
    transition: "all 0.2s",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(217, 119, 6, 0.4)";
    e.target.style.background = "rgba(17, 17, 17, 0.75)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(217, 119, 6, 0.15)";
    e.target.style.background = "rgba(17, 17, 17, 0.6)";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      style={{
        backgroundColor: "#050505",
        borderTop: "1px solid #1A1A1A",
      }}
      className="w-full py-20"
    >
      <div
        ref={sectionRef}
        className="mx-auto px-6"
        style={{ maxWidth: 1100 }}
      >
        <div
          className="grid gap-12"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {/* ── Left ────────────────────────────────────────────────── */}
          <motion.div
            variants={leftVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-col"
            style={{ gap: 20 }}
          >
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: "#D97706",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 400,
                margin: 0,
              }}
            >
              Join Our Mission
            </p>

            <h2
              className="font-display"
              style={{
                fontSize: "clamp(24px, 3vw, 40px)",
                fontWeight: 700,
                color: "#FAFAFA",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Let's create something that matters.
            </h2>

            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 14,
                color: "#888888",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Whether you're a partner, sponsor, commission client, or simply
              someone who believes in what we're building — we'd love to hear
              from you.
            </p>

            <div className="flex flex-col" style={{ gap: 10 }}>
              {CONTACT_DETAILS.map((item) => (
                <p
                  key={item.label}
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  <span style={{ color: "#D97706" }}>{item.label}: </span>
                  <span style={{ color: "#666666" }}>{item.value}</span>
                </p>
              ))}
            </div>
          </motion.div>

          {/* ── Right — Form ─────────────────────────────────────────── */}
          <motion.div
            variants={rightVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col"
                  style={{ gap: 12 }}
                  aria-label="Contact Viera Amber"
                >
                  <label htmlFor="contact-name" className="sr-only">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />

                  <label htmlFor="contact-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />

                  <label htmlFor="contact-subject" className="sr-only">
                    Inquiry type
                  </label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    style={{
                      ...inputStyle,
                      color: form.subject ? "#FAFAFA" : "#888888",
                      backgroundColor: "#111111",
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="" disabled>
                      I'm reaching out about...
                    </option>
                    {INQUIRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} style={{ color: "#FAFAFA" }}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="contact-message" className="sr-only">
                    Your message
                  </label>
                  <textarea
                    id="contact-message"
                    placeholder="Your message..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: 100,
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />

                  <motion.button
                    type="submit"
                    whileHover={reduced ? {} : { opacity: 0.9, scale: 1.02 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      background: "#D97706",
                      color: "#0A0A0A",
                      border: "1px solid rgba(217, 119, 6, 0.3)",
                      borderRadius: 8,
                      padding: "13px",
                      cursor: "pointer",
                      width: "100%",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 16px rgba(217, 119, 6, 0.2)",
                    }}
                  >
                    Send Message
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.5 }}
                  className="flex flex-col items-center justify-center text-center"
                  style={{
                    minHeight: 300,
                    gap: 16,
                  }}
                  aria-live="polite"
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "1px solid #D97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: "#D97706",
                    }}
                  >
                    ✓
                  </div>
                  <p
                    className="font-display"
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#FAFAFA",
                      margin: 0,
                    }}
                  >
                    Message received.
                  </p>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 300,
                      fontSize: 14,
                      color: "#888888",
                      margin: 0,
                      maxWidth: 320,
                    }}
                  >
                    We'll be in touch within 48 hours.
                    <br />
                    For her, by her.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
