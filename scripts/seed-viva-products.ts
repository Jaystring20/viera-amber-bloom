/**
 * Seed VIVA Products into Supabase
 * Run this ONCE to migrate hardcoded products to database:
 *
 * npx tsx scripts/seed-viva-products.ts
 *
 * After running, you can delete this file or keep it for reference.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hardcoded products from VIVA.tsx
const VIVA_PRODUCTS = [
  {
    title: "The Heritage",
    subtitle: "Look 01 · Batya Collection",
    type: "garment",
    badge: "Made to Order",
    images: ["/viva/look-1.webp", "/viva/look-2.webp", "/viva/look-3.webp"],
    price_ngn: 180000,
    price_usd: 115,
    description:
      "Olive woven kimono · wide-leg pleated denim · gold cuffs. Bespoke fit, made to your measurements.",
    full_description:
      "This Heritage piece combines traditional tailoring with modern sensibility. The olive woven kimono drapes beautifully over wide-leg pleated denim, finished with delicate gold cuffs. Every measurement is taken to perfection for your bespoke fit. Crafted to celebrate structured fluidity—where precision meets the body in motion.",
    materials: "100% premium cotton kimono · sustainable denim · 18k gold-plated cuffs",
    care_instructions:
      "Dry clean recommended. Gentle hand wash for delicate pieces. Store in cool, dry place.",
    featured: false,
    active: true,
    sort_order: 0,
  },
  {
    title: "The Bold",
    subtitle: "Look 02 · Batya Collection",
    type: "garment",
    badge: "Limited",
    images: ["/viva/look-2.webp", "/viva/look-1.webp", "/viva/look-3.webp"],
    price_ngn: 195000,
    price_usd: 126,
    description:
      "Hot-pink structured crop · wide-leg denim · statement earrings. Confidence, personalised.",
    full_description:
      "The Bold is a declaration of artistic agency. The hot-pink structured crop defines your silhouette with precision tailoring, paired with comfortable wide-leg denim and statement-making earrings. This is fashion as confidence—personalised, powerful, and unapologetically you.",
    materials: "Structured cotton blend crop · premium denim · statement jewelry",
    care_instructions: "Machine wash cold. Line dry. Iron on low heat if needed.",
    featured: false,
    active: true,
    sort_order: 1,
  },
  {
    title: "The Artist",
    subtitle: "Look 03 · Batya Collection",
    type: "garment",
    badge: "Made to Order",
    images: ["/viva/look-3.webp", "/viva/look-1.webp", "/viva/look-2.webp"],
    price_ngn: 188000,
    price_usd: 121,
    description:
      "Chartreuse palazzo · structured crop · layered gold jewellery. Chromatic freedom in fabric.",
    full_description:
      "Chromatic freedom is the heart of The Artist. The chartreuse palazzo pants flow with artistic fluidity, balanced by a structured crop top. Layered gold jewellery adds depth and dimension. This piece celebrates your identity as a creative force—dressed in who you are, and whose you are.",
    materials: "Linen-blend palazzo pants · structured cotton crop · layered gold jewelry",
    care_instructions: "Hand wash recommended. Lay flat to dry. Store jewelry separately.",
    featured: false,
    active: true,
    sort_order: 2,
  },
  {
    title: "Batya No.1",
    subtitle: "Fashion Illustration · A3 Giclée",
    type: "print",
    badge: "Edition / 30",
    images: ["/viva/look-4.jpeg", "/viva/look-1.webp"],
    price_ngn: 35000,
    price_usd: 22,
    description:
      "Archival giclée on 300gsm cotton rag. Signed + numbered. Ships in a protective tube.",
    full_description:
      "Batya No.1 is a limited-edition fashion illustration printed on archival-quality 300gsm cotton rag paper. Each print is hand-signed and numbered as part of the Daughters of Adonai series. Ships in a protective tube with certificate of authenticity.",
    materials: "300gsm cotton rag paper · archival pigment inks · hand-signed and numbered",
    care_instructions: "Frame under UV-protective glass. Keep away from direct sunlight to preserve colors.",
    featured: false,
    active: true,
    sort_order: 3,
  },
  {
    title: "Heritage Print",
    subtitle: "Fashion Illustration · A3 Giclée",
    type: "print",
    badge: "Edition / 30",
    images: ["/viva/look-1.webp", "/viva/look-4.jpeg"],
    price_ngn: 35000,
    price_usd: 22,
    description:
      "The Heritage silhouette in ink and gouache. Signed by Viera Amber. Edition of 30.",
    full_description:
      "The Heritage Print captures the essence of the iconic silhouette through ink and gouache artistry. This limited edition celebrates the craftsmanship and attention to detail that defines VIVA. Each piece is a gallery-worthy work created by Viera Amber herself.",
    materials: "300gsm cotton rag paper · ink and gouache · hand-signed",
    care_instructions: "Frame under glass. Avoid moisture. Display away from heat sources.",
    featured: false,
    active: true,
    sort_order: 4,
  },
];

async function seed() {
  try {
    console.log("🌱 Starting VIVA products seed...\n");

    // Check if products already exist
    const { data: existing, error: checkError } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("❌ Error checking existing products:", checkError);
      process.exit(1);
    }

    if (existing && existing.length > 0) {
      console.warn(
        "⚠️  Products already exist in database. Skipping to avoid duplicates.\n"
      );
      console.log("If you want to reseed, delete the products table first:");
      console.log("  1. Go to Supabase → SQL Editor");
      console.log("  2. Run: DELETE FROM products;");
      console.log("  3. Run this script again\n");
      process.exit(0);
    }

    // Insert products
    console.log(`📦 Inserting ${VIVA_PRODUCTS.length} products...\n`);

    const { data, error } = await supabase
      .from("products")
      .insert(VIVA_PRODUCTS)
      .select();

    if (error) {
      console.error("❌ Error inserting products:", error);
      process.exit(1);
    }

    console.log("✅ Successfully seeded products:\n");
    data?.forEach((p: any) => {
      console.log(`  ✓ ${p.title} (${p.type})`);
    });

    console.log(`\n✅ All ${data?.length || 0} products are now in Supabase!`);
    console.log(
      "\n🎉 You can now:\n" +
        "  1. Go to admin dashboard → VIVA Products tab\n" +
        "  2. See and edit all 5 products\n" +
        "  3. Changes sync immediately to /viva page\n"
    );
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

seed();
