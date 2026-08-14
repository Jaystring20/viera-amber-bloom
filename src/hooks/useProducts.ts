import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
  id?: string;
  title: string;
  subtitle: string;
  type: "garment" | "print";
  badge: string;
  images: string[];
  priceNGN: number;
  priceUSD: number;
  desc: string;
  fullDesc?: string;
  materials?: string;
  care?: string;
  sizeGuide?: string;
  styleNotes?: string;
  occasions?: string[];
  colors?: string[];
  fitDetails?: string;
  featured?: boolean;
  active?: boolean;
  // Present on products sold as Top Only / Pants Only / the complete set
  // (currently the four Ajogún styles). Each key is optional so a product
  // can offer just two of the three (e.g. no standalone pants for a style
  // that doesn't have a matching pants cut).
  purchaseOptions?: {
    topOnly?: { NGN: number; USD: number };
    pantsOnly?: { NGN: number; USD: number };
    both?: { NGN: number; USD: number };
  };
}

/** Database row -> the shape the storefront renders. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    type: p.type,
    badge: p.badge,
    images: p.images ?? [],
    priceNGN: p.price_ngn,
    priceUSD: p.price_usd,
    desc: p.description,
    fullDesc: p.full_description,
    materials: p.materials,
    care: p.care_instructions,
    sizeGuide: p.size_guide,
    styleNotes: p.style_notes,
    occasions: p.occasions,
    colors: p.colors,
    fitDetails: p.fit_details,
    featured: p.featured,
    active: p.active,
  };
}

/**
 * Products from Supabase, falling back to the supplied catalogue.
 *
 * The fallback is returned as the initial value rather than an empty array,
 * so the shop renders immediately and swaps to live data when it arrives —
 * a storefront that flashes empty reads as broken.
 */
export function useProducts(fallbackData: Product[]) {
  const [products, setProducts] = useState<Product[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Held in a ref so changing it never re-subscribes the channel, and so
  // fetchProducts can stay referentially stable.
  const fallbackRef = useRef(fallbackData);
  fallbackRef.current = fallbackData;

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (supabaseError) {
        console.warn("useProducts: query failed, using fallback catalogue.", supabaseError);
        setProducts(fallbackRef.current);
      } else if (data && data.length > 0) {
        setProducts(data.map(toProduct));
      } else {
        // Table reachable but empty — the fallback is still the better shop.
        setProducts(fallbackRef.current);
      }
    } catch (err) {
      console.error("useProducts: unexpected failure, using fallback catalogue.", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch products"));
      setProducts(fallbackRef.current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();

    // supabase-js v2 realtime. The previous implementation used the v1 API
    // (`supabase.from(table).on(...)`), which does not exist on v2 — the
    // query builder has no .on(), so this threw a TypeError as soon as the
    // hook was mounted. That is almost certainly why the storefront was
    // never wired up to the table in the first place.
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => { void fetchProducts(); },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
