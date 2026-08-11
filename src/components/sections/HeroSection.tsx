import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import logoSrc from "@/assets/viera-amber-logo.png";

/* ════════════════════════════════════════════════════════════════════════
   HERO — Jacqueline, masthead band

   Restores the client-approved photo hero and fixes the one thing that was
   actually wrong with it.

   The old treatment scrimmed the type with a soft radial blob:
     radial-gradient(ellipse 600px 400px at 50% 50%, rgba(255,255,255,.92) …)
   An edgeless wash has no shape, so it never reads as a decision — it reads
   as the middle of the picture being faded out. That is the "too bright"
   note: not the amount of white, the absence of an edge. Swapping it for a
   black wash kept the same flaw with the opposite value, which is why that
   attempt landed the same way.

   This replaces it with a masthead band, per the client's reference frame:
   hard top and bottom edges so it reads as a deliberate plate, feathered
   left and right so it dissolves into the portrait instead of ending in two
   blunt vertical seams. Same job, but shaped — so the white is now an
   authored element rather than haze.

   The portrait also carries more contrast than before. Half of "too bright"
   was the artwork itself sitting washed out; the reference frame has real
   blacks in the hat and hair, and that density is what lets a white band sit
   on top without the whole frame going pale.

   GUARDRAILS: no perpetual motion — the scroll cue is static, since the
   looping bob was explicitly called out as making the page hard to read.
   ════════════════════════════════════════════════════════════════════════ */

const INK = "#0A0A0A";
const PAPER = "#FFFFFF";
const MUTED = "rgba(10,10,10,0.62)";

/* Pulled back from 0.96. At near-opaque the frame was mostly white and the
   portrait had nowhere to breathe; letting more of the photograph read
   through the plate is what balances the two instead of the white winning. */
const BAND = "rgba(255,255,255,0.90)";

/* ARCH RADIUS — the plate is a portal, not a card.
   Large radius on the top corners, small on the bottom, so the shape reads as
   an arch rather than a rounded rectangle. Arches are a standing device in
   fashion and beauty editorial, and this one sits directly under the curve of
   the hat brim, so the geometry rhymes with the photograph instead of fighting
   it. Both values scale with the viewport so the arch keeps its proportion on
   a phone rather than flattening into a generic radius. */
// Flat by client direction — the arch shape (52-104px top, 14-26px bottom
// radius) described above was superseded by a site-wide flat-corner rule
// applied first to the VIVA hero's masthead plate; this card carries the
// same rule now. Left as named constants rather than deleted so the
// original arch rationale stays on record if it's ever revisited.
const ARCH_TOP = "0px";
const ARCH_BOTTOM = "0px";

/* NO MASK. Every previous pass feathered the left and right terminations —
   7%, then 4% — and every one of them read as bleed, because a gradient edge
   IS bleed no matter how narrow you make it. The plate is a hard-edged
   rectangle on all four sides. The edge is the design; softening it was the
   defect. */

