import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import {
  LayoutDashboard, Droplets, Palette, School as SchoolIcon, LogOut,
  TrendingUp, Users, BookOpen, Coins,
  AlertCircle, RefreshCw, Plus, Pencil, Trash2, X,
  GraduationCap, ClipboardList, CheckCircle2, Images, Camera, Bot, ShoppingBag,
} from "lucide-react";
import GalleryAdminTab from "@/components/admin/GalleryAdminTab";
import VAGINImagesAdminTab from "@/components/admin/VAGINImagesAdminTab";
import BotActivityTab from "@/components/admin/BotActivityTab";
import WhatsAppBotSimulatorTab from "@/components/admin/WhatsAppBotSimulatorTab";

const PINK   = "#ED155D";
const PURPLE = "#62017F";
const GOLD   = "#D97706";
const PL     = "#C77DFF";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SchoolRow { id: string; name: string; code: string | null; country: string; state_region: string | null; contact_name: string | null; city: string | null; girls_reached: number }
interface Student   { id: string; student_id: string; name: string; school_id: string | null; class: string | null; balance_ngn: number; free_pads_used: number; paid_pads_used: number; pads_received: number; active: boolean; created_at: string }
interface Matron    { id: string; name: string; phone: string; school_id: string | null; active: boolean; created_at: string }
interface CountryConfig { country: string; dial_code: string; currency_code: string; currency_symbol: string }
interface Distribution { id: string; school_id: string; distribution_date: string; girls_count: number; pads_count: number; savings_collected_ngn: number; distributed_by: string | null }
interface Session      { id: string; school_id: string; session_date: string; topic: string; girls_attended: number; facilitator: string | null; delivery_format: string }
interface Savings      { id: string; school_id: string; month: string; contributors: number; total_ngn: number }
interface TxRow        { id: string; student_id: string | null; matron_id: string | null; type: string; pads_issued: number; amount_ngn: number; source: string; notes: string | null; created_at: string; voided?: boolean; voided_reason?: string | null; flagged?: boolean }

interface DashData {
  schools: SchoolRow[]; students: Student[]; matrons: Matron[];
  distributions: Distribution[]; sessions: Session[];
  savings: Savings[]; transactions: TxRow[]; countryConfigs: CountryConfig[];
}

// ── Maps ───────────────────────────────────────────────────────────────────────
const TOPIC_LABELS: Record<string, string> = {
  puberty: "Puberty Basics", hygiene: "Hygiene & Wellness",
  safety: "Physical Safety", mental_health: "Mental Health", srhr_rights: "SRHR Rights",
};
const FORMAT_LABELS: Record<string, string> = {
  in_school: "In-School", community_circle: "Community Circle", toolkit: "Toolkit",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt     = (n: number) => n.toLocaleString("en-NG");
const fmtNGN  = (n: number) => `₦${fmt(Math.round(n))}`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const today   = () => new Date().toISOString().slice(0, 10);
// Initials: first letter of first name + first letter of last name (fallback: first 2 chars)
const studentInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "XX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase().padEnd(2, "X");
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
// Derive a 3-letter school code from its name if none was set (fallback only)
const codeFromName = (name: string) =>
  name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X") || "VAG";
// Build the globally-unique student ID: SCHOOLCODE-INITIALS-SEQ  e.g. LGS-FA-001
const buildStudentId = (schoolCode: string, name: string, seq: number) =>
  `${schoolCode}-${studentInitials(name)}-${String(seq).padStart(3, "0")}`;

// ── Phone normalization ────────────────────────────────────────────────────────
// Canonical bot-matching format: digits only, no "+", no local trunk "0" —
// exactly what WhatsApp sends as the inbound message's `from` field. Applied
// at every entry point (manual matron form, CSV import) so the bot's phone
// lookup never silently fails on a formatting mismatch.
type PhoneResult = { ok: true; phone: string } | { ok: false; reason: string };
function normalizePhone(raw: string, dialCode: string): PhoneResult {
  let digits = raw.trim().replace(/[\s\-()]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits) return { ok: false, reason: "Phone number is required." };
  if (!/^\d+$/.test(digits)) return { ok: false, reason: "Phone number must contain only digits (spaces/dashes/parens are fine, letters aren't)." };
  if (digits.startsWith(dialCode)) {
    // already carries the right country code
  } else if (digits.startsWith("0")) {
    digits = dialCode + digits.slice(1);
  } else {
    return { ok: false, reason: `Doesn't start with +${dialCode} (this school's country code) or a local "0" prefix — check the country is right.` };
  }
  if (digits.length < dialCode.length + 7 || digits.length > dialCode.length + 11) {
    return { ok: false, reason: "Unexpected length for a phone number once normalized — double check the digits." };
  }
  return { ok: true, phone: digits };
}

// ── Bulk import (CSV) ──────────────────────────────────────────────────────────
// One row per student (or per matron, if a school has no students yet). School
// and matron columns repeat across every row that belongs to them — normal for
// a flattened CSV export from Excel/Sheets.
const IMPORT_HEADERS = [
  "school_code", "school_name", "school_country", "school_city", "school_state_region", "school_contact_name",
  "matron_name", "matron_phone", "matron_active",
  "student_id", "student_name", "student_class", "student_balance_ngn", "student_free_pads_used", "student_paid_pads_used",
] as const;
type ImportRow = Record<typeof IMPORT_HEADERS[number], string>;
const IMPORT_REQUIRED_HEADERS = ["school_code", "school_name", "matron_name", "matron_phone"] as const;

// Minimal RFC4180 CSV parser — handles quoted fields, embedded commas, "" escapes,
// and both \n and \r\n line endings (what Excel/Sheets actually export).
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(cell => cell.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some(cell => cell.trim() !== "")) rows.push(row); }
  return rows;
}

// ── Shared input styles ────────────────────────────────────────────────────────
const inputSx: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "11px 14px", color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, outline: "none",
  colorScheme: "dark", // renders native dropdown popups & date pickers in dark mode (readable options)
};
const labelSx: React.CSSProperties = {
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13,
  color: "rgba(250,250,250,0.45)", letterSpacing: "0.18em",
  textTransform: "uppercase", display: "block", marginBottom: 5,
};
const cancelBtnSx: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "10px 18px",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13,
  color: "rgba(250,250,250,0.7)", cursor: "pointer",
};

// ── Field wrapper ──────────────────────────────────────────────────────────────
const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={labelSx}>{label}</label>
    {children}
  </div>
);

// ── BarChart ───────────────────────────────────────────────────────────────────
const BarChart = ({ data, color }: { data: { label: string; value: number }[]; color: string }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, ease: "easeOut" as const }}
            style={{ width: "100%", height: Math.max((d.value / max) * 64, 4), background: color, borderRadius: "4px 4px 0 0", transformOrigin: "bottom", opacity: 0.85 }}
          />
          <span style={{ fontSize: 9, color: "rgba(250,250,250,0.4)", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── StatCard ───────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: typeof Users; label: string; value: string; sub?: string; color: string }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, borderRadius: 14, padding: "22px 24px", backdropFilter: "blur(8px)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon size={18} color={color} strokeWidth={1.75} />
      </span>
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.45)", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>{label}</p>
    </div>
    <p className="font-display" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.4)", margin: "6px 0 0" }}>{sub}</p>}
  </motion.div>
);

// ── Table ──────────────────────────────────────────────────────────────────────
const Table = ({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.18em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "12px 14px", color: j === 0 ? "#FAFAFA" : "rgba(250,250,250,0.65)", whiteSpace: "nowrap" }}>{cell}</td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={headers.length} style={{ padding: "24px 14px", color: "rgba(250,250,250,0.35)", textAlign: "center" }}>No records yet</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

// ── Card ───────────────────────────────────────────────────────────────────────
const Card = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px 20px", marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", margin: 0 }}>{title}</p>
      {action}
    </div>
    {children}
  </div>
);

