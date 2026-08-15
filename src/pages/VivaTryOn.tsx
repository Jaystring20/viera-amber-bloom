import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Sparkles, Send, RefreshCw, AlertCircle } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { WHATSAPP_NUMBER } from "@/config/contact";

const BURGUNDY = "#6E0025";
const GOLD = "#D4AF37";
const ALABASTER = "#FAF9F6";
const CORMORANT = "Cormorant Garamond, Georgia, serif";
const SANS = "DM Sans, system-ui, sans-serif";


// Wearable VIVA garments, one representative photo per style, drawn from
// the same three shop collections as VIVA.tsx (src/pages/VIVA.tsx) —
// previously this list still pointed at "The Heritage / The Bold / The
// Artist", three demo looks retired from the shop months ago, so trying
// them on here was styling a product that no longer exists. 9 items keeps
// the 3-column grid below in even rows (3x3) instead of an orphaned card.
const GARMENTS = [
  { id: "ajogun-plain", title: "Ajogún Plain Aṣọ-Òkè", photo: "/viva/collection/ajogun/plain/plain_1.jpeg", desc: "Heritage Aṣọ-Òkè top in clean, plain weave. The Inheritance collection." },
  { id: "ajogun-patched", title: "Ajogún Patched Aṣọ-Òkè", photo: "/viva/collection/ajogun/patched/patched_1.jpeg", desc: "Heritage Aṣọ-Òkè top in signature patched weave. The Inheritance collection." },
  { id: "ajogun-one-sleeved", title: "One-Sleeved Ajogún", photo: "/viva/collection/ajogun/one-sleeved/one_sleeved_1.jpeg", desc: "Architectural one-sleeved Aṣọ-Òkè top. The Inheritance collection." },
  { id: "ajogun-other-fabrics", title: "Ajogún: Other Fabrics", photo: "/viva/collection/ajogun/other-fabrics/fabric_1.jpeg", desc: "Ajogún top in Akwẹ́tẹ́ and specialty fabrics. The Inheritance collection." },
  { id: "nka-adire", title: "Nkà Garment: Àdịrẹ", photo: "/viva/collection/nka/adire_1.jpeg", desc: "Artisan garment in signature Àdịrẹ fabric. The Craftsmanship collection." },
  { id: "nka-silk-crepe", title: "Nkà: Silk & Crepe", photo: "/viva/collection/nka/silk_crepe_1.jpeg", desc: "Artisan garment in luxurious silk and crepe. The Craftsmanship collection." },
  { id: "daughters-tee", title: "Daughter of Adonai Tee", photo: "/viva/collection/daughter-of-adonai/crop-denim-white.jpeg", desc: "Statement graphic tee in premium cotton, white or black." },
  { id: "daughters-crop-denim", title: "Daughters Pants: 3/4 Denim", photo: "/viva/collection/daughter-of-adonai/crop-denim-white.jpeg", desc: "Cropped denim with the collection's signature ring hardware." },
  { id: "daughters-full-denim", title: "Daughters Pants: Full Denim", photo: "/viva/collection/daughter-of-adonai/full-denim-white.jpeg", desc: "Full-length wide-leg denim with the signature ring hardware." },
];

type Garment = (typeof GARMENTS)[number];

