import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Printer, Pencil, Download, Star } from "lucide-react";
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

const TEAL = "#0B7B8C";
const TEAL_LIGHT = "#0E9BAF";
const TEAL_DIM = "rgba(11,123,140,0.08)";
const TEAL_BORDER = "rgba(11,123,140,0.2)";
const DARK = "#050E10";

const CATEGORIES = [
  {
    icon: Printer,
    title: "Fine Art Prints",
    desc: "Gallery-quality prints of Viera Amber's original illustrations. Limited editions, numbered and signed.",
    badge: "Limited Edition",
    cta: "Browse Prints",
    items: ["Hatmaker — Gold Series", "Jacqueline — Portrait Study", "Coronation — Statement Piece"],
  },
  {
    icon: Star,
    title: "Original Artworks",
    desc: "Own the original. One-of-a-kind pieces available for private collectors who want to hold the real thing.",
    badge: "Collectors",
    cta: "View Originals",
    items: ["Ada Set — Original Mixed Media", "Danfo Series — Acrylic on Canvas", "Golden Hour — Watercolour Original"],
  },
  {
    icon: Download,
    title: "Digital Downloads",
    desc: "Instant-access digital files — illustrations, wallpapers, and design assets for creatives who move fast.",
    badge: "Instant Access",
    cta: "Shop Digital",
    items: ["Fashion Figure Pack (Procreate)", "Colour Palette Collection", "Brand Mood Board Templates"],
  },
  {
    icon: Pencil,
    title: "Custom Commissions",
    desc: "A bespoke portrait, brand illustration, or event piece. Inquire with your brief and we'll create something just for you.",
    badge: "Personalised",
    cta: "Commission a Piece",
    items: ["Portrait Illustration", "Brand Identity Artwork", "Event / Wedding Illustration"],
  },
];

const FEATURED = [
  { title: "Hatmaker", category: "Fine Art Print", price: "₦85,000", size: "A3", mood: "Power", gradient: "160deg, #1a0a00, #4a2000" },
  { title: "Coronation", category: "Fine Art Print", price: "₦120,000", size: "A2", mood: "Regal", gradient: "200deg, #0a0020, #200040" },
  { title: "Golden Hour", category: "Original Artwork", price: "₦450,000", size: "50×70cm", mood: "Warmth", gradient: "140deg, #1a0a00, #3a2000" },
  { title: "Pink Means", category: "Fine Art Print", price: "₦85,000", size: "A3", mood: "Soft Power", gradient: "170deg, #200015, #500035" },
];

