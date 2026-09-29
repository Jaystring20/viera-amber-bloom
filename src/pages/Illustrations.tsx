import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BrandFilm from "@/components/BrandFilm";
import RotatingHeroCarousel from "@/components/sections/RotatingHeroCarousel";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CHAPTERS, SECTIONS, ARTWORKS_103 } from "@/lib/gallery-data";

const Illustrations = () => {
  const browseRef = useRef<HTMLDivElement>(null);
  const browseInView = useInView(browseRef, { once: true, amount: 0.2 });

  // Get artworks by section
  const getArtworksBySection = (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section || section.seq_start === 0) return [];
    return ARTWORKS_103.filter(
      (a) => a.seq >= section.seq_start && a.seq <= section.seq_end
    );
  };

  // Group chapters by category (Fashion vs Lifestyle)
  const fashionChapters = ["fashion-illustrations", "bridal-designs", "shoes", "bags"];
  const lifestyleChapters = [
    "single-illustrations",
    "product-illustrations",
    "birthday-couple",
    "book-covers",
    "event-programs",
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-20">
        {/* ── Hero Carousel with Subcategories ───────────────────────────────── */}
        <RotatingHeroCarousel
          onCategorySelect={(category) => {
            // Scroll to category section if needed
          }}
        />

        {/* ── Behind the Work: Video Section ───────────────────────────────── */}
        <section className="py-16 px-6 bg-white">
          <div className="mx-auto max-w-6xl flex flex-col items-center text-center gap-4 mb-12">
            <p className="text-sm font-semibold tracking-widest text-gray-600 uppercase">
              Behind the Work
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
              See the process unfold.
            </h2>
          </div>
          <div className="mx-auto max-w-6xl">
            <BrandFilm variant="page" />
          </div>
        </section>

        {/* ── Browse by Category: 9 Subcategories Grid ───────────────────────────────── */}
        <section
          ref={browseRef}
          className="py-20 px-6 bg-gray-50"
          aria-label="Browse by Category"
        >
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              animate={browseInView ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <p className="text-sm font-semibold tracking-widest text-gray-600 uppercase mb-2">
                Explore Our Collections
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
                Browse by Category
              </h2>
            </motion.div>

            {/* Fashion Categories - 4 columns in 1 row */}
            <motion.div
              className="mb-16"
              initial="hidden"
              animate={browseInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <p className="text-sm font-semibold tracking-widest text-gray-600 uppercase mb-8">
                Fashion Illustration
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {fashionChapters.map((chapterId) => {
                  const chapter = CHAPTERS.find((c) => c.id === chapterId);
                  const artworksInCategory = ARTWORKS_103.filter(
                    (a) => a.chapter === chapterId
                  );
                  return (
                    <motion.div
                      key={chapterId}
                      variants={fadeInUp}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {chapter?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {artworksInCategory.length} illustration
                        {artworksInCategory.length !== 1 ? "s" : ""}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Lifestyle Categories - 4 + 1 layout (4 in first row, 1 centered below) */}
            <motion.div
              initial="hidden"
              animate={browseInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <p className="text-sm font-semibold tracking-widest text-gray-600 uppercase mb-8">
                Lifestyle Illustration
              </p>
              {/* First 4 lifestyle categories */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {lifestyleChapters.slice(0, 4).map((chapterId) => {
                  const chapter = CHAPTERS.find((c) => c.id === chapterId);
                  const artworksInCategory = ARTWORKS_103.filter(
                    (a) => a.chapter === chapterId
                  );
                  return (
                    <motion.div
                      key={chapterId}
                      variants={fadeInUp}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {chapter?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {artworksInCategory.length} illustration
                        {artworksInCategory.length !== 1 ? "s" : ""}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
              {/* Last lifestyle category - centered in its own row */}
              <div className="flex justify-center">
                {lifestyleChapters.slice(4).map((chapterId) => {
                  const chapter = CHAPTERS.find((c) => c.id === chapterId);
                  const artworksInCategory = ARTWORKS_103.filter(
                    (a) => a.chapter === chapterId
                  );
                  return (
                    <motion.div
                      key={chapterId}
                      variants={fadeInUp}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow w-full md:w-1/4"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {chapter?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {artworksInCategory.length} illustration
                        {artworksInCategory.length !== 1 ? "s" : ""}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── 103 Artworks organized into 21 Sections (Sequential) ───────────────────────────────── */}
        <section className="py-20 px-6 bg-white">
          <div className="mx-auto max-w-6xl">
            {SECTIONS.slice(0, 16).map((section) => {
              const artworks = getArtworksBySection(section.id);
              if (artworks.length === 0) return null;

              return (
                <motion.div
                  key={section.id}
                  className="mb-20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Section Header */}
                  <div className="mb-12">
                    <p className="text-sm font-semibold tracking-widest text-gray-600 uppercase mb-2">
                      Section {section.number}
                    </p>
                    <h3 className="text-3xl font-display font-bold text-gray-900">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Artwork {section.seq_start} – {section.seq_end}
                    </p>
                  </div>

                  {/* Artworks Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                  >
                    {artworks.map((artwork) => (
                      <motion.div
                        key={artwork.id}
                        variants={fadeInUp}
                        className="group overflow-hidden rounded-lg bg-gray-50"
                      >
                        <div className="aspect-square overflow-hidden bg-gray-200">
                          <img
                            src={artwork.image}
                            alt={artwork.title || `Artwork ${artwork.seq}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 font-semibold tracking-wider mb-1">
                            Artwork {artwork.seq}
                          </p>
                          {artwork.title && (
                            <h4 className="text-sm font-bold text-gray-900">
                              {artwork.title}
                            </h4>
                          )}
                          {artwork.story && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {artwork.story}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Illustrations;
