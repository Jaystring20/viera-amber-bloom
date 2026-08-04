/**
 * AI-Powered Product Description Enhancement
 * Uses Claude to analyze and enhance product descriptions based on fashion e-commerce best practices
 */

interface ProductInput {
  title: string;
  subtitle: string;
  type: "garment" | "print";
  badge: string;
  description: string;
  materials?: string;
  care_instructions?: string;
  images?: string[];
}

interface EnhancedProduct {
  full_description: string;
  materials: string;
  care_instructions: string;
  fit_details?: string;
  style_notes: string;
  occasions: string[];
  colors: string[];
  size_guide?: string;
}

export async function enhanceProductWithAI(product: ProductInput): Promise<EnhancedProduct> {
  const prompt = `
You are a luxury fashion e-commerce copywriter specializing in high-end wearable art.
Analyze this product and generate comprehensive, engaging descriptions following fashion e-commerce best practices.

PRODUCT:
- Title: ${product.title}
- Subtitle: ${product.subtitle}
- Type: ${product.type}
- Badge: ${product.badge}
- Current Description: ${product.description}
- Materials: ${product.materials || "Not provided"}
- Current Care: ${product.care_instructions || "Not provided"}

YOUR TASK:
1. Write a compelling 2-3 paragraph full_description that tells the product story
2. Enhance/complete materials with specific fabric content, composition percentages
3. Write detailed care_instructions with 3-5 specific steps
4. Add fit_details including sizing notes, how it fits, body type recommendations
5. Create style_notes with styling tips, occasions, and pairing suggestions
6. List 3-5 occasions this piece is perfect for
7. Identify 3-4 dominant colors from the description

Guidelines:
- Use sophisticated, aspirational language
- Emphasize craftsmanship, quality, and artistic vision
- Include sustainability/ethical production notes if possible
- Make it feel premium and exclusive
- Focus on the wearer's empowerment and confidence
- Use the brand's voice: "For her, by her" - empowerment, creativity, identity

Return ONLY valid JSON with these exact keys:
{
  "full_description": "string",
  "materials": "string",
  "care_instructions": "string",
  "fit_details": "string",
  "style_notes": "string",
  "occasions": ["string"],
  "colors": ["string"],
  "size_guide": "string"
}
`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || "{}";

    // Parse JSON response
    const enhanced = JSON.parse(content);

    return {
      full_description: enhanced.full_description || product.description,
      materials: enhanced.materials || product.materials || "",
      care_instructions: enhanced.care_instructions || product.care_instructions || "",
      fit_details: enhanced.fit_details || "",
      style_notes: enhanced.style_notes || "",
      occasions: enhanced.occasions || [],
      colors: enhanced.colors || [],
      size_guide: enhanced.size_guide || "",
    };
  } catch (error) {
    console.error("AI enhancement failed:", error);
    // Return best-effort enhancement
    return {
      full_description: product.description,
      materials: product.materials || "Premium quality materials",
      care_instructions: product.care_instructions || "Hand wash or dry clean. Lay flat to dry.",
      fit_details: "Designed for a modern woman. Fits true to size.",
      style_notes: "Versatile piece perfect for elevated casual or special occasions.",
      occasions: ["Daily wear", "Evening events", "Special occasions"],
      colors: ["Black", "Neutral", "Burgundy"],
      size_guide: "Available in sizes XS-XL",
    };
  }
}

/**
 * Fetch products from Supabase with fallback to hardcoded data
 */
export async function fetchProductsFromDB() {
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("Failed to fetch products from database, using fallback:", error);
    return null; // Return null to indicate fallback should be used
  }
}

/**
 * Get products with fallback to hardcoded data
 */
export async function getProductsWithFallback(fallbackData: any[]) {
  const dbProducts = await fetchProductsFromDB();
  return dbProducts || fallbackData;
}
