import { useMemo } from "react";
import { motion } from "framer-motion";
import { Artwork } from "./types";
import { CategorySelector } from "./CategorySelector";
import { SubcategoryTabs } from "./SubcategoryTabs";
import { IllustrationGrid } from "./IllustrationGrid";
import { DetailModal } from "./DetailModal";
import { useArtworks, useGalleryState } from "./hooks";
import { COLORS, MAIN_CATEGORIES } from "./constants";

interface IllustrationsGalleryProps {
  initialCategory?: "fashion" | "lifestyle";
}

/**
 * Illustrations Gallery Component
 *
 * Production-ready gallery with:
 * - 2-tier category/subcategory filtering
 * - Responsive grid layout (3-col desktop, 2-col tablet, 1-col mobile)
 * - 21 organized sections
 * - Full-screen detail modal with keyboard navigation
 * - Accessibility features (keyboard nav, ARIA labels, screen reader support)
 * - Performance optimization (lazy loading, WebP, responsive images)
 * - Reduced motion support
 */
export const IllustrationsGallery = ({
  initialCategory = "fashion",
}: IllustrationsGalleryProps) => {
  const {
    activeCategory,
    activeSubcategory,
    selectedArtwork,
    handleCategoryChange,
    handleSubcategoryChange,
    handleArtworkSelect,
    handleNavigateArtwork,
    setSelectedArtwork,
  } = useGalleryState(initialCategory);

  // Fetch all artworks for the active subcategory
  const { artworks: subcategoryArtworks } = useArtworks(activeSubcategory);

  // Flatten all artworks for modal navigation
  const allArtworks = useMemo(
    () => subcategoryArtworks.sort((a, b) => a.seq - b.seq),
    [subcategoryArtworks]
  );

  return (
    <div
      style={{
        backgroundColor: COLORS.alabaster,
      }}
    >
      {/* Category Selector Hero */}
      <CategorySelector
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Subcategory Filter Tabs */}
      <SubcategoryTabs
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        onSubcategoryChange={handleSubcategoryChange}
      />

      {/* Main Grid with Sections */}
      <IllustrationGrid
        artworks={allArtworks}
        onArtworkClick={handleArtworkSelect}
      />

      {/* Detail Modal */}
      <DetailModal
        artwork={selectedArtwork}
        allArtworks={allArtworks}
        onClose={() => setSelectedArtwork(null)}
        onNavigate={(next) => handleNavigateArtwork(allArtworks, next)}
      />
    </div>
  );
};

export default IllustrationsGallery;
