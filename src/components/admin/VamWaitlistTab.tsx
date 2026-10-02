import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// VAM masterclass waitlist (table `vam_waitlist`). Fed by the /vam page and
// the home page's VAM chapter; readable only by admins (see migration 09).

type Entry = {
  id: string;
  name: string | null;
  email: string;
  source: "vam_page" | "home";
  created_at: string;
};

const GOLD = "#D97706";
const FONT = "DM Sans, system-ui, sans-serif";
const SOURCE_LABEL: Record<Entry["source"], string> = { vam_page: "VAM page", home: "Home page" };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

const VamWaitlistTab = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase
      .from("vam_waitlist")
      .select("id, name, email, source, created_at")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setEntries((data ?? []) as Entry[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const remove = async (entry: Entry) => {
    if (!confirm(`Remove ${entry.email} from the VAM waitlist?`)) return;
    const { error: err } = await supabase.from("vam_waitlist").delete().eq("id", entry.id);
    if (err) { alert("Could not remove: " + err.message); return; }
    setEntries(prev => prev.filter(e => e.id !== entry.id));
  };

  const downloadCsv = () => {
    const rows = [
      ["Name", "Email", "Signed up from", "Date"],
      ...entries.map(e => [e.name ?? "", e.email, SOURCE_LABEL[e.source], e.created_at.slice(0, 10)]),
    ];
    const blob = new Blob([rows.map(r => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vam-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
    fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#FAFAFA",
  };
  const th: React.CSSProperties = {
    textAlign: "left", padding: "10px 12px", fontFamily: FONT, fontSize: 11, fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(250,250,250,0.45)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };
  const td: React.CSSProperties = {
    padding: "10px 12px", fontFamily: FONT, fontSize: 13, color: "#FAFAFA",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <p style={{ fontFamily: FONT, fontSize: 14, color: "#FAFAFA", margin: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: GOLD, marginRight: 8 }}>{loading ? "…" : entries.length}</span>
          {entries.length === 1 ? "person" : "people"} on the waitlist
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={btn} onClick={() => void load()}><RefreshCw size={14} /> Refresh</button>
          <button type="button" style={{ ...btn, opacity: entries.length ? 1 : 0.5 }} onClick={downloadCsv} disabled={!entries.length}>
            <Download size={14} /> Download CSV
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" style={{ fontFamily: FONT, fontSize: 13, color: "#EF4444" }}>Could not load the waitlist: {error}</p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(250,250,250,0.5)" }}>
          No sign-ups yet. They appear here as soon as someone joins from the VAM page or the home page.
        </p>
      )}

      {entries.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Signed up from</th>
                <th style={th}>Date</th>
                <th style={th} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td style={td}>{e.name || <span style={{ color: "rgba(250,250,250,0.35)" }}>—</span>}</td>
                  <td style={td}><a href={`mailto:${e.email}`} style={{ color: GOLD }}>{e.email}</a></td>
                  <td style={td}>{SOURCE_LABEL[e.source]}</td>
                  <td style={td}>{fmtDate(e.created_at)}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button type="button" onClick={() => void remove(e)} aria-label={`Remove ${e.email}`}
                      style={{ background: "none", border: "none", color: "rgba(250,250,250,0.45)", cursor: "pointer", padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VamWaitlistTab;