const HeroSection = () => {
  const reduced = useReducedMotion();
  const d = (s: number) => (reduced ? 0 : s);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("ecosystem");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: d(1.4), staggerChildren: d(0.1), delayChildren: d(0.3) },
    },
  };

  const labelVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: d(0.5), ease: "easeOut" as const } },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.93 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 110, damping: 18, delay: d(0.1) },
    },
  };

  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: { duration: d(0.7), ease: "easeOut" as const, delay: d(0.15) } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: d(0.6), ease: "easeOut" as const, delay: d(0.2) } },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: d(0.6), ease: "easeOut" as const, delay: d(0.4) } },
  };

  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 200, damping: 22, delay: d(0.5) },
    },
  };

  /* The one authored moment: the plate settles onto the photograph.
     A clip wipe is wrong now that the shape is an arch — clip-path insets
     are square, so mid-animation you would watch the corners un-round. A
     scale settle keeps the silhouette intact the whole way through. */
  const bandVariants = {
    hidden: { opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.965 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: d(1.1), ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <>
      <style>{`
        /* The crop is tuned per breakpoint so the plate always bisects the
           portrait the way the reference does: brow and hat above the top
           edge, jaw and earring below the bottom one. Without this the plate
           slides over the face on narrow screens and the composition dies. */
        .hero-artwork { object-position: center 20%; }

        /* Tablet — portrait fills more of a squarer frame, so ease the crop up */
        @media (max-width: 1023px) {
          .hero-artwork { object-position: center 15%; }
        }

        /* ── Phone ──────────────────────────────────────────────────────
           Requirement: nothing of the portrait below the plate. The crop is
           pushed up so the frame holds the hat and brow, and the bottom fade
           is grown to just over half the viewport and reaches solid white
           EARLY (60% of its own height) rather than at the very bottom — so
           the jaw, earring and shoulder are gone, not merely dimmed. The
           result is portrait above, plate, clean paper below. */
        @media (max-width: 767px) {
          .hero-artwork {
            object-position: 58% 8%;
            transform: scale(1.34);
            transform-origin: 58% 20%;
          }
          /* This curve DECELERATES into white. The previous one climbed to
             0.92 by 44%, hit solid at 62%, then sat flat — and that abrupt
             change in rate is what drew a visible line across the seam on
             phones. Desktop never showed it because its curve keeps easing all
             the way to 100%. Same idea here: no stop where the slope jumps,
             so the photograph dissolves with no edge to catch, while still
             arriving at effectively solid white before the section ends. */
          .hero-bottom-fade {
            height: 56% !important;
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.10) 22%,
              rgba(255,255,255,0.34) 42%,
              rgba(255,255,255,0.62) 60%,
              rgba(255,255,255,0.83) 74%,
              rgba(255,255,255,0.95) 86%,
              rgba(255,255,255,0.99) 94%,
              rgba(255,255,255,1) 100%
            ) !important;
          }
          .hero-scroll-indicator { display: none; }
        }

        @media (max-width: 479px) {
          .hero-artwork {
            object-position: 60% 7%;
            transform: scale(1.38);
            transform-origin: 60% 18%;
          }
          .hero-bottom-fade { height: 60% !important; }
        }
      `}</style>

      <div
        ref={containerRef}
        className="hero-container relative w-full min-h-dvh overflow-hidden flex items-center justify-center px-4 sm:px-6"
        style={{ backgroundColor: PAPER }}
      >
        {/* ── Jacqueline portrait — high-contrast B&W, multiplied onto paper.
             Contrast is up and brightness slightly down against the previous
             pass: the reference frame holds true blacks, and that density is
             what stops the band from washing the whole composition out. ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <img
            src="/artworks/artwork_0064.webp"
            alt=""
            draggable={false}
            className="hero-artwork w-full h-full select-none"
            style={{
              objectFit: "cover",
              /* No multiply blend. Against a white ground it did nothing but
                 lift the midtones, which is half of why the hat rendered grey
                 instead of black. Straight contrast gets the reference's
                 density: true blacks in the hat and hair, clean separation. */
              /* 1.85 was overcooked — it crushed the hair and hat into a
                 single black mass and blew the background to paper. 1.5 keeps
                 true blacks in the brim while holding midtone detail in the
                 hair and jaw, which is where the drawing actually lives. */
              filter: "grayscale(100%) contrast(1.5) brightness(0.96) saturate(0)",
            }}
          />
        </div>

        {/* ── Bottom fade — the seam into the white Ecosystem section.
             Cut from 32% to 20% on desktop: at 32% it was climbing into the
             jaw and earring and bleaching them. On phones it deliberately
             goes the other way and grows tall enough to erase the lower
             portrait completely — see .hero-bottom-fade in the style block. ── */}
        <div
          aria-hidden="true"
          className="hero-bottom-fade absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "24%",
            /* Eased, not linear. A straight alpha ramp has a detectable start
               line — the eye finds the exact row where the wash begins. These
               stops approximate an S-curve so the photograph dissolves with no
               edge to catch on. */
            background:
              "linear-gradient(to bottom," +
              " rgba(255,255,255,0) 0%," +
              " rgba(255,255,255,0.06) 24%," +
              " rgba(255,255,255,0.26) 45%," +
              " rgba(255,255,255,0.56) 64%," +
              " rgba(255,255,255,0.84) 82%," +
              " rgba(255,255,255,1) 100%)",
            zIndex: 2,
          }}
        />

        {/* No top fade. The nav is its own dark floating pill and needs no
            scrim behind it, and a 14% white wash across the top was bleaching
            the hat — the single densest black in the frame and the thing the
            reference leads with. */}

        {/* ── Content on the masthead plate ───────────────────────────────
             The plate is a sized box, not a bleed. Its width and padding are
             the only things that set its dimensions, and the band layer is
             `inset: 0` against it — so the rectangle always wraps the copy
             with the same proportional margin at every breakpoint, and both
             feathered ends stay on screen.

             The band stays a separate layer behind the type: masking the
             content box itself would feather the words along with the plate. */}
        <div
          className="hero-plate relative mx-auto"
          style={{
            zIndex: 10,
            width: "100%",
            /* The hero container's own px-4/sm:px-6 supplies the outer margin,
               so the plate simply fills the column up to its ceiling. This is
               what keeps desktop, tablet and phone reading as the same object
               at different sizes rather than three different crops. */
            maxWidth: "min(100%, 880px)",
            paddingLeft: "clamp(26px, 5.5vw, 92px)",
            paddingRight: "clamp(26px, 5.5vw, 92px)",
            /* Vertical padding cut from 38-68px. The plate was running ~500px
               tall, which made it a panel rather than a masthead and pushed
               the white past the portrait's share of the frame. The arch needs
               a wide, low proportion to read as an arch at all. */
            paddingTop: "clamp(30px, 3.4vw, 48px)",
            paddingBottom: "clamp(30px, 3.4vw, 48px)",
          }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute pointer-events-none"
            variants={bandVariants}
            initial="hidden"
            animate="visible"
            style={{
              inset: 0,
              background: BAND,
              /* No mask, no border, no backdrop-filter. Three separate
                 attempts at "softening" this edge each produced the bleed:
                 a mask gradient fades it, a hairline draws a stroke the
                 reference does not have, and backdrop-filter ignores masks
                 entirely and leaves a hard blur rectangle of its own. Every
                 side stays crisp — the arch does the shaping, not a fade. */
              borderRadius: `${ARCH_TOP} ${ARCH_TOP} ${ARCH_BOTTOM} ${ARCH_BOTTOM}`,
            }}
          />

          <motion.div
            className="relative flex flex-col items-center text-center w-full"
            style={{ gap: "clamp(11px, 1.4vw, 17px)", zIndex: 1 }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={labelVariants}
              className="m-0"
              style={{
                fontSize: 13,
                color: INK,
                letterSpacing: "0.45em",
                fontWeight: 600,
                fontFamily: "var(--font-body, sans-serif)",
                textTransform: "uppercase",
              }}
            >
              EST. 2013
            </motion.p>

            <motion.h1 variants={logoVariants} className="m-0" style={{ lineHeight: 1 }}>
              <span className="sr-only">Viera Amber</span>
              <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="select-none"
                style={{
                  width: "clamp(172px, 30vw, 420px)",
                  height: "auto",
                  display: "block",
                  // Reverted: this file's source asset is the white hollow-
                  // outline mark, so it needs recoloring for a light
                  // background. A dilated, pre-colored dark asset replaced
                  // this for one revision to make the mark bolder, but the
                  // client flagged it as too thick — back to the original,
                  // unmodified stroke weight rather than guessing at some
                  // in-between thickness.
                  filter: "brightness(0) saturate(0)",
                }}
              />
            </motion.h1>

            <motion.div
              variants={dividerVariants}
              aria-hidden="true"
              style={{ width: 44, height: 1, backgroundColor: INK, transformOrigin: "center" }}
            />

            <motion.p
              variants={textVariants}
              className="m-0"
              style={{
                fontSize: "clamp(15px, 1.8vw, 20px)",
                color: MUTED,
                maxWidth: 520,
                lineHeight: 1.8,
                fontWeight: 400,
                fontFamily: "var(--font-body, sans-serif)",
                letterSpacing: "0.2px",
              }}
            >
              A creative ecosystem built for feminine empowerment.
            </motion.p>

            <motion.p
              variants={taglineVariants}
              className="m-0"
              style={{
                fontSize: "clamp(22px, 3vw, 40px)",
                color: INK,
                fontWeight: 600,
                fontFamily: "var(--font-display, serif)",
                fontStyle: "italic",
                letterSpacing: "-0.015em",
              }}
            >
              For her, by her.
            </motion.p>

            <motion.div variants={ctaVariants}>
              <button
                type="button"
                className="px-8 py-3 font-body uppercase tracking-widest min-h-[44px] transition-all hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-amber-600"
                style={{ backgroundColor: INK, color: PAPER, fontSize: 13, fontWeight: 600, borderRadius: 999, border: "none" }}
                onClick={handleScroll}
                aria-label="Scroll down to explore the Viera Amber ecosystem"
              >
                Explore the Ecosystem ↓
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll cue — static. The looping bob this used to carry was
              called out as making the page hard to read; it does not come
              back. */}
          <div
            className="hero-scroll-indicator absolute"
            style={{ bottom: "-3.25rem", left: "50%", transform: "translateX(-50%)" }}
            aria-hidden="true"
          >
            <div
              style={{
                width: 22,
                height: 38,
                border: `1.5px solid ${INK}`,
                borderRadius: 11,
                display: "flex",
                justifyContent: "center",
                paddingTop: 7,
                opacity: 0.55,
              }}
            >
              <div style={{ width: 2, height: 6, background: INK, borderRadius: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
