import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EditorialGallery from "@/components/sections/EditorialGallery";
import BrandFilm from "@/components/BrandFilm";
import RotatingHeroCarousel from "@/components/sections/RotatingHeroCarousel";
import CategoryThumbnailNav from "@/components/sections/CategoryThumbnailNav";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { scrollToCategory } from "@/lib/illustration-categories";
import { ARTWORKS } from "@/lib/gallery-data";
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

  // Was navigate(`/collections/${collectionId}`) — a separate page, and one
  // whose ids mostly didn't match anything real (see
  // illustration-categories.ts). The client's direction was explicit: a
  // category click should land on that category's own section further down
  // this same page, in sync with "Browse by Category" above it — so this is
  // now an in-page scroll instead of a navigation.
  const handleCategorySelect = (categoryId: string) => {
    scrollToCategory(categoryId);
  };

  // Lifestyle category preview data
  const lifestyleSingle1 = ARTWORKS.filter((a) => a.chapter === "single-illustrations").slice(0, 1);
  const productArtworks = ARTWORKS.filter((a) => a.chapter === "product-illustrations").slice(0, 1);
  const birthdayCoupleSet1 = ARTWORKS.filter((a) => a.chapter === "birthday-couple").slice(0, 1);
  const bookCoversArtworks = ARTWORKS.filter((a) => a.chapter === "book-covers").slice(0, 1);
  const eventProgramsArtworks = ARTWORKS.filter((a) => a.chapter === "event-programs").slice(0, 1);

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

        {/* The Collection — editorial scrollytelling gallery */}
        <EditorialGallery />

        {/* ── Lifestyle Illustration Categories (5-column row) ───────────────────────────────────── */}
        <section
          id="lifestyle-categories"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Lifestyle Illustration Categories"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={motion.fadeIn ? {} : {}}
              initial="hidden"
              whileInView="visible"
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "#0A0A0A",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Lifestyle Illustration
              </p>
            </motion.div>

            {/* 5-column grid - Desktop: 5 cols, Mobile: responsive */}
            <motion.div
              className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(5, 1fr)",
              }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Single Illustrations */}
              <motion.div
                key="single-illustrations"
                variants={cardVariants}
                className="overflow-hidden cursor-pointer group"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={lifestyleSingle1[0]?.image}
                  alt="Single Illustrations"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                  }}
                />
                <div style={{ textAlign: "center", paddingTop: 12 }}>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Single Illustrations
                  </p>
                </div>
              </motion.div>

              {/* Product Illustrations */}
              <motion.div
                key="product-illustrations"
                variants={cardVariants}
                className="overflow-hidden cursor-pointer group"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={productArtworks[0]?.image}
                  alt="Product Illustrations"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                />
                <div style={{ textAlign: "center", paddingTop: 12 }}>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Product Illustrations
                  </p>
                </div>
              </motion.div>

              {/* Birthday & Couple Illustrations */}
              <motion.div
                key="birthday-couple"
                variants={cardVariants}
                className="overflow-hidden cursor-pointer group"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={birthdayCoupleSet1[0]?.image}
                  alt="Birthday & Couple Illustrations"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                  }}
                />
                <div style={{ textAlign: "center", paddingTop: 12 }}>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Birthday & Couple Illustrations
                  </p>
                </div>
              </motion.div>

              {/* Book Covers */}
              <motion.div
                key="book-covers"
                variants={cardVariants}
                className="overflow-hidden cursor-pointer group"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={bookCoversArtworks[0]?.image}
                  alt="Book Covers"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                  }}
                />
                <div style={{ textAlign: "center", paddingTop: 12 }}>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Book Covers
                  </p>
                </div>
              </motion.div>

              {/* Event Programs */}
              <motion.div
                key="event-programs"
                variants={cardVariants}
                className="overflow-hidden cursor-pointer group"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={eventProgramsArtworks[0]?.image}
                  alt="Event Programs"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "1/1.4",
                    objectFit: "cover",
                  }}
                />
                <div style={{ textAlign: "center", paddingTop: 12 }}>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0A0A0A",
                      margin: 0,
                    }}
                  >
                    Event Programs
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

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
