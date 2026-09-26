import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Send, Star, User, Check, AlertCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BURGUNDY = "#6E0025";
const GOLD = "#D4AF37";
const ALABASTER = "#FAF9F6";
const CREAM = "#F5EDE6";
const DARK_TEXT = "#221A1A";
const BURG_ALPHA = "rgba(110,0,37,0.14)";
const BURG_LIGHT = "rgba(110,0,37,0.08)";
const CORMORANT = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const SUCCESS_COLOR = "#2E7D32";
const ERROR_COLOR = "#C62828";

interface Feedback {
  id: string;
  name: string;
  comment: string;
  rating: number;
  created_at: string;
}

export default function VIVAFeedbackCarousel() {
  const reduced = useReducedMotion();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({ name: "", comment: "", rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch feedback on mount
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from("viva_feedback")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setFeedbacks(data || []);
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();

    // Subscribe to real-time updates
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel("viva_feedback_channel", { config: { broadcast: { self: true } } })
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "viva_feedback" },
            (payload) => {
              const newFeedback = payload.new as Feedback;
              setFeedbacks((prev) => [newFeedback, ...prev]);
              setCurrentIndex(0);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Feedback subscription active");
            }
          });
      } catch (err) {
        console.error("Failed to setup subscription:", err);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (reduced || feedbacks.length <= 1) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [feedbacks.length, reduced]);

  // Handle manual navigation
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const { error } = await supabase.from("viva_feedback").insert({
        name: formData.name.trim(),
        comment: formData.comment.trim(),
        rating: formData.rating,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setFormData({ name: "", comment: "", rating: 5 });
      setSubmitStatus("success");

      setTimeout(() => setSubmitStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFeedback = feedbacks[currentIndex];

  return (
    <section style={{ background: ALABASTER, padding: "clamp(40px, 8vw, 80px) clamp(16px, 5vw, 20px)", minHeight: "100dvh", display: "flex", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "clamp(40px, 8vw, 64px)" }}
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "clamp(10px, 2.5vw, 12px)",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: BURGUNDY,
              opacity: 0.6,
              marginBottom: "clamp(8px, 2vw, 12px)",
            }}
          >
            Customer Voices
          </p>
          <h2
            style={{
              fontFamily: CORMORANT,
              fontSize: "clamp(28px, 7vw, 52px)",
              fontWeight: 700,
              color: DARK_TEXT,
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
            }}
          >
            Wear Your Story
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: "clamp(13px, 3vw, 15px)",
              color: "rgba(34,26,26,0.65)",
              marginTop: "clamp(12px, 3vw, 20px)",
              maxWidth: "640px",
              margin: "clamp(12px, 3vw, 20px) auto 0",
              lineHeight: 1.6,
            }}
          >
            Share your VIVA experience. Feedback appears instantly in our rotating gallery—real voices, real stories, real impact.
          </p>
        </motion.div>

        {/* Main container: Full-width sections */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(40px, 8vw, 80px)",
            width: "100%",
          }}
        >
          {/* HERO: Full-Width Horizontal Scrolling Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #FAF9F6 0%, rgba(255,255,255,0.5) 100%)",
                borderRadius: 0,
                padding: "clamp(40px, 6vw, 60px) clamp(20px, 5vw, 40px)",
                minHeight: "clamp(600px, 70vh, 700px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "none",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: `2px solid ${BURG_ALPHA}`,
                      borderTopColor: BURGUNDY,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(34,26,26,0.5)" }}>
                    Loading stories...
                  </p>
                </motion.div>
              ) : feedbacks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 24,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${BURG_ALPHA}, rgba(212,175,55,0.1))`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 40,
                    }}
                  >
                    ✨
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: CORMORANT,
                        fontSize: 20,
                        fontWeight: 600,
                        color: DARK_TEXT,
                        margin: "0 0 8px 0",
                      }}
                    >
                      Your Story Awaits
                    </p>
                    <p
                      style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: 13,
                        color: "rgba(34,26,26,0.6)",
                        margin: 0,
                        maxWidth: "280px",
                        lineHeight: 1.6,
                      }}
                    >
                      Be the first to share how VIVA made you feel. Your feedback will appear here instantly.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(24px, 4vw, 40px)" }}>
                  {/* HORIZONTAL SCROLLING CAROUSEL */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "900px",
                      position: "relative",
                      perspective: "1200px",
                    }}
                  >
                    {/* Carousel Container - Horizontal Scroll */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{
                          duration: 0.5,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                        style={{
                          background: "#fff",
                          border: `1.5px solid ${BURG_ALPHA}`,
                          borderRadius: 16,
                          padding: "clamp(40px, 6vw, 56px)",
                          minHeight: "clamp(480px, 55vh, 560px)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxShadow: "0 8px 32px rgba(110,0,37,0.08)",
                        }}
                      >
                        {/* Opening Quotation Mark - Elegant Detail */}
                        <div style={{ marginBottom: "clamp(8px, 2vw, 12px)" }}>
                          <span
                            style={{
                              fontSize: "clamp(48px, 12vw, 72px)",
                              color: GOLD,
                              opacity: 0.25,
                              lineHeight: "0.8",
                              fontFamily: CORMORANT,
                              fontWeight: 700,
                            }}
                          >
                            "
                          </span>
                        </div>

                        {/* Rating Stars */}
                        <div style={{ display: "flex", gap: "clamp(6px, 1vw, 10px)", marginBottom: "clamp(20px, 3vw, 28px)" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, duration: 0.3 }}>
                              <Star
                                size={24}
                                style={{
                                  fill: i < currentFeedback.rating ? GOLD : "rgba(110,0,37,0.1)",
                                  color: i < currentFeedback.rating ? GOLD : "rgba(110,0,37,0.1)",
                                }}
                              />
                            </motion.div>
                          ))}
                        </div>

                        {/* Feedback Comment - Enhanced Typography */}
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(28px, 4vw, 40px)" }}>
                          <p
                            style={{
                              fontFamily: "DM Sans, system-ui, sans-serif",
                              fontSize: "clamp(16px, 3vw, 20px)",
                              color: DARK_TEXT,
                              lineHeight: 1.85,
                              margin: 0,
                              fontStyle: "italic",
                              opacity: 0.92,
                              letterSpacing: "0.3px",
                              textAlign: "center",
                              fontWeight: 400,
                            }}
                          >
                            {currentFeedback.comment}
                          </p>
                        </div>

                        {/* Divider - Subtle Luxury Detail */}
                        <div
                          style={{
                            height: "1px",
                            background: `linear-gradient(90deg, transparent, ${BURG_ALPHA}, transparent)`,
                            marginBottom: "clamp(20px, 3vw, 32px)",
                          }}
                        />

                        {/* Author Section - Clean & Elevated */}
                        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px, 2vw, 18px)", justifyContent: "center" }}>
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: "50%",
                              background: `linear-gradient(135deg, ${BURGUNDY}, ${GOLD})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              flexShrink: 0,
                              boxShadow: `0 4px 16px rgba(110,0,37,0.18)`,
                              fontSize: "22px",
                            }}
                          >
                            {currentFeedback.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p
                              style={{
                                fontFamily: "DM Sans, system-ui, sans-serif",
                                fontSize: "clamp(14px, 2.5vw, 16px)",
                                fontWeight: 700,
                                color: DARK_TEXT,
                                margin: 0,
                                letterSpacing: "0.3px",
                              }}
                            >
                              {currentFeedback.name}
                            </p>
                            <p
                              style={{
                                fontFamily: "DM Sans, system-ui, sans-serif",
                                fontSize: "clamp(11px, 2vw, 12px)",
                                color: "rgba(34,26,26,0.5)",
                                margin: "4px 0 0 0",
                              }}
                            >
                              {new Date(currentFeedback.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                  </div>

                  {/* Navigation Controls Below Carousel */}
                  {feedbacks.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "clamp(20px, 4vw, 32px)",
                        marginTop: "clamp(24px, 4vw, 40px)",
                      }}
                    >
                      {/* Indicators - Dots */}
                      <div style={{ display: "flex", gap: "clamp(8px, 1.5vw, 12px)", alignItems: "center" }}>
                        {feedbacks.slice(0, 7).map((_, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            whileTap={{ scale: 1.2 }}
                            whileHover={{ scale: 1.1 }}
                            type="button"
                            style={{
                              width: idx === currentIndex ? 32 : 10,
                              height: 10,
                              borderRadius: 5,
                              background: idx === currentIndex ? BURGUNDY : BURG_ALPHA,
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              border: "none",
                              padding: 0,
                              minWidth: 10,
                            }}
                            aria-label={`Go to feedback ${idx + 1}`}
                            aria-current={idx === currentIndex}
                          />
                        ))}
                        {feedbacks.length > 7 && (
                          <span
                            style={{
                              fontSize: "clamp(11px, 2vw, 12px)",
                              color: "rgba(34,26,26,0.5)",
                              fontFamily: "DM Sans, system-ui, sans-serif",
                              marginLeft: "6px",
                              fontWeight: 500,
                            }}
                          >
                            +{feedbacks.length - 7}
                          </span>
                        )}
                      </div>

                      {/* Counter */}
                      <div
                        style={{
                          fontSize: "clamp(12px, 2.5vw, 13px)",
                          color: "rgba(34,26,26,0.6)",
                          fontFamily: "DM Sans, system-ui, sans-serif",
                          fontWeight: 500,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {currentIndex + 1} / {feedbacks.length}
                      </div>
                    </motion.div>
                  )}

                  {/* Scroll Indicator */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, loop: Infinity }}
                    style={{
                      marginTop: "clamp(32px, 5vw, 48px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      opacity: 0.5,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "clamp(10px, 2vw, 11px)",
                        color: "rgba(34,26,26,0.5)",
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        margin: 0,
                      }}
                    >
                      Scroll Down
                    </p>
                    <ChevronDown size={16} color="rgba(110,0,37,0.4)" />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* CTA: Centered Feedback Form Below */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            style={{ width: "100%", maxWidth: "620px", margin: "0 auto" }}
          >
            <div
              style={{
                background: "#fff",
                border: `1.5px solid ${BURG_ALPHA}`,
                borderRadius: 16,
                padding: "clamp(32px, 6vw, 48px)",
                boxShadow: "0 4px 20px rgba(110,0,37,0.08)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ position: "relative", marginBottom: "clamp(8px, 2vw, 12px)" }}>
                <h3
                  style={{
                    fontFamily: CORMORANT,
                    fontSize: "clamp(28px, 6vw, 36px)",
                    fontWeight: 700,
                    color: DARK_TEXT,
                    margin: "0 0 clamp(8px, 1.5vw, 12px) 0",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Share Your Story
                </h3>
                <div
                  style={{
                    height: "2px",
                    width: "clamp(40px, 8vw, 60px)",
                    background: GOLD,
                    marginBottom: "clamp(20px, 4vw, 28px)",
                    opacity: 0.4,
                  }}
                />
                <p
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "clamp(13px, 2.5vw, 15px)",
                    color: "rgba(34,26,26,0.65)",
                    margin: "0 0 clamp(28px, 5vw, 36px) 0",
                    lineHeight: 1.65,
                  }}
                >
                  Tell us how VIVA made you feel. Your feedback appears instantly in the carousel above.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 5vw, 32px)" }}>
                {/* Name input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 10px)" }}>
                  <label
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: "clamp(11px, 2vw, 12px)",
                      fontWeight: 700,
                      color: DARK_TEXT,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                    htmlFor="feedback-name"
                  >
                    Your Name
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    style={{
                      width: "100%",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      padding: "clamp(12px, 2.5vw, 16px) clamp(14px, 2.5vw, 18px)",
                      border: `1.5px solid ${BURG_ALPHA}`,
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      backgroundColor: "rgba(245,237,230,0.3)",
                      minHeight: "48px",
                      color: DARK_TEXT,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = BURGUNDY;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${BURG_LIGHT}`;
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = BURG_ALPHA;
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.backgroundColor = "rgba(245,237,230,0.3)";
                    }}
                  />
                </div>

                {/* Rating */}
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vw, 16px)" }}>
                  <label
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: "clamp(11px, 2vw, 12px)",
                      fontWeight: 700,
                      color: DARK_TEXT,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    How would you rate your experience?
                  </label>
                  <div style={{ display: "flex", gap: "clamp(10px, 2vw, 14px)", alignItems: "center" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        whileTap={{ scale: 1.25 }}
                        whileHover={{ scale: 1.1 }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "48px",
                          minHeight: "48px",
                          transition: "all 0.2s ease",
                        }}
                        aria-label={`Rate ${star} stars`}
                        aria-pressed={star <= formData.rating}
                      >
                        <Star
                          size={32}
                          style={{
                            fill: star <= formData.rating ? GOLD : "rgba(110,0,37,0.12)",
                            color: star <= formData.rating ? GOLD : "rgba(110,0,37,0.12)",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 10px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
                    <label
                      style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: "clamp(11px, 2vw, 12px)",
                        fontWeight: 700,
                        color: DARK_TEXT,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                      htmlFor="feedback-comment"
                    >
                      Your Feedback
                    </label>
                    <span
                      style={{
                        fontSize: "clamp(10px, 2vw, 11px)",
                        color: "rgba(34,26,26,0.5)",
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {formData.comment.length} / 300
                    </span>
                  </div>
                  <textarea
                    id="feedback-comment"
                    value={formData.comment}
                    onChange={(e) => {
                      const text = e.target.value.slice(0, 300);
                      setFormData({ ...formData, comment: text });
                    }}
                    placeholder="Share your experience with VIVA..."
                    style={{
                      width: "100%",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      padding: "clamp(12px, 2.5vw, 16px) clamp(14px, 2.5vw, 18px)",
                      border: `1.5px solid ${BURG_ALPHA}`,
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "none",
                      minHeight: "clamp(120px, 22vh, 160px)",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      backgroundColor: "rgba(245,237,230,0.3)",
                      color: DARK_TEXT,
                      lineHeight: 1.6,
                    }}
                    maxLength={300}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = BURGUNDY;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${BURG_LIGHT}`;
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = BURG_ALPHA;
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.backgroundColor = "rgba(245,237,230,0.3)";
                    }}
                  />
                  <p
                    style={{
                      fontSize: "clamp(11px, 2vw, 12px)",
                      color: "rgba(34,26,26,0.55)",
                      margin: "4px 0 0 0",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    Be specific—tell us what made your experience special.
                  </p>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.comment.trim()}
                  whileTap={!isSubmitting ? { scale: 0.96 } : {}}
                  style={{
                    width: "100%",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "clamp(14px, 3vw, 18px) clamp(20px, 4vw, 28px)",
                    background:
                      submitStatus === "success"
                        ? `linear-gradient(135deg, ${SUCCESS_COLOR}, rgba(46,125,50,0.8))`
                        : submitStatus === "error"
                        ? ERROR_COLOR
                        : BURGUNDY,
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    cursor:
                      isSubmitting || !formData.name.trim() || !formData.comment.trim()
                        ? "not-allowed"
                        : "pointer",
                    opacity: isSubmitting || !formData.name.trim() || !formData.comment.trim() ? 0.65 : 1,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    minHeight: "52px",
                    boxShadow: submitStatus === "success" ? `0 4px 16px rgba(46,125,50,0.25)` : "0 4px 16px rgba(110,0,37,0.18)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && !(!formData.name.trim() || !formData.comment.trim()) && submitStatus !== "success") {
                      e.currentTarget.style.background = "rgba(110,0,37,0.85)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(110,0,37,0.3)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (submitStatus !== "success" && submitStatus !== "error") {
                      e.currentTarget.style.background = BURGUNDY;
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(110,0,37,0.18)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, loop: Infinity, ease: "linear" }}
                        style={{
                          width: 18,
                          height: 18,
                          border: `2px solid white`,
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                        }}
                      />
                      Submitting...
                    </>
                  ) : submitStatus === "success" ? (
                    <>
                      <Check size={18} strokeWidth={3} />
                      Feedback Submitted
                    </>
                  ) : submitStatus === "error" ? (
                    <>
                      <AlertCircle size={18} />
                      Try Again
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Feedback
                    </>
                  )}
                </motion.button>

                {/* Error message */}
                <AnimatePresence>
                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        background: "rgba(198, 40, 40, 0.08)",
                        border: `1px solid ${ERROR_COLOR}`,
                        borderRadius: 8,
                        padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <AlertCircle size={16} color={ERROR_COLOR} style={{ flexShrink: 0 }} />
                      <p
                        style={{
                          color: ERROR_COLOR,
                          fontSize: "clamp(12px, 2.5vw, 13px)",
                          margin: 0,
                          fontFamily: "DM Sans, system-ui, sans-serif",
                          lineHeight: 1.5,
                        }}
                      >
                        Something went wrong. Please check your details and try again.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </motion.div>
        </div>

        {/* Global styles */}
        <style>{`

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          input[type="text"],
          textarea {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
          }

          @supports (scrollbar-gutter: stable) {
            html {
              scrollbar-gutter: stable;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
