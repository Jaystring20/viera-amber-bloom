import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import IllustrationsSection from "@/components/sections/IllustrationsSection";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import {
  fadeSlideUp,
  fadeIn,
  staggerContainer,
  cardItem,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";

const Illustrations = () => {
  const reduced = useReducedMotion();

  const featuredRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  const featuredInView = useInView(featuredRef, inViewProps);
  const appsInView = useInView(appsRef, inViewProps);
  const processInView = useInView(processRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />
      <main>
        {/* Core Illustrations Section */}
        <section id="collections" aria-label="Collections">
          <IllustrationsSection />
        </section>

        {/* Featured Story */}
        <section
          ref={featuredRef}
          id="featured"
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid #1A1A1A" }}
          aria-label="Featured Story"
        >
          <div
            className="mx-auto px-6 grid gap-12 items-center"
            style={{ maxWidth: 1100, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
              style={{
                aspectRatio: "3 / 4",
                backgroundColor: "#111111",
                border: "1px solid #2A2A2A",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "#444444",
                  margin: 0,
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Featured Illustration
              </p>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
              className="flex flex-col"
              style={{ gap: 20 }}
            >
              <motion.p
                variants={fadeVariants}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 11,
                  color: "#C8A96E",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Featured Story
              </motion.p>

              <motion.h2
                variants={headerVariants}
                className="font-display"
                style={{
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                The Hatmaker
              </motion.h2>

              <motion.p
                variants={fadeVariants}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "#888888",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                She chose the hat before she chose the room. This is a woman who decided long ago that presence was not something you asked for — it was something you wore.
              </motion.p>

              <motion.p
                variants={fadeVariants}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "#888888",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                This piece celebrates the power of personal presentation — how what we wear tells the world who we are before we speak a single word.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Commercial Applications */}
        <section
          ref={appsRef}
          id="applications"
          className="w-full py-20"
          style={{ backgroundColor: "#000000" }}
          aria-label="Commercial Applications"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <motion.div
              className="flex flex-col items-center text-center mb-12"
              style={{ gap: 16 }}
            >
              <motion.p
                variants={fadeVariants}
                initial="hidden"
                animate={appsInView ? "visible" : "hidden"}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 11,
                  color: "#C8A96E",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Commercial Applications
              </motion.p>

              <motion.h2
                variants={headerVariants}
                initial="hidden"
                animate={appsInView ? "visible" : "hidden"}
                className="font-display"
                style={{
                  fontSize: "clamp(26px, 4vw, 48px)",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Where Our Art Lives
              </motion.h2>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              animate={appsInView ? "visible" : "hidden"}
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
            >
              {["Brand Campaigns", "Editorial Assets", "Fashion Design"].map((app) => (
                <motion.div
                  key={app}
                  variants={cardVariants}
                  whileHover={reduced ? {} : { y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    padding: "28px 24px",
                  }}
                >
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#FAFAFA",
                      marginBottom: 10,
                    }}
                  >
                    {app}
                  </h3>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 300,
                      fontSize: 13,
                      color: "rgba(250,250,250,0.6)",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    High-impact visual narratives for brands, publications, and fashion houses worldwide.
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Process */}
        <section
          ref={processRef}
          id="process"
          className="w-full py-20"
          style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid #1A1A1A" }}
          aria-label="Our Process"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <motion.div
              className="flex flex-col items-center text-center mb-12"
              style={{ gap: 16 }}
            >
              <motion.p
                variants={fadeVariants}
                initial="hidden"
                animate={processInView ? "visible" : "hidden"}
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 11,
                  color: "#C8A96E",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Our Process
              </motion.p>

              <motion.h2
                variants={headerVariants}
                initial="hidden"
                animate={processInView ? "visible" : "hidden"}
                className="font-display"
                style={{
                  fontSize: "clamp(26px, 4vw, 48px)",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                From Concept to Creation
              </motion.h2>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              animate={processInView ? "visible" : "hidden"}
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
            >
              {[
                { num: "01", title: "Research", desc: "Deep dive into stories, themes, and visual inspiration" },
                { num: "02", title: "Sketch", desc: "Conceptualize compositions and narrative hooks" },
                { num: "03", title: "Digital", desc: "Refine in Procreate, Adobe, bringing precision and soul" },
                { num: "04", title: "Delivery", desc: "Final artwork with accompanying story and context" },
              ].map((step) => (
                <motion.div
                  key={step.num}
                  variants={cardVariants}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    padding: "28px 24px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: 10,
                      color: "#C8A96E",
                      letterSpacing: "3px",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    {step.num}
                  </span>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#FAFAFA",
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 300,
                      fontSize: 13,
                      color: "#666666",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Illustrations;
