import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import {
  LayoutDashboard, Droplets, Palette, School, LogOut,
  TrendingUp, Users, BookOpen, Coins, ChevronRight,
  AlertCircle, RefreshCw,
} from "lucide-react";

// ── Brand colours ──────────────────────────────────────────────────────────────
const PINK   = "#ED155D";
const PURPLE = "#62017F";
const GOLD   = "#D97706";
const PL     = "#C77DFF";

// ── Types ──────────────────────────────────────────────────────────────────────
interface School { id: string; name: string; country: string; state_region: string | null }
interface Distribution { id: string; school_id: string; distribution_date: string; girls_count: number; pads_count: number; savings_collected_ngn: number; distributed_by: string | null }
interface Session { id: string; school_id: string; session_date: string; topic: string; girls_attended: number; facilitator: string | null; delivery_format: string }
interface Savings { school_id: string; month: string; contributors: number; total_ngn: number }

interface DashData {
  schools: School[];
  distributions: Distribution[];
  sessions: Session[];
  savings: Savings[];
}

// ── Topic label map ────────────────────────────────────────────────────────────
const TOPIC_LABELS: Record<string, string> = {
  puberty: "Puberty Basics",
  hygiene: "Hygiene & Wellness",
  safety: "Physical Safety",
  mental_health: "Mental Health",
  srhr_rights: "SRHR Rights",
};

