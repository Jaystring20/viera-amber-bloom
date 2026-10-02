import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Shared by /vagin-dashboard and /admin/products. Admin = a Supabase login
// whose email is in va_admins, the same list the database's write rules use.

const PURPLE = "#62017F";
const PL     = "#C77DFF";

const inputSx: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "11px 14px", color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, outline: "none",
  colorScheme: "dark",
};

export const AdminLogin = ({ onLogin, badge = "VAGIN Admin", title = "Dashboard Login" }: { onLogin: () => void; badge?: string; title?: string }) => {
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
            <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: PL, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600 }}>{badge}</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(28px,5vw,38px)", fontWeight: 700, color: "#FAFAFA", margin: "0 0 8px", lineHeight: 1.1 }}>{title}</h1>
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
