import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import {
  LayoutDashboard, Droplets, Palette, School as SchoolIcon, LogOut,
  TrendingUp, Users, BookOpen, Coins,
  AlertCircle, RefreshCw, Plus, Pencil, Trash2, X,
  GraduationCap, ClipboardList, CheckCircle2,
} from "lucide-react";

const PINK   = "#ED155D";
const PURPLE = "#62017F";
const GOLD   = "#D97706";
const PL     = "#C77DFF";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SchoolRow { id: string; name: string; code: string | null; country: string; state_region: string | null; contact_name: string | null; city: string | null; girls_reached: number }
interface Student   { id: string; student_id: string; name: string; school_id: string | null; class: string | null; balance_ngn: number; free_pads_used: number; paid_pads_used: number; pads_received: number; active: boolean; created_at: string }
interface Matron    { id: string; name: string; phone: string; school_id: string | null; active: boolean; created_at: string }
interface Distribution { id: string; school_id: string; distribution_date: string; girls_count: number; pads_count: number; savings_collected_ngn: number; distributed_by: string | null }
interface Session      { id: string; school_id: string; session_date: string; topic: string; girls_attended: number; facilitator: string | null; delivery_format: string }
interface Savings      { id: string; school_id: string; month: string; contributors: number; total_ngn: number }
interface TxRow        { id: string; student_id: string | null; matron_id: string | null; type: string; pads_issued: number; amount_ngn: number; source: string; notes: string | null; created_at: string }

interface DashData {
  schools: SchoolRow[]; students: Student[]; matrons: Matron[];
  distributions: Distribution[]; sessions: Session[];
  savings: Savings[]; transactions: TxRow[];
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

// ── Shared input styles ────────────────────────────────────────────────────────
const inputSx: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "11px 14px", color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, outline: "none",
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
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
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
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.45)", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>{label}</p>
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
            <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 10, color: "rgba(250,250,250,0.4)", letterSpacing: "0.18em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>{h}</th>
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
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", margin: 0 }}>{title}</p>
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
      if (!adminRow) { await supabase.auth.signOut(); throw new Error("Access denied — admins only."); }
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
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PL, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600 }}>VAGIN Admin</span>
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
  type TabId = "overview" | "schools" | "students" | "matrons" | "pad_kolo" | "vaginart" | "transactions";
  type ModalType = "add-school" | "edit-school" | "add-student" | "edit-student" | "add-matron" | "edit-matron" | "add-distribution" | "add-session" | "confirm-delete" | null;

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
      const [s, st, m, d, se, sa, tx] = await Promise.all([
        supabase.from("vagin_schools").select("*").order("name"),
        supabase.from("vagin_students").select("*").order("student_id"),
        supabase.from("vagin_matrons").select("*").order("name"),
        supabase.from("vagin_pad_distributions").select("*").order("distribution_date", { ascending: false }),
        supabase.from("vagin_sessions").select("*").order("session_date", { ascending: false }),
        supabase.from("vagin_savings").select("*").order("month"),
        supabase.from("vagin_transactions").select("*").order("created_at", { ascending: false }).limit(100),
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
      });
    } catch (err) { setDataError(err instanceof Error ? err.message : "Failed to load data"); }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const handleSignOut = async () => { await supabase.auth.signOut(); setAuthed(false); setData(null); };

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
    e.preventDefault(); setSaving(true);
    try {
      const payload = { name: matronForm.name, phone: matronForm.phone, school_id: matronForm.school_id || null, active: matronForm.active };
      const { error } = matronForm.id
        ? await supabase.from("vagin_matrons").update(payload).eq("id", matronForm.id)
        : await supabase.from("vagin_matrons").insert(payload);
      if (error) throw error;
      showToast(matronForm.id ? "Matron updated" : "Matron added");
      closeModal(); await fetchData();
    } catch (err) { showToast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSaving(false); }
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
  ] as const;

  const infoBox = (msg: React.ReactNode, color = PL) => (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10, padding: "12px 16px", marginTop: 4 }}>
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color, margin: 0, lineHeight: 1.6 }}>{msg}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080810" }}>
      <NavBar />

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(160deg, #0D0020 0%, #080810 60%)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingTop: 80 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PL, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 8px" }}>VAGIN Admin</p>
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

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", borderBottom: activeTab === t.id ? `2px solid ${PURPLE}` : "2px solid transparent", color: activeTab === t.id ? "#FAFAFA" : "rgba(250,250,250,0.4)", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                <t.Icon size={13} strokeWidth={1.75} />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>
        {dataError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
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
                <Card title="School Registry" action={<AddBtn label="Add School" onClick={openAddSchool} />}>
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
                      headers={["Time", "Type", "Student", "Matron", "Pads", "Amount", "Source"]}
                      rows={data.transactions.map(t => [
                        fmtDate(t.created_at),
                        <span key="type" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: t.type === "pad_issue" ? "rgba(237,21,93,0.15)" : "rgba(217,119,6,0.12)", color: t.type === "pad_issue" ? PINK : GOLD, border: `1px solid ${t.type === "pad_issue" ? "rgba(237,21,93,0.3)" : "rgba(217,119,6,0.3)"}` }}>{t.type.replace(/_/g, " ")}</span>,
                        studentName(t.student_id),
                        matronName(t.matron_id),
                        t.pads_issued || "—",
                        t.amount_ngn ? fmtNGN(t.amount_ngn) : "—",
                        <span key="src" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: t.source === "whatsapp" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: t.source === "whatsapp" ? "#22C55E" : "rgba(250,250,250,0.5)", border: `1px solid ${t.source === "whatsapp" ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)"}` }}>{t.source}</span>
                      ])}
                    />
                  )}
                </Card>
                {infoBox(<><strong>Phase 2 ready:</strong> Every pad issuance, savings deposit, and balance check from the WhatsApp bot will be automatically logged here with the student ID, matron name, and channel (whatsapp / manual). This is your full audit trail for donors and stakeholders.</>, "#22C55E")}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>

        {/* School form */}
        {(modal === "add-school" || modal === "edit-school") && (
          <Modal key="school-modal" title={modal === "add-school" ? "Add School" : "Edit School"} onClose={closeModal}>
            <form onSubmit={saveSchool} style={{ display: "flex", flexDirection: "column" }}>
              <F label="School Name *"><input required style={inputSx} value={schoolForm.name} onChange={e => setSchoolForm(p => ({ ...p, name: e.target.value }))} /></F>
              <F label="School Code * (2–4 letters — used in every student ID, must be unique)">
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
              <F label="Student ID (auto-generated — globally unique)">
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
              <F label="WhatsApp Number * (with country code)">
                <input required style={inputSx} value={matronForm.phone} onChange={e => setMatronForm(p => ({ ...p, phone: e.target.value }))} placeholder="+2348012345678" />
                <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.3)", margin: "5px 0 0" }}>Used to authenticate the matron in the WhatsApp bot.</p>
              </F>
              <F label="School">
                <select style={inputSx} value={matronForm.school_id} onChange={e => setMatronForm(p => ({ ...p, school_id: e.target.value }))}>
                  <option value="">— Select school —</option>
                  {schoolOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
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
