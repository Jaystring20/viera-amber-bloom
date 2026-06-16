import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EditorialGallery from "@/components/sections/EditorialGallery";
import BrandFilm from "@/components/BrandFilm";
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

  const appsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  const appsInView = useInView(appsRef, inViewProps);
  const processInView = useInView(processRef, inViewProps);

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />
      <main className="pt-20">
        {/* ── Brand Film opener ───────────────────────────────────── */}
        <section
          aria-label="Brand Film"
          style={{ backgroundColor: "#000" }}
        >
          {/* Cinematic header above the film */}
          <div
            className="mx-auto px-6 pt-12 pb-6 flex flex-col items-center text-center"
            style={{ maxWidth: 1100, gap: 10 }}
          >
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 10,
                color: "#D97706",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 400,
                margin: 0,
              }}
            >
              The Collection
            </p>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(22px, 3.5vw, 40px)",
                fontWeight: 700,
                color: "#FAFAFA",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Every piece tells a story.
            </h1>
          </div>

          {/* Full-width film container */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
            <BrandFilm variant="page" />
          </div>
        </section>

        {/* The Collection — editorial scrollytelling gallery */}
        <EditorialGallery />

        {/* Commercial Applications */}
        <section
          ref={appsRef}
          id="applications"
          className="w-full py-20"
          style={{ backgroundColor: "#000000" }}
          aria-label="Commercial Applications"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
            <motion.div className="flex flex-col items-center text-center mb-12" style={{ gap: 16 }}>
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
              {[
                {
                  title: "Brand Campaigns",
                  desc: "From #BreakTheBias to Mother's Day — illustration that gives a campaign a face and a voice.",
                },
                {
                  title: "Editorial & Print",
                  desc: "Covers, features, and storytelling spreads where a single image has to carry the headline.",
                },
                {
                  title: "Fashion & Product",
                  desc: "The Atelier line and the Lagos Icons accessories — art that walks off the page and onto the body.",
                },
              ].map((app) => (
                <motion.div
                  key={app.title}
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
                    style={{ fontSize: 20, fontWeight: 700, color: "#FAFAFA", marginBottom: 10 }}
                  >
                    {app.title}
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
                    {app.desc}
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
            <motion.div className="flex flex-col items-center text-center mb-12" style={{ gap: 16 }}>
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
                { num: "03", title: "Digital", desc: "Refine in Procreate and Adobe, bringing precision and soul" },
                { num: "04", title: "Delivery", desc: "Final artwork with its accompanying story and context" },
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
                    style={{ fontSize: 17, fontWeight: 700, color: "#FAFAFA", marginBottom: 10 }}
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
