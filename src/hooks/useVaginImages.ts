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

  const img = useCallback(
    (slot: string) =>
      rows.find((r) => r.slot === slot)?.image_url ?? `/vagin-images/${slot}.webp`,
    [rows],
  );

  const bySection = useCallback(
    (section: string) => rows.filter((r) => r.section === section),
    [rows],
  );

  return { rows, img, bySection };
};

export default useVaginImages;