const VASHPage = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  const categoriesInView = useInView(categoriesRef, inViewProps);
  const featuredInView = useInView(featuredRef, inViewProps);
  const notifyInView = useInView(notifyRef, inViewProps);

  const fadeVariants = useReducedVariants(fadeIn);
  const slideUpVariants = useReducedVariants(fadeSlideUp);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  const d = (s: number) => (reduced ? 0 : s);

  const [email, setEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "done">("idle");

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNotifyStatus("done");
  };

  return (
    <div style={{ backgroundColor: "#F7FAFB", minHeight: "100vh" }}>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 60%, #F8F8F8 100%)`,
          paddingTop: 120,
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Mesh gradient */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(11,123,140,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(14,155,175,0.08) 0%, transparent 50%)
            `,
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
              color: "rgba(11,123,140,0.55)",
              cursor: "pointer",
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 12,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: 0,
            }}
            whileHover={reduced ? {} : { color: TEAL_LIGHT }}
          >
            <ArrowLeft size={13} /> Back
          </motion.button>

          <div className="flex flex-col items-center text-center" style={{ gap: 18 }}>
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.1) }}
              className="flex items-center gap-2"
            >
              <ShoppingBag size={14} color={TEAL_LIGHT} strokeWidth={1.5} />
              <p style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                color: TEAL_LIGHT,
                letterSpacing: "5px",
                textTransform: "uppercase",
                margin: 0,
              }}>
                VASH — Viera Amber Shop
              </p>
            </motion.div>

            <motion.h1
              className="font-display"
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.2) }}
              style={{
                fontSize: "clamp(36px, 7vw, 80px)",
                fontWeight: 700,
                color: "#111111",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Art you can
              <br />
              <span style={{ color: TEAL }}>live with.</span>
            </motion.h1>

            <motion.p
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.35) }}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 15,
                color: "rgba(17,17,17,0.65)",
                maxWidth: 440,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Prints, originals, digital assets, and custom commissions — the full universe of Viera Amber's creative work, available for you to own.
            </motion.p>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: d(0.5) }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: TEAL_DIM,
                border: `1px solid ${TEAL_BORDER}`,
                borderRadius: 999,
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: TEAL_LIGHT, display: "inline-block",
                animation: "pulse 2s infinite",
              }} />
              <span style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 12, color: TEAL_LIGHT, letterSpacing: "1px",
              }}>
                Shop opening soon — join the launch list
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section className="w-full py-20" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col items-center text-center mb-14" style={{ gap: 10 }}>
            <p style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11, color: TEAL,
              letterSpacing: "4px", textTransform: "uppercase", margin: 0,
            }}>
              What We Offer
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.15,
            }}>
              Four ways to own the work.
            </h2>
          </div>

          <motion.div
            ref={categoriesRef}
            variants={staggerVariants}
            initial="hidden"
            animate={categoriesInView ? "visible" : "hidden"}
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.title}
                  variants={cardVariants}
                  whileHover={reduced ? {} : { y: -4, borderColor: TEAL }}
                  transition={{ type: "spring" as const, stiffness: 300, damping: 22 }}
                  style={{
                    background: "#FAFAFA",
                    border: `1px solid #EBEBEB`,
                    borderTop: `3px solid ${TEAL}`,
                    borderRadius: 6,
                    padding: "26px 22px",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon size={18} color={TEAL} strokeWidth={1.5} />
                    <span style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 10,
                      color: TEAL,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      background: TEAL_DIM,
                      border: `1px solid ${TEAL_BORDER}`,
                      borderRadius: 999,
                      padding: "3px 10px",
                    }}>
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="font-display" style={{
                    fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 10,
                  }}>
                    {cat.title}
                  </h3>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13, fontWeight: 300, color: "#555",
                    lineHeight: 1.75, margin: "0 0 16px 0",
                  }}>
                    {cat.desc}
                  </p>

                  <ul className="flex flex-col" style={{ gap: 5, margin: "0 0 18px 0", padding: 0, listStyle: "none" }}>
                    {cat.items.map((item) => (
                      <li key={item} style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: 12, color: "#777",
                        paddingLeft: 14,
                        position: "relative",
                      }}>
                        <span style={{
                          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                          width: 4, height: 4, borderRadius: "50%",
                          background: TEAL, display: "inline-block",
                        }} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("vash-notify")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
                    }}
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11, letterSpacing: "1.5px",
                      textTransform: "uppercase", fontWeight: 500,
                      background: "transparent",
                      color: TEAL,
                      border: `1px solid ${TEAL}`,
                      borderRadius: 4,
                      padding: "9px 18px",
                      cursor: "pointer",
                      width: "100%",
                      transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = TEAL;
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = TEAL;
                    }}
                  >
                    {cat.cta} →
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Artworks ─────────────────────────────────────────── */}
      <section className="w-full py-20" style={{ background: "#F0F5F6" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col items-center text-center mb-12" style={{ gap: 10 }}>
            <p style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 11, color: TEAL,
              letterSpacing: "4px", textTransform: "uppercase", margin: 0,
            }}>
              Featured Works
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 700, color: DARK, margin: 0,
            }}>
              Arriving in the shop.
            </h2>
          </div>

          <motion.div
            ref={featuredRef}
            variants={staggerVariants}
            initial="hidden"
            animate={featuredInView ? "visible" : "hidden"}
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
          >
            {FEATURED.map((piece, i) => (
              <motion.div
                key={piece.title}
                variants={cardVariants}
                whileHover={reduced ? {} : { y: -4, scale: 1.01 }}
                transition={{ type: "spring" as const, stiffness: 280, damping: 22 }}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E0EBEC",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {/* Art placeholder */}
                <div
                  aria-hidden="true"
                  style={{
                    height: 200,
                    background: `linear-gradient(${piece.gradient})`,
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
                    background: `radial-gradient(ellipse at ${30 + i * 15}% ${40 + i * 12}%, rgba(11,123,140,0.15) 0%, transparent 60%)`,
                  }} />
                  <span className="font-display" style={{
                    fontSize: 13, color: "rgba(255,255,255,0.35)",
                    letterSpacing: "3px", textTransform: "uppercase", zIndex: 1,
                  }}>
                    {piece.title}
                  </span>
                  {/* "Coming soon" badge */}
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: 999, padding: "3px 10px",
                  }}>
                    <span style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 9, color: "rgba(255,255,255,0.7)",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                    }}>
                      Coming Soon
                    </span>
                  </div>
                </div>

                <div style={{ padding: "14px 16px" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display" style={{
                        fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 3px 0",
                      }}>
                        {piece.title}
                      </h3>
                      <p style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: 11, color: "#888", margin: 0,
                      }}>
                        {piece.category} · {piece.size}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 13, fontWeight: 600, color: TEAL,
                    }}>
                      {piece.price}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Notify Form ──────────────────────────────────────────────── */}
      <section
        id="vash-notify"
        className="w-full py-20"
        style={{ background: "#1A1A1A" }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 560 }}>
          <motion.div
            ref={notifyRef}
            variants={staggerVariants}
            initial="hidden"
            animate={notifyInView ? "visible" : "hidden"}
            className="flex flex-col items-center text-center"
            style={{ gap: 0 }}
          >
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11, color: TEAL_LIGHT,
                letterSpacing: "4px", textTransform: "uppercase",
                margin: "0 0 12px 0",
              }}
            >
              Launch List
            </motion.p>
            <motion.h2
              className="font-display"
              variants={slideUpVariants}
              style={{
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 700, color: "#FAFAFA",
                margin: "0 0 12px 0", lineHeight: 1.2,
              }}
            >
              Be first through the door.
            </motion.h2>
            <motion.p
              variants={fadeVariants}
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 14, fontWeight: 300,
                color: "rgba(250,250,250,0.45)", lineHeight: 1.75,
                margin: "0 0 32px 0", maxWidth: 380,
              }}
            >
              The shop is coming. Launch list members get early access to prints, originals, and limited-release pieces before they go live.
            </motion.p>

            <AnimatePresence mode="wait">
              {notifyStatus === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.4 }}
                  className="flex flex-col items-center"
                  style={{ gap: 10 }}
                  aria-live="polite"
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `1px solid ${TEAL_LIGHT}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: TEAL_LIGHT,
                  }}>
                    ✓
                  </div>
                  <p className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#FAFAFA", margin: 0 }}>
                    You're on the list.
                  </p>
                  <p style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 13, fontWeight: 300,
                    color: "rgba(250,250,250,0.45)", margin: 0,
                  }}>
                    We'll notify you the moment the shop opens.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleNotify}
                  aria-label="VASH shop launch notification"
                  className="flex gap-2 w-full"
                  style={{ maxWidth: 420 }}
                >
                  <label htmlFor="vash-email" className="sr-only">Email address</label>
                  <input
                    id="vash-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.07)",
                      border: `1px solid ${TEAL_BORDER}`,
                      borderRadius: 6,
                      padding: "12px 14px",
                      color: "#FAFAFA",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 13,
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = TEAL_LIGHT)}
                    onBlur={(e) => (e.target.style.borderColor = TEAL_BORDER)}
                  />
                  <motion.button
                    type="submit"
                    whileHover={reduced ? {} : { opacity: 0.9 }}
                    whileTap={reduced ? {} : { scale: 0.97 }}
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 11, letterSpacing: "1.5px",
                      textTransform: "uppercase", fontWeight: 500,
                      background: TEAL,
                      color: "#FAFAFA",
                      border: "none",
                      borderRadius: 6,
                      padding: "12px 20px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Notify Me
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
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

export default VASHPage;
