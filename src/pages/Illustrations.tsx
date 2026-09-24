import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EditorialGallery from "@/components/sections/EditorialGallery";
import BrandFilm from "@/components/BrandFilm";
import RotatingHeroCarousel from "@/components/sections/RotatingHeroCarousel";
import CategoryThumbnailNav from "@/components/sections/CategoryThumbnailNav";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { scrollToCategory } from "@/lib/illustration-categories";
import {
  fadeSlideUp,
  fadeIn,
  staggerContainer,
  cardItem,
  inViewProps,
  useReducedVariants,
} from "@/lib/animations";
import { ARTWORKS } from "@/lib/gallery-data";

const Illustrations = () => {
  const reduced = useReducedMotion();

  const handleCategorySelect = (categoryId: string) => {
    scrollToCategory(categoryId);
  };

  const headerVariants = useReducedVariants(fadeSlideUp);
  const fadeVariants = useReducedVariants(fadeIn);
  const staggerVariants = useReducedVariants(staggerContainer);
  const cardVariants = useReducedVariants(cardItem);

  // Fashion Illustrations section - hero 3 + grid 10
  const fashionArtworks = ARTWORKS.filter((a) => a.chapter === "fashion-illustrations").slice(0, 13);
  const fashionHero = fashionArtworks.slice(0, 3);
  const fashionGrid = fashionArtworks.slice(3, 13);

  // #5for5 Collection - 5 pieces
  const fivefor5Artworks = ARTWORKS.filter((a) => a.collectionId === "5for5").slice(0, 5);

  // Muses/Portraits - 4 pieces
  const musesArtworks = ARTWORKS.filter((a) => a.chapter === "single-illustrations").slice(0, 4);

  // 7-day ready to wear collection - 7 pieces (5 top, 2 bottom)
  const sevenDayArtworks = ARTWORKS.filter((a) => a.collectionId === "7-day-ready-to-wear").slice(0, 7);

  // Bridal Designs - 4 pieces
  const bridalArtworks = ARTWORKS.filter((a) => a.chapter === "bridal-designs").slice(0, 4);

  // Shoes Collection - 6 pieces (1 large + 5 numbered)
  const shoesArtworks = ARTWORKS.filter((a) => a.chapter === "shoes").slice(0, 6);

  // Ride or Die Bags - 2 pieces
  const rideOrDieBags = ARTWORKS.filter((a) => a.collectionId === "ride-or-die").slice(0, 2);

  // Sisi Eko Bag Collection - 5 pieces
  const sisiEkoBags = ARTWORKS.filter((a) => a.collectionId === "sisi-eko").slice(0, 5);

  // Lifestyle Single Illustrations - 6 pieces
  const lifestyleSingle1 = ARTWORKS.filter((a) => a.chapter === "single-illustrations").slice(4, 10);

  // IWD Theme Illustrations - 4 pieces
  const iwdArtworks = ARTWORKS.filter((a) => a.collectionId === "iwd-theme").slice(0, 4);

  // General Single Illustrations - 12 pieces (6 + 6)
  const singleIllustrations = ARTWORKS.filter((a) => a.chapter === "single-illustrations").slice(10, 22);

  // Christmas/New Year Illustrations - 4 pieces
  const christmasArtworks = ARTWORKS.filter((a) => a.collectionId === "christmas-new-year").slice(0, 4);

  // Product Illustrations - 1 piece
  const productArtworks = ARTWORKS.filter((a) => a.chapter === "product-illustrations").slice(0, 1);

  // Birthday & Couple Illustrations - 8 pieces (4+4 layout)
  const birthdayCoupleSet1 = ARTWORKS.filter((a) => a.chapter === "birthday-couple").slice(0, 8);

  // Birthday & Couple Illustrations Set 2 - 1 piece
  const birthdayCoupleSet2 = ARTWORKS.filter((a) => a.chapter === "birthday-couple").slice(8, 9);

  // Book Covers - 1 piece
  const bookCoversArtworks = ARTWORKS.filter((a) => a.chapter === "book-covers").slice(0, 1);

  // Event Programs - 5 pieces
  const eventProgramsArtworks = ARTWORKS.filter((a) => a.chapter === "event-programs").slice(0, 5);

  // Eden Collection - 7 pieces
  const edenArtworks = ARTWORKS.filter((a) => a.collectionId === "eden-collection").slice(0, 7);

  // Oppenheimer-Barbie - 2 pieces
  const oppArtworks = ARTWORKS.filter((a) => a.collectionId === "oppenheimer-barbie").slice(0, 2);

  // Time will tell - 3 pieces (Past, Present, Future)
  const timeArtworks = ARTWORKS.filter((a) => a.collectionId === "time-will-tell").slice(0, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      <NavBar />
      <main className="pt-20">
        {/* ── Rotating Hero Carousel ───────────────────────────────────── */}
        <RotatingHeroCarousel onCategorySelect={(category) => {
          handleCategorySelect(category.id);
        }} />

        {/* ── Category Thumbnail Navigation ───────────────────────────────────── */}
        <CategoryThumbnailNav
          onCategorySelect={(category) => {
            handleCategorySelect(category.id);
          }}
        />

        {/* ── Brand Film / Video Carousel ───────────────────────────────────── */}
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

        {/* The Collection — editorial scrollytelling gallery */}
        <EditorialGallery />

        {/* ── Fashion Illustrations Section ───────────────────────────────────── */}
        <section
          ref={fashionRef}
          id="fashion-illustrations"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Fashion Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            {/* Header */}
            <motion.div
              className="mb-12"
              variants={fadeVariants}
              initial="hidden"
              animate={fashionInView ? "visible" : "hidden"}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "#D97706",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  margin: "0 0 16px 0",
                }}
              >
                Fashion Illustration: Fashion Illustrations
              </p>
            </motion.div>

            {/* Hero Grid - 3 columns */}
            <motion.div
              className="grid gap-6 mb-12"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              animate={fashionInView ? "visible" : "hidden"}
            >
              {fashionHero.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Lower Grid - 5 columns with text below each */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              animate={fashionInView ? "visible" : "hidden"}
            >
              {fashionGrid.map((artwork) => (
                <motion.div key={artwork.id} variants={cardVariants}>
                  <div
                    className="overflow-hidden mb-3"
                    style={{ borderRadius: 4 }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        aspectRatio: "1/1",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0A0A0A",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {artwork.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 300,
                      color: "#666666",
                      margin: "4px 0 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {artwork.story}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Lifestyle Illustration Categories Section ───────────────────────────────────── */}
        <section
          id="lifestyle-categories"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Lifestyle Illustration Categories"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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

            {/* 5-column grid - Desktop: 5 cols, Tablet: 3 cols, Mobile: 1 col */}
            <motion.div
              className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                "@media (min-width: 1024px)": {
                  gridTemplateColumns: "repeat(5, 1fr)",
                },
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
                onClick={() => {
                  const elem = document.getElementById("lifestyle-singles-1");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
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
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: 12,
                  }}
                >
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
                onClick={() => {
                  const elem = document.getElementById("product-illustrations");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
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
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: 12,
                  }}
                >
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
                onClick={() => {
                  const elem = document.getElementById("birthday-couple-1");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
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
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: 12,
                  }}
                >
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
                onClick={() => {
                  const elem = document.getElementById("book-covers");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
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
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: 12,
                  }}
                >
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
                onClick={() => {
                  const elem = document.getElementById("event-programs");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
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
                <div
                  style={{
                    textAlign: "center",
                    paddingTop: 12,
                  }}
                >
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

        {/* ── #5for5 Collection Section ───────────────────────────────────── */}
        <section
          id="5for5-collection"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="5for5 Collection"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Fashion Illustration: Fashion Illustrations
              </p>
            </motion.div>

            {/* 5-column grid */}
            <motion.div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {fivefor5Artworks.map((artwork) => (
                <motion.div key={artwork.id} variants={cardVariants}>
                  <div
                    className="overflow-hidden mb-3"
                    style={{ borderRadius: 4 }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        aspectRatio: "2/3",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: "0 0 8px 0",
                }}
              >
                #5for5 collection.
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#666666",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                An artistic expression of advocacy for human rights and good
                governance in Nigeria during the October 2020 #EndSARS protest
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Muses Collection Section ───────────────────────────────────── */}
        <section
          id="muses-collection"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Muses Collection"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Fashion Illustration: Fashion Illustrations
              </p>
            </motion.div>

            {/* 4-column grid */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {musesArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── 7-day Ready to Wear Collection Section ───────────────────────────────────── */}
        <section
          id="7-day-collection"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="7-day Ready to Wear Collection"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Fashion Illustration: Fashion Illustrations
              </p>
            </motion.div>

            {/* Top row: 5 pieces */}
            <motion.div
              className="grid gap-6 mb-6"
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {sevenDayArtworks.slice(0, 5).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom row: 2 pieces */}
            <motion.div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: "40%" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {sevenDayArtworks.slice(5, 7).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                A 7-day ready to wear collection.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Bridal Designs Section ───────────────────────────────────── */}
        <section
          id="bridal-designs"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Bridal Designs"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Fashion Illustration: Bridal Designs
              </p>
            </motion.div>

            {/* 4-column grid */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {bridalArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Shoes Collection Section ───────────────────────────────────── */}
        <section
          id="shoes-collection"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Shoes Collection"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Fashion Illustration: Shoes
              </p>
            </motion.div>

            {/* 1 large + 5 grid layout */}
            <div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: "1fr 2fr", alignItems: "start" }}
            >
              {/* Left: 1 large */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                className="overflow-hidden"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={shoesArtworks[0]?.image}
                  alt={shoesArtworks[0]?.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "1/1.2",
                    objectFit: "cover",
                  }}
                />
              </motion.div>

              {/* Right: 5-piece grid */}
              <motion.div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                variants={staggerVariants}
                initial="hidden"
                whileInView="visible"
              >
                {shoesArtworks.slice(1, 6).map((artwork) => (
                  <motion.div
                    key={artwork.id}
                    variants={cardVariants}
                    className="overflow-hidden"
                    style={{ borderRadius: 4 }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        aspectRatio: "1/1",
                        objectFit: "cover",
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
            >
              <h3
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: "0 0 8px 0",
                }}
              >
                Ta lo pa chief Shoe collection.
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#666666",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Inspired by lagos crime stories.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Ride or Die Bags Section ───────────────────────────────────── */}
        <section
          id="ride-or-die-bags"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Ride or Die Bags"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Fashion Illustration: Bags
              </p>
            </motion.div>

            {/* 2-column grid */}
            <motion.div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {rideOrDieBags.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1.2",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
            >
              <h3
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: "0 0 8px 0",
                }}
              >
                The ride or die bags. Inspired by the steering wheels of cars such as Tesla.
              </h3>
            </motion.div>
          </div>
        </section>

        {/* ── Sisi Eko Bags Section ───────────────────────────────────── */}
        <section
          id="sisi-eko-bags"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Sisi Eko Bags"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Fashion Illustration: Bags
              </p>
            </motion.div>

            {/* Top row: 5 items */}
            <motion.div
              className="grid gap-6 mb-6"
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {sisiEkoBags.slice(0, 5).map((artwork, idx) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{
                    borderRadius: 4,
                    gridColumn: idx === 4 ? "auto" : "auto",
                  }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1.2",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
            >
              <h3
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: "0 0 8px 0",
                }}
              >
                The sisi Eko bag collection.
              </h3>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#666666",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Inspired by elements of Lagos traffic.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Lifestyle Single Illustrations (Set 1) ───────────────────────────────────── */}
        <section
          id="lifestyle-singles-1"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Lifestyle Single Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Single Illustrations
              </p>
            </motion.div>

            {/* 6-column grid */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {lifestyleSingle1.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── IWD Theme Illustrations ───────────────────────────────────── */}
        <section
          id="iwd-theme"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="IWD Theme Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Single Illustrations
              </p>
            </motion.div>

            {/* 4-column grid */}
            <motion.div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {iwdArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1.3",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                IWD theme inspired illustrations
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── General Single Illustrations ───────────────────────────────────── */}
        <section
          id="general-singles"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="General Single Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Single Illustrations
              </p>
            </motion.div>

            {/* Top row: 6 items */}
            <motion.div
              className="grid gap-6 mb-6"
              style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {singleIllustrations.slice(0, 6).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom row: 6 items */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {singleIllustrations.slice(6, 12).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Christmas/New Year Illustrations ───────────────────────────────────── */}
        <section
          id="christmas-new-year"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Christmas and New Year Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Single Illustrations
              </p>
            </motion.div>

            {/* 4-column grid */}
            <motion.div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {christmasArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeVariants}
              initial="hidden"
              whileInView="visible"
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                Christmas and New year illustrations
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Product Illustrations Section ───────────────────────────────────── */}
        <section
          id="product-illustrations"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Product Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Lifestyle Illustration: Product Illustrations
              </p>
            </motion.div>

            {/* Single item with caption */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              className="max-w-xs"
            >
              <div
                className="overflow-hidden mb-4"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={productArtworks[0]?.image}
                  alt={productArtworks[0]?.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                {productArtworks[0]?.title || "Malta Guinness"}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Birthday & Couple Illustrations Set 1 ───────────────────────────────────── */}
        <section
          id="birthday-couple-1"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Birthday and Couple Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Birthday & Couple Illustrations
              </p>
            </motion.div>

            {/* Top row: 4 items */}
            <motion.div
              className="grid gap-6 mb-6"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {birthdayCoupleSet1.slice(0, 4).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom row: 4 items */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {birthdayCoupleSet1.slice(4, 8).map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Birthday & Couple Illustrations Set 2 ───────────────────────────────────── */}
        <section
          id="birthday-couple-2"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Birthday and Couple Illustrations"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Birthday & Couple Illustrations
              </p>
            </motion.div>

            {/* Single item */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              className="max-w-xs"
            >
              <div
                className="overflow-hidden"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={birthdayCoupleSet2[0]?.image}
                  alt={birthdayCoupleSet2[0]?.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Book Covers Section ───────────────────────────────────── */}
        <section
          id="book-covers"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Book Covers"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                  margin: "0 0 24px 0",
                }}
              >
                Lifestyle Illustration: Book Covers
              </p>
            </motion.div>

            {/* Single item with caption */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              className="max-w-xs"
            >
              <div
                className="overflow-hidden mb-4"
                style={{ borderRadius: 4 }}
              >
                <img
                  src={bookCoversArtworks[0]?.image}
                  alt={bookCoversArtworks[0]?.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                {bookCoversArtworks[0]?.title || "The Hatching Lady"}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Event Programs Section ───────────────────────────────────── */}
        <section
          id="event-programs"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Event Programs"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
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
                Lifestyle Illustration: Event Programs
              </p>
            </motion.div>

            {/* 5-column grid */}
            <motion.div
              className="grid gap-6"
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
            >
              {eventProgramsArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  variants={cardVariants}
                  className="overflow-hidden"
                  style={{ borderRadius: 4 }}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      aspectRatio: "1/1.4",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Eden Collection Section ───────────────────────────────────── */}
        <section
          ref={edenRef}
          id="eden-collection"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Eden Collection"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            <motion.div
              className="mb-12"
              variants={fadeVariants}
              initial="hidden"
              animate={edenInView ? "visible" : "hidden"}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "#D97706",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  margin: "0 0 16px 0",
                }}
              >
                Fashion Illustration: Fashion Illustrations
              </p>
            </motion.div>

            {/* Grid + Description */}
            <div
              className="grid gap-8"
              style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}
            >
              {/* Left: Grid of 7 artworks in 2-2-2-1 layout */}
              <motion.div
                className="grid gap-6"
                style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
                variants={staggerVariants}
                initial="hidden"
                animate={edenInView ? "visible" : "hidden"}
              >
                {edenArtworks.map((artwork, idx) => (
                  <motion.div
                    key={artwork.id}
                    variants={cardVariants}
                    className="overflow-hidden"
                    style={{
                      borderRadius: 4,
                      gridColumn: idx === 6 ? "1 / -1" : "auto",
                    }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Right: Description */}
              <motion.div
                variants={fadeVariants}
                initial="hidden"
                animate={edenInView ? "visible" : "hidden"}
                style={{ paddingLeft: 24 }}
              >
                <p
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#0A0A0A",
                    margin: "0 0 16px 0",
                    lineHeight: 1.4,
                  }}
                >
                  The Eden collection inspired by the Biblical story of creation.
                </p>
                <p
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 300,
                    color: "#666666",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Each piece in this collection celebrates the genesis of identity and
                  the beauty of self-discovery, drawing from the spiritual narrative of
                  beginning and transformation.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Oppenheimer-Barbie & Time will tell Section ───────────────────────────────────── */}
        <section
          ref={oppRef}
          id="special-collections"
          className="w-full py-20"
          style={{ backgroundColor: "#FAFAFA" }}
          aria-label="Special Collections"
        >
          <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
            {/* Oppenheimer-Barbie */}
            <motion.div
              className="mb-20"
              variants={fadeVariants}
              initial="hidden"
              animate={oppInView ? "visible" : "hidden"}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "#D97706",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  margin: "0 0 16px 0",
                }}
              >
                Fashion Illustration: Fashion Illustrations
              </p>

              <div
                className="grid gap-6 mb-8"
                style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
              >
                {oppArtworks.map((artwork) => (
                  <motion.div
                    key={artwork.id}
                    variants={cardVariants}
                    className="overflow-hidden"
                    style={{ borderRadius: 4 }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        aspectRatio: "1/1",
                        objectFit: "cover",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                The Oppenheimer-Barbie collection inspired by the movies.
              </p>
            </motion.div>

            {/* Time will tell */}
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate={oppInView ? "visible" : "hidden"}
            >
              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "#D97706",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  margin: "0 0 16px 0",
                }}
              >
                Fashion Illustration: Fashion Illustrations
              </p>

              <div
                className="grid gap-6 mb-8"
                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                {timeArtworks.map((artwork, idx) => (
                  <motion.div
                    key={artwork.id}
                    variants={cardVariants}
                    className="overflow-hidden"
                    style={{ borderRadius: 4 }}
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0A0A0A",
                        margin: "12px 0 0 0",
                        textAlign: "center",
                      }}
                    >
                      {["Past", "Present", "Future"][idx]}
                    </p>
                  </motion.div>
                ))}
              </div>

              <p
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  margin: 0,
                }}
              >
                Time will tell collection inspired by the way man has told time over the
                years.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Illustrations;
