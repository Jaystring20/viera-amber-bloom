import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { processMessage } from "@/lib/botEngine";
import {
  Send, RefreshCw, Power, Flag, RotateCcw, MessageSquare,
  ArrowDownLeft, ArrowUpRight, Save, AlertCircle,
} from "lucide-react";

const PINK   = "#ED155D";
const PURPLE = "#62017F";
const PL     = "#C77DFF";
const GOLD   = "#D97706";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BotLog {
  id: string; direction: "in" | "out"; phone: string; matron_id: string | null;
  raw_text: string; parsed_intent: string | null; session_state: string | null;
  tx_id: string | null; error: string | null; created_at: string;
}
interface BotConfigRow {
  id: number; bot_enabled: boolean; pack_price_ngn: number; undo_window_min: number;
  outlier_min_ngn: number; outlier_max_ngn: number; admin_phone: string | null;
}
interface FlaggedTx {
  id: string; student_id: string | null; matron_id: string | null; type: string;
  pads_issued: number; amount_ngn: number; source: string; notes: string | null;
  voided: boolean; flagged: boolean; created_at: string;
}
interface MatronRow { id: string; name: string; phone: string; active: boolean }

const cardSx: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16, padding: "20px 22px 18px",
};
const labelSx: React.CSSProperties = {
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11,
  color: "rgba(250,250,250,0.4)", letterSpacing: "0.25em",
  textTransform: "uppercase", margin: "0 0 14px",
};
const inputSx: React.CSSProperties = {
  boxSizing: "border-box", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
  padding: "9px 12px", color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, outline: "none",
  colorScheme: "dark", width: "100%",
};

