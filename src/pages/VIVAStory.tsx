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

const inViewProps = { once: true, margin: "0px 0px -100px 0px" } as const;

// Staggered paragraph reveal — each line arrives on its own beat instead of
// the whole block fading in at once, so the reading has a pulse to it
// rather than dumping the full paragraph on the reader in one motion.
const StaggerText = ({ lines, style, gap = 16, reduced }: { lines: string[]; style: React.CSSProperties; gap?: number; reduced: boolean }) => (
  <>
    {lines.map((line, i) => (
      <motion.p
        key={i}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inViewProps}
        transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
        style={{ ...style, margin: i < lines.length - 1 ? `0 0 ${gap}px 0` : 0 }}
      >
        {line}
      </motion.p>
    ))}
  </>
);

// ═══════════════════════════════════════════════════════════
// STORY SECTION — shared shell for Ajogún and Nká.
//
// Redesigned from a single static photo + text column into a proper
// editorial hero+detail pairing: a large primary photo with a second,
// smaller detail shot stacked over its corner (the classic magazine
// "full shot, then a close look" move), a roman-numeral chapter mark
// tying this page visually to the Philosophy section's own numerals
// back on the main VIVA page, and a pull quote big enough to function
// as a real breath in the reading, not a boxed sidebar fact.
//
// Image side still alternates (Ajogún left, Nká right) — exactly two
// of this split-layout family in a row, the cap for this pattern.
// ═══════════════════════════════════════════════════════════
interface StorySectionProps {
  numeral: string;
  reverse?: boolean;
  image: string;
  imageAlt: string;
  detailImage: string;
  detailImageAlt: string;
  name: string;
  meaning: string;
  scripture: string;
  story: string[];
  whatThisMeans: string;
  forTheWearer: string[];
  line: string;
  pieceQuote: string;
}