// Read a File as raw base64 (no data: prefix).
const fileToBase64 = (file: File): Promise<{ base64: string; mime: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mime: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Fetch a public asset and return raw base64 + mime.
const urlToBase64 = async (url: string): Promise<{ base64: string; mime: string }> => {
  const res = await fetch(url);
  const blob = await res.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { base64: dataUrl.split(",")[1] ?? "", mime: blob.type || "image/webp" };
};

const VivaTryOn = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garment, setGarment] = useState<Garment>(GARMENTS[0]);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image is too large. Please use one under 8MB.");
      return;
    }
    setError(null);
    setResult(null);
    setStatus("idle");
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
  };

  const runTryOn = async () => {
    if (!personFile) return;
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const person = await fileToBase64(personFile);
      const garmentImg = await urlToBase64(garment.photo);

      const { data, error: fnError } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          personImageBase64: person.base64,
          personMimeType: person.mime,
          garmentImageBase64: garmentImg.base64,
          garmentMimeType: garmentImg.mime,
          garmentName: garment.title,
        },
      });

      if (fnError) throw new Error(fnError.message || "Try-on request failed.");
      if (data?.error) throw new Error(data.detail || data.error);
      if (!data?.imageBase64) throw new Error("No image was returned. Please try again.");

      setResult(`data:${data.mimeType || "image/png"};base64,${data.imageBase64}`);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const orderOnWhatsApp = () => {
    const message =
      `Hi VIVA! I tried on "${garment.title}" using the virtual try-on and I love it. ` +
      `I'd like to order it / ask about a made-to-measure fit.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const reset = () => {
    setPersonPreview(null);
    setPersonFile(null);
    setResult(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: ALABASTER }}>
      <NavBar />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section
          className="w-full"
          style={{ background: `linear-gradient(135deg, ${BURGUNDY} 0%, #8B0A3A 55%, ${BURGUNDY} 100%)`, paddingTop: 56, paddingBottom: 56 }}
        >
          <div className="mx-auto px-6 text-center" style={{ maxWidth: 820 }}>
            <button
              type="button"
              onClick={() => navigate("/viva")}
              className="inline-flex items-center"
              style={{ gap: 8, color: "rgba(255,255,255,0.8)", background: "transparent", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 22 }}
            >
              <ArrowLeft size={15} /> Back to VIVA
            </button>
            <div className="inline-flex items-center" style={{ gap: 8, background: "rgba(212,175,55,0.16)", border: `1px solid ${GOLD}55`, borderRadius: 999, padding: "6px 16px", marginBottom: 18 }}>
              <Sparkles size={13} color={GOLD} />
              <span style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>Virtual Try-On · Preview</span>
            </div>
            <h1 style={{ fontFamily: CORMORANT, fontSize: "clamp(34px, 5vw, 60px)", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.05, margin: "0 0 14px" }}>
              See it on you, before it's made.
            </h1>
            <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0 }}>
              Upload a photo, pick a VIVA look, and preview how the piece would look on you.
              When you love it, we finish the order on WhatsApp, made to your measurements.
            </p>
          </div>
        </section>

        {/* Workspace */}
        <section className="mx-auto px-6" style={{ maxWidth: 1080, marginTop: 48 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 32 }}>
            {/* LEFT: inputs */}
            <div>
              {/* Step 1 — upload */}
              <p style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: BURGUNDY, fontWeight: 700, margin: "0 0 10px" }}>Step 1 · Your photo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%", aspectRatio: personPreview ? "auto" : "4/3", minHeight: 200,
                  border: `1.5px dashed ${personPreview ? "transparent" : `${BURGUNDY}55`}`,
                  borderRadius: 16, background: "#FFFFFF", cursor: "pointer", overflow: "hidden",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 0,
                }}
              >
                {personPreview ? (
                  <img src={personPreview} alt="Your uploaded photo" style={{ width: "100%", height: "100%", maxHeight: 420, objectFit: "contain" }} />
                ) : (
                  <>
                    <span style={{ width: 52, height: 52, borderRadius: 12, background: `${BURGUNDY}0F`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Upload size={22} color={BURGUNDY} />
                    </span>
                    <span style={{ fontFamily: SANS, fontSize: 14, color: BURGUNDY, fontWeight: 600 }}>Upload a clear full-body photo</span>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(17,17,17,0.5)" }}>JPG or PNG · under 8MB</span>
                  </>
                )}
              </button>
              {personPreview && (
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12, color: BURGUNDY, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Choose a different photo
                </button>
              )}

              {/* Step 2 — pick a look */}
              <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: BURGUNDY, fontWeight: 700, margin: "28px 0 10px" }}>Step 2 · Pick a look</p>
              <div className="grid grid-cols-3" style={{ gap: 10 }}>
                {GARMENTS.map((g) => {
                  const active = g.id === garment.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => { setGarment(g); setResult(null); setStatus("idle"); }}
                      style={{ padding: 0, border: `2px solid ${active ? BURGUNDY : "transparent"}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "#FFFFFF", boxShadow: active ? `0 8px 22px ${BURGUNDY}30` : "0 2px 8px rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                        <img src={g.photo} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "8px 6px" }}>
                        <span style={{ fontFamily: CORMORANT, fontSize: 14, fontStyle: "italic", color: active ? BURGUNDY : "#222", display: "block" }}>{g.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(17,17,17,0.6)", lineHeight: 1.6, margin: "10px 0 0" }}>{garment.desc}</p>

              {/* Action */}
              <button
                type="button"
                onClick={runTryOn}
                disabled={!personFile || status === "loading"}
                className="inline-flex items-center justify-center"
                style={{
                  width: "100%", marginTop: 24, gap: 10, minHeight: 52,
                  fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                  color: ALABASTER, border: "none", borderRadius: 999, cursor: personFile && status !== "loading" ? "pointer" : "not-allowed",
                  background: personFile && status !== "loading" ? `linear-gradient(135deg, ${BURGUNDY} 0%, #9B0A3A 100%)` : "#C9B9BE",
                  boxShadow: personFile && status !== "loading" ? `0 10px 28px ${BURGUNDY}40` : "none",
                }}
              >
                {status === "loading" ? (<><RefreshCw size={16} className="animate-spin" /> Styling your look…</>) : (<><Sparkles size={16} /> Try it on</>)}
              </button>
              <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(17,17,17,0.45)", lineHeight: 1.6, margin: "12px 0 0", textAlign: "center" }}>
                AI-generated preview for styling only. Final colour, fit & fabric are confirmed on your made-to-measure order.
              </p>
            </div>

            {/* RIGHT: result */}
            <div>
              <p style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: BURGUNDY, fontWeight: 700, margin: "0 0 10px" }}>Your preview</p>
              <div style={{ width: "100%", minHeight: 380, borderRadius: 16, background: "#FFFFFF", border: `1px solid ${BURGUNDY}1A`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <AnimatePresence mode="wait">
                  {status === "loading" && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center" style={{ gap: 14, padding: 40, textAlign: "center" }}>
                      <RefreshCw size={30} color={BURGUNDY} className={reduced ? "" : "animate-spin"} />
                      <span style={{ fontFamily: CORMORANT, fontSize: 20, fontStyle: "italic", color: BURGUNDY }}>Dressing your look…</span>
                      <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(17,17,17,0.5)" }}>This usually takes 10–20 seconds.</span>
                    </motion.div>
                  )}
                  {status === "done" && result && (
                    <motion.img key="result" src={result} alt={`You wearing ${garment.title}`} initial={{ opacity: 0, scale: reduced ? 1 : 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", maxHeight: 560, objectFit: "contain" }} />
                  )}
                  {(status === "idle" || status === "error") && (
                    <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center" style={{ gap: 12, padding: 40, textAlign: "center" }}>
                      <Sparkles size={28} color={`${BURGUNDY}66`} />
                      <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(17,17,17,0.45)", maxWidth: 240, lineHeight: 1.6 }}>
                        Your styled preview will appear here once you upload a photo and tap “Try it on.”
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="flex items-start" style={{ gap: 8, marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#FDECEF", border: `1px solid ${BURGUNDY}33` }}>
                  <AlertCircle size={16} color={BURGUNDY} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontFamily: SANS, fontSize: 13, color: BURGUNDY, lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              {status === "done" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col" style={{ gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="inline-flex items-center justify-center"
                    style={{ gap: 10, minHeight: 52, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#FFFFFF", border: "none", borderRadius: 999, cursor: "pointer", background: "#25D366", boxShadow: "0 10px 28px rgba(37,211,102,0.35)" }}
                  >
                    <Send size={16} /> Order “{garment.title}” on WhatsApp
                  </button>
                  <button type="button" onClick={reset} className="inline-flex items-center justify-center" style={{ gap: 8, minHeight: 46, fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: BURGUNDY, background: "transparent", border: `1px solid ${BURGUNDY}40`, borderRadius: 999, cursor: "pointer" }}>
                    <RefreshCw size={14} /> Try another look
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VivaTryOn;
