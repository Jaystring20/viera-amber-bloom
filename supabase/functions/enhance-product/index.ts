import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface ProductInput {
  title: string;
  subtitle: string;
  type: "garment" | "print";
  badge: string;
  description: string;
  materials?: string;
  care_instructions?: string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const product: ProductInput = await req.json();

    const prompt = `You are a luxury fashion e-commerce copywriter specializing in high-end wearable art.
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
2. Enhance/complete materials with specific fabric content
3. Write detailed care_instructions with 3-5 specific steps
4. Add fit_details including sizing notes and recommendations
5. Create style_notes with styling tips and pairing suggestions
6. List 3-5 occasions this piece is perfect for
7. Identify 3-4 dominant colors

Guidelines:
- Use sophisticated, aspirational language
- Emphasize craftsmanship, quality, and artistic vision
- Make it feel premium and exclusive
- Focus on empowerment and identity
- Use brand voice: "For her, by her" - empowerment, creativity, authenticity

Return ONLY valid JSON:
{
  "full_description": "string",
  "materials": "string",
  "care_instructions": "string",
  "fit_details": "string",
  "style_notes": "string",
  "occasions": ["string"],
  "colors": ["string"],
  "size_guide": "string"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY || "",
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
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || "{}";
    const enhanced = JSON.parse(content);

    return new Response(
      JSON.stringify({
        full_description: enhanced.full_description || product.description,
        materials: enhanced.materials || product.materials || "Premium quality materials",
        care_instructions: enhanced.care_instructions || product.care_instructions || "Hand wash or dry clean. Lay flat to dry.",
        fit_details: enhanced.fit_details || "Designed for the modern woman",
        style_notes: enhanced.style_notes || "Versatile and elegant",
        occasions: enhanced.occasions || ["Casual", "Evening", "Special occasions"],
        colors: enhanced.colors || ["Neutral"],
        size_guide: enhanced.size_guide || "True to size",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Enhancement error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Enhancement failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
