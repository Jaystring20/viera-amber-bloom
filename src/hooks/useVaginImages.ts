import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface VaginImage {
  id: string;
  slot: string;
  label: string;
  section: string;
  image_url: string;
  sort_order: number;
}

/**
 * Admin-managed VAGIN page images (va_vagin_images table).
 *
 * - `img(slot)` resolves a slot to its current URL, falling back to the
 *   static /vagin-images/<slot>.webp file if the table is empty/unreachable,
 *   so the page never breaks.
 * - `bySection(section)` returns every row in a section (sorted) for
 *   dynamically-rendered blocks like "Meet the Team".
 */
export const useVaginImages = () => {
  const [rows, setRows] = useState<VaginImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("va_vagin_images")
      .select("*")
      .order("sort_order")
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setRows(data as VaginImage[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // `fallbackSlot` covers the window between shipping code that references a
  // new slot and running the migration that creates it. Without it the plain
  // fallback resolves to /vagin-images/<newSlot>.webp — a file that does not
  // exist for a slot that has never been uploaded to — so the page renders a
  // broken image until the SQL is run, making deploy order load-bearing.
  // Naming an existing slot to fall back to removes that ordering hazard: the
  // old picture shows until the new row exists, then the new one takes over.
  const img = useCallback(
    (slot: string, fallbackSlot?: string) => {
      const hit = rows.find((r) => r.slot === slot)?.image_url;
      if (hit) return hit;
      if (fallbackSlot) {
        return (
          rows.find((r) => r.slot === fallbackSlot)?.image_url ??
          `/vagin-images/${fallbackSlot}.webp`
        );
      }
      return `/vagin-images/${slot}.webp`;
    },
    [rows],
  );

  const bySection = useCallback(
    (section: string) => rows.filter((r) => r.section === section),
    [rows],
  );

  return { rows, img, bySection };
};

export default useVaginImages;
