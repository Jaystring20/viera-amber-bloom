import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// Same tokens as VIVA.tsx (src/pages/VIVA.tsx) — this page is a continuation
// of that page's story, not a new brand surface, so it inherits the exact
// same palette and type system rather than introducing a second one.
const ALABASTER  = "#FAF9F6";
const CREAM      = "#F5EDE6";
const BURGUNDY   = "#6E0025";
const GOLD       = "#D4AF37";
const DARK_TEXT  = "#221A1A";
const CORMORANT  = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const SANS       = "DM Sans, system-ui, sans-serif";
const BURG_ALPHA = "rgba(110,0,37,0.14)";

const inViewProps = { once: true, margin: "0px 0px -80px 0px" } as const;

// ═══════════════════════════════════════════════════════════
// STORY SECTION — shared shell for Ajogún and Nká: a real product
// photo on one side, the narrative on the other. The two sections
// alternate image side (Ajogún: image left / Nká: image right) —
// exactly two of this layout family in a row, which is the cap.
// Collection Coherence and the closing CTA use different layout
// families afterward so the page doesn't read as one repeated split.
// ═══════════════════════════════════════════════════════════
interface StorySectionProps {
  reverse?: boolean;
  image: string;
  imageAlt: string;
  name: string;
  meaning: string;
  scripture: string;
  story: string[];
  whatThisMeans: string;
  forTheWearer: string[];
  line: string;
  pieceQuote: string;
}

