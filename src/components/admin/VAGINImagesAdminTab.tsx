import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Plus, Pencil, Trash2, Upload, X, Image as ImageIcon,
  CheckCircle2, AlertCircle, RefreshCw,
} from "lucide-react";

// ── DB type ────────────────────────────────────────────────────────────────────
export interface DBVaginImage {
  id: string;
  slot: string;
  label: string;
  section: string;
  image_url: string;
  sort_order: number;
  updated_at: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const PURPLE = "#62017F";
const PINK   = "#ED155D";
const PL     = "#C77DFF";

const SECTIONS = [
  "Hero photo cluster",
  "Malawi field work",
  "Session snapshots",
  "Meet the Team",
  "General",
] as const;

type ImagesModal = "add" | "edit" | "confirm-delete" | null;

// ── Shared micro-styles (same look as GalleryAdminTab) ────────────────────────
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

const Toast = ({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
    style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${type === "success" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: type === "success" ? "#22C55E" : "#EF4444", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
    {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, display: "flex", padding: 0 }}><X size={13} /></button>
  </motion.div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const VAGINImagesAdminTab = () => {
  const [images,    setImages]    = useState<DBVaginImage[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [modal,     setModal]     = useState<ImagesModal>(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DBVaginImage | null>(null);
  // id of the row a quick "Replace" upload applies to (null = upload inside the modal form)
  const [replacingId, setReplacingId] = useState<string | null>(null);

  const [form, setForm] = useState({ id: "", slot: "", label: "", section: "Meet the Team", image_url: "", sort_order: "" });

  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const closeModal = () => setModal(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("va_vagin_images").select("*").order("sort_order");
    if (error) {
      // 42P01 = relation does not exist → setup SQL not run yet
      setTableMissing(true);
    } else {
      setTableMissing(false);
      setImages(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Upload (reuses the public 'gallery' bucket, vagin/ folder) ──────────────
  const uploadFile = async (file: File): Promise<string> => {
    const ext  = file.name.split(".").pop() ?? "webp";
    const path = `vagin/vagin-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("gallery").upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(data.path);
    return publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadFile(file);
      if (replacingId) {
        // Quick replace straight from the card
        const { error } = await supabase.from("va_vagin_images").update({ image_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", replacingId);
        if (error) throw error;
        showToast("Image replaced");
        await load();
      } else {
        // Upload inside the add/edit form
        setForm(p => ({ ...p, image_url: publicUrl }));
        showToast("Image uploaded");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      setReplacingId(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const startReplace = (row: DBVaginImage) => {
    setReplacingId(row.id);
    fileRef.current?.click();
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    const nextSort = images.length ? Math.max(...images.map(i => i.sort_order)) + 1 : 1;
    setForm({ id: "", slot: `vagin_custom_${Date.now()}`, label: "", section: "Meet the Team", image_url: "", sort_order: String(nextSort) });
    setModal("add");
  };

  const openEdit = (row: DBVaginImage) => {
    setForm({ id: row.id, slot: row.slot, label: row.label, section: row.section, image_url: row.image_url, sort_order: String(row.sort_order) });
    setModal("edit");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        slot:       form.slot.trim(),
        label:      form.label.trim(),
        section:    form.section,
        image_url:  form.image_url.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };
      const { error } = form.id
        ? await supabase.from("va_vagin_images").update(payload).eq("id", form.id)
        : await supabase.from("va_vagin_images").insert(payload);
      if (error) throw error;
      showToast(form.id ? "Image updated" : "Image added");
      closeModal(); await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("va_vagin_images").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      showToast("Image removed");
      closeModal(); await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally { setSaving(false); }
  };

  // ── Derived: group by section ───────────────────────────────────────────────
  const sections = Array.from(new Set(images.map(i => i.section)));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* hidden file input shared by card "Replace" buttons and the modal */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", margin: 0 }}>
          VAGIN Page Images · {images.length}
        </p>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <motion.button onClick={load} disabled={loading} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "7px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.55)", cursor: "pointer" }}>
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />Refresh
          </motion.button>
          <motion.button onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: `${PURPLE}22`, border: `1px solid ${PURPLE}55`, borderRadius: 999, padding: "7px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: PL, cursor: "pointer" }}>
            <Plus size={13} strokeWidth={2.5} />Add Image
          </motion.button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(250,250,250,0.3)", fontFamily: "DM Sans, system-ui, sans-serif" }}>Loading images…</div>
      )}

      {/* Setup notice */}
      {!loading && tableMissing && (
        <div style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.35)", borderRadius: 12, padding: "18px 20px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.75)", lineHeight: 1.7 }}>
          <strong style={{ color: "#D97706" }}>One-time setup needed:</strong> run <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>sql/vagin_images_setup.sql</code> in the
          Supabase SQL Editor (Database → SQL Editor), then hit Refresh. Until then the site keeps using its built-in images.
        </div>
      )}

      {/* Cards grouped by section */}
      {!loading && !tableMissing && sections.map(section => (
        <div key={section} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 20px 16px", marginBottom: 16 }}>
          <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PL, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>{section}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
            {images.filter(i => i.section === section).map(row => (
              <div key={row.id} style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ aspectRatio: "4 / 3", background: "rgba(255,255,255,0.04)", position: "relative" }}>
                  {row.image_url ? (
                    <img src={row.image_url} alt={row.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={22} color="rgba(255,255,255,0.2)" />
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, fontWeight: 600, color: "#FAFAFA", margin: "0 0 2px" }}>{row.label}</p>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.35)", margin: "0 0 10px", letterSpacing: "0.06em" }}>{row.slot}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startReplace(row)} disabled={uploading}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: `${PINK}15`, border: `1px solid ${PINK}40`, borderRadius: 6, padding: "6px 8px", cursor: uploading ? "wait" : "pointer", color: PINK, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, fontWeight: 600 }}>
                      <Upload size={11} />{uploading && replacingId === row.id ? "…" : "Replace"}
                    </button>
                    <button onClick={() => openEdit(row)} style={{ background: `${PURPLE}30`, border: `1px solid ${PURPLE}60`, borderRadius: 6, padding: "6px 9px", cursor: "pointer", color: PL }}><Pencil size={12} /></button>
                    <button onClick={() => { setDeleteTarget(row); setModal("confirm-delete"); }} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "6px 9px", cursor: "pointer", color: "#EF4444" }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!loading && !tableMissing && (
        <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.25)", padding: "0 4px" }}>
          Replace swaps the photo shown on the VAGIN page instantly. Deleting a fixed slot makes the site fall back
          to its built-in default image; images in "Meet the Team" are fully add/remove-able.
        </p>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {(modal === "add" || modal === "edit") && (
          <Modal key="img-modal" title={modal === "add" ? "Add Image" : "Edit Image"} onClose={closeModal} width={560}>
            <form onSubmit={save} style={{ display: "flex", flexDirection: "column" }}>
              <F label="Image">
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, width: 88, height: 66, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {form.image_url ? (
                      <img src={form.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageIcon size={22} color="rgba(255,255,255,0.15)" />
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <input style={inputSx} value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="/vagin-images/….webp  or  https://…" />
                    <motion.button type="button" onClick={() => { setReplacingId(null); fileRef.current?.click(); }} disabled={uploading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: `${PINK}15`, border: `1px solid ${PINK}40`, borderRadius: 8, padding: "9px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: PINK, cursor: uploading ? "wait" : "pointer", fontWeight: 600 }}>
                      <Upload size={13} />{uploading ? "Uploading…" : "Upload new image"}
                    </motion.button>
                  </div>
                </div>
              </F>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Label *">
                  <input required style={inputSx} value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Community Outreach" />
                </F>
                <F label="Sort order">
                  <input type="number" style={inputSx} value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} />
                </F>
              </div>

              <F label="Section">
                <select style={inputSx} value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>

              {modal === "edit" && (
                <F label="Slot (referenced by the site — change with care)">
                  <input style={inputSx} value={form.slot} onChange={e => setForm(p => ({ ...p, slot: e.target.value }))} />
                </F>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} label={modal === "add" ? "Add Image" : "Save Changes"} />
              </div>
            </form>
          </Modal>
        )}

        {modal === "confirm-delete" && deleteTarget && (
          <Modal key="confirm-modal" title="Remove Image" onClose={closeModal} width={400}>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.7)", margin: "0 0 20px", lineHeight: 1.6 }}>
              Remove <strong style={{ color: "#FAFAFA" }}>{deleteTarget.label}</strong>?{" "}
              {deleteTarget.section === "Meet the Team"
                ? "It will disappear from the Meet the Team row on the VAGIN page."
                : "The site will fall back to its built-in default image for this slot."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={cancelBtnSx}>Cancel</button>
              <button onClick={confirmDelete} disabled={saving}
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#EF4444", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Removing…" : "Remove"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="vt" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default VAGINImagesAdminTab;
