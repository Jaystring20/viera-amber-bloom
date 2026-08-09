import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { whatsappLink } from "@/config/contact";

const ALABASTER = "#FAF9F6";
const BURGUNDY  = "#6E0025";
const GOLD      = "#D4AF37";
const DARK_TEXT = "#221A1A";
const CORMORANT = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const SANS      = "DM Sans, system-ui, sans-serif";
const BURG_ALPHA = "rgba(110,0,37,0.14)";

// Local time, not UTC — a bare "2026-09-13" string parses as UTC midnight in
// JS (a well-known footgun) and would show the wrong countdown for anyone
// west of London. The numeric constructor is always local time, unambiguous.
const LAUNCH_DATE = new Date(2026, 8, 13, 0, 0, 0); // month is 0-indexed: 8 = September

// Shown once per browser session, not on every visit to /viva — reappears
// after the tab/browser is closed and reopened. A "coming soon" promo that
// re-interrupts every single page load reads as spam, not launch energy.
const SESSION_KEY = "viva.launchModal.shownThisSession";

// Persists across sessions (unlike SESSION_KEY above) — once someone has
// actually joined, the auto-popup should never interrupt them with the same
// ask again, on this or any future visit.
const JOINED_KEY = "viva.launchModal.joinedPhone";

// A dedicated subject on the shared contact_submissions table, not a
// separate column — this is how the duplicate check below finds prior
// launch-list rows without touching order/enquiry rows that share the table.
const LAUNCH_SUBJECT = "VIVA Launch Signup — Batya";

// Strips everything but digits and a leading "+" — the shape stored and
// matched against for the duplicate check, so "0814 342 5141" and
// "+234 814 342 5141" typed on two different visits are recognised as the
// same number rather than becoming two rows.
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

