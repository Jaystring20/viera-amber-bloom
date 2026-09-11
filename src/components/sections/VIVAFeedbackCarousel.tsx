import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Send, Star, User, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BURGUNDY = "#6E0025";
const GOLD = "#D4AF37";
const ALABASTER = "#FAF9F6";
const CREAM = "#F5EDE6";
const DARK_TEXT = "#221A1A";
const BURG_ALPHA = "rgba(110,0,37,0.14)";
const CORMORANT = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";

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
    const subscription = supabase
      .channel("viva_feedback_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "viva_feedback" },
        (payload) => {
          const newFeedback = payload.new as Feedback;
          setFeedbacks((prev) => [newFeedback, ...prev]);
          // Reset to show new feedback
          setCurrentIndex(0);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
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
    }, 5000); // Change every 5 seconds

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

      // Clear form
      setFormData({ name: "", comment: "", rating: 5 });
      setSubmitStatus("success");

      // Reset status after 2 seconds
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
    <section style={{ background: ALABASTER, padding: "80px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: BURGUNDY,
              opacity: 0.5,
              marginBottom: 12,
            }}
          >
            Customer Voices
          </p>
          <h2
            style={{
              fontFamily: CORMORANT,
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 600,
              color: DARK_TEXT,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Wear Your Story
          </h2>
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(34,26,26,0.6)",
              marginTop: 16,
              maxWidth: "600px",
              margin: "16px auto 0",
            }}
          >
            Share how VIVA garments made you feel. Your feedback appears in real-time,
            rotating for everyone to see. Every story matters.
          </p>
        </motion.div>

        {/* Main container: Feedback carousel + Form side-by-side */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "start",
            "@media (max-width: 1024px)": {
              gridTemplateColumns: "1fr",
              gap: 30,
            },
          }}
        >
          {/* Left: Rotating Feedback Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div
              style={{
                background: "#fff",
                border: `1px solid ${BURG_ALPHA}`,
                borderRadius: 8,
                padding: 40,
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 20px rgba(110,0,37,0.08)",
              }}
            >
              {loading ? (
                <div style={{ textAlign: "center", color: "rgba(34,26,26,0.4)" }}>
                  <p>Loading testimonials...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div style={{ textAlign: "center", color: "rgba(34,26,26,0.4)" }}>
                  <p>Be the first to share your VIVA story.</p>
                </div>
              ) : (
                <>
                  {/* Carousel content with animation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      style={{ flex: 1 }}
                    >
                      {/* Rating stars */}
                      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            style={{
                              fill: i < currentFeedback.rating ? GOLD : "rgba(110,0,37,0.1)",
                              color: i < currentFeedback.rating ? GOLD : "rgba(110,0,37,0.1)",
                            }}
                          />
                        ))}
                      </div>

                      {/* Feedback comment */}
                      <blockquote
                        style={{
                          fontFamily: "DM Sans, system-ui, sans-serif",
                          fontSize: 16,
                          color: DARK_TEXT,
                          lineHeight: 1.7,
                          margin: "0 0 24px 0",
                          fontStyle: "italic",
                          opacity: 0.85,
                        }}
                      >
                        "{currentFeedback.comment}"
                      </blockquote>

                      {/* Author */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${BURGUNDY}, ${GOLD})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          <User size={20} />
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "DM Sans, system-ui, sans-serif",
                              fontSize: 14,
                              fontWeight: 600,
                              color: DARK_TEXT,
                              margin: 0,
                            }}
                          >
                            {currentFeedback.name}
                          </p>
                          <p
                            style={{
                              fontFamily: "DM Sans, system-ui, sans-serif",
                              fontSize: 11,
                              color: "rgba(34,26,26,0.5)",
                              margin: "4px 0 0 0",
                            }}
                          >
                            {new Date(currentFeedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation controls */}
                  {feedbacks.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 32,
                        paddingTop: 24,
                        borderTop: `1px solid ${BURG_ALPHA}`,
                      }}
                    >
                      <button
                        onClick={goToPrevious}
                        style={{
                          background: "transparent",
                          border: `1px solid ${BURG_ALPHA}`,
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: BURGUNDY,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            BURGUNDY;
                          (e.currentTarget as HTMLButtonElement).style.color =
                            ALABASTER;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            BURGUNDY;
                        }}
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* Indicators */}
                      <div style={{ display: "flex", gap: 8 }}>
                        {feedbacks.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                              width: idx === currentIndex ? 24 : 8,
                              height: 8,
                              borderRadius: 4,
                              background:
                                idx === currentIndex ? BURGUNDY : BURG_ALPHA,
                              cursor: "pointer",
                              transition: "all 0.3s",
                            }}
                          />
                        ))}
                      </div>

                      <button
                        onClick={goToNext}
                        style={{
                          background: "transparent",
                          border: `1px solid ${BURG_ALPHA}`,
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: BURGUNDY,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            BURGUNDY;
                          (e.currentTarget as HTMLButtonElement).style.color =
                            ALABASTER;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            BURGUNDY;
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  {/* Counter */}
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 16,
                      fontSize: 12,
                      color: "rgba(34,26,26,0.5)",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                    }}
                  >
                    {currentIndex + 1} of {feedbacks.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Right: Feedback submission form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div
              style={{
                background: "#fff",
                border: `1px solid ${BURG_ALPHA}`,
                borderRadius: 8,
                padding: 40,
                boxShadow: "0 4px 20px rgba(110,0,37,0.08)",
              }}
            >
              <h3
                style={{
                  fontFamily: CORMORANT,
                  fontSize: 28,
                  fontWeight: 600,
                  color: DARK_TEXT,
                  margin: "0 0 8px 0",
                }}
              >
                Share Your Story
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "rgba(34,26,26,0.6)",
                  margin: "0 0 32px 0",
                }}
              >
                Tell us how VIVA made you feel. Your feedback appears immediately in
                our rotating carousel above.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Name input */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: DARK_TEXT,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    style={{
                      width: "100%",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      padding: "12px 14px",
                      border: `1px solid ${BURG_ALPHA}`,
                      borderRadius: 6,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        BURGUNDY;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.borderColor =
                        BURG_ALPHA;
                    }}
                  />
                </div>

                {/* Rating */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: DARK_TEXT,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    Rating
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <Star
                          size={24}
                          style={{
                            fill:
                              star <= formData.rating ? GOLD : "rgba(110,0,37,0.1)",
                            color:
                              star <= formData.rating ? GOLD : "rgba(110,0,37,0.1)",
                            transition: "all 0.2s",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: DARK_TEXT,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Your Feedback
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    placeholder="Share your experience with VIVA..."
                    style={{
                      width: "100%",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      padding: "12px 14px",
                      border: `1px solid ${BURG_ALPHA}`,
                      borderRadius: 6,
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                      minHeight: "120px",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLTextAreaElement).style.borderColor =
                        BURGUNDY;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLTextAreaElement).style.borderColor =
                        BURG_ALPHA;
                    }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.comment.trim()}
                  style={{
                    width: "100%",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "12px 20px",
                    background:
                      submitStatus === "success" ? "rgba(34,139,34,0.1)" : BURGUNDY,
                    color: submitStatus === "success" ? "#228B22" : ALABASTER,
                    border: "none",
                    borderRadius: 6,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && submitStatus !== "success") {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(110,0,37,0.9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (submitStatus !== "success") {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        BURGUNDY;
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: `2px solid ${submitStatus === "success" ? "#228B22" : ALABASTER}`,
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Submitting...
                    </>
                  ) : submitStatus === "success" ? (
                    <>
                      ✓ Feedback Submitted
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Feedback
                    </>
                  )}
                </button>

                {submitStatus === "error" && (
                  <p
                    style={{
                      color: "#d32f2f",
                      fontSize: 12,
                      marginTop: 12,
                      textAlign: "center",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                    }}
                  >
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
