import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Plus, Pencil, Trash2, Upload, X, Image as ImageIcon,
  CheckCircle2, AlertCircle, RefreshCw, Star,
} from "lucide-react";

// ── DB types ───────────────────────────────────────────────────────────────────
export interface DBChapter {
  id: string;
  index_label: string;
  name: string;
  tagline: string;
  description: string;
  layout: string;
  sort_order: number;
}

export interface DBartwork {
  id: string;
  seq: number;
  title: string;
  story: string;
  chapter_id: string | null;
  medium: string;
  image_url: string;
  featured: boolean;
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const PURPLE = "#62017F";
const PINK   = "#ED155D";
const PL     = "#C77DFF";
const GOLD   = "#D97706";

const MEDIA   = ["Portrait", "Couture", "Fashion Design", "Product", "Footwear", "Campaign"] as const;
const LAYOUTS = ["mosaic", "rail", "feature"] as const;

type GalleryModal =
  | "add-artwork" | "edit-artwork"
  | "edit-chapter"
  | "confirm-delete"
  | null;

// ── Shared micro-styles ────────────────────────────────────────────────────────
const inputSx: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "11px 14px", color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, outline: "none",
  colorScheme: "dark",
};
const labelSx: React.CSSProperties = {
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10,
  color: "rgba(250,250,250,0.45)", letterSpacing: "0.18em",
  textTransform: "uppercase", display: "block", marginBottom: 5,
};
const cancelBtnSx: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "10px 18px",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13,
  color: "rgba(250,250,250,0.7)", cursor: "pointer",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={labelSx}>{label}</label>
    {children}
  </div>
);

const SaveBtn = ({ loading, label = "Save" }: { loading: boolean; label?: string }) => (
  <motion.button type="submit" disabled={loading}
    whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.97 }}
    style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #8B00B0 100%)`, color: "#FAFAFA", border: "none", borderRadius: 999, padding: "11px 24px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: `0 6px 20px ${PURPLE}44` }}>
    {loading ? "Saving…" : label}
  </motion.button>
);