// Deliberately loose — not validating a specific country's format, since
// VIVA ships internationally and a strict pattern would reject real numbers
// from anyone outside Nigeria. This exists to catch "hi", "123", or a
// stray keystroke, not to police formatting: 7-15 digits covers the real
// E.164 range without rejecting valid numbers written with or without a
// country code.
function isPlausiblePhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, remaining);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    reached: clamped <= 0,
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  border: `1px solid ${BURG_ALPHA}`,
  borderRadius: 2,
  padding: "13px 14px",
  color: DARK_TEXT,
  fontFamily: SANS,
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
};

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div style={{ textAlign: "center", minWidth: 52 }}>
    <div
      style={{
        fontFamily: CORMORANT,
        fontSize: "clamp(24px, 4vw, 32px)",
        fontWeight: 700,
        color: BURGUNDY,
        lineHeight: 1,
        // Tabular-ish via fixed width prevents the layout twitching as
        // digits change width (11 -> 9 -> 08 etc.) every second.
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {String(value).padStart(2, "0")}
    </div>
    <div
      style={{
        fontFamily: SANS,
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(34,26,26,0.5)",
        marginTop: 4,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  </div>
);

export default function VivaLaunchModal() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const countdown = useCountdown(LAUNCH_DATE);

  // Someone who has already joined never sees the ask again — not this
  // session, not next month. Checked once, synchronously, before the first
  // paint would otherwise decide whether to schedule the auto-popup at all.
  const [alreadyJoined] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem(JOINED_KEY);
    } catch {
      return false;
    }
  });

  // Defensive: there's currently no OTHER way to open this modal besides
  // the auto-popup, which already skips itself for a joined visitor — but
  // if that ever changes, this stops a returning member from landing on a
  // blank form as if they'd never signed up.
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    alreadyJoined ? "done" : "idle",
  );

  useEffect(() => {
    if (typeof window === "undefined" || alreadyJoined) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // Storage blocked (private mode) — fall through and show anyway
      // rather than silently never showing the promo at all.
    }
    const t = setTimeout(() => {
      setOpen(true);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* non-fatal */ }
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const close = () => setOpen(false);

  const preOrderMessage =
    "Hi VIVA! I'd like to pre-order from the Batya collection ahead of launch and lock in the 20% pre-order discount.";

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Catches "hi", "123", a stray keystroke — the class of submission that
    // used to insert successfully and show "you're on the list" for a
    // number nobody could ever actually reach.
    if (!isPlausiblePhone(phone)) {
      setValidationError("That doesn't look like a complete phone number — please check it.");
      return;
    }

    const normalized = normalizePhone(phone);
    setStatus("sending");

    try {
      // Look for this exact number already on the launch list before
      // writing a new row. Scoped to LAUNCH_SUBJECT specifically so this
      // never matches an unrelated order or enquiry that happens to share
      // the same free-text message field.
      const { data: existing, error: lookupError } = await supabase
        .from("contact_submissions")
        .select("id")
        .eq("subject", LAUNCH_SUBJECT)
        .eq("message", normalized)
        .limit(1);

      // A failed lookup should not block a genuine new signup — fall
      // through to inserting rather than stranding the user on an error
      // for a read that was only ever a nice-to-have.
      if (!lookupError && existing && existing.length > 0) {
        try { localStorage.setItem(JOINED_KEY, normalized); } catch { /* non-fatal */ }
        setStatus("done");
        return;
      }

      const { error } = await supabase.from("contact_submissions").insert({
        name: "VIVA Launch List",
        // Every other caller of this table always has a real email; this
        // is the first phone-only submission. Using a placeholder rather
        // than "" in case the column has an email-format check this
        // session has no way to inspect (no live DB access available).
        email: "no-email@viva-launch-list.local",
        subject: LAUNCH_SUBJECT,
        message: normalized,
      });
      if (error) throw error;

      // Best effort, and explicitly not trusted: notify-admin is not
      // present anywhere in this repo, so whether it is actually deployed
      // on Supabase cannot be confirmed from here. If it exists this
      // reaches the same inbox the enquiry form already notifies; if it
      // doesn't, this fails exactly as harmlessly as that form's call
      // already does, and the signup itself has still succeeded either way.
      supabase.functions.invoke("notify-admin", {
        body: { type: "viva_launch_signup", data: { phone: normalized } },
      }).catch(() => {});

      try { localStorage.setItem(JOINED_KEY, normalized); } catch { /* non-fatal */ }
      setStatus("done");
    } catch (err) {
      console.error("Launch list signup failed:", err);
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="viva-launch-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
          onClick={close}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(20,0,7,0.6)",
            backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1200, padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viva-launch-heading"
            className="flex flex-col md:flex-row"
            style={{
              background: ALABASTER,
              // Flat corners, matching the rest of the page's client-directed
              // treatment — nothing on VIVA rounds aggressively anymore.
              borderRadius: 2,
              overflow: "hidden",
              maxWidth: 780,
              width: "100%",
              maxHeight: "92vh",
              boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            }}
          >
            {/* Image — one catalogue look, cropped to a portrait column on
                desktop and a shorter wide band on mobile. Combines the two
                reference layouts: single-column-simple on small screens,
                image-beside-form on larger ones. */}
            <div
              className="w-full md:w-[42%]"
              style={{
                position: "relative",
                minHeight: 180,
                aspectRatio: "4/3",
                flexShrink: 0,
              }}
            >
              <img
                src="/viva/look-3.webp"
                alt="Batya collection preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(110,0,37,0.35) 0%, rgba(110,0,37,0) 40%)",
                }}
              />
            </div>

            {/* Content */}
            <div
              className="flex-1"
              style={{
                padding: "clamp(24px, 4vw, 40px)",
                overflowY: "auto",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                style={{
                  position: "absolute", top: 14, right: 14,
                  background: "none", border: "none", cursor: "pointer",
                  padding: 8, minWidth: 44, minHeight: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={18} color={BURGUNDY} />
              </button>

              <p
                style={{
                  fontFamily: SANS, fontSize: 11, letterSpacing: "0.3em",
                  textTransform: "uppercase", color: GOLD, fontWeight: 600,
                  margin: "0 0 8px 0",
                }}
              >
                The Maiden Collection
              </p>

              <h2
                id="viva-launch-heading"
                style={{
                  fontFamily: CORMORANT, fontSize: "clamp(28px, 3.4vw, 38px)",
                  fontWeight: 700, color: BURGUNDY, margin: "0 0 20px 0", lineHeight: 1.1,
                }}
              >
                Batya is coming!
              </h2>

              {countdown.reached ? (
                <p style={{ fontFamily: CORMORANT, fontSize: 20, fontStyle: "italic", color: BURGUNDY, margin: "0 0 20px 0" }}>
                  She's here.
                </p>
              ) : (
                <div style={{ display: "flex", gap: "clamp(10px, 2vw, 18px)", marginBottom: 22 }}>
                  <CountdownUnit value={countdown.days} label="Days" />
                  <CountdownUnit value={countdown.hours} label="Hrs" />
                  <CountdownUnit value={countdown.minutes} label="Min" />
                  <CountdownUnit value={countdown.seconds} label="Sec" />
                </div>
              )}

              <p style={{ fontFamily: SANS, fontSize: 14, color: DARK_TEXT, margin: "0 0 14px 0", lineHeight: 1.6 }}>
                Pre-order to enjoy <strong style={{ color: BURGUNDY }}>20% off</strong>.
              </p>

              <a
                href={whatsappLink(preOrderMessage)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", background: GOLD, color: "#1A1A1A",
                  fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", textDecoration: "none",
                  padding: "14px 20px", borderRadius: 2, minHeight: 48,
                  boxShadow: "0 10px 26px rgba(212,175,55,0.3)",
                }}
              >
                <MessageCircle size={15} />
                Pre-order Now
              </a>

              <div style={{ height: 1, background: BURG_ALPHA, margin: "24px 0" }} />

              <p style={{ fontFamily: SANS, fontSize: 13, color: DARK_TEXT, margin: "0 0 12px 0", lineHeight: 1.6 }}>
                Join our VIVA community to stay connected and updated.
              </p>

              {/* aria-live so a screen reader hears the outcome — the visual
                  swap between form and confirmation previously had no
                  announcement at all. */}
              <div aria-live="polite">
                <AnimatePresence mode="wait">
                  {status === "done" ? (
                    <motion.div
                      key="signup-done"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      <p style={{ fontFamily: SANS, fontSize: 13, color: BURGUNDY, fontWeight: 600, margin: 0 }}>
                        You're on the list — see you at launch.
                      </p>
                      {/* Points back at the pre-order CTA above rather than
                          leaving someone who just signalled real interest
                          with nothing further to do but close the window. */}
                      <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(34,26,26,0.65)", margin: "8px 0 0 0", lineHeight: 1.6 }}>
                        Want to lock in your size before launch? Pre-order above to enjoy 20% off now.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="signup-form"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onSubmit={handleJoin}
                    >
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        aria-invalid={validationError ? true : undefined}
                        style={{
                          ...inputStyle,
                          // Driven entirely by state now, not by onFocus/
                          // onBlur mutating the DOM directly. That imperative
                          // version raced with this declarative style: a
                          // blur handler bound during a stale render could
                          // fire after setValidationError and stomp the red
                          // border back to default, which is exactly what
                          // happened testing this live — the error text and
                          // aria-invalid were correct, the visual cue wasn't.
                          borderColor: validationError ? "#B00020" : phoneFocused ? GOLD : BURG_ALPHA,
                        }}
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={() => setPhoneFocused(false)}
                      />
                      {validationError && (
                        <p role="alert" style={{ fontFamily: SANS, fontSize: 11, color: "#B00020", margin: "6px 0 0 0" }}>
                          {validationError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={status === "sending" || !phone.trim()}
                        style={{
                          width: "100%", marginTop: 10, minHeight: 46,
                          background: !phone.trim() || status === "sending" ? "rgba(110,0,37,0.35)" : BURGUNDY,
                          color: ALABASTER, border: "none", borderRadius: 2,
                          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          cursor: !phone.trim() ? "not-allowed" : "pointer",
                        }}
                      >
                        {status === "sending" ? "Joining…" : "Join"}
                      </button>
                      {status === "error" && (
                        <p role="alert" style={{ fontFamily: SANS, fontSize: 11, color: "#B00020", margin: "8px 0 0 0" }}>
                          Something went wrong — please try again.
                        </p>
                      )}
                      <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(34,26,26,0.5)", margin: "10px 0 0 0", lineHeight: 1.5 }}>
                        By signing up, I agree to receive email marketing. (No spam.)
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