// ── Small action buttons ───────────────────────────────────────────────────────
const EditBtn   = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{ background: `${PURPLE}30`, border: `1px solid ${PURPLE}60`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: PL, marginRight: 6 }}><Pencil size={12} /></button>
);
const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#EF4444" }}><Trash2 size={12} /></button>
);
const AddBtn = ({ label, onClick, color = PURPLE }: { label: string; onClick: () => void; color?: string }) => (
  <motion.button onClick={onClick} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
    style={{ display: "flex", alignItems: "center", gap: 6, background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 999, padding: "7px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: color === PURPLE ? PL : color, cursor: "pointer" }}>
    <Plus size={13} strokeWidth={2.5} />{label}
  </motion.button>
);

// ── Save button ────────────────────────────────────────────────────────────────
const SaveBtn = ({ loading, label = "Save" }: { loading: boolean; label?: string }) => (
  <motion.button type="submit" disabled={loading} whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.97 }}
    style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #8B00B0 100%)`, color: "#FAFAFA", border: "none", borderRadius: 999, padding: "11px 24px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: `0 6px 20px ${PURPLE}44` }}>
    {loading ? "Saving…" : label}
  </motion.button>
);

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
    style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${type === "success" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: type === "success" ? "#22C55E" : "#EF4444", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
    {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, display: "flex", padding: 0 }}><X size={13} /></button>
  </motion.div>
);

// ── Modal shell ────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, width = 500 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
      style={{ background: "#14042A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "26px 28px 22px", width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 15, fontWeight: 700, color: "#FAFAFA", margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", color: "rgba(250,250,250,0.5)", display: "flex", padding: 6 }}><X size={14} /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

// ── Confirm delete ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ label, onConfirm, onCancel, saving }: { label: string; onConfirm: () => void; onCancel: () => void; saving: boolean }) => (
  <Modal title="Confirm Delete" onClose={onCancel} width={380}>
    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.7)", margin: "0 0 20px", lineHeight: 1.6 }}>
      Delete <strong style={{ color: "#FAFAFA" }}>{label}</strong>? This cannot be undone.
    </p>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button onClick={onCancel} style={cancelBtnSx}>Cancel</button>
      <button onClick={onConfirm} disabled={saving}
        style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#EF4444", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Deleting…" : "Delete"}
      </button>
    </div>
  </Modal>
);

