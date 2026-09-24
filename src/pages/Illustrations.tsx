import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BrandFilm from "@/components/BrandFilm";
import RotatingHeroCarousel from "@/components/sections/RotatingHeroCarousel";
import CategoryThumbnailNav from "@/components/sections/CategoryThumbnailNav";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { scrollToCategory } from "@/lib/illustration-categories";
import { ARTWORKS, COLLECTIONS, CHAPTERS, ChapterId } from "@/lib/gallery-data";
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

  const handleCategorySelect = (categoryId: string) => {
    scrollToCategory(categoryId);
  };

  // Get all artworks for a collection by collectionId (excluding draft items)
  const getCollectionArtworks = (collectionId: string) => {
    return ARTWORKS.filter((a) => a.collectionId === collectionId && !a.draft);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      <NavBar />
      <main className="pt-20">
        {/* ── Rotating Hero Carousel ───────────────────────────────────── */}
        <RotatingHeroCarousel onCategorySelect={(category) => {
          handleCategorySelect(category.id);
        }} />

        {/* ── Brand Film / Video Carousel (BEFORE Browse) ───────────────────────────────────── */}
        <section
          aria-label="Brand Film"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          <div
            className="mx-auto px-6 pt-12 pb-6 flex flex-col items-center text-center"
            style={{ maxWidth: 1100, gap: 10 }}
          >
            <p
              style={{
                fontFamily: "Montserrat, system-ui, sans-serif",
                fontSize: 13,
                color: "#111111",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Behind the Work
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(22px, 3.5vw, 40px)",
                fontWeight: 700,
                color: "#111111",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              See the process unfold.
            </h2>
          </div>

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
            <BrandFilm variant="page" />
          </div>
        </section>

        {/* ── Category Thumbnail Navigation ───────────────────────────────────── */}
        <CategoryThumbnailNav
          onCategorySelect={(category) => {
            handleCategorySelect(category.id);
          }}
        />

        {/* ── Chapter-Grouped Collections (per PDF structure) ───────────────────────────────────── */}
        {CHAPTERS.map((chapter) => {
          const collectionsInChapter = COLLECTIONS.filter(c => c.categoryId === chapter.id).sort((a, b) => a.sortOrder - b.sortOrder);
          if (collectionsInChapter.length === 0) return null;

          const isFashion = ["fashion-illustrations", "bridal-designs", "shoes", "bags"].includes(chapter.id);
          const umbrella = isFashion ? "FASHION ILLUSTRATION" : "LIFESTYLE ILLUSTRATION";
          const chapterLabel = chapter.name.toUpperCase().replace("-", " ");

          return (
            <section
              key={chapter.id}
              id={chapter.id}
              className="w-full py-20"
              style={{ backgroundColor: "#FAFAFA" }}
              aria-label={chapter.name}
            >
              <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
                {/* Chapter-Level Header */}
                <motion.div
                  className="mb-16"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeVariants}
                >
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 13,
                      color: "#111111",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 12,
                    }}
                  >
                    {umbrella}: {chapterLabel}
                  </p>
                </motion.div>

                {/* Collections within this Chapter */}
                {collectionsInChapter.map((collection) => {
                  const artworks = getCollectionArtworks(collection.id);
                  if (artworks.length === 0) return null;

                  return (
                    <div key={collection.id} style={{ marginBottom: 48 }}>
                      {/* Collection Header */}
                      <motion.div
                        className="mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeVariants}
                      >
                        <h2
                          className="font-display"
                          style={{
                            fontSize: "clamp(24px, 4vw, 44px)",
                            fontWeight: 700,
                            color: "#111111",
                            margin: 0,
                            lineHeight: 1.1,
                            marginBottom: 12,
                          }}
                        >
                          {collection.name}
                        </h2>
                        {collection.description && (
                          <p
                            style={{
                              fontFamily: "DM Sans, system-ui, sans-serif",
                              fontSize: 14,
                              color: "#666666",
                              margin: 0,
                              lineHeight: 1.6,
                            }}
                          >
                            {collection.description}
                          </p>
                        )}
                      </motion.div>

                      {/* Artworks Grid */}
                      <motion.div
                        className="grid gap-6"
                        style={{
                          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        }}
                        variants={staggerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                      >
                        {artworks.map((artwork) => (
                          <motion.div
                            key={artwork.id}
                            variants={cardVariants}
                            className="overflow-hidden"
                            style={{ borderRadius: 4 }}
                          >
                            <img
                              src={artwork.image}
                              alt={artwork.title || collection.name}
                              style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                objectFit: "cover",
                              }}
                            />
                            {artwork.title && (
                              <div style={{ paddingTop: 12 }}>
                                <p
                                  style={{
                                    fontFamily: "DM Sans, system-ui, sans-serif",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#111111",
                                    margin: 0,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {artwork.title}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Commercial Applications */}
        <section
          ref={appsRef}
          id="applications"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
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
                  fontSize: 13,
                  color: "#111111",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
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
                  color: "#111111",
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
                  desc: "From #BreakTheBias to Mother's Day. Illustration that gives a campaign a face and a voice.",
                },
                {
                  title: "Editorial & Print",
                  desc: "Covers, features, and storytelling spreads where a single image has to carry the headline.",
                },
                {
                  title: "Fashion & Product",
                  desc: "The Atelier line and the Lagos Icons accessories. Art that walks off the page and onto the body.",
                },
              ].map((app) => (
                <motion.div
                  key={app.title}
                  variants={cardVariants}
                  whileHover={reduced ? {} : { y: -3 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    borderRadius: 4,
                    padding: "28px 24px",
                  }}
                >
                  <h3
                    className="font-display"
                    style={{ fontSize: 20, fontWeight: 700, color: "#111111", marginBottom: 10 }}
                  >
                    {app.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 300,
                      fontSize: 13,
                      color: "#666666",
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
          style={{ backgroundColor: "#F5F4F2", borderTop: "1px solid #EBEBEB" }}
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
                  fontSize: 13,
                  color: "#111111",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
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
                  color: "#111111",
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
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    borderRadius: 4,
                    padding: "28px 24px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#111111",
                      letterSpacing: "3px",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    {step.num}
                  </span>
                  <h3
                    className="font-display"
                    style={{ fontSize: 17, fontWeight: 700, color: "#111111", marginBottom: 10 }}
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
