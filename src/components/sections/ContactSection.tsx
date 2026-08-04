import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { supabase } from "@/lib/supabase";
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const leftVariants = useReducedVariants(slideInLeft);
  const rightVariants = useReducedVariants(slideInRight);
  const fadeVariants = useReducedVariants(fadeIn);

  const inputStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "2px solid #E8E8E8",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#111111",
    fontFamily: "DM Sans, system-ui, sans-serif",
    fontSize: 13,
    outline: "none",
    width: "100%",
    transition: "all 0.2s",
    boxShadow: "0 0 0 0 transparent",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#D97706";
    e.target.style.background = "#FFFFFF";
    e.target.style.boxShadow = "0 0 0 3px rgba(217, 119, 6, 0.1)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#E8E8E8";
    e.target.style.background = "#FFFFFF";
    e.target.style.boxShadow = "0 0 0 0 transparent";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(false);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name,
        email: form.email,
        subject: form.subject || "General Enquiry",
        message: form.message,
      });
      if (error) throw error;
      // Fire-and-forget email notification
      supabase.functions.invoke("notify-admin", {
        body: { type: "contact", data: form },
      }).catch(() => {});
      setSubmitted(true);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#FAFAFA",
        borderTop: "1px solid #EBEBEB",
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
                color: "#111111",
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
                color: "#666666",
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
                      color: form.subject ? "#111111" : "#888888",
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="" disabled>
                      I'm reaching out about...
                    </option>
                    {INQUIRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} style={{ color: "#111111" }}>
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

                  {saveError && (
                    <p style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 12,
                      color: "#EF4444",
                      margin: 0,
                    }}>
                      Something went wrong. Email us directly at admin@vieraamber.com
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={reduced || saving ? {} : { opacity: 0.9, scale: 1.02 }}
                    whileTap={reduced || saving ? {} : { scale: 0.98 }}
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      background: saving ? "rgba(217,119,6,0.55)" : "#D97706",
                      color: "#0A0A0A",
                      border: "1px solid rgba(217, 119, 6, 0.3)",
                      borderRadius: 8,
                      padding: "13px",
                      cursor: saving ? "not-allowed" : "pointer",
                      width: "100%",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 16px rgba(217, 119, 6, 0.2)",
                    }}
                  >
                    {saving ? "Sending..." : "Send Message"}
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
                      color: "#111111",
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
                      color: "#666666",
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