const StorySection = ({ reverse, image, imageAlt, name, meaning, scripture, story, whatThisMeans, forTheWearer, line, pieceQuote }: StorySectionProps) => {
  const reduced = useReducedMotion();
  return (
    <section style={{ background: ALABASTER, padding: "80px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
        <div
          className={`grid lg:grid-cols-12 gap-10 lg:gap-16 ${reverse ? "" : ""}`}
          style={{ alignItems: "start" }}
        >
          {/* Image */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={inViewProps}
            className={reverse ? "lg:col-span-5 lg:order-2" : "lg:col-span-5"}
            style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", borderRadius: 2, background: BURGUNDY }}
          >
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(110,0,37,0.05) 0%, rgba(110,0,37,0.18) 100%)", pointerEvents: "none" }} />
          </motion.div>

          {/* Narrative */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={inViewProps}
            className={reverse ? "lg:col-span-7 lg:order-1" : "lg:col-span-7"}
          >
            <p style={{ fontFamily: SANS, fontSize: "clamp(9px, 1vw, 11px)", color: BURGUNDY, letterSpacing: "4px", textTransform: "uppercase", opacity: 0.55, margin: "0 0 10px 0", fontWeight: 500 }}>
              {scripture}
            </p>
            <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, fontStyle: "italic", color: BURGUNDY, margin: "0 0 4px 0", lineHeight: 1.15, paddingBottom: 4 }}>
              {name}
            </h2>
            <p style={{ fontFamily: SANS, fontSize: "clamp(11px, 1vw, 13px)", color: "rgba(110,0,37,0.6)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 28px 0" }}>
              {meaning}
            </p>

            <div style={{ marginBottom: 28 }}>
              {story.map((p, i) => (
                <p key={i} style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.15vw, 16px)", color: DARK_TEXT, lineHeight: 1.8, margin: i < story.length - 1 ? "0 0 16px 0" : 0 }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ marginBottom: 28, paddingLeft: 20, borderLeft: `2px solid ${GOLD}` }}>
              <p style={{ fontFamily: CORMORANT, fontSize: "clamp(17px, 1.6vw, 20px)", fontStyle: "italic", color: BURGUNDY, lineHeight: 1.6, margin: 0 }}>
                {whatThisMeans}
              </p>
            </div>

            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: SANS, fontSize: 10, color: BURGUNDY, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.5, margin: "0 0 10px 0", fontWeight: 600 }}>
                For the Wearer
              </p>
              {forTheWearer.map((p, i) => (
                <p key={i} style={{ fontFamily: SANS, fontSize: "clamp(13px, 1.05vw, 15px)", color: DARK_TEXT, lineHeight: 1.75, opacity: 0.85, margin: i < forTheWearer.length - 1 ? "0 0 12px 0" : 0 }}>
                  {p}
                </p>
              ))}
            </div>

            <p style={{ fontFamily: CORMORANT, fontSize: "clamp(19px, 1.9vw, 24px)", fontWeight: 600, color: BURGUNDY, margin: "0 0 20px 0", lineHeight: 1.3 }}>
              {line}
            </p>

            <div style={{ background: CREAM, borderRadius: 4, padding: "18px 22px" }}>
              <p style={{ fontFamily: CORMORANT, fontSize: "clamp(14px, 1.15vw, 16px)", fontStyle: "italic", color: DARK_TEXT, lineHeight: 1.7, margin: 0 }}>
                &ldquo;{pieceQuote}&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const VIVAStory = () => {
  const reduced = useReducedMotion();
  const coherenceRef = useRef<HTMLDivElement>(null);
  const coherenceInView = useInView(coherenceRef, { once: true, amount: 0.4 });

  return (
    <div style={{ background: ALABASTER, minHeight: "100dvh" }}>
      <NavBar />

      {/* ═══════════════════════════════════════════════════════
          HERO — editorial manifesto, no image. The message is the
          design here; a photo would compete with, not support, the
          two names (Ajogun, Nka) the rest of the page unpacks.
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: ALABASTER, paddingTop: 140, paddingBottom: 80 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 860, textAlign: "center" }}>
          <Link
            to="/viva"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: SANS, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase",
              color: BURGUNDY, opacity: 0.6, textDecoration: "none", marginBottom: 40,
            }}
          >
            <ArrowLeft size={13} strokeWidth={1.5} /> Back to VIVA
          </Link>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: SANS, fontSize: "clamp(10px, 1vw, 12px)", color: BURGUNDY, letterSpacing: "5px", textTransform: "uppercase", opacity: 0.6, margin: "0 0 20px 0", fontWeight: 500 }}
          >
            Batya: Daughters of Adonai
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: CORMORANT, fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 400, fontStyle: "italic", color: BURGUNDY, lineHeight: 1.15, margin: "0 0 28px 0", paddingBottom: 6 }}
          >
            She claims. She creates.
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ fontFamily: SANS, fontSize: "clamp(15px, 1.3vw, 18px)", color: DARK_TEXT, lineHeight: 1.85, opacity: 0.85, maxWidth: 620, margin: "0 auto" }}
          >
            Every piece in this collection connects to a woman whose story proves the same thing: women have always been architects of their own destiny. This isn't preaching. It's witnessing. Look at what these women did. Now look at yourself.
          </motion.p>
        </div>
      </section>

      {/* AJOGÚN */}
      <StorySection
        image="/viva/collection/ajogun/patched/patched_1.jpeg"
        imageAlt="Ajogún Patched Aṣọ-Òkè, the Inheritance collection"
        scripture="Numbers 27:1-11, Joshua 17:3-6"
        name="Ajogún"
        meaning="Yoruba for Inheritance"
        story={[
          "Five sisters, Mahlah, Noah, Hoglah, Milcah, and Tirzah, stood before Moses and said something radical: their father had died in the wilderness with no sons, and they wanted a possession among his relatives.",
          "In their culture, this was impossible. Women didn't inherit. But these daughters didn't accept the default. They stated their case with precision, and God sided with them. Not reluctantly, not as an exception: \"The daughters of Zelophehad are right.\" The law was rewritten. They inherited the land.",
        ]}
        whatThisMeans="This is a story about claiming what is rightfully yours. Clarity beats compliance. They didn't apologize or minimize their ask. They stated a fact and demanded it be honored, and the system adjusted because they were correct."
        forTheWearer={[
          "Ajogún is for the woman who knows she has inherited something: authority, power, voice, freedom, generations of women who fought for what she now holds.",
          "You have what is rightfully yours. Not because someone gave it to you. Because it was always meant to be yours.",
        ]}
        line="Reclaim it. Unapologetically."
        pieceQuote="What belongs to you that you've been taught to defer? The daughters of Zelophehad claimed theirs. So do you."
      />

      {/* NKÀ */}
      <StorySection
        reverse
        image="/viva/collection/nka/adire_1.jpeg"
        imageAlt="Nkà Garment in Àdịrẹ, the Craftsmanship collection"
        scripture="Exodus 35:25-26, Proverbs 31:13-19, Acts 9:36-42"
        name="Nká"
        meaning="Igbo for Skill & Craftsmanship"
        story={[
          "Across scripture, women are described making things. Not as helpers. As skilled artisans. The spinning women in Exodus brought their work, yarn they had spun, with pride, willing to contribute their skill.",
          "The woman in Proverbs 31 isn't described as dutiful. She's described as intentional, skilled, and economic. Her hands are the foundation of her value. Then there's Tabitha, the seamstress disciple: when she died, the evidence of her life was the things she made. The widows showed Peter the robes and clothing she had made. Her hands were her legacy.",
        ]}
        whatThisMeans="Your hands are not secondary. They're primary. You don't have to choose between being skilled and being devoted. Your ability to make things, whether fashion, art, business, or beauty, is not a distraction from your purpose. It is your purpose."
        forTheWearer={[
          "Nká is for the woman who creates. Whether you make clothes or art or music or code or homes or conversations that heal, your making matters.",
          "The garment itself mirrors this truth: two modular pieces that clip together. You're not wearing someone else's vision. You're completing the artist's work by creating your own form.",
        ]}
        line="Your hands are holy."
        pieceQuote="Your hands are not incidental. From Tabitha to the spinning women to today, what you create with intention is sacred."
      />

      {/* ═══════════════════════════════════════════════════════
          COLLECTION COHERENCE — centered manifesto block. Deliberately
          a different layout family from the two split sections above
          (no image, no split) so the page doesn't read as one pattern
          repeated three times.
          ═══════════════════════════════════════════════════════ */}
      <section ref={coherenceRef} style={{ background: BURGUNDY, padding: "96px 0" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 760, textAlign: "center" }}>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={coherenceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="grid sm:grid-cols-2 gap-8" style={{ marginBottom: 40, textAlign: "left" }}>
              <div>
                <p style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 600, fontStyle: "italic", color: GOLD, margin: "0 0 8px 0" }}>Ajogún</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: ALABASTER, opacity: 0.8, lineHeight: 1.7, margin: 0 }}>
                  You have the right to claim what is yours.
                </p>
              </div>
              <div>
                <p style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 600, fontStyle: "italic", color: GOLD, margin: "0 0 8px 0" }}>Nká</p>
                <p style={{ fontFamily: SANS, fontSize: 14, color: ALABASTER, opacity: 0.8, lineHeight: 1.7, margin: 0 }}>
                  You have the skill to create your own path.
                </p>
              </div>
            </div>

            <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 400, fontStyle: "italic", color: ALABASTER, margin: "0 0 20px 0", lineHeight: 1.25, paddingBottom: 4 }}>
              &ldquo;I am a daughter who claims what is hers and creates with intention.&rdquo;
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 11, color: GOLD, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.75 }}>
              Claim. Create.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLOSING CTA — simple, single-intent. The only "shop" call to
          action on this page, so there is no duplicate CTA intent with
          the "Read the full story" link that led here.
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: ALABASTER, padding: "88px 0" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 560, textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.1vw, 16px)", color: DARK_TEXT, opacity: 0.75, lineHeight: 1.75, margin: "0 0 28px 0" }}>
            Ajogún and Nká are both available now, made to order, in the Batya: Daughters of Adonai collection.
          </p>
          <Link
            to="/viva#viva-shop"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: SANS, fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600,
              background: BURGUNDY, color: GOLD, padding: "16px 32px", borderRadius: 3, textDecoration: "none",
            }}
          >
            Shop the Collection <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VIVAStory;
