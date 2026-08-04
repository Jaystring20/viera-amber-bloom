import { useEffect, useState } from "react";
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
}

/**
 * Hook to fetch products from Supabase with fallback to hardcoded data
 */
export function useProducts(fallbackData: Product[]) {
  const [products, setProducts] = useState<Product[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from Supabase
        const { data, error: supabaseError } = await supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true });

        if (supabaseError) {
          console.warn("Failed to fetch from Supabase, using fallback:", supabaseError);
          setProducts(fallbackData);
        } else if (data && data.length > 0) {
          // Transform database schema to match frontend interface
          const transformedProducts = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle,
            type: p.type,
            badge: p.badge,
            images: p.images || [],
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
          }));
          setProducts(transformedProducts);
        } else {
          // No data from Supabase, use fallback
          setProducts(fallbackData);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch products"));
        setProducts(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to real-time updates
    const subscription = supabase
      .from("products")
      .on("*", () => {
        // Refetch products when the table changes
        fetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { products, loading, error };
}

/**
 * Hook to subscribe to real-time product updates
 */
export function useProductUpdates(callback: (products: Product[]) => void) {
  useEffect(() => {
    const subscription = supabase
      .from("products")
      .on("*", async () => {
        try {
          const { data } = await supabase
            .from("products")
            .select("*")
            .eq("active", true);
          if (data) {
            const transformed = data.map((p: any) => ({
              id: p.id,
              title: p.title,
              subtitle: p.subtitle,
              type: p.type,
              badge: p.badge,
              images: p.images || [],
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
            }));
            callback(transformed);
          }
        } catch (err) {
          console.error("Failed to sync products:", err);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [callback]);
}
