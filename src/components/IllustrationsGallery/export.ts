/**
 * Public exports for the Illustrations Gallery component
 */

export { IllustrationsGallery } from "./index";
export type { Artwork, Section, Subcategory, Category, SortOrder } from "./types";
export { COLORS, TYPOGRAPHY, SPACING, BREAKPOINTS, MOTION } from "./constants";
export { useArtworks, useGalleryState, useInitialSubcategory } from "./hooks";

// Sub-components (for advanced usage)
export { CategorySelector } from "./CategorySelector";
export { SubcategoryTabs } from "./SubcategoryTabs";
export { IllustrationGrid } from "./IllustrationGrid";
export { IllustrationCard } from "./IllustrationCard";
export { DetailModal } from "./DetailModal";
export { SectionHeader } from "./SectionHeader";