// ── Admin Login ────────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      if (!data.user) throw new Error("Login failed");
      const { data: adminRow } = await supabase.from("va_admins").select("email").eq("email", data.user.email).maybeSingle();
      if (!adminRow) { await supabase.auth.signOut(); throw new Error("Access denied. Admins only."); }
      onLogin();
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0D0020 0%, #0A0A0A 100%)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div className="text-center" style={{ marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${PURPLE}22`, border: `1px solid ${PL}44`, borderRadius: 999, padding: "7px 18px", marginBottom: 20 }}>
            <LayoutDashboard size={13} color={PL} strokeWidth={2} />
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: PL, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600 }}>VAGIN Admin</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(28px,5vw,38px)", fontWeight: 700, color: "#FAFAFA", margin: "0 0 8px", lineHeight: 1.1 }}>Dashboard Login</h1>
          <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.5)", margin: 0 }}>Admin access only</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required style={inputSx} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputSx} />
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "11px 14px" }}>
                <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#EF4444", lineHeight: 1.5 }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button type="submit" disabled={loading} whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }}
            style={{ marginTop: 4, background: `linear-gradient(135deg, ${PURPLE} 0%, #8B00B0 100%)`, color: "#FAFAFA", border: "none", borderRadius: 999, padding: "14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: `0 8px 24px ${PURPLE}44` }}>
            {loading ? "Signing in…" : "Sign In →"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const VAGINDashboard = () => {
  type TabId = "overview" | "schools" | "students" | "matrons" | "pad_kolo" | "vaginart" | "transactions" | "gallery" | "vagin_images" | "viva_products" | "bot";
  type ModalType = "add-school" | "edit-school" | "add-student" | "edit-student" | "add-matron" | "edit-matron" | "add-distribution" | "add-session" | "confirm-delete" | "bulk-import" | null;

  const [authed, setAuthed]         = useState<boolean | null>(null);
  const [activeTab, setActiveTab]   = useState<TabId>("overview");
  const [data, setData]             = useState<DashData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError]   = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [modal, setModal]           = useState<ModalType>(null);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ table: string; id: string; label: string } | null>(null);

  // Form states
  const [schoolForm, setSchoolForm] = useState({ id: "", name: "", code: "", country: "Nigeria", city: "", state_region: "", contact_name: "" });
  const [studentForm, setStudentForm] = useState({ id: "", student_id: "", name: "", school_id: "", class: "", balance_ngn: "0", free_pads_used: "0", paid_pads_used: "0", idManual: false });
  const [matronForm, setMatronForm] = useState({ id: "", name: "", phone: "", school_id: "", active: true });
  const [distForm, setDistForm]     = useState({ school_id: "", distribution_date: today(), girls_count: "", pads_count: "", savings_collected_ngn: "0", distributed_by: "" });
  const [sessForm, setSessForm]     = useState({ school_id: "", session_date: today(), topic: "puberty", girls_attended: "", facilitator: "", delivery_format: "in_school" });

  // Bulk import (CSV) state
  const [importRows, setImportRows]     = useState<ImportRow[]>([]);
  const [importParseErrors, setImportParseErrors] = useState<string[]>([]);
  const [importing, setImporting]       = useState(false);
  const [importSummary, setImportSummary] = useState<{ schools: number; matrons: number; students: number; errors: { row: number; message: string }[] } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const closeModal = () => setModal(null);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthed(false); return; }
      const { data: row } = await supabase.from("va_admins").select("email").eq("email", session.user.email).maybeSingle();
      setAuthed(!!row);
    });
  }, []);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoadingData(true); setDataError(null);
    try {
      const [s, st, m, d, se, sa, tx, cc] = await Promise.all([
        supabase.from("vagin_schools").select("*").order("name"),
        supabase.from("vagin_students").select("*").order("student_id"),
        supabase.from("vagin_matrons").select("*").order("name"),
        supabase.from("vagin_pad_distributions").select("*").order("distribution_date", { ascending: false }),
        supabase.from("vagin_sessions").select("*").order("session_date", { ascending: false }),
        supabase.from("vagin_savings").select("*").order("month"),
        supabase.from("vagin_transactions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("country_configs").select("*"),
      ]);
      if (s.error) throw s.error;
      setData({
        schools:       s.data  as SchoolRow[],
        students:      (st.data ?? []) as Student[],
        matrons:       (m.data  ?? []) as Matron[],
        distributions: (d.data  ?? []) as Distribution[],
        sessions:      (se.data ?? []) as Session[],
        savings:       (sa.data ?? []) as Savings[],
        transactions:  (tx.data ?? []) as TxRow[],
        countryConfigs: (cc.data ?? []) as CountryConfig[],
      });
    } catch (err) { setDataError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const handleSignOut = async () => { await supabase.auth.signOut(); setAuthed(false); setData(null); };

  // ── Void a transaction (reverses balances, keeps audit row) ────────────────
  const voidTransaction = async (t: TxRow) => {
    if (!window.confirm(`Void this ${t.type.replace(/_/g, " ")} transaction? Balances will be reversed; the audit row is kept.`)) return;
    await supabase.from("vagin_transactions").update({ voided: true, voided_reason: "Admin void from dashboard" }).eq("id", t.id);
    if (t.student_id) {
      const { data: g } = await supabase.from("vagin_students").select("*").eq("id", t.student_id).maybeSingle();
      if (g) {
        const patch: Record<string, unknown> = {};
        if (t.type === "paid_pads") {
          patch.paid_pads_used = Math.max(0, (g.paid_pads_used ?? 0) - t.pads_issued);
          patch.pads_received = Math.max(0, (g.pads_received ?? 0) - t.pads_issued);
          patch.balance_ngn = (g.balance_ngn ?? 0) + (t.amount_ngn ?? 0);
        } else if (t.type === "free_pads") {
          patch.free_pads_used = Math.max(0, (g.free_pads_used ?? 0) - t.pads_issued);
          patch.pads_received = Math.max(0, (g.pads_received ?? 0) - t.pads_issued);
        } else if (t.type === "savings_deposit") {
          patch.balance_ngn = (g.balance_ngn ?? 0) - (t.amount_ngn ?? 0);
        }
        if (Object.keys(patch).length) await supabase.from("vagin_students").update(patch).eq("id", g.id);
      }
    }
    fetchData();
  };

  // ── School CRUD ───────────────────────────────────────────────────────────
  const openAddSchool  = () => { setSchoolForm({ id: "", name: "", code: "", country: "Nigeria", city: "", state_region: "", contact_name: "" }); setModal("add-school"); };
  const openEditSchool = (s: SchoolRow) => { setSchoolForm({ id: s.id, name: s.name, code: s.code ?? "", country: s.country, city: s.city ?? "", state_region: s.state_region ?? "", contact_name: s.contact_name ?? "" }); setModal("edit-school"); };
  const saveSchool = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { name: schoolForm.name, code: (schoolForm.code || codeFromName(schoolForm.name)).toUpperCase(), country: schoolForm.country, city: schoolForm.city || null, state_region: schoolForm.state_region || null, contact_name: schoolForm.contact_name || null };
      const { error } = schoolForm.id
        ? await supabase.from("vagin_schools").update(payload).eq("id", schoolForm.id)
        : await supabase.from("vagin_schools").insert(payload);
      if (error) throw error;
      showToast(schoolForm.id ? "School updated" : "School added");
      closeModal(); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
  };

  // ── Student CRUD ──────────────────────────────────────────────────────────
  // Next per-school sequence — based on max existing trailing number (delete-safe), not count
  const nextSeqForSchool = (schoolId: string) => {
    let max = 0;
    (data?.students ?? []).filter(s => s.school_id === schoolId).forEach(s => {
      const m = s.student_id.match(/-(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1;
  };
  // SCHOOLCODE-INITIALS-SEQ
  const computeStudentId = (schoolId: string, name: string) => {
    const school = data?.schools.find(s => s.id === schoolId);
    const code = (school?.code || (school ? codeFromName(school.name) : "VAG")).toUpperCase();
    return buildStudentId(code, name, nextSeqForSchool(schoolId));
  };
  // Recompute the auto-ID when name/school change (unless the admin typed a custom one)
  const studentField = (patch: Partial<typeof studentForm>) => setStudentForm(p => {
    const next = { ...p, ...patch };
    if (!next.id && !next.idManual && ("name" in patch || "school_id" in patch)) {
      next.student_id = computeStudentId(next.school_id, next.name);
    }
    return next;
  });

  const openAddStudent  = () => {
    const sid = data?.schools[0]?.id ?? "";
    setStudentForm({ id: "", student_id: data ? computeStudentId(sid, "") : "VAG-XX-001", name: "", school_id: sid, class: "", balance_ngn: "0", free_pads_used: "0", paid_pads_used: "0", idManual: false });
    setModal("add-student");
  };
  const openEditStudent = (s: Student) => { setStudentForm({ id: s.id, student_id: s.student_id, name: s.name, school_id: s.school_id ?? "", class: s.class ?? "", balance_ngn: String(s.balance_ngn), free_pads_used: String(s.free_pads_used ?? 0), paid_pads_used: String(s.paid_pads_used ?? 0), idManual: true }); setModal("edit-student"); };
  const saveStudent = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const freePads = Math.min(parseInt(studentForm.free_pads_used) || 0, 1);
      const paidPads = Math.min(parseInt(studentForm.paid_pads_used) || 0, 2);
      const payload = { student_id: studentForm.student_id.toUpperCase(), name: studentForm.name, school_id: studentForm.school_id || null, class: studentForm.class || null, balance_ngn: parseFloat(studentForm.balance_ngn) || 0, free_pads_used: freePads, paid_pads_used: paidPads, pads_received: freePads + paidPads };
      const { error } = studentForm.id
        ? await supabase.from("vagin_students").update(payload).eq("id", studentForm.id)
        : await supabase.from("vagin_students").insert(payload);
      if (error) throw error;
      showToast(studentForm.id ? "Student updated" : "Student registered");
      closeModal(); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
  };

  // ── Matron CRUD ───────────────────────────────────────────────────────────
  const openAddMatron  = () => { setMatronForm({ id: "", name: "", phone: "", school_id: data?.schools[0]?.id ?? "", active: true }); setModal("add-matron"); };
  const openEditMatron = (m: Matron) => { setMatronForm({ id: m.id, name: m.name, phone: m.phone, school_id: m.school_id ?? "", active: m.active }); setModal("edit-matron"); };
  const saveMatron = async (e: React.FormEvent) => {
    e.preventDefault();
    const dialCode = data?.schools.find(s => s.id === matronForm.school_id)?.country
      ? data.countryConfigs.find(c => c.country === data.schools.find(s => s.id === matronForm.school_id)!.country)?.dial_code
      : undefined;
    const phoneResult = normalizePhone(matronForm.phone, dialCode ?? "234");
    if (!phoneResult.ok) { showToast(phoneResult.reason, "error"); return; }
    setSaving(true);
    try {
      const payload = { name: matronForm.name, phone: phoneResult.phone, school_id: matronForm.school_id || null, active: matronForm.active };

      // Save to vagin_matrons (dashboard table)
      const { error: error1, data: savedData } = matronForm.id
        ? await supabase.from("vagin_matrons").update(payload).eq("id", matronForm.id).select()
        : await supabase.from("vagin_matrons").insert(payload).select();

      if (error1) throw error1;

      // Also sync to teachers_matrons (bot lookup table)
      const matronId = matronForm.id || savedData?.[0]?.id;
      if (matronId) {
        const { error: error2 } = matronForm.id
          ? await supabase.from("teachers_matrons").update(payload).eq("id", matronId)
          : await supabase.from("teachers_matrons").insert({ id: matronId, ...payload });
        if (error2) console.warn("Warning: could not sync to teachers_matrons", error2);
      }

      showToast(matronForm.id ? "Matron updated" : "Matron added");
      closeModal(); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
  };

  // ── Bulk import (CSV) ─────────────────────────────────────────────────────
  const openBulkImport = () => { setImportRows([]); setImportParseErrors([]); setImportSummary(null); setModal("bulk-import"); };

  const downloadImportTemplate = () => {
    const example1 = ["LGS", "Lagos Girls School", "Nigeria", "Lagos", "Lagos State", "Mrs. Adeyemi", "Mrs Bamidele", "08038838094", "true", "", "Amara Okafor", "SS2", "0", "0", "0"];
    const example2 = ["BAM", "Blantyre Academy for Malawi Mission", "Malawi", "Blantyre", "Southern Region", "Mr. Banda", "Grace Phiri", "0991234567", "true", "", "Chikondi Banda", "Form 2", "0", "0", "0"];
    const csv = `${IMPORT_HEADERS.join(",")}\n${example1.join(",")}\n${example2.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vagin_bulk_import_template.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const grid = parseCSV(String(reader.result || ""));
      if (grid.length < 1) { setImportParseErrors(["File is empty."]); setImportRows([]); return; }
      const header = grid[0].map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const missing = IMPORT_REQUIRED_HEADERS.filter(h => !header.includes(h));
      if (missing.length) { setImportParseErrors([`Missing required column(s): ${missing.join(", ")}. Download the template to see the expected format.`]); setImportRows([]); return; }
      const rows: ImportRow[] = grid.slice(1).map(cells => {
        const obj = {} as ImportRow;
        IMPORT_HEADERS.forEach(h => { obj[h] = ""; });
        header.forEach((h, idx) => { if ((IMPORT_HEADERS as readonly string[]).includes(h)) obj[h as typeof IMPORT_HEADERS[number]] = (cells[idx] ?? "").trim(); });
        return obj;
      });
      setImportRows(rows);
      setImportParseErrors([]);
      setImportSummary(null);
    };
    reader.onerror = () => setImportParseErrors(["Could not read the file."]);
    reader.readAsText(file);
  };

  const runImport = async () => {
    setImporting(true);
    const errors: { row: number; message: string }[] = [];
    const schoolIdByCode = new Map<string, string>();
    const matronIdByPhone = new Map<string, string>();
    const nextSeq = new Map<string, number>(); // schoolId -> next auto student sequence
    const dialCodeByCountry = new Map((data?.countryConfigs ?? []).map(c => [c.country, c.dial_code]));
    let schoolsCount = 0, matronsCount = 0, studentsCount = 0;

    for (let i = 0; i < importRows.length; i++) {
      const r = importRows[i];
      const rowNum = i + 2; // header row + 1-indexing
      try {
        const code = r.school_code.trim().toUpperCase();
        if (!code || !r.school_name.trim()) throw new Error("Missing school_code or school_name");
        if (!r.matron_name.trim() || !r.matron_phone.trim()) throw new Error("Missing matron_name or matron_phone");

        let schoolId = schoolIdByCode.get(code);
        if (!schoolId) {
          const schoolPayload = {
            name: r.school_name.trim(), code,
            country: r.school_country.trim() || "Nigeria",
            city: r.school_city.trim() || null,
            state_region: r.school_state_region.trim() || null,
            contact_name: r.school_contact_name.trim() || null,
          };
          const { data: saved, error } = await supabase.from("vagin_schools").upsert(schoolPayload, { onConflict: "code" }).select("id").single();
          if (error) throw error;
          schoolId = saved.id;
          schoolIdByCode.set(code, schoolId);
          schoolsCount++;
        }

        const dialCode = dialCodeByCountry.get(r.school_country.trim() || "Nigeria") ?? "234";
        const phoneResult = normalizePhone(r.matron_phone, dialCode);
        if (!phoneResult.ok) throw new Error(`matron_phone: ${phoneResult.reason}`);
        const phone = phoneResult.phone;
        let matronId = matronIdByPhone.get(phone);
        if (!matronId) {
          const activeVal = r.matron_active.trim().toLowerCase();
          const matronPayload = {
            name: r.matron_name.trim(), phone, school_id: schoolId,
            active: activeVal === "" || activeVal === "true" || activeVal === "yes" || activeVal === "1",
          };
          const { data: saved, error } = await supabase.from("vagin_matrons").upsert(matronPayload, { onConflict: "phone" }).select("id").single();
          if (error) throw error;
          matronId = saved.id;
          // Sync to the bot's lookup table — onConflict on phone (its real unique
          // constraint), not id, so this never collides with a pre-existing row.
          const { error: syncErr } = await supabase.from("teachers_matrons").upsert({ id: matronId, ...matronPayload }, { onConflict: "phone" });
          if (syncErr) console.warn("teachers_matrons sync failed for", phone, syncErr);
          matronIdByPhone.set(phone, matronId);
          matronsCount++;
        }

        if (r.student_name.trim()) {
          let studentId = r.student_id.trim().toUpperCase();
          if (!studentId) {
            if (!nextSeq.has(schoolId)) nextSeq.set(schoolId, nextSeqForSchool(schoolId));
            const seq = nextSeq.get(schoolId)!;
            studentId = buildStudentId(code, r.student_name.trim(), seq);
            nextSeq.set(schoolId, seq + 1);
          }
          const freePads = Math.min(parseInt(r.student_free_pads_used) || 0, 1);
          const paidPads = Math.min(parseInt(r.student_paid_pads_used) || 0, 2);
          const studentPayload = {
            student_id: studentId, name: r.student_name.trim(), school_id: schoolId,
            class: r.student_class.trim() || null,
            balance_ngn: parseFloat(r.student_balance_ngn) || 0,
            free_pads_used: freePads, paid_pads_used: paidPads, pads_received: freePads + paidPads,
          };
          const { error } = await supabase.from("vagin_students").upsert(studentPayload, { onConflict: "student_id" });
          if (error) throw error;
          studentsCount++;
        }
      } catch (err) {
        errors.push({ row: rowNum, message: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    setImporting(false);
    setImportSummary({ schools: schoolsCount, matrons: matronsCount, students: studentsCount, errors });
    await fetchData();
  };

  // ── Distribution add ──────────────────────────────────────────────────────
  const openAddDist = () => { setDistForm({ school_id: data?.schools[0]?.id ?? "", distribution_date: today(), girls_count: "", pads_count: "", savings_collected_ngn: "0", distributed_by: "" }); setModal("add-distribution"); };
  const saveDist = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const { error } = await supabase.from("vagin_pad_distributions").insert({
        school_id: distForm.school_id, distribution_date: distForm.distribution_date,
        girls_count: parseInt(distForm.girls_count) || 0, pads_count: parseInt(distForm.pads_count) || 0,
        savings_collected_ngn: parseFloat(distForm.savings_collected_ngn) || 0,
        distributed_by: distForm.distributed_by || null,
      });
      if (error) throw error;
      showToast("Distribution logged"); closeModal(); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
  };

  // ── Session add ───────────────────────────────────────────────────────────
  const openAddSession = () => { setSessForm({ school_id: data?.schools[0]?.id ?? "", session_date: today(), topic: "puberty", girls_attended: "", facilitator: "", delivery_format: "in_school" }); setModal("add-session"); };
  const saveSession = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const { error } = await supabase.from("vagin_sessions").insert({
        school_id: sessForm.school_id, session_date: sessForm.session_date,
        topic: sessForm.topic, girls_attended: parseInt(sessForm.girls_attended) || 0,
        facilitator: sessForm.facilitator || null, delivery_format: sessForm.delivery_format,
      });
      if (error) throw error;
      showToast("Session logged"); closeModal(); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete = (table: string, id: string, label: string) => { setDeleteTarget({ table, id, label }); setModal("confirm-delete"); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const { error } = await supabase.from(deleteTarget.table as any).delete().eq("id", deleteTarget.id);
      if (error) throw error;

      // If deleting a matron, also delete from teachers_matrons
      if (deleteTarget.table === "vagin_matrons") {
        await supabase.from("teachers_matrons").delete().eq("id", deleteTarget.id);
      }

      showToast(`Deleted "${deleteTarget.label}"`);
      closeModal(); setDeleteTarget(null); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
  };

  // ── Auth states ───────────────────────────────────────────────────────────
  if (authed === null) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A" }}>
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "rgba(250,250,250,0.4)" }}>Checking session…</p>
    </div>
  );
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalPads     = data ? data.distributions.reduce((s, d) => s + d.pads_count, 0) : 0;
  const totalGirls    = data ? data.distributions.reduce((s, d) => s + d.girls_count, 0) : 0;
  const totalSessions = data?.sessions.length ?? 0;
  const totalSavings  = data ? data.savings.reduce((s, r) => s + Number(r.total_ngn), 0) : 0;

  const schoolName  = (id: string) => data?.schools.find(s => s.id === id)?.name ?? "—";
  const countryConfigFor = (country: string) => data?.countryConfigs.find(c => c.country === country);
  const dialCodeForSchool = (schoolId: string) => countryConfigFor(data?.schools.find(s => s.id === schoolId)?.country ?? "Nigeria")?.dial_code ?? "234";
  const studentName = (id: string | null) => id ? (data?.students.find(s => s.id === id)?.name ?? "—") : "—";
  const matronName  = (id: string | null) => id ? (data?.matrons.find(m => m.id === id)?.name ?? "—") : "—";

  const monthlyDist = data ? (() => {
    const byM: Record<string, number> = {};
    data.distributions.forEach(d => { const m = d.distribution_date.slice(0, 7); byM[m] = (byM[m] ?? 0) + d.girls_count; });
    return Object.entries(byM).sort().slice(-6).map(([m, v]) => ({ label: new Date(m + "-01").toLocaleDateString("en", { month: "short" }), value: v }));
  })() : [];

  const monthlySess = data ? (() => {
    const byM: Record<string, number> = {};
    data.sessions.forEach(s => { const m = s.session_date.slice(0, 7); byM[m] = (byM[m] ?? 0) + 1; });
    return Object.entries(byM).sort().slice(-6).map(([m, v]) => ({ label: new Date(m + "-01").toLocaleDateString("en", { month: "short" }), value: v }));
  })() : [];

  const schoolOptions = data?.schools.map(s => ({ value: s.id, label: s.name })) ?? [];

  const TABS = [
    { id: "overview"      as TabId, label: "Overview",      Icon: LayoutDashboard },
    { id: "schools"       as TabId, label: "Schools",       Icon: SchoolIcon },
    { id: "students"      as TabId, label: "Students",      Icon: GraduationCap },
    { id: "matrons"       as TabId, label: "Matrons",       Icon: Users },
    { id: "pad_kolo"      as TabId, label: "PAD KOLO",      Icon: Droplets },
    { id: "vaginart"      as TabId, label: "VaginART",      Icon: Palette },
    { id: "transactions"  as TabId, label: "Transactions",  Icon: ClipboardList },
    { id: "gallery"       as TabId, label: "Gallery CMS",   Icon: Images },
    { id: "vagin_images"  as TabId, label: "VAGIN Images",  Icon: Camera },
    { id: "viva_products" as TabId, label: "VIVA Products", Icon: ShoppingBag },
    { id: "bot"           as TabId, label: "Bot Activity",  Icon: Bot },
  ] as const;

  // This admin serves three distinct products under one roof (VAGIN's own
  // school/matron/pad operations, the Illustrations gallery CMS, and VIVA
  // product management) — grouped here so the sidebar makes that ownership
  // obvious instead of presenting 11 tabs as one undifferentiated list.
  const VAGIN_TAB_IDS: readonly TabId[] = ["overview", "schools", "students", "matrons", "pad_kolo", "vaginart", "transactions", "bot"];
  const ILLUSTRATIONS_TAB_IDS: readonly TabId[] = ["gallery", "vagin_images"];
  const VIVA_TAB_IDS: readonly TabId[] = ["viva_products"];
  const SECTIONS = [
    { label: "VAGIN",                    tabs: TABS.filter(t => (VAGIN_TAB_IDS as string[]).includes(t.id)) },
    { label: "Illustrations & Gallery",  tabs: TABS.filter(t => (ILLUSTRATIONS_TAB_IDS as string[]).includes(t.id)) },
    { label: "VIVA",                     tabs: TABS.filter(t => (VIVA_TAB_IDS as string[]).includes(t.id)) },
  ];

  const sidebarItemSx = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
    padding: "9px 12px", borderRadius: 8, marginBottom: 2,
    fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, fontWeight: 500,
    background: active ? `${PURPLE}22` : "transparent",
    border: active ? `1px solid ${PURPLE}55` : "1px solid transparent",
    color: active ? "#FAFAFA" : "rgba(250,250,250,0.5)",
    cursor: "pointer", transition: "all 0.15s",
  });
  const sectionLabelSx: React.CSSProperties = {
    fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, fontWeight: 600,
    color: "rgba(250,250,250,0.3)", letterSpacing: "0.2em", textTransform: "uppercase",
    margin: "0 0 8px", padding: "0 12px",
  };

  const infoBox = (msg: React.ReactNode, color = PL) => (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10, padding: "12px 16px", marginTop: 4 }}>
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color, margin: 0, lineHeight: 1.6 }}>{msg}</p>
    </div>
  );

  return (
    <div className="vagin-dash" style={{ minHeight: "100vh", background: "#080810" }}>
      {/* Dark-mode dropdown contrast: native option lists default to light bg + light text (invisible).
          color-scheme handles Chromium/Firefox; the explicit option rule covers the rest. */}
      <style>{`
        .vagin-dash select, .vagin-dash input, .vagin-dash textarea { color-scheme: dark; }
        .vagin-dash select option { background-color: #1A0B2E; color: #FAFAFA; }
        .vagin-dash select option:checked { background-color: #62017F; color: #FFFFFF; }
      `}</style>
      <NavBar />

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(160deg, #0D0020 0%, #080810 60%)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingTop: 80 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: PL, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 8px" }}>VAGIN Admin</p>
              <h1 className="font-display" style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: 1.1 }}>Impact Dashboard</h1>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.45)", margin: "6px 0 0" }}>Schools · Students · Matrons · Distributions · Sessions</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button onClick={fetchData} disabled={loadingData} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(250,250,250,0.7)", borderRadius: 999, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, cursor: "pointer" }}>
                <RefreshCw size={13} style={{ animation: loadingData ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </motion.button>
              <motion.button onClick={handleSignOut} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(237,21,93,0.1)", border: "1px solid rgba(237,21,93,0.25)", color: PINK, borderRadius: 999, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, cursor: "pointer" }}>
                <LogOut size={13} />Sign Out
              </motion.button>
            </div>
          </div>

          {/* Compact grouped tab row — visible below the lg breakpoint, where
              the sidebar (below) is hidden in favor of this scrollable strip. */}
          <div className="lg:hidden" style={{ display: "flex", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto", paddingBottom: 2 }}>
            {SECTIONS.map(section => (
              <div key={section.label} style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(250,250,250,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0 6px", whiteSpace: "nowrap" }}>{section.label}</span>
                {section.tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", borderBottom: activeTab === t.id ? `2px solid ${PURPLE}` : "2px solid transparent", color: activeTab === t.id ? "#FAFAFA" : "rgba(250,250,250,0.4)", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                    <t.Icon size={13} strokeWidth={1.75} />{t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar (lg+) + content ── */}
      <div className="flex flex-col lg:flex-row" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 64px", gap: 28, alignItems: "flex-start" }}>

        {/* Sidebar — grouped by product, hidden below lg in favor of the
            compact tab row in the header above. */}
        <nav className="hidden lg:block" style={{ width: 208, flexShrink: 0, position: "sticky", top: 96 }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 22 }}>
              <p style={sectionLabelSx}>{section.label}</p>
              {section.tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={sidebarItemSx(activeTab === t.id)}>
                  <t.Icon size={14} strokeWidth={1.75} />{t.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
        {dataError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "14px 18px", marginBottom: 24 }}>
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#EF4444" }}>{dataError}</span>
          </div>
        )}
        {loadingData && !data && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "rgba(250,250,250,0.35)" }}>Loading…</p>
          </div>
        )}

        {data && (
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={Users}         label="Girls Reached"    value={fmt(totalGirls)}    sub={`${data.schools.length} schools`}            color={PINK} />
                  <StatCard icon={Droplets}       label="Pads Distributed" value={fmt(totalPads)}     sub="all time"                                    color={PINK} />
                  <StatCard icon={BookOpen}       label="Sessions Run"     value={fmt(totalSessions)} sub="VaginART sessions"                           color={PL} />
                  <StatCard icon={GraduationCap} label="Students"         value={fmt(data.students.length)} sub={`${data.matrons.length} matrons`}     color={GOLD} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Card title="Girls reached per month (PAD KOLO)"><BarChart data={monthlyDist} color={PINK} /></Card>
                  <Card title="Sessions per month (VaginART)"><BarChart data={monthlySess} color={PL} /></Card>
                </div>
                <Card title="Schools summary">
                  <Table
                    headers={["School", "Country", "Students", "Distributions", "Girls Total", "Sessions"]}
                    rows={data.schools.map(s => {
                      const dists = data.distributions.filter(d => d.school_id === s.id);
                      const sess  = data.sessions.filter(r => r.school_id === s.id);
                      const studs = data.students.filter(st => st.school_id === s.id);
                      return [s.name, s.country, studs.length, dists.length, fmt(dists.reduce((a, d) => a + d.girls_count, 0)), sess.length];
                    })}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── SCHOOLS ── */}
            {activeTab === "schools" && (
              <motion.div key="schools" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Card title="School Registry" action={<div style={{ display: "flex", gap: 8 }}><AddBtn label="Import CSV" onClick={openBulkImport} color={GOLD} /><AddBtn label="Add School" onClick={openAddSchool} /></div>}>
                  <Table
                    headers={["Code", "Name", "Country", "City", "Contact", "Students", "Actions"]}
                    rows={data.schools.map(s => {
                      const studs = data.students.filter(st => st.school_id === s.id);
                      return [
                        <span key="c" style={{ fontFamily: "monospace", color: PL, fontWeight: 600, letterSpacing: "0.1em" }}>{s.code ?? "—"}</span>,
                        s.name, s.country, s.city ?? "—", s.contact_name ?? "—", studs.length,
                        <span key="a"><EditBtn onClick={() => openEditSchool(s)} /><DeleteBtn onClick={() => openDelete("vagin_schools", s.id, s.name)} /></span>
                      ];
                    })}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── STUDENTS ── */}
            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={GraduationCap} label="Total Students"   value={fmt(data.students.length)}                                                    color={PL} />
                  <StatCard icon={Coins}         label="Total KOLO Saved" value={fmtNGN(data.students.reduce((s, st) => s + Number(st.balance_ngn), 0))}        color={GOLD} />
                  <StatCard icon={Droplets}      label="Pads Received"    value={fmt(data.students.reduce((s, st) => s + st.pads_received, 0))}                  color={PINK} />
                </div>
                <Card title="Student Registry" action={<AddBtn label="Register Student" onClick={openAddStudent} />}>
                  <Table
                    headers={["ID", "Name", "School", "Class", "KOLO Balance", "Pads (cycle)", "Actions"]}
                    rows={data.students.map(s => {
                      const free = s.free_pads_used ?? 0, paid = s.paid_pads_used ?? 0;
                      const total = free + paid;
                      return [
                        <span key="id" style={{ fontFamily: "monospace", color: PL, fontSize: 12, fontWeight: 600 }}>{s.student_id}</span>,
                        s.name,
                        schoolName(s.school_id ?? ""),
                        s.class ?? "—",
                        fmtNGN(s.balance_ngn),
                        <span key="p" style={{ color: total >= 3 ? GOLD : "rgba(250,250,250,0.65)" }}>{total}/3 <span style={{ fontSize: 10, opacity: 0.6 }}>({free}f·{paid}p)</span></span>,
                        <span key="a"><EditBtn onClick={() => openEditStudent(s)} /><DeleteBtn onClick={() => openDelete("vagin_students", s.id, s.name)} /></span>
                      ];
                    })}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── MATRONS ── */}
            {activeTab === "matrons" && (
              <motion.div key="matrons" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Card title="Matron Registry" action={<AddBtn label="Add Matron" onClick={openAddMatron} />}>
                  <Table
                    headers={["Name", "WhatsApp Number", "School", "Status", "Actions"]}
                    rows={data.matrons.map(m => [
                      m.name,
                      <span key="p" style={{ fontFamily: "monospace", fontSize: 12 }}>{m.phone}</span>,
                      schoolName(m.school_id ?? ""),
                      <span key="s" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: m.active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", color: m.active ? "#22C55E" : "rgba(250,250,250,0.4)", border: `1px solid ${m.active ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}` }}>{m.active ? "Active" : "Inactive"}</span>,
                      <span key="a"><EditBtn onClick={() => openEditMatron(m)} /><DeleteBtn onClick={() => openDelete("vagin_matrons", m.id, m.name)} /></span>
                    ])}
                  />
                </Card>
                {infoBox(<><strong>Phase 2 ready:</strong> Each matron's WhatsApp number is how the bot identifies who is issuing pads. When a matron messages your VAGIN WhatsApp number, the bot checks their phone number against this table to verify they are authorised before processing any request.</>)}
              </motion.div>
            )}

            {/* ── PAD KOLO ── */}
            {activeTab === "pad_kolo" && (
              <motion.div key="pad_kolo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={Droplets} label="Total Pads"        value={fmt(totalPads)}       color={PINK} />
                  <StatCard icon={Users}    label="Girls Reached"     value={fmt(totalGirls)}      color={PINK} />
                  <StatCard icon={Coins}    label="Savings Collected" value={fmtNGN(totalSavings)} color={GOLD} />
                </div>
                <Card title="Distribution History" action={<AddBtn label="Log Distribution" onClick={openAddDist} color={PINK} />}>
                  <Table
                    headers={["Date", "School", "Girls", "Pads", "Savings (₦)", "By", ""]}
                    rows={data.distributions.map(d => [
                      fmtDate(d.distribution_date),
                      schoolName(d.school_id),
                      fmt(d.girls_count),
                      fmt(d.pads_count),
                      fmtNGN(d.savings_collected_ngn),
                      d.distributed_by ?? "—",
                      <DeleteBtn key="del" onClick={() => openDelete("vagin_pad_distributions", d.id, `Distribution ${fmtDate(d.distribution_date)}`)} />
                    ])}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── VAGINART ── */}
            {activeTab === "vaginart" && (
              <motion.div key="vaginart" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={Palette}    label="Total Sessions"    value={fmt(totalSessions)} color={PL} />
                  <StatCard icon={Users}      label="Girls in Sessions" value={fmt(data.sessions.reduce((s, r) => s + r.girls_attended, 0))} color={PL} />
                  <StatCard icon={TrendingUp} label="Topics Covered"    value="5" sub="puberty · hygiene · safety · mental health · SRHR" color={PURPLE} />
                </div>
                <Card title="Sessions by topic">
                  {(["puberty","hygiene","safety","mental_health","srhr_rights"] as const).map(topic => {
                    const count = data.sessions.filter(s => s.topic === topic).length;
                    const pct   = Math.round((count / Math.max(totalSessions, 1)) * 100);
                    return (
                      <div key={topic} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#FAFAFA", minWidth: 150 }}>{TOPIC_LABELS[topic]}</span>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} style={{ height: "100%", background: PL, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.4)", minWidth: 70, textAlign: "right" }}>{count} session{count !== 1 ? "s" : ""}</span>
                      </div>
                    );
                  })}
                </Card>
                <Card title="Session Log" action={<AddBtn label="Log Session" onClick={openAddSession} color={PL} />}>
                  <Table
                    headers={["Date", "School", "Topic", "Girls", "Format", "Facilitator", ""]}
                    rows={data.sessions.map(s => [
                      fmtDate(s.session_date),
                      schoolName(s.school_id),
                      TOPIC_LABELS[s.topic] ?? s.topic,
                      fmt(s.girls_attended),
                      FORMAT_LABELS[s.delivery_format] ?? s.delivery_format,
                      s.facilitator ?? "—",
                      <DeleteBtn key="del" onClick={() => openDelete("vagin_sessions", s.id, `Session ${fmtDate(s.session_date)}`)} />
                    ])}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── GALLERY CMS ── */}
            {activeTab === "gallery" && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: PL, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 4px" }}>Gallery CMS</p>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.45)", margin: 0 }}>Manage Illustrations artworks and chapter descriptions. Changes appear live on the public gallery page.</p>
                </div>
                <GalleryAdminTab />
              </motion.div>
            )}

            {/* ── VAGIN IMAGES ── */}
            {activeTab === "vagin_images" && (
              <motion.div key="vagin_images" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: PL, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 4px" }}>VAGIN Images</p>
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.45)", margin: 0 }}>Swap, upload, or remove the photos shown on the VAGIN page. Hero cluster, Malawi field work, session snapshots, and the Meet the Team row.</p>
                </div>
                <VAGINImagesAdminTab />
              </motion.div>
            )}

            {/* ── TRANSACTIONS ── */}
            {activeTab === "transactions" && (
              <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Card title="Transaction Audit Log">
                  {data.transactions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <ClipboardList size={32} color="rgba(250,250,250,0.15)" style={{ marginBottom: 12 }} />
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.35)", margin: "0 0 6px" }}>No transactions yet</p>
                      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.2)", margin: 0 }}>Transactions appear here once the WhatsApp bot is live.</p>
                    </div>
                  ) : (
                    <Table
                      headers={["Time", "Type", "Student", "Matron", "Pads", "Amount", "Source", "Status", ""]}
                      rows={data.transactions.map(t => {
                        const isBot = t.source === "whatsapp_bot" || t.source === "whatsapp";
                        return [
                        <span key="time" style={{ opacity: t.voided ? 0.4 : 1 }}>{fmtDate(t.created_at)}</span>,
                        <span key="type" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: t.type === "pad_issue" ? "rgba(237,21,93,0.15)" : "rgba(217,119,6,0.12)", color: t.type === "pad_issue" ? PINK : GOLD, border: `1px solid ${t.type === "pad_issue" ? "rgba(237,21,93,0.3)" : "rgba(217,119,6,0.3)"}`, textDecoration: t.voided ? "line-through" : "none", opacity: t.voided ? 0.5 : 1 }}>{t.type.replace(/_/g, " ")}</span>,
                        <span key="stu" style={{ opacity: t.voided ? 0.4 : 1 }}>{studentName(t.student_id)}</span>,
                        <span key="mat" style={{ opacity: t.voided ? 0.4 : 1 }}>{matronName(t.matron_id)}</span>,
                        <span key="pads" style={{ opacity: t.voided ? 0.4 : 1 }}>{t.pads_issued || "—"}</span>,
                        <span key="amt" style={{ opacity: t.voided ? 0.4 : 1 }}>{t.amount_ngn ? fmtNGN(t.amount_ngn) : "—"}</span>,
                        <span key="src" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: isBot ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: isBot ? "#22C55E" : "rgba(250,250,250,0.5)", border: `1px solid ${isBot ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)"}` }}>{t.source}</span>,
                        <span key="status">
                          {t.voided && <span title={t.voided_reason ?? undefined} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>voided</span>}
                          {!t.voided && t.flagged && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(217,119,6,0.14)", border: "1px solid rgba(217,119,6,0.4)", color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>flagged</span>}
                          {!t.voided && !t.flagged && <span style={{ color: "rgba(250,250,250,0.2)", fontSize: 11 }}>—</span>}
                        </span>,
                        <span key="act">
                          {!t.voided && (
                            <button onClick={() => voidTransaction(t)} title="Void this transaction (reverses balances, keeps the audit row)"
                              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#EF4444", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, fontWeight: 600 }}>
                              Void
                            </button>
                          )}
                        </span>,
                      ]; })}
                    />
                  )}
                </Card>
                {infoBox(<><strong>Phase 2 ready:</strong> Every pad issuance, savings deposit, and balance check from the WhatsApp bot will be automatically logged here with the student ID, matron name, and channel (whatsapp / manual). This is your full audit trail for donors and stakeholders.</>, "#22C55E")}
              </motion.div>
            )}

            {activeTab === "viva_products" && (
              <motion.div key="viva_products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Card title="VIVA Products Management">
                  <div style={{ textAlign: "center", padding: "48px 24px" }}>
                    <ShoppingBag size={40} color="rgba(250,250,250,0.2)" style={{ marginBottom: 16 }} />
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 16, color: "rgba(250,250,250,0.8)", margin: "0 0 12px", fontWeight: 500 }}>Manage VIVA Products</p>
                    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, color: "rgba(250,250,250,0.5)", margin: "0 0 24px", maxWidth: 500 }}>Create, edit, and manage your VIVA collection products. Add rich descriptions, pricing, images, and more.</p>
                    <a href="/admin/products" style={{ display: "inline-block", padding: "12px 24px", backgroundColor: PURPLE, color: "#FAFAFA", textDecoration: "none", borderRadius: 8, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, fontWeight: 600, transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#7F2BAA")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = PURPLE)}>
                      Open Products Dashboard
                    </a>
                  </div>
                </Card>
                {infoBox(<><strong>Product Management:</strong> Use the dedicated Products Dashboard to create and manage all VIVA garments and prints. Changes sync in real-time to the storefront.</>, "#D97706")}
              </motion.div>
            )}

            {activeTab === "bot" && (
              <motion.div key="bot" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <WhatsAppBotSimulatorTab />
              </motion.div>
            )}

          </AnimatePresence>
        )}
        </div>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>

        {/* School form */}
        {(modal === "add-school" || modal === "edit-school") && (
          <Modal key="school-modal" title={modal === "add-school" ? "Add School" : "Edit School"} onClose={closeModal}>
            <form onSubmit={saveSchool} style={{ display: "flex", flexDirection: "column" }}>
              <F label="School Name *"><input required style={inputSx} value={schoolForm.name} onChange={e => setSchoolForm(p => ({ ...p, name: e.target.value }))} /></F>
              <F label="School Code * (2-4 letters. Used in every student ID, must be unique)">
                <input required maxLength={4} style={{ ...inputSx, textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.15em", color: PL }}
                  value={schoolForm.code} onChange={e => setSchoolForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") }))} placeholder="e.g. LGS" />
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.3)", margin: "5px 0 0" }}>
                  Students here become e.g. <span style={{ color: PL, fontFamily: "monospace" }}>{(schoolForm.code || codeFromName(schoolForm.name || "School"))}-FA-001</span>. Leave blank to auto-derive from the name.
                </p>
              </F>
              <F label="Country *">
                <select required style={inputSx} value={schoolForm.country} onChange={e => setSchoolForm(p => ({ ...p, country: e.target.value }))}>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Kenya">Kenya</option>
                </select>
                {(() => { const cc = countryConfigFor(schoolForm.country); return cc && (
                  <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.3)", margin: "5px 0 0" }}>
                    Phone numbers here will be normalized to +{cc.dial_code}… and the WhatsApp bot will report amounts in {cc.currency_code} ({cc.currency_symbol}).
                  </p>
                ); })()}
              </F>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="City"><input style={inputSx} value={schoolForm.city} onChange={e => setSchoolForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Lagos" /></F>
                <F label="State / Region"><input style={inputSx} value={schoolForm.state_region} onChange={e => setSchoolForm(p => ({ ...p, state_region: e.target.value }))} placeholder="e.g. Lagos State" /></F>
              </div>
              <F label="Contact Name"><input style={inputSx} value={schoolForm.contact_name} onChange={e => setSchoolForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="e.g. Mrs. Adeyemi" /></F>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} />
              </div>
            </form>
          </Modal>
        )}

        {/* Student form */}
        {(modal === "add-student" || modal === "edit-student") && (
          <Modal key="student-modal" title={modal === "add-student" ? "Register Student" : "Edit Student"} onClose={closeModal}>
            <form onSubmit={saveStudent} style={{ display: "flex", flexDirection: "column" }}>
              <F label="School * (sets the ID prefix)">
                <select required style={inputSx} value={studentForm.school_id} onChange={e => studentField({ school_id: e.target.value })}>
                  <option value="">— Select school —</option>
                  {schoolOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </F>
              <F label="Full Name *"><input required style={inputSx} value={studentForm.name} onChange={e => studentField({ name: e.target.value })} placeholder="e.g. Faith Adeyemi" /></F>
              <F label="Student ID (auto-generated, globally unique)">
                <input required style={{ ...inputSx, fontFamily: "monospace", color: PL, letterSpacing: "0.1em", fontWeight: 600 }} value={studentForm.student_id}
                  onChange={e => setStudentForm(p => ({ ...p, student_id: e.target.value.toUpperCase(), idManual: true }))} placeholder="LGS-FA-001" />
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.3)", margin: "5px 0 0" }}>
                  Built from school code + initials + per-school number. Edit only if you must override.
                </p>
              </F>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Class / Year"><input style={inputSx} value={studentForm.class} onChange={e => setStudentForm(p => ({ ...p, class: e.target.value }))} placeholder="e.g. SS2" /></F>
                <F label="KOLO Balance (₦)"><input type="number" min="0" style={inputSx} value={studentForm.balance_ngn} onChange={e => setStudentForm(p => ({ ...p, balance_ngn: e.target.value }))} /></F>
              </div>
              <F label="Pads used this 3-month cycle (cap: 1 free + 2 paid)">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.35)" }}>Free pads (0–1)</span>
                    <input type="number" min="0" max="1" style={{ ...inputSx, marginTop: 4 }} value={studentForm.free_pads_used} onChange={e => setStudentForm(p => ({ ...p, free_pads_used: e.target.value }))} />
                  </div>
                  <div>
                    <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.35)" }}>Paid pads (0–2)</span>
                    <input type="number" min="0" max="2" style={{ ...inputSx, marginTop: 4 }} value={studentForm.paid_pads_used} onChange={e => setStudentForm(p => ({ ...p, paid_pads_used: e.target.value }))} />
                  </div>
                </div>
              </F>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} label={modal === "add-student" ? "Register" : "Save"} />
              </div>
            </form>
          </Modal>
        )}

        {/* Matron form */}
        {(modal === "add-matron" || modal === "edit-matron") && (
          <Modal key="matron-modal" title={modal === "add-matron" ? "Add Matron" : "Edit Matron"} onClose={closeModal}>
            <form onSubmit={saveMatron} style={{ display: "flex", flexDirection: "column" }}>
              <F label="Full Name *"><input required style={inputSx} value={matronForm.name} onChange={e => setMatronForm(p => ({ ...p, name: e.target.value }))} /></F>
              <F label="School">
                <select style={inputSx} value={matronForm.school_id} onChange={e => setMatronForm(p => ({ ...p, school_id: e.target.value }))}>
                  <option value="">— Select school —</option>
                  {schoolOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </F>
              <F label="WhatsApp Number * (with or without country code)">
                <input required style={inputSx} value={matronForm.phone} onChange={e => setMatronForm(p => ({ ...p, phone: e.target.value }))} placeholder={`0803... or +${dialCodeForSchool(matronForm.school_id)}803...`} />
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.3)", margin: "5px 0 0" }}>
                  Auto-normalized to +{dialCodeForSchool(matronForm.school_id)}… (the selected school's country code) on save — used to authenticate the matron in the WhatsApp bot.
                </p>
              </F>
              <F label="Status">
                <select style={inputSx} value={matronForm.active ? "true" : "false"} onChange={e => setMatronForm(p => ({ ...p, active: e.target.value === "true" }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </F>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} />
              </div>
            </form>
          </Modal>
        )}

        {/* Bulk import (CSV) */}
        {modal === "bulk-import" && (
          <Modal key="bulk-import-modal" title="Bulk Import — Schools, Matrons & Students" onClose={closeModal} width={640}>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.6)", lineHeight: 1.6, margin: "0 0 16px" }}>
              One row per student (or per matron, if a school has no students yet). Each row's school and matron are created or updated automatically — matrons are wired into the WhatsApp bot immediately, no extra step needed. Phone numbers are normalized and validated against the row's <code>school_country</code> (local "0..." or full "+country code" both work); rows with an unrecognized number are rejected individually rather than silently imported. Re-uploading later updates existing schools and adds new matrons/students without duplicating anything.
            </p>
            <button type="button" onClick={downloadImportTemplate} style={{ ...cancelBtnSx, marginBottom: 18 }}>Download CSV Template</button>

            {!importSummary && (
              <F label="CSV File">
                <input type="file" accept=".csv,text/csv" style={inputSx}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }} />
              </F>
            )}

            {importParseErrors.length > 0 && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                {importParseErrors.map((e, i) => <p key={i} style={{ margin: 0, fontSize: 12, color: "#EF4444" }}>{e}</p>)}
              </div>
            )}

            {importRows.length > 0 && !importSummary && (
              <>
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.75)", margin: "0 0 16px" }}>
                  <strong style={{ color: "#FAFAFA" }}>{importRows.length}</strong> row{importRows.length === 1 ? "" : "s"} detected —{" "}
                  <strong style={{ color: "#FAFAFA" }}>{new Set(importRows.map(r => r.school_code.trim().toUpperCase())).size}</strong> school(s),{" "}
                  <strong style={{ color: "#FAFAFA" }}>{new Set(importRows.map(r => r.matron_phone.trim())).size}</strong> matron(s),{" "}
                  <strong style={{ color: "#FAFAFA" }}>{importRows.filter(r => r.student_name.trim()).length}</strong> student(s).
                </p>
                <form onSubmit={e => { e.preventDefault(); runImport(); }} style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                  <SaveBtn loading={importing} label={importing ? "Importing…" : `Import ${importRows.length} Row${importRows.length === 1 ? "" : "s"}`} />
                </form>
              </>
            )}

            {importSummary && (
              <div>
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#22C55E", margin: "0 0 10px" }}>
                  ✓ {importSummary.schools} school(s), {importSummary.matrons} matron(s), {importSummary.students} student(s) imported.
                </p>
                {importSummary.errors.length > 0 && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", maxHeight: 180, overflowY: "auto" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#EF4444", fontWeight: 600 }}>{importSummary.errors.length} row(s) failed:</p>
                    {importSummary.errors.map((e, i) => <p key={i} style={{ margin: "2px 0", fontSize: 12, color: "#EF4444" }}>Row {e.row}: {e.message}</p>)}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <button type="button" onClick={closeModal} style={cancelBtnSx}>Close</button>
                </div>
              </div>
            )}
          </Modal>
        )}

        {/* Distribution form */}
        {modal === "add-distribution" && (
          <Modal key="dist-modal" title="Log PAD Distribution" onClose={closeModal}>
            <form onSubmit={saveDist} style={{ display: "flex", flexDirection: "column" }}>
              <F label="School *">
                <select required style={inputSx} value={distForm.school_id} onChange={e => setDistForm(p => ({ ...p, school_id: e.target.value }))}>
                  <option value="">— Select school —</option>
                  {schoolOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </F>
              <F label="Distribution Date *"><input required type="date" style={inputSx} value={distForm.distribution_date} onChange={e => setDistForm(p => ({ ...p, distribution_date: e.target.value }))} /></F>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Girls Count *"><input required type="number" min="1" style={inputSx} value={distForm.girls_count} onChange={e => setDistForm(p => ({ ...p, girls_count: e.target.value }))} /></F>
                <F label="Pads Count *"><input required type="number" min="1" style={inputSx} value={distForm.pads_count} onChange={e => setDistForm(p => ({ ...p, pads_count: e.target.value }))} /></F>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Savings Collected (₦)"><input type="number" min="0" style={inputSx} value={distForm.savings_collected_ngn} onChange={e => setDistForm(p => ({ ...p, savings_collected_ngn: e.target.value }))} /></F>
                <F label="Distributed By"><input style={inputSx} value={distForm.distributed_by} onChange={e => setDistForm(p => ({ ...p, distributed_by: e.target.value }))} placeholder="Staff name" /></F>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} label="Log Distribution" />
              </div>
            </form>
          </Modal>
        )}

        {/* Session form */}
        {modal === "add-session" && (
          <Modal key="sess-modal" title="Log VaginART Session" onClose={closeModal}>
            <form onSubmit={saveSession} style={{ display: "flex", flexDirection: "column" }}>
              <F label="School *">
                <select required style={inputSx} value={sessForm.school_id} onChange={e => setSessForm(p => ({ ...p, school_id: e.target.value }))}>
                  <option value="">— Select school —</option>
                  {schoolOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </F>
              <F label="Session Date *"><input required type="date" style={inputSx} value={sessForm.session_date} onChange={e => setSessForm(p => ({ ...p, session_date: e.target.value }))} /></F>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Topic *">
                  <select required style={inputSx} value={sessForm.topic} onChange={e => setSessForm(p => ({ ...p, topic: e.target.value }))}>
                    {Object.entries(TOPIC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </F>
                <F label="Delivery Format *">
                  <select required style={inputSx} value={sessForm.delivery_format} onChange={e => setSessForm(p => ({ ...p, delivery_format: e.target.value }))}>
                    {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </F>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <F label="Girls Attended *"><input required type="number" min="1" style={inputSx} value={sessForm.girls_attended} onChange={e => setSessForm(p => ({ ...p, girls_attended: e.target.value }))} /></F>
                <F label="Facilitator"><input style={inputSx} value={sessForm.facilitator} onChange={e => setSessForm(p => ({ ...p, facilitator: e.target.value }))} placeholder="Name" /></F>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={cancelBtnSx}>Cancel</button>
                <SaveBtn loading={saving} label="Log Session" />
              </div>
            </form>
          </Modal>
        )}

        {/* Confirm delete */}
        {modal === "confirm-delete" && deleteTarget && (
          <ConfirmModal key="confirm" label={deleteTarget.label} onConfirm={confirmDelete} onCancel={closeModal} saving={saving} />
        )}

      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default VAGINDashboard;
