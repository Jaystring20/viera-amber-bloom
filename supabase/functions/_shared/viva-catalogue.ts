// VIVA catalogue — the server's copy of what things cost.
//
// This exists because the browser must never be trusted with an amount.
// The old checkout sent `cartTotal * 100` straight to Paystack, so anyone
// with devtools could have paid ₦1 for a ₦195,000 garment. The client now
// sends only product ids and quantities; every price is resolved here.
//
// Why a constant and not a `products` table lookup: the VIVA storefront
// still renders from a hardcoded SHOP_PRODUCTS array in src/pages/VIVA.tsx,
// and the `products` table is driven by the separate admin UI. Until the
// storefront is migrated onto the table, a DB lookup would fail closed for
// every real order. Swapping this out later is a small change — replace
// priceFor() with a select against `products` and keep the same signature.
//
// KEEP IN SYNC with SHOP_PRODUCTS in src/pages/VIVA.tsx. An id present
// there but missing here is rejected rather than guessed at.

export interface CatalogueEntry {
  title: string;
  priceNGN: number; // major units, as displayed
  priceUSD: number;
}

export const VIVA_CATALOGUE: Record<string, CatalogueEntry> = {
  heritage:   { title: "The Heritage",   priceNGN: 180000, priceUSD: 115 },
  bold:       { title: "The Bold",       priceNGN: 195000, priceUSD: 126 },
  artist:     { title: "The Artist",     priceNGN: 188000, priceUSD: 121 },
  "print-01": { title: "Batya No.1",     priceNGN: 35000,  priceUSD: 22 },
  "print-02": { title: "Heritage Print", priceNGN: 35000,  priceUSD: 22 },
};

export type Currency = "NGN" | "USD";

export const MAX_QTY_PER_LINE = 99;

/**
 * Price of one unit in the minor unit (kobo / cents), which is what
 * Paystack expects. Integer arithmetic throughout — money in floats is a
 * bug that surfaces as a one-kobo mismatch months later.
 */
export function unitPriceSubunit(productId: string, currency: Currency): number | null {
  const entry = VIVA_CATALOGUE[productId];
  if (!entry) return null;
  const major = currency === "NGN" ? entry.priceNGN : entry.priceUSD;
  return Math.round(major * 100);
}

export function titleFor(productId: string): string | null {
  return VIVA_CATALOGUE[productId]?.title ?? null;
}
