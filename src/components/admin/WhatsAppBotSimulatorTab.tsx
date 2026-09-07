/**
 * WhatsApp Bot Simulator Tab
 * ═════════════════════════════════════════════════════════════════
 * Local testing harness for PAD KÓLÓ WhatsApp bot.
 * Uses SimulatorProvider to capture inbound/outbound without Meta setup.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  simulatorProvider,
  parseCommand,
  executeCommand,
  getHelpMessage,
  type SimulatedMessage,
} from "@/lib/whatsapp";
import {
  Send, RefreshCw, MessageSquare, Copy, Trash2, BookOpen, AlertCircle,
} from "lucide-react";

const PINK = "#ED155D";
const PURPLE = "#62017F";
const PL = "#C77DFF";
const GOLD = "#D97706";

const cardSx: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "20px 22px 18px",
};

const labelSx: React.CSSProperties = {
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: 11,
  color: "rgba(250,250,250,0.4)",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  margin: "0 0 14px",
};

const inputSx: React.CSSProperties = {
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#FAFAFA",
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: 13,
  outline: "none",
  colorScheme: "dark",
  width: "100%",
};

// ── Message interface ──────────────────────────────────────────────
interface ChatMessage {
  from: "matron" | "bot";
  text: string;
  timestamp: number;
}

// ── Main component ────────────────────────────────────────────────
const WhatsAppBotSimulatorTab = () => {
  const [matrons, setMatrons] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [customPhone, setCustomPhone] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [messageLog, setMessageLog] = useState<SimulatedMessage[]>([]);
  const [showHelp, setShowHelp] = useState(true);
  const [loadingMatrons, setLoadingMatrons] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load matrons from database
  const loadMatrons = useCallback(async () => {
    setLoadingMatrons(true);
    try {
      const { data } = await supabase
        .from("teachers_matrons")
        .select("id, name, phone")
        .eq("active", true)
        .order("name");
      if (data) {
        setMatrons(data);
        if (data.length > 0 && !selectedPhone) setSelectedPhone(data[0].phone);
      }
    } catch (err) {
      console.error("Error loading matrons:", err);
    } finally {
      setLoadingMatrons(false);
    }
  }, [selectedPhone]);

  // Load matrons on mount
  useEffect(() => {
    loadMatrons();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Update message log from simulator
  const updateMessageLog = useCallback(() => {
    setMessageLog([...simulatorProvider.getMessageLog()]);
  }, []);

  // Send message
  const handleSendMessage = async () => {
    const text = inputText.trim();
    const phone = customPhone.trim() || selectedPhone;

    if (!text || !phone || sending) return;

    setSending(true);
    setInputText("");
    setShowHelp(false);

    try {
      // Add matron message to chat
      setChatMessages((prev) => [...prev, { from: "matron", text, timestamp: Date.now() }]);

      // Inject into simulator
      simulatorProvider.simulateInbound(text, phone);
      updateMessageLog();

      // Parse and execute command
      const command = parseCommand(text);
      if (!command) {
        setChatMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `❌ Command not recognized.\n\nTry:\nCHECK ID [student_id]\nISSUE PAD [student_id] [FREE|PAID]\nDEPOSIT [amount]\nREPORT [DAILY|CYCLE]`,
            timestamp: Date.now(),
          },
        ]);
        setSending(false);
        return;
      }

      // Fetch matron's actual school_id from database
      const { data: matronData } = await supabase
        .from("teachers_matrons")
        .select("school_id")
        .eq("phone", phone)
        .single();

      const schoolId = matronData?.school_id || "default-test-school";

      // Execute command with matron's school
      const response = await executeCommand(command, phone, schoolId);

      // Add bot response
      setChatMessages((prev) => [
        ...prev,
        { from: "bot", text: response.message, timestamp: Date.now() },
      ]);

      // Log the outbound message
      simulatorProvider.sendText(phone, response.message);
      updateMessageLog();
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `⚠️ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // Clear chat
  const clearChat = () => {
    setChatMessages([]);
    simulatorProvider.clearLog();
    setMessageLog([]);
    setShowHelp(true);
  };

  // Get active phone
  const activePhone = customPhone.trim() || selectedPhone;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
        {/* Chat Interface */}
        <div style={cardSx}>
          <p style={labelSx}>
            <MessageSquare size={11} style={{ display: "inline", marginRight: 6 }} />
            WhatsApp Bot Simulator
          </p>

          {/* Matron Selection */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={labelSx}>Select matron or enter phone</label>
              <button
                onClick={() => loadMatrons()}
                disabled={loadingMatrons}
                style={{
                  background: "rgba(237, 21, 93, 0.2)",
                  border: "1px solid rgba(237, 21, 93, 0.5)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  color: PINK,
                  cursor: loadingMatrons ? "not-allowed" : "pointer",
                  opacity: loadingMatrons ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  transition: "all 0.2s ease",
                }}
                title="Refresh matrons list from database"
              >
                <RefreshCw size={11} style={{ transform: loadingMatrons ? "rotate(360deg)" : "rotate(0deg)", transition: "transform 0.3s linear" }} />
                Refresh
              </button>
            </div>
            <select
              style={inputSx}
              value={selectedPhone}
              onChange={(e) => setSelectedPhone(e.target.value)}
            >
              {matrons.map((m) => (
                <option key={m.id} value={m.phone}>
                  {m.name} · {m.phone}
                </option>
              ))}
              {matrons.length === 0 && <option value="">No matrons registered</option>}
            </select>
          </div>

          {/* Custom Phone Input */}
          <div style={{ marginBottom: 14 }}>
            <input
              type="tel"
              style={inputSx}
              placeholder="Or enter phone (e.g. +2347079505314)"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
            />
          </div>

          {/* Chat Display */}
          <div
            style={{
              height: 340,
              overflowY: "auto",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <AnimatePresence mode="wait">
              {showHelp && chatMessages.length === 0 && (
                <motion.div
                  key="help"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 12,
                    color: "rgba(250,250,250,0.3)",
                    textAlign: "center",
                    margin: "auto",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  {getHelpMessage()}
                </motion.div>
              )}
            </AnimatePresence>

            {chatMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: msg.from === "matron" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background:
                    msg.from === "matron" ? `${PURPLE}55` : "rgba(255,255,255,0.08)",
                  border: `1px solid ${msg.from === "matron" ? `${PURPLE}88` : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10,
                  padding: "9px 13px",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 13,
                  color: "#FAFAFA",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              style={{ ...inputSx, flex: 1 }}
              placeholder='Type command (e.g. "CHECK ID ABC-DF-001")'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sending || !activePhone}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={sending || !inputText.trim() || !activePhone}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: `linear-gradient(135deg, ${PURPLE} 0%, #8B00B0 100%)`,
                border: "none",
                borderRadius: 8,
                padding: "0 16px",
                cursor: sending || !inputText.trim() || !activePhone ? "not-allowed" : "pointer",
                color: "#FAFAFA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: sending || !inputText.trim() || !activePhone ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </motion.button>
          </div>

          {/* Active phone display */}
          <div
            style={{
              fontSize: 11,
              color: "rgba(250,250,250,0.35)",
              fontFamily: "DM Sans, system-ui, sans-serif",
            }}
          >
            {activePhone ? `Active phone: ${activePhone}` : "Select a matron or enter phone"}
          </div>
        </div>

        {/* Command Reference */}
        <div style={cardSx}>
          <p style={labelSx}>
            <BookOpen size={11} style={{ display: "inline", marginRight: 6 }} />
            Command Reference
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                cmd: "CHECK ID",
                example: "CHECK ID ABC-DF-001",
                desc: "Look up student balance & free pads remaining",
              },
              {
                cmd: "ISSUE PAD",
                example: "ISSUE PAD ABC-DF-001 FREE",
                desc: "Issue free or paid pad (PAID = ₦200)",
              },
              {
                cmd: "DEPOSIT",
                example: "DEPOSIT 5000",
                desc: "Record school deposit (adds to balance)",
              },
              {
                cmd: "REPORT",
                example: "REPORT DAILY",
                desc: "Get today's or cycle totals (DAILY|CYCLE)",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: PL,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {item.cmd}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "rgba(250,250,250,0.5)",
                    marginBottom: 4,
                  }}
                >
                  {item.example}
                </div>
                <div
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 11.5,
                    color: "rgba(250,250,250,0.6)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}

            <div
              style={{
                background: `${GOLD}10`,
                border: `1px solid ${GOLD}30`,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 11.5,
                  color: GOLD,
                  lineHeight: 1.5,
                }}
              >
                <strong>Testing note:</strong> Student lookups use school_id{" "}
                <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 4px" }}>
                  default-test-school
                </code>
                . Create test students in that school to verify commands.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Log */}
      <div style={cardSx}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={labelSx}>Simulator Message Log</p>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button
              onClick={() => setMessageLog([...simulatorProvider.getMessageLog()])}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
                padding: "6px 13px",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(250,250,250,0.55)",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} />
              Refresh
            </motion.button>
            <motion.button
              onClick={clearChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 999,
                padding: "6px 13px",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 12,
                color: "#EF4444",
                cursor: "pointer",
              }}
            >
              <Trash2 size={12} />
              Clear
            </motion.button>
          </div>
        </div>

        {messageLog.length === 0 ? (
          <p
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(250,250,250,0.35)",
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            Send a message above to populate the log.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {["Direction", "Phone", "Content", "Type", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        fontSize: 10,
                        color: "rgba(250,250,250,0.4)",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messageLog.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 3,
                          background:
                            log.direction === "inbound" ? `${PL}25` : `${PINK}25`,
                          color: log.direction === "inbound" ? PL : PINK,
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        {log.direction === "inbound" ? "↓" : "↑"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color: "rgba(250,250,250,0.6)",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                      }}
                    >
                      {log.phone}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color: "#FAFAFA",
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={typeof log.content === "string" ? log.content : JSON.stringify(log.content)}
                    >
                      {typeof log.content === "string"
                        ? log.content
                        : JSON.stringify(log.content).slice(0, 50)}
                    </td>
                    <td style={{ padding: "8px 10px", color: "rgba(250,250,250,0.5)" }}>
                      {log.type}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        color: log.status === "sent" ? "#22C55E" : "rgba(250,250,250,0.5)",
                      }}
                    >
                      {log.status}
                    </td>
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

export default WhatsAppBotSimulatorTab;
