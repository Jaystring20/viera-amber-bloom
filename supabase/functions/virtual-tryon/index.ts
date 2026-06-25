// VIVA Virtual Try-On — secure Gemini image proxy (Supabase Edge Function).
//
// The Gemini API key is read from the GEMINI_API_KEY secret and never leaves
// the server. The browser calls this function via supabase.functions.invoke
// with the user's uploaded photo + the selected VIVA garment (both base64).
//
// Set the secret before deploying:
//   supabase secrets set GEMINI_API_KEY=your_key_here
// Deploy:
//   supabase functions deploy virtual-tryon
//
// Model: Gemini 2.5 Flash Image ("Nano Banana"). Override with GEMINI_IMAGE_MODEL.

const GEMINI_MODEL = Deno.env.get("GEMINI_IMAGE_MODEL") ?? "gemini-2.5-flash-image";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TryOnRequest {
  personImageBase64: string;
  personMimeType: string;
  garmentImageBase64: string;
  garmentMimeType: string;
  garmentName?: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return json(
      { error: "Server not configured: GEMINI_API_KEY secret is missing." },
      500,
    );
  }

  let payload: TryOnRequest;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const {
    personImageBase64,
    personMimeType,
    garmentImageBase64,
    garmentMimeType,
    garmentName,
  } = payload;

  if (!personImageBase64 || !garmentImageBase64) {
    return json(
      { error: "Both a person photo and a garment image are required." },
      400,
    );
  }

  const prompt =
    `You are a professional virtual try-on specialist performing face and garment composition.

CRITICAL INSTRUCTIONS:
1. FIRST IMAGE = The USER'S FACE and BODY to use (extract the person's face, skin tone, hair, facial features)
2. SECOND IMAGE = GARMENT REFERENCE ONLY (extract only the clothing${garmentName ? ` — "${garmentName}"` : ""})

TASK:
- Take the person's FACE from the FIRST image (the uploaded photo)
- Place that face on a body wearing the garment from the SECOND image
- Preserve all facial features, skin tone, hair color, and facial expression from the FIRST image
- Use the person's body proportions from the FIRST image to naturally wear the garment
- Match the garment's exact colors, patterns, fabric texture, fit, and silhouette from the SECOND image
- Ensure realistic lighting, shadows, fabric draping, and natural fit
- Use a clean, neutral studio background (light gray or white)
- Do NOT include the original model's face from the product image
- Do NOT add text, watermarks, logos, or any additional elements
- Output ONLY the final photorealistic composed image

Result: A photorealistic image showing the user's uploaded face on a body wearing the selected garment from the product image.`;

  const geminiBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: personMimeType || "image/jpeg",
              data: personImageBase64,
            },
          },
          {
            inline_data: {
              mime_type: garmentMimeType || "image/jpeg",
              data: garmentImageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      // Required for the image model; it returns an image (and optional text) part.
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(geminiBody),
      },
    );
  } catch (e) {
    return json({ error: `Failed to reach Gemini: ${String(e)}` }, 502);
  }

  if (!geminiRes.ok) {
    const detail = await geminiRes.text();
    return json(
      { error: `Gemini error (${geminiRes.status})`, detail: detail.slice(0, 600) },
      502,
    );
  }

  const data = await geminiRes.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find(
    (p: { inline_data?: { data?: string }; inlineData?: { data?: string } }) =>
      p.inline_data?.data || p.inlineData?.data,
  );
  const outData = imagePart?.inline_data?.data || imagePart?.inlineData?.data;
  const outMime =
    imagePart?.inline_data?.mime_type ||
    imagePart?.inlineData?.mimeType ||
    "image/png";

  if (!outData) {
    const textPart = parts.find((p: { text?: string }) => p.text)?.text;
    return json(
      {
        error: "Gemini did not return an image.",
        detail: textPart?.slice(0, 300) ?? "No image in response.",
      },
      502,
    );
  }

  return json({ imageBase64: outData, mimeType: outMime });
});