const FORMAT_LABELS: Record<string, string> = {
  in_school: "In-School",
  community_circle: "Community Circle",
  toolkit: "Toolkit",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-NG");
const fmtNGN = (n: number) => `₦${fmt(Math.round(n))}`;

// ── Mini bar chart (SVG, no lib) ───────────────────────────────────────────────
const BarChart = ({ data, color }: { data: { label: string; value: number }[]; color: string }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              width: "100%",
              height: Math.max((d.value / max) * 64, 4),
              background: color,
              borderRadius: "4px 4px 0 0",
              transformOrigin: "bottom",
              opacity: 0.85,
            }}
          />
          <span style={{ fontSize: 9, color: "rgba(250,250,250,0.4)", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: string; sub?: string; color: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: "22px 24px",
      backdropFilter: "blur(8px)",
    }}
  >
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
const Table = ({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => (
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

// ── Section wrapper ────────────────────────────────────────────────────────────
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px 20px", marginBottom: 20 }}>
    <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 18px" }}>{title}</p>
    {children}
  </div>
);

// ── Admin Login ────────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, padding: "13px 16px", color: "#FAFAFA",
    fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, outline: "none",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      if (!data.user) throw new Error("Login failed");

      // Verify admin
      const { data: adminRow } = await supabase.from("va_admins").select("email").eq("email", data.user.email).maybeSingle();
      if (!adminRow) {
        await supabase.auth.signOut();
        throw new Error("Access denied — this dashboard is for VAGIN admins only.");
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
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
          <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "11px 14px" }}>
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

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const VAGINDashboard = () => {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [activeTab, setActiveTab] = useState<"overview" | "pad_kolo" | "vaginart" | "schools">("overview");
  const [data, setData] = useState<DashData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── Auth check on mount ──
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthed(false); return; }
      const { data: adminRow } = await supabase.from("va_admins").select("email").eq("email", session.user.email).maybeSingle();
      setAuthed(!!adminRow);
    });
  }, []);

  // ── Fetch all data ──
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const [schoolsRes, distRes, sessRes, savRes] = await Promise.all([
        supabase.from("vagin_schools").select("*").order("name"),
        supabase.from("vagin_pad_distributions").select("*").order("distribution_date", { ascending: false }),
        supabase.from("vagin_sessions").select("*").order("session_date", { ascending: false }),
        supabase.from("vagin_savings").select("*").order("month"),
      ]);
      if (schoolsRes.error) throw schoolsRes.error;
      setData({
        schools: schoolsRes.data as School[],
        distributions: distRes.data as Distribution[],
        sessions: sessRes.data as Session[],
        savings: savRes.data as Savings[],
      });
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    setData(null);
  };

  // ── Loading check ──
  if (authed === null) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A" }}>
      <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "rgba(250,250,250,0.4)" }}>Checking session…</p>
    </div>;
  }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  // ── Derived stats ──
  const totalGirls    = data ? [...new Set(data.distributions.map(d => `${d.school_id}-${d.distribution_date.slice(0,7)}`))]
                               .reduce((sum, _, i) => sum + (data.distributions[i]?.girls_count ?? 0), 0) : 0;
  const totalGirlsRaw = data ? data.distributions.reduce((s, d) => s + d.girls_count, 0) : 0;
  const totalPads     = data ? data.distributions.reduce((s, d) => s + d.pads_count, 0) : 0;
  const totalSessions = data?.sessions.length ?? 0;
  const totalSavings  = data ? data.savings.reduce((s, r) => s + Number(r.total_ngn), 0) : 0;
  const totalSavingsContribs = data ? [...new Set(data.savings.map(s => s.month))].length > 0
    ? data.savings.reduce((s, r) => s + r.contributors, 0) / Math.max(1, [...new Set(data.savings.map(s => s.month))].length) : 0 : 0;

  // Monthly distributions chart (last 6 months)
  const monthlyDist = data ? (() => {
    const byMonth: Record<string, number> = {};
    data.distributions.forEach(d => {
      const m = d.distribution_date.slice(0, 7);
      byMonth[m] = (byMonth[m] ?? 0) + d.girls_count;
    });
    return Object.entries(byMonth).sort().slice(-6).map(([m, v]) => ({
      label: new Date(m + "-01").toLocaleDateString("en", { month: "short" }),
      value: v,
    }));
  })() : [];

  // Monthly sessions chart
  const monthlySess = data ? (() => {
    const byMonth: Record<string, number> = {};
    data.sessions.forEach(s => {
      const m = s.session_date.slice(0, 7);
      byMonth[m] = (byMonth[m] ?? 0) + 1;
    });
    return Object.entries(byMonth).sort().slice(-6).map(([m, v]) => ({
      label: new Date(m + "-01").toLocaleDateString("en", { month: "short" }),
      value: v,
    }));
  })() : [];

  // School name lookup
  const schoolName = (id: string) => data?.schools.find(s => s.id === id)?.name ?? id.slice(0, 8);

  const TABS = [
    { id: "overview",  label: "Overview",   Icon: LayoutDashboard },
    { id: "pad_kolo",  label: "PAD KOLO",   Icon: Droplets },
    { id: "vaginart",  label: "VaginART",   Icon: Palette },
    { id: "schools",   label: "Schools",    Icon: School },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#080810" }}>
      <NavBar />

      {/* ── Page Header ── */}
      <div style={{ background: "linear-gradient(160deg, #0D0020 0%, #080810 60%)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: PL, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 8px" }}>VAGIN Admin</p>
              <h1 className="font-display" style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#FAFAFA", margin: 0, lineHeight: 1.1 }}>Impact Dashboard</h1>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.45)", margin: "6px 0 0" }}>Live data — PAD KOLO distributions &amp; VaginART sessions</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button onClick={fetchData} disabled={loadingData} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(250,250,250,0.7)", borderRadius: 999, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, cursor: "pointer" }}>
                <RefreshCw size={13} style={{ animation: loadingData ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </motion.button>
              <motion.button onClick={handleSignOut} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(237,21,93,0.1)", border: "1px solid rgba(237,21,93,0.25)", color: PINK, borderRadius: 999, padding: "9px 18px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, cursor: "pointer" }}>
                <LogOut size={13} />
                Sign Out
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
                  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, fontWeight: 500,
                  background: "none", border: "none", cursor: "pointer", borderBottom: activeTab === t.id ? `2px solid ${PURPLE}` : "2px solid transparent",
                  color: activeTab === t.id ? "#FAFAFA" : "rgba(250,250,250,0.45)", transition: "all 0.2s",
                }}>
                <t.Icon size={14} strokeWidth={1.75} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>

        {dataError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#EF4444" }}>{dataError}</span>
          </div>
        )}

        {loadingData && !data && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", color: "rgba(250,250,250,0.35)" }}>Loading data…</p>
          </div>
        )}

        {data && (
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={Users}     label="Girls Reached"      value={fmt(totalGirlsRaw)}   sub={`across ${data.schools.length} schools`} color={PINK} />
                  <StatCard icon={Droplets}  label="Pads Distributed"   value={fmt(totalPads)}        sub="all time"                                  color={PINK} />
                  <StatCard icon={BookOpen}  label="Sessions Run"       value={fmt(totalSessions)}    sub="VaginART sessions"                         color={PURPLE} />
                  <StatCard icon={Coins}     label="Savings Pool"       value={fmtNGN(totalSavings)}  sub="Nigeria schools"                           color={GOLD} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Card title="Girls reached per month (PAD KOLO)">
                    <BarChart data={monthlyDist} color={PINK} />
                  </Card>
                  <Card title="Sessions per month (VaginART)">
                    <BarChart data={monthlySess} color={PL} />
                  </Card>
                </div>

                <Card title="Schools at a glance">
                  <Table
                    headers={["School", "Country", "Distributions", "Girls (total)", "Sessions"]}
                    rows={data.schools.map(s => {
                      const dists = data.distributions.filter(d => d.school_id === s.id);
                      const sess  = data.sessions.filter(r => r.school_id === s.id);
                      return [s.name, s.country, dists.length, fmt(dists.reduce((a, d) => a + d.girls_count, 0)), sess.length];
                    })}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── PAD KOLO ── */}
            {activeTab === "pad_kolo" && (
              <motion.div key="pad_kolo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={Droplets}  label="Total Pads"         value={fmt(totalPads)}       color={PINK} />
                  <StatCard icon={Users}     label="Girls Reached"      value={fmt(totalGirlsRaw)}   color={PINK} />
                  <StatCard icon={Coins}     label="Savings Collected"  value={fmtNGN(totalSavings)} color={GOLD} />
                </div>

                <Card title="Monthly pad distribution (girls)">
                  <BarChart data={monthlyDist} color={PINK} />
                </Card>

                <Card title="All distributions">
                  <Table
                    headers={["Date", "School", "Girls", "Pads", "Savings (₦)", "By"]}
                    rows={data.distributions.slice(0, 30).map(d => [
                      new Date(d.distribution_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                      schoolName(d.school_id),
                      fmt(d.girls_count),
                      fmt(d.pads_count),
                      fmtNGN(d.savings_collected_ngn),
                      d.distributed_by ?? "—",
                    ])}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── VAGINART ── */}
            {activeTab === "vaginart" && (
              <motion.div key="vaginart" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
                  <StatCard icon={Palette}    label="Total Sessions"    value={fmt(totalSessions)}   color={PL} />
                  <StatCard icon={Users}      label="Girls in Sessions" value={fmt(data.sessions.reduce((s, r) => s + r.girls_attended, 0))} color={PL} />
                  <StatCard icon={TrendingUp} label="Topics Covered"    value={"5"}                  sub="puberty · hygiene · safety · mental health · SRHR" color={PURPLE} />
                </div>

                {/* Topic breakdown */}
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
                        <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.4)", minWidth: 60, textAlign: "right" }}>{count} sessions</span>
                      </div>
                    );
                  })}
                </Card>

                <Card title="Recent sessions">
                  <Table
                    headers={["Date", "School", "Topic", "Girls", "Format", "Facilitator"]}
                    rows={data.sessions.slice(0, 25).map(s => [
                      new Date(s.session_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                      schoolName(s.school_id),
                      TOPIC_LABELS[s.topic] ?? s.topic,
                      fmt(s.girls_attended),
                      FORMAT_LABELS[s.delivery_format] ?? s.delivery_format,
                      s.facilitator ?? "—",
                    ])}
                  />
                </Card>
              </motion.div>
            )}

            {/* ── SCHOOLS ── */}
            {activeTab === "schools" && (
              <motion.div key="schools" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.schools.map(s => {
                    const dists   = data.distributions.filter(d => d.school_id === s.id);
                    const sessions = data.sessions.filter(r => r.school_id === s.id);
                    const pads    = dists.reduce((a, d) => a + d.pads_count, 0);
                    const girls   = dists.reduce((a, d) => a + d.girls_count, 0);
                    const isNG    = s.country === "Nigeria";
                    const accent  = isNG ? PINK : PL;
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}28`, borderRadius: 16, padding: "22px 22px 20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                          <div>
                            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: "#FAFAFA", margin: 0, lineHeight: 1.3 }}>{s.name}</p>
                            <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", margin: "4px 0 0", fontWeight: 600 }}>{s.country}{s.state_region ? ` · ${s.state_region}` : ""}</p>
                          </div>
                          <ChevronRight size={16} color="rgba(250,250,250,0.2)" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            { label: "Distributions", value: dists.length },
                            { label: "Girls reached", value: fmt(girls) },
                            { label: "Pads sent", value: fmt(pads) },
                            { label: "Sessions", value: sessions.length },
                          ].map(stat => (
                            <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                              <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: accent, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 10, color: "rgba(250,250,250,0.38)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "4px 0 0" }}>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default VAGINDashboard;