const Modal = ({ title, onClose, children, width = 520 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
      style={{ background: "#14042A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "26px 28px 22px", width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 15, fontWeight: 700, color: "#FAFAFA", margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", color: "rgba(250,250,250,0.5)", display: "flex", padding: 6 }}><X size={14} /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

const GalleryToast = ({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
    style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${type === "success" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: type === "success" ? "#22C55E" : "#EF4444", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
    {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, display: "flex", padding: 0 }}><X size={13} /></button>
  </motion.div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const GalleryAdminTab = () => {
  const [artworks,   setArtworks]   = useState<DBartwork[]>([]);
  const [chapters,   setChapters]   = useState<DBChapter[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<GalleryModal>(null);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleteLabel, setDeleteLabel] = useState("");
  const [view,       setView]       = useState<"artworks" | "chapters">("artworks");

  const [artworkForm, setArtworkForm] = useState({
    id: "", seq: "", title: "", story: "", chapter_id: "", medium: "Portrait", image_url: "", featured: false,
  });
  const [chapterForm, setChapterForm] = useState({
    id: "", index_label: "", name: "", tagline: "", description: "", layout: "mosaic",
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const closeModal = () => setModal(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const [a, c] = await Promise.all([
      supabase.from("va_artworks").select("*").order("seq"),
      supabase.from("va_gallery_chapters").select("*").order("sort_order"),
    ]);
    setArtworks(a.data ?? []);
    setChapters(c.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop() ?? "webp";
      const path = `artwork-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("gallery").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(data.path);
      setArtworkForm(p => ({ ...p, image_url: publicUrl }));
      showToast("Image uploaded");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Artwork CRUD ────────────────────────────────────────────────────────────
  const openAddArtwork = () => {
    const nextSeq = (artworks.length ? Math.max(...artworks.map(a => a.seq)) + 1 : 1);
    setArtworkForm({ id: "", seq: String(nextSeq), title: "", story: "", chapter_id: chapters[0]?.id ?? "", medium: "Portrait", image_url: "", featured: false });
    setModal("add-artwork");
  };

  const openEditArtwork = (a: DBartwork) => {
    setArtworkForm({ id: a.id, seq: String(a.seq), title: a.title, story: a.story, chapter_id: a.chapter_id ?? "", medium: a.medium, image_url: a.image_url, featured: a.featured });
    setModal("edit-artwork");
  };

  const saveArtwork = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        seq:        parseInt(artworkForm.seq) || 0,
        title:      artworkForm.title.trim(),
        story:      artworkForm.story.trim(),
        chapter_id: artworkForm.chapter_id || null,
        medium:     artworkForm.medium,
        image_url:  artworkForm.image_url.trim(),
        featured:   artworkForm.featured,
      };
      const { error } = artworkForm.id
        ? await supabase.from("va_artworks").update(payload).eq("id", artworkForm.id)
        : await supabase.from("va_artworks").insert(payload);
      if (error) throw error;
      showToast(artworkForm.id ? "Artwork updated" : "Artwork added");
      closeModal(); await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally { setSaving(false); }
  };

  const openDeleteArtwork = (a: DBartwork) => {
    setDeleteId(a.id); setDeleteLabel(a.title); setModal("confirm-delete");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("va_artworks").delete().eq("id", deleteId);
      if (error) throw error;
      showToast("Artwork deleted");
      closeModal(); await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally { setSaving(false); }
  };

  // ── Chapter CRUD (edit-only: no add/delete — structural) ───────────────────
  const openEditChapter = (c: DBChapter) => {
    setChapterForm({ id: c.id, index_label: c.index_label, name: c.name, tagline: c.tagline, description: c.description, layout: c.layout });
    setModal("edit-chapter");
  };

  const saveChapter = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { name: chapterForm.name.trim(), tagline: chapterForm.tagline.trim(), description: chapterForm.description.trim(), layout: chapterForm.layout };
      const { error } = await supabase.from("va_gallery_chapters").update(payload).eq("id", chapterForm.id);
      if (error) throw error;
      showToast("Chapter updated");
      closeModal(); await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally { setSaving(false); }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const chapterName = (id: string | null) => chapters.find(c => c.id === id)?.name ?? "—";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {(["artworks", "chapters"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "8px 18px", borderRadius: 999, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${view === v ? `${PURPLE}88` : "rgba(255,255,255,0.1)"}`, background: view === v ? `${PURPLE}22` : "transparent", color: view === v ? PL : "rgba(250,250,250,0.45)", textTransform: "capitalize" }}>
            {v} {v === "artworks" ? `(${artworks.length})` : `(${chapters.length})`}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <motion.button onClick={load} disabled={loading} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "7px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.55)", cursor: "pointer" }}>
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />Refresh
          </motion.button>
          {view === "artworks" && (
            <motion.button onClick={openAddArtwork} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: `${PURPLE}22`, border: `1px solid ${PURPLE}55`, borderRadius: 999, padding: "7px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: PL, cursor: "pointer" }}>
              <Plus size={13} strokeWidth={2.5} />Add Artwork
            </motion.button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(250,250,250,0.3)", fontFamily: "DM Sans, system-ui, sans-serif" }}>Loading gallery…</div>
      )}

      {/* ── Artworks grid ── */}
      {!loading && view === "artworks" && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px 20px" }}>
          <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 18px" }}>
            Illustrations · {artworks.length} artworks
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13 }}>
              <thead>
                <tr>
                  {["", "Title", "Chapter", "Medium", "Featured", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, color: "rgba(250,250,250,0.4)", letterSpacing: "0.18em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {artworks.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {/* Thumbnail */}
                    <td style={{ padding: "8px 12px", width: 60 }}>
                      {a.image_url ? (
                        <img src={a.image_url} alt={a.title} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ImageIcon size={16} color="rgba(255,255,255,0.2)" />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#FAFAFA", fontWeight: 500 }}>{a.title}</td>
                    <td style={{ padding: "8px 12px", color: "rgba(250,250,250,0.55)", fontSize: 12 }}>{chapterName(a.chapter_id)}</td>
                    <td style={{ padding: "8px 12px", color: "rgba(250,250,250,0.55)", fontSize: 12 }}>{a.medium}</td>
                    <td style={{ padding: "8px 12px" }}>
                      {a.featured && <Star size={13} color={GOLD} fill={GOLD} />}
                    </td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <button onClick={() => openEditArtwork(a)} style={{ background: `${PURPLE}30`, border: `1px solid ${PURPLE}60`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: PL, marginRight: 6 }}><Pencil size={12} /></button>
                      <button onClick={() => openDeleteArtwork(a)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#EF4444" }}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
                {artworks.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "32px 12px", color: "rgba(250,250,250,0.3)", textAlign: "center" }}>
                    No artworks yet — run the seed SQL or add one above.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Chapters ── */}
      {!loading && view === "chapters" && (
        <div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px 20px", marginBottom: 12 }}>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 18px" }}>Story Chapters</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {chapters.map(c => (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                    <div>
                      <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: PL, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>{c.index_label}</span>
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: "#FAFAFA", margin: "4px 0 2px" }}>{c.name}</p>
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: GOLD, margin: 0, fontStyle: "italic" }}>{c.tagline}</p>
                    </div>
                    <button onClick={() => openEditChapter(c)} style={{ flexShrink: 0, background: `${PURPLE}30`, border: `1px solid ${PURPLE}60`, borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: PL }}>
                      <Pencil size={12} />
                    </button>
                  </div>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.5)", margin: "0 0 8px", lineHeight: 1.55 }}>{c.description}</p>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: `${PURPLE}20`, border: `1px solid ${PURPLE}40`, color: PL, textTransform: "uppercase", letterSpacing: "0.12em" }}>{c.layout}</span>
                    <span style={{ fontSize: 10, color: "rgba(250,250,250,0.3)" }}>{artworks.filter(a => a.chapter_id === c.id).length} artworks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.25)", padding: "0 4px" }}>
            Chapter IDs are fixed (referenced by artworks). You can edit names, taglines, descriptions, and layout.
          </p>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>

        {/* Add / Edit Artwork */}
        {(modal === "add-artwork" || modal === "edit-artwork") && (
          <Modal key="artwork-modal" title={modal === "add-artwork" ? "Add Artwork" : "Edit Artwork"} onClose={closeModal} width={560}>
            <form onSubmit={saveArtwork} style={{ display: "flex", flexDirection: "column" }}>

              {/* Image */}
              <F label="Image">
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {/* Preview */}
                  <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {artworkForm.image_url ? (
                      <img src={artworkForm.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageIcon size={24} color="rgba(255,255,255,0.15)" />
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <input style={inputSx} value={artworkForm.image_url} onChange={e => setArtworkForm(p => ({ ...p, image_url: e.target.value }))} placeholder="/artworks/artwork_0001.webp  or  https://…" />
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    <motion.button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: `${PINK}15`, border: `1px solid ${PINK}40`, borderRadius: 8, padding: "9px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: PINK, cursor: uploading ? "wait" : "pointer", fontWeight: 600 }}>
                      <Upload size={13} />{uploading ? "Uploading…" : "Upload new image"}
                    </motion.button>
                  </div>
                </div>
              </F>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Title *">
                  <input required style={inputSx} value={artworkForm.title} onChange={e => setArtworkForm(p => ({ ...p, title: e.target.value }))} placeholder="The Hatmaker" />
                </F>
                <F label="Seq (display order)">
                  <input type="number" style={inputSx} value={artworkForm.seq} onChange={e => setArtworkForm(p => ({ ...p, seq: e.target.value }))} />
                </F>
              </div>

              <F label="Story *">
                <textarea required rows={3} style={{ ...inputSx, resize: "vertical" }} value={artworkForm.story} onChange={e => setArtworkForm(p => ({ ...p, story: e.target.value }))} />
              </F>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Chapter">
                  <select style={inputSx} value={artworkForm.chapter_id} onChange={e => setArtworkForm(p => ({ ...p, chapter_id: e.target.value }))}>
                    <option value="">— None —</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>{c.index_label} · {c.name}</option>)}
                  </select>
                </F>
                <F label="Medium">
                  <select style={inputSx} value={artworkForm.medium} onChange={e => setArtworkForm(p => ({ ...p, medium: e.target.value }))}>
                    {MEDIA.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </F>
              </div>

              {/* Featured toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
                onClick={() => setArtworkForm(p => ({ ...p, featured: !p.featured }))}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${artworkForm.featured ? GOLD : "rgba(255,255,255,0.2)"}`, background: artworkForm.featured ? `${GOLD}22` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {artworkForm.featured && <Star size={10} color={GOLD} fill={GOLD} />}
                </div>
                <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: artworkForm.featured ? GOLD : "rgba(250,250,250,0.55)" }}>
                  Featured — shown prominently in the gallery
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} label={modal === "add-artwork" ? "Add Artwork" : "Save Changes"} />
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Chapter */}
        {modal === "edit-chapter" && (
          <Modal key="chapter-modal" title={`Edit Chapter · ${chapterForm.index_label}`} onClose={closeModal}>
            <form onSubmit={saveChapter} style={{ display: "flex", flexDirection: "column" }}>
              <F label="Name *">
                <input required style={inputSx} value={chapterForm.name} onChange={e => setChapterForm(p => ({ ...p, name: e.target.value }))} />
              </F>
              <F label="Tagline *">
                <input required style={inputSx} value={chapterForm.tagline} onChange={e => setChapterForm(p => ({ ...p, tagline: e.target.value }))} />
              </F>
              <F label="Description *">
                <textarea required rows={4} style={{ ...inputSx, resize: "vertical" }} value={chapterForm.description} onChange={e => setChapterForm(p => ({ ...p, description: e.target.value }))} />
              </F>
              <F label="Layout">
                <select style={inputSx} value={chapterForm.layout} onChange={e => setChapterForm(p => ({ ...p, layout: e.target.value }))}>
                  {LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </F>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} />
              </div>
            </form>
          </Modal>
        )}

        {/* Confirm delete */}
        {modal === "confirm-delete" && (
          <Modal key="confirm-modal" title="Delete Artwork" onClose={closeModal} width={380}>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.7)", margin: "0 0 20px", lineHeight: 1.6 }}>
              Delete <strong style={{ color: "#FAFAFA" }}>{deleteLabel}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={cancelBtnSx}>Cancel</button>
              <button onClick={confirmDelete} disabled={saving}
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#EF4444", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </Modal>
        )}

      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <GalleryToast key="gt" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default GalleryAdminTab;
