import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BrandFilm from "@/components/BrandFilm";
import RotatingHeroCarousel from "@/components/sections/RotatingHeroCarousel";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CHAPTERS, SECTIONS, ARTWORKS_103 } from "@/lib/gallery-data";
import { ILLUSTRATION_CATEGORIES, categoryAnchorId, scrollToCategory } from "@/lib/illustration-categories";
import { ARTWORK_DIMENSIONS } from "@/lib/artwork-dimensions";
import ArtworkViewer from "@/components/sections/ArtworkViewer";

const Illustrations = () => {
  const browseRef = useRef<HTMLDivElement>(null);
  const browseInView = useInView(browseRef, { once: true, amount: "some" });
  const [viewerSeq, setViewerSeq] = useState<number | null>(null);

  // Full-screen swipe gallery is for phones and tablets; laptops/desktops keep the grid.
  const openViewer = (seq: number) => {
    if (window.matchMedia("(max-width: 1023px)").matches) setViewerSeq(seq);
  };

  // Get artworks by section
  const getArtworksBySection = (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section || section.seq_start === 0) return [];
    return ARTWORKS_103.filter(
      (a) => a.seq >= section.seq_start && a.seq <= section.seq_end
    );
  };

  // Fashion vs Lifestyle categories
  const fashionChapters = ["fashion-illustrations", "bridal-designs", "shoes", "bags"];
  const lifestyleChapters = [
    "single-illustrations",
    "product-illustrations",
    "birthday-couple",
    "book-covers",
    "event-programs",
  ];

  // First section of each chapter is the scroll target for the hero's "Explore Collection"
  const chapterAnchors: Record<string, string> = {};
  SECTIONS.forEach((sec) => {
    const first = ARTWORKS_103.find((a) => a.seq === sec.seq_start);
    if (first && sec.seq_start > 0 && !chapterAnchors[first.chapter]) {
      chapterAnchors[first.chapter] = sec.id;
    }
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-20">
        {/* Hero Carousel */}
        <RotatingHeroCarousel onCategorySelect={(c) => scrollToCategory(c.id)} />

        {/* Behind the Work */}
        <section className="py-16 px-6 bg-white">
          <div className="mx-auto max-w-6xl flex flex-col items-center text-center gap-4 mb-12">
            <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
              Behind the Work
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              See the process unfold.
            </h2>
          </div>
          <div className="mx-auto max-w-6xl">
            <BrandFilm variant="page" />
          </div>
        </section>

        {/* Browse by Category */}
        <section
          ref={browseRef}
          className="py-20 px-6 bg-gray-50"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="text-left mb-16"
              initial="hidden"
              animate={browseInView ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase mb-2">
                Browse by Category
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Explore Our Collections
              </h2>
            </motion.div>

            {/* Fashion - 4 columns */}
            <motion.div
              className="mb-16"
              initial="hidden"
              animate={browseInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase mb-8">
                Fashion Illustration
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {fashionChapters.map((chapterId) => {
                  const chapter = CHAPTERS.find((c) => c.id === chapterId);
                  const artworksInCategory = ARTWORKS_103.filter(
                    (a) => a.chapter === chapterId
                  );
                  return (
                    <motion.a
                      key={chapterId}
                      href={`#${categoryAnchorId(chapterId)}`}
                      variants={fadeInUp}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToCategory(chapterId);
                      }}
                      className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {artworksInCategory[0] && (
                          <img
                            src={artworksInCategory[0].image}
                            alt={chapter?.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900">
                          {chapter?.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {artworksInCategory.length} piece
                          {artworksInCategory.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Lifestyle - 4 + 1 layout */}
            <motion.div
              initial="hidden"
              animate={browseInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase mb-8">
                Lifestyle Illustration
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {lifestyleChapters.map((chapterId) => {
                  const chapter = CHAPTERS.find((c) => c.id === chapterId);
                  const artworksInCategory = ARTWORKS_103.filter(
                    (a) => a.chapter === chapterId
                  );
                  return (
                    <motion.a
                      key={chapterId}
                      href={`#${categoryAnchorId(chapterId)}`}
                      variants={fadeInUp}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToCategory(chapterId);
                      }}
                      className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {artworksInCategory[0] && (
                          <img
                            src={artworksInCategory[0].image}
                            alt={chapter?.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900">
                          {chapter?.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {artworksInCategory.length} piece
                          {artworksInCategory.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 103 Artworks in Sections - 3 column grid */}
        <section className="py-20 px-6 bg-white">
          <div className="mx-auto max-w-6xl">
            {SECTIONS.map((section) => {
              const artworks = getArtworksBySection(section.id);
              if (artworks.length === 0) return null;
              const anchorChapter = Object.keys(chapterAnchors).find(
                (k) => chapterAnchors[k] === section.id
              );
              const anchorCategory = ILLUSTRATION_CATEGORIES.find((c) => c.id === anchorChapter);

              return (
                <motion.div
                  key={section.id}
                  id={anchorChapter ? categoryAnchorId(anchorChapter) : undefined}
                  className="mb-20 scroll-mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Separator line between sections */}
                  <div className="h-px bg-gray-300 mb-10"></div>
                  {anchorCategory && (
                    <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-gray-600">
                      {anchorCategory.umbrella === "fashion" ? "Fashion Illustration" : "Lifestyle Illustration"}: {anchorCategory.name}
                    </p>
                  )}
                  {section.name && (
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {section.name}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600">
                          {section.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Desktop: 3-column grid. Phone: sideways swipe strip that opens the full-screen gallery */}
                  <motion.div
                    className="-mx-6 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: "some" }}
                  >
                    {artworks.map((artwork) => (
                      <motion.div
                        key={artwork.id}
                        variants={fadeInUp}
                        className="flex w-[78vw] max-w-[360px] shrink-0 snap-center flex-col md:w-auto md:max-w-none"
                      >
                        {/* Full artwork, uncropped */}
                        <button
                          type="button"
                          onClick={() => openViewer(artwork.seq)}
                          aria-label={`View ${artwork.title || "artwork"} full screen`}
                          className="mb-5 block cursor-pointer overflow-hidden bg-gray-100 text-left md:cursor-default"
                        >
                          <img
                            src={artwork.image}
                            alt={artwork.title || "Artwork"}
                            width={ARTWORK_DIMENSIONS[artwork.seq]?.[0]}
                            height={ARTWORK_DIMENSIONS[artwork.seq]?.[1]}
                            className="w-full h-auto block"
                            loading="lazy"
                          />
                        </button>

                        {/* Title + description sit directly under the artwork */}
                        {artwork.title && (
                          <h4 className="text-base font-bold text-gray-900 mb-2">
                            {artwork.title}
                          </h4>
                        )}
                        {artwork.story && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {artwork.story}
                          </p>
                        )}
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
      {viewerSeq !== null && (
        <ArtworkViewer startSeq={viewerSeq} onClose={() => setViewerSeq(null)} />
      )}
    </div>
  );
};

export default Illustrations;