// ── Main ───────────────────────────────────────────────────────────────────────
const BotActivityTab = () => {
  const [logs,    setLogs]    = useState<BotLog[]>([]);
  const [config,  setConfig]  = useState<BotConfigRow | null>(null);
  const [flagged, setFlagged] = useState<FlaggedTx[]>([]);
  const [matrons, setMatrons] = useState<MatronRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [savingCfg, setSavingCfg] = useState(false);

  // Simulator state
  const [simPhone, setSimPhone] = useState("");
  const [simInput, setSimInput] = useState("");
  const [simChat,  setSimChat]  = useState<{ from: "matron" | "bot"; text: string }[]>([]);
  const [simBusy,  setSimBusy]  = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [l, c, f, m] = await Promise.all([
      supabase.from("vagin_bot_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("vagin_bot_config").select("*").eq("id", 1).maybeSingle(),
      supabase.from("vagin_transactions").select("*").eq("flagged", true).eq("voided", false).order("created_at", { ascending: false }).limit(20),
      supabase.from("vagin_matrons").select("id, name, phone, active").eq("active", true),
    ]);
    if (l.error) { setTableMissing(true); setLoading(false); return; }
    setTableMissing(false);
    setLogs(l.data ?? []);
    setConfig(c.data ?? null);
    setFlagged((f.data ?? []) as FlaggedTx[]);
    setMatrons(m.data ?? []);
    if (!simPhone && m.data?.length) setSimPhone(m.data[0].phone);
    setLoading(false);
  }, [simPhone]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simChat]);

  // ── Simulator send ───────────────────────────────────────────────────────────
  const simSend = async () => {
    const text = simInput.trim();
    if (!text || !simPhone || simBusy) return;
    setSimInput("");
    setSimChat(p => [...p, { from: "matron", text }]);
    setSimBusy(true);
    try {
      const result = await processMessage(supabase, simPhone, text);
      const replies = result.replies.length ? result.replies : ["(no reply — check kill switch / rate limit)"];
      setSimChat(p => [...p, ...replies.map(r => ({ from: "bot" as const, text: r }))]);
    } catch (err) {
      setSimChat(p => [...p, { from: "bot", text: `⚠ Engine error: ${err instanceof Error ? err.message : "unknown"}` }]);
    } finally {
      setSimBusy(false);
      load();
    }
  };

  // ── Config save ──────────────────────────────────────────────────────────────
  const saveConfig = async (patch: Partial<BotConfigRow>) => {
    if (!config) return;
    setSavingCfg(true);
    const next = { ...config, ...patch };
    setConfig(next);
    await supabase.from("vagin_bot_config").update(patch).eq("id", 1);
    setSavingCfg(false);
  };

  // ── Void a flagged tx ────────────────────────────────────────────────────────
  const voidTx = async (tx: FlaggedTx) => {
    await supabase.from("vagin_transactions").update({ voided: true, voided_reason: "Admin void from flagged review queue" }).eq("id", tx.id);
    if (tx.student_id && tx.type === "savings_deposit") {
      const { data: g } = await supabase.from("vagin_students").select("balance_ngn").eq("id", tx.student_id).maybeSingle();
      if (g) await supabase.from("vagin_students").update({ balance_ngn: (g.balance_ngn ?? 0) - tx.amount_ngn }).eq("id", tx.student_id);
    }
    load();
  };

  const approveTx = async (tx: FlaggedTx) => {
    await supabase.from("vagin_transactions").update({ flagged: false }).eq("id", tx.id);
    load();
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(250,250,250,0.3)", fontFamily: "DM Sans, system-ui, sans-serif" }}>Loading bot activity…</div>;
  }

  if (tableMissing) {
    return (
      <div style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.35)", borderRadius: 12, padding: "18px 20px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.75)", lineHeight: 1.7 }}>
        <strong style={{ color: GOLD }}>One-time setup needed:</strong> run <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>sql/padkolo_bot_setup.sql</code> in the
        Supabase SQL Editor (Database → SQL Editor), then refresh this tab.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* ── Row 1: Simulator + Settings ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>

        {/* Simulator */}
        <div style={cardSx}>
          <p style={labelSx}><MessageSquare size={11} style={{ display: "inline", marginRight: 6 }} />WhatsApp Simulator</p>
          <div style={{ marginBottom: 10 }}>
            <select style={inputSx} value={simPhone} onChange={e => { setSimPhone(e.target.value); setSimChat([]); }}>
              {matrons.length === 0 && <option value="">— no active matrons; add one in the Matrons tab —</option>}
              {matrons.map(m => <option key={m.id} value={m.phone}>{m.name} · {m.phone}</option>)}
              <option value="+2340000000000">Unknown number (test rejection)</option>
            </select>
          </div>
          <div style={{ height: 300, overflowY: "auto", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 12, marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {simChat.length === 0 && (
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.3)", textAlign: "center", margin: "auto" }}>
                Send "hi" to start · try ISSUE &lt;code&gt; 2 PAID · SAVE &lt;code&gt; 800 · BAL &lt;code&gt;
              </p>
            )}
            {simChat.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === "matron" ? "flex-end" : "flex-start", maxWidth: "85%", background: m.from === "matron" ? `${PURPLE}55` : "rgba(255,255,255,0.08)", border: `1px solid ${m.from === "matron" ? `${PURPLE}88` : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "8px 12px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "#FAFAFA", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputSx, flex: 1 }}
              value={simInput}
              placeholder='Type as the matron… e.g. "hi"'
              onChange={e => setSimInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") simSend(); }}
              disabled={simBusy}
            />
            <motion.button onClick={simSend} disabled={simBusy || !simInput.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #8B00B0 100%)`, border: "none", borderRadius: 8, padding: "0 16px", cursor: simBusy ? "wait" : "pointer", color: "#FAFAFA", display: "flex", alignItems: "center" }}>
              <Send size={15} />
            </motion.button>
          </div>
        </div>

        {/* Settings */}
        <div style={cardSx}>
          <p style={labelSx}>Bot Settings</p>
          {config && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => saveConfig({ bot_enabled: !config.bot_enabled })}
                disabled={savingCfg}
                style={{ display: "flex", alignItems: "center", gap: 10, background: config.bot_enabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.12)", border: `1px solid ${config.bot_enabled ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.45)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, fontWeight: 600, color: config.bot_enabled ? "#22C55E" : "#EF4444" }}>
                <Power size={15} />
                {config.bot_enabled ? "Bot is LIVE — click to disable (kill switch)" : "Bot is DISABLED — click to enable"}
              </button>

              {([
                ["pack_price_ngn",  "Pack price (₦)"],
                ["undo_window_min", "Undo window (minutes)"],
                ["outlier_min_ngn", "Flag deposits below (₦)"],
                ["outlier_max_ngn", "Flag deposits above (₦)"],
              ] as const).map(([key, label]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12.5, color: "rgba(250,250,250,0.65)" }}>{label}</span>
                  <input
                    type="number"
                    style={{ ...inputSx, width: 110, textAlign: "right" }}
                    value={config[key]}
                    onChange={e => setConfig({ ...config, [key]: parseInt(e.target.value) || 0 })}
                    onBlur={e => saveConfig({ [key]: parseInt(e.target.value) || 0 } as Partial<BotConfigRow>)}
                  />
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12.5, color: "rgba(250,250,250,0.65)" }}>Admin phone (stock alerts)</span>
                <input
                  style={{ ...inputSx, width: 170 }}
                  placeholder="+234…"
                  value={config.admin_phone ?? ""}
                  onChange={e => setConfig({ ...config, admin_phone: e.target.value })}
                  onBlur={e => saveConfig({ admin_phone: e.target.value || null })}
                />
              </div>
              <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 11, color: "rgba(250,250,250,0.3)", margin: 0 }}>
                Changes apply to the very next message the bot handles.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Flagged review queue ── */}
      {flagged.length > 0 && (
        <div style={{ ...cardSx, border: `1px solid ${GOLD}44` }}>
          <p style={{ ...labelSx, color: GOLD }}><Flag size={11} style={{ display: "inline", marginRight: 6 }} />Flagged for Review ({flagged.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {flagged.map(tx => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                <AlertCircle size={15} color={GOLD} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12.5, color: "rgba(250,250,250,0.8)", lineHeight: 1.5 }}>
                  <strong style={{ color: "#FAFAFA" }}>₦{Number(tx.amount_ngn).toLocaleString()}</strong> · {tx.type} · {new Date(tx.created_at).toLocaleString()}
                  <div style={{ fontSize: 11.5, color: "rgba(250,250,250,0.45)" }}>{tx.notes}</div>
                </div>
                <button onClick={() => approveTx(tx)} style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: "#22C55E", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 600 }}>Approve</button>
                <button onClick={() => voidTx(tx)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: "#EF4444", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><RotateCcw size={11} />Void</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 3: Message log ── */}
      <div style={cardSx}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={labelSx}>Message Log (last 50)</p>
          <motion.button onClick={load} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "6px 13px", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12, color: "rgba(250,250,250,0.55)", cursor: "pointer", marginBottom: 14 }}>
            <RefreshCw size={12} />Refresh
          </motion.button>
        </div>
        {logs.length === 0 ? (
          <p style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 13, color: "rgba(250,250,250,0.35)", textAlign: "center", padding: "24px 0" }}>
            No messages yet — try the Simulator above.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["", "Time", "Phone", "Message", "Intent", "State", "Error"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: "rgba(250,250,250,0.4)", letterSpacing: "0.18em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "7px 10px" }}>
                      {l.direction === "in"
                        ? <ArrowDownLeft size={13} color={PL} />
                        : <ArrowUpRight size={13} color={PINK} />}
                    </td>
                    <td style={{ padding: "7px 10px", color: "rgba(250,250,250,0.5)", whiteSpace: "nowrap" }}>{new Date(l.created_at).toLocaleTimeString()}</td>
                    <td style={{ padding: "7px 10px", color: "rgba(250,250,250,0.6)", whiteSpace: "nowrap" }}>{l.phone}</td>
                    <td style={{ padding: "7px 10px", color: "#FAFAFA", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.raw_text}</td>
                    <td style={{ padding: "7px 10px" }}>
                      {l.parsed_intent && (
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: l.parsed_intent === "REJECTED" ? "rgba(239,68,68,0.15)" : `${PURPLE}25`, border: `1px solid ${l.parsed_intent === "REJECTED" ? "rgba(239,68,68,0.4)" : `${PURPLE}50`}`, color: l.parsed_intent === "REJECTED" ? "#EF4444" : PL, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {l.parsed_intent}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "7px 10px", color: "rgba(250,250,250,0.45)", fontSize: 11.5 }}>{l.session_state ?? "—"}</td>
                    <td style={{ padding: "7px 10px", color: "#EF4444", fontSize: 11.5 }}>{l.error ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotActivityTab;
