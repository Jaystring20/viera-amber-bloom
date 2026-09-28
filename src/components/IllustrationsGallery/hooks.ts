import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Artwork } from "./types";
import { MAIN_CATEGORIES } from "./constants";

export const useArtworks = (subcategoryId?: string) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("va_artworks")
          .select("*")
          .eq("is_draft", false)
          .order("seq", { ascending: true });

        // Filter by chapter_id if subcategoryId provided
        if (subcategoryId) {
          query = query.eq("chapter_id", subcategoryId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data) {
          setArtworks(data as Artwork[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch artworks");
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [subcategoryId]);

  return { artworks, loading, error };
};

export const useInitialSubcategory = (category: "fashion" | "lifestyle") => {
  const subcategories = MAIN_CATEGORIES[category].subcategories;
  return subcategories[0] || "";
};

export const useGalleryState = (initialCategory: "fashion" | "lifestyle" = "fashion") => {
  const [activeCategory, setActiveCategory] = useState<"fashion" | "lifestyle">(
    initialCategory
  );
  const [activeSubcategory, setActiveSubcategory] = useState<string>(() =>
    useInitialSubcategory(initialCategory)
  );
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Update subcategory when category changes
  const handleCategoryChange = useCallback(
    (category: "fashion" | "lifestyle") => {
      setActiveCategory(category);
      const newSubcategory = useInitialSubcategory(category);
      setActiveSubcategory(newSubcategory);
      setSelectedArtwork(null);
    },
    []
  );

  const handleSubcategoryChange = useCallback((subcategoryId: string) => {
    setActiveSubcategory(subcategoryId);
    setSelectedArtwork(null);
  }, []);

  const handleArtworkSelect = useCallback((artwork: Artwork) => {
    setSelectedArtwork(artwork);
  }, []);

  const handleNavigateArtwork = useCallback(
    (artworks: Artwork[], next: boolean) => {
      if (!selectedArtwork || artworks.length === 0) return;

      const currentIndex = artworks.findIndex((a) => a.id === selectedArtwork.id);
      let nextIndex;

      if (next) {
        nextIndex = currentIndex + 1;
        if (nextIndex >= artworks.length) nextIndex = 0;
      } else {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = artworks.length - 1;
      }

      setSelectedArtwork(artworks[nextIndex]);
    },
    [selectedArtwork]
  );

  return {
    activeCategory,
    activeSubcategory,
    selectedArtwork,
    handleCategoryChange,
    handleSubcategoryChange,
    handleArtworkSelect,
    handleNavigateArtwork,
    setSelectedArtwork,
  };
};