const StorySection = ({ numeral, reverse, image, imageAlt, detailImage, detailImageAlt, name, meaning, scripture, story, whatThisMeans, forTheWearer, line, pieceQuote }: StorySectionProps) => {
  const reduced = useReducedMotion();
  return (
    <section style={{ background: ALABASTER, padding: "104px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1280 }}>
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-20" style={{ alignItems: "start" }}>
          {/* Hero + detail photo pairing */}
          <div
            className={reverse ? "lg:col-span-5 lg:order-2" : "lg:col-span-5"}
            style={{ position: "relative", paddingBottom: reverse ? 0 : "14%", paddingLeft: reverse ? "14%" : 0 }}
          >
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={inViewProps}
              style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", borderRadius: 2, background: BURGUNDY }}
            >
              <img
                src={image}
                alt={imageAlt}
                loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(110,0,37,0.05) 0%, rgba(110,0,37,0.18) 100%)", pointerEvents: "none" }} />
            </motion.div>

            {/* Detail shot, stacked over the corner */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              viewport={inViewProps}
              style={{
                position: "absolute",
                bottom: reverse ? "-14%" : 0,
                left: reverse ? 0 : "auto",
                right: reverse ? "auto" : "-14%",
                width: "45%",
                aspectRatio: "4/5",
                overflow: "hidden",
                borderRadius: 2,
                border: `6px solid ${ALABASTER}`,
                boxShadow: "0 16px 40px rgba(34,26,26,0.22)",
                background: BURGUNDY,
              }}
            >
              <img
                src={detailImage}
                alt={detailImageAlt}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
            </motion.div>
          </div>

          {/* Narrative */}
          <div className={reverse ? "lg:col-span-7 lg:order-1" : "lg:col-span-7"}>
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={inViewProps}
              style={{
                width: 40, height: 40, borderRadius: "50%", border: `1px solid ${GOLD}`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
              }}
            >
              <span style={{ fontFamily: CORMORANT, fontSize: 16, fontStyle: "italic", color: GOLD }}>{numeral}</span>
            </motion.div>

            <p style={{ fontFamily: SANS, fontSize: "clamp(9px, 1vw, 11px)", color: BURGUNDY, letterSpacing: "4px", textTransform: "uppercase", opacity: 0.5, margin: "0 0 12px 0", fontWeight: 500 }}>
              {scripture}
            </p>
            <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 400, fontStyle: "italic", color: BURGUNDY, margin: "0 0 6px 0", lineHeight: 1.1, paddingBottom: 4 }}>
              {name}
            </h2>
            <p style={{ fontFamily: SANS, fontSize: "clamp(11px, 1vw, 13px)", color: "rgba(110,0,37,0.6)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 36px 0" }}>
              {meaning}
            </p>

            <div style={{ marginBottom: 8, maxWidth: 640 }}>
              <StaggerText lines={story} reduced={!!reduced} gap={18} style={{ fontFamily: SANS, fontSize: "clamp(14.5px, 1.2vw, 16.5px)", color: DARK_TEXT, lineHeight: 1.85 }} />
            </div>

            {/* Pull quote — a real breath in the column, not a boxed
                sidebar fact. The oversized quote glyph sits behind the
                text at low opacity, a common editorial pull-quote device. */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={inViewProps}
              style={{ position: "relative", margin: "40px 0 40px -4px", maxWidth: 620 }}
            >
              <span aria-hidden style={{
                position: "absolute", top: -46, left: -8, fontFamily: CORMORANT, fontSize: 140,
                color: GOLD, opacity: 0.14, lineHeight: 1, userSelect: "none", pointerEvents: "none",
              }}>&ldquo;</span>
              <p style={{ position: "relative", fontFamily: CORMORANT, fontSize: "clamp(20px, 2vw, 26px)", fontStyle: "italic", color: BURGUNDY, lineHeight: 1.5, margin: 0 }}>
                {whatThisMeans}
              </p>
            </motion.div>

            <div style={{ marginBottom: 36, maxWidth: 620 }}>
              <p style={{ fontFamily: SANS, fontSize: 10, color: BURGUNDY, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.5, margin: "0 0 12px 0", fontWeight: 600 }}>
                For the Wearer
              </p>
              <StaggerText lines={forTheWearer} reduced={!!reduced} gap={14} style={{ fontFamily: SANS, fontSize: "clamp(13.5px, 1.05vw, 15px)", color: DARK_TEXT, lineHeight: 1.8, opacity: 0.85 }} />
            </div>

            <p style={{ fontFamily: CORMORANT, fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 600, color: BURGUNDY, margin: "0 0 24px 0", lineHeight: 1.3 }}>
              {line}
            </p>

            <div style={{ borderTop: `1px solid ${BURG_ALPHA}`, paddingTop: 24, maxWidth: 560 }}>
              <p style={{ fontFamily: CORMORANT, fontSize: "clamp(15px, 1.2vw, 17px)", fontStyle: "italic", color: DARK_TEXT, opacity: 0.85, lineHeight: 1.75, margin: 0 }}>
                &ldquo;{pieceQuote}&rdquo;
              </p>
            </div>
          </div>
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
          HERO — full-bleed photograph of the actual collection (the
          same duo image used on the main VIVA page's Batya Moment
          section) instead of text on a blank field, so the story opens
          on the two women it's actually about, not an abstraction of
          them.
          ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "78dvh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <motion.img
          initial={reduced ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          src="/viva/lifestyle/lifestyle-03-duo-moment.webp"
          alt="Two women in the Batya collection, styled in Ajogún and Nká pieces"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,3,9,0.82) 0%, rgba(20,3,9,0.35) 55%, rgba(20,3,9,0.15) 100%)" }} />

        <div className="mx-auto px-6" style={{ maxWidth: 900, position: "relative", width: "100%", paddingBottom: 72, paddingTop: 120 }}>
          <Link
            to="/viva"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: SANS, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase",
              color: ALABASTER, opacity: 0.75, textDecoration: "none", marginBottom: 32,
            }}
          >
            <ArrowLeft size={13} strokeWidth={1.5} /> Back to VIVA
          </Link>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontFamily: SANS, fontSize: "clamp(10px, 1vw, 12px)", color: GOLD, letterSpacing: "5px", textTransform: "uppercase", margin: "0 0 18px 0", fontWeight: 500 }}
          >
            Batya: Daughters of Adonai
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: CORMORANT, fontSize: "clamp(42px, 7vw, 84px)", fontWeight: 400, fontStyle: "italic", color: ALABASTER, lineHeight: 1.1, margin: "0 0 24px 0", paddingBottom: 6, maxWidth: 720 }}
          >
            She claims. She creates.
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{ fontFamily: SANS, fontSize: "clamp(14.5px, 1.2vw, 17px)", color: ALABASTER, opacity: 0.9, lineHeight: 1.8, maxWidth: 560 }}
          >
            Every piece in this collection connects to a woman whose story proves the same thing: women have always been architects of their own destiny. This isn't preaching. It's witnessing.
          </motion.p>
        </div>
      </section>

      {/* AJOGÚN */}
      <StorySection
        numeral="I"
        image="/viva/collection/ajogun/patched/patched_1.jpeg"
        imageAlt="Ajogún Patched Aṣọ-Òkè, the Inheritance collection"
        detailImage="/viva/collection/ajogun/patched/patched_2.png"
        detailImageAlt="Detail of the Ajogún Patched Aṣọ-Òkè weave"
        scripture="Numbers 27:1-11, Joshua 17:3-6"
        name="Ajogún"
        meaning="Yoruba for Inheritance"
        story={[
          "Five sisters, Mahlah, Noah, Hoglah, Milcah, and Tirzah, stood before Moses and said something radical: their father had died in the wilderness with no sons, and they wanted a possession among his relatives.",
          "In their culture, this was impossible. Women didn't inherit. But these daughters didn't accept the default. They stated their case with precision, and God sided with them. Not reluctantly, not as an exception: \"The daughters of Zelophehad are right.\" The law was rewritten. They inherited the land.",
        ]}
        whatThisMeans="This is a story about claiming what is rightfully yours. Clarity beats compliance."
        forTheWearer={[
          "Ajogún is for the woman who knows she has inherited something: authority, power, voice, freedom, generations of women who fought for what she now holds.",
          "You have what is rightfully yours. Not because someone gave it to you. Because it was always meant to be yours.",
        ]}
        line="Reclaim it. Unapologetically."
        pieceQuote="What belongs to you that you've been taught to defer? The daughters of Zelophehad claimed theirs. So do you."
      />

      {/* NKÀ */}
      <StorySection
        numeral="II"
        reverse
        image="/viva/collection/nka/adire_1.jpeg"
        imageAlt="Nkà Garment in Àdịrẹ, the Craftsmanship collection"
        detailImage="/viva/collection/nka/adire_2.jpeg"
        detailImageAlt="Detail of the Nkà Garment in Àdịrẹ"
        scripture="Exodus 35:25-26, Proverbs 31:13-19, Acts 9:36-42"
        name="Nká"
        meaning="Igbo for Skill & Craftsmanship"
        story={[
          "Across scripture, women are described making things. Not as helpers. As skilled artisans. The spinning women in Exodus brought their work, yarn they had spun, with pride, willing to contribute their skill.",
          "The woman in Proverbs 31 isn't described as dutiful. She's described as intentional, skilled, and economic. Then there's Tabitha, the seamstress disciple: when she died, the evidence of her life was the things she made. The widows showed Peter the robes and clothing she had made. Her hands were her legacy.",
        ]}
        whatThisMeans="Your hands are not secondary. They're primary. Your ability to make things is not a distraction from your purpose. It is your purpose."
        forTheWearer={[
          "Nká is for the woman who creates. Whether you make clothes or art or music or code or homes or conversations that heal, your making matters.",
          "The garment itself mirrors this truth: two modular pieces that clip together. You're not wearing someone else's vision. You're completing the artist's work by creating your own form.",
        ]}
        line="Your hands are holy."
        pieceQuote="Your hands are not incidental. From Tabitha to the spinning women to today, what you create with intention is sacred."
      />

      {/* ═══════════════════════════════════════════════════════
          COLLECTION COHERENCE — centered manifesto block, a deliberately
          different layout family from the two split sections above.
          The two taglines now sit beside the actual garments they
          describe (small framed portraits), rather than as plain text
          columns, so "she claims" and "she creates" are visibly tied to
          real pieces the reader just saw worn.
          ═══════════════════════════════════════════════════════ */}
      <section ref={coherenceRef} style={{ background: BURGUNDY, padding: "104px 0" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 820 }}>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={coherenceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="grid sm:grid-cols-2 gap-10" style={{ marginBottom: 56 }}>
              {[
                { name: "Ajogún", tagline: "You have the right to claim what is yours.", img: "/viva/collection/ajogun/patched/patched_1.jpeg" },
                { name: "Nká", tagline: "You have the skill to create your own path.", img: "/viva/collection/nka/adire_1.jpeg" },
              ].map((c, i) => (
                <div key={c.name} className="flex items-start" style={{ gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1px solid ${GOLD}55` }}>
                    <img src={c.img} alt={c.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontFamily: CORMORANT, fontSize: 22, fontWeight: 600, fontStyle: "italic", color: GOLD, margin: "0 0 6px 0" }}>{c.name}</p>
                    <p style={{ fontFamily: SANS, fontSize: 14, color: ALABASTER, opacity: 0.8, lineHeight: 1.7, margin: 0 }}>
                      {c.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: CORMORANT, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 400, fontStyle: "italic", color: ALABASTER, margin: "0 0 20px 0", lineHeight: 1.25, paddingBottom: 4 }}>
                &ldquo;I am a daughter who claims what is hers and creates with intention.&rdquo;
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 11, color: GOLD, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.75 }}>
                Claim. Create.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLOSING CTA — a short strip of real pieces from all three shop
          collections bridges the story back to the products themselves,
          then a single "shop" call to action (the only shop-intent CTA
          on this page, distinct from "Read the full story" on the page
          that links here).
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: ALABASTER, padding: "96px 0" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 720, textAlign: "center" }}>
          <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 40, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            {[
              { src: "/viva/collection/ajogun/plain/plain_1.jpeg", alt: "Ajogún Plain Aṣọ-Òkè" },
              { src: "/viva/collection/nka/silk_crepe_1.jpeg", alt: "Nkà Garment in Silk & Crepe" },
              { src: "/viva/collection/daughter-of-adonai/crop-denim-white.jpeg", alt: "Daughter of Adonai T-Shirt" },
            ].map((p, i) => (
              <motion.div
                key={p.src}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={inViewProps}
                style={{ aspectRatio: "3/4", overflow: "hidden", borderRadius: 2, background: BURGUNDY }}
              >
                <img src={p.src} alt={p.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
              </motion.div>
            ))}
          </div>

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
