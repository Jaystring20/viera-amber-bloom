/* ═══════════════════════════════════════════════════════════════════════════════
   PAD KOLO WhatsApp Bot Engine
   Spec: https://github.com/Jaystring20/viera-amber-bloom/issues/1

   Runtime-agnostic: the Supabase client is dependency-injected, so this exact
   file runs in the browser (dashboard Simulator, admin-authed client + RLS) and
   in the Deno Edge Function (service-role client). No runtime-specific imports.

   Message economy: max 2 bot replies per completed operation; BAL costs 1.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ── Minimal client shape (satisfied by @supabase/supabase-js v2) ────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
export type DBClient = {
  from: (table: string) => any;
};

export interface BotConfig {
  bot_enabled: boolean;
  pack_price_ngn: number;
  undo_window_min: number;
  outlier_min_ngn: number;
  outlier_max_ngn: number;
  admin_phone: string | null;
}

export interface BotResult {
  replies: string[];              // messages to send back (0-2)
  intent: string;                 // parsed intent for logging
  txId?: string;                  // transaction created (if any)
  stockRequest?: { qty: number; reason: string; schoolName: string; matronName: string };
  error?: string;
}

type SessionCtx = {
  pending?: {
    kind: "ISSUE" | "SAVE" | "STOCK";
    studentId?: string;           // uuid
    studentCode?: string;
    studentName?: string;
    qty?: number;
    padType?: "free" | "paid";
    amount?: number;
    reason?: string;
  };
  lastTxId?: string;
  lastTxAt?: string;
};

const MENU = [
  "1 Issue pads  2 Record savings  3 Check balance",
  "4 Request stock  5 Undo last  0 Help",
  "Commands: ISSUE <code> <qty> FREE|PAID · SAVE <code> <amt> · BAL <code> · STOCK <qty> [reason] · UNDO",
].join("\n");

const naira = (n: number) => `₦${Number(n).toLocaleString("en-NG")}`;

// ── Command parser ───────────────────────────────────────────────────────────────
export type Parsed =
  | { intent: "ISSUE"; code: string; qty: number; padType: "free" | "paid" }
  | { intent: "SAVE"; code: string; amount: number }
  | { intent: "BAL"; code: string }
  | { intent: "STOCK"; qty: number; reason: string }
  | { intent: "UNDO" }
  | { intent: "HELP" }
  | { intent: "YES" }
  | { intent: "NO" }
  | { intent: "MENU_PICK"; n: number }
  | { intent: "CODE_ONLY"; code: string }
  | { intent: "UNKNOWN"; raw: string };

export function parseMessage(text: string): Parsed {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return { intent: "UNKNOWN", raw: text };
  const upper = t.toUpperCase();

  if (/^(YES|Y|CONFIRM)$/.test(upper)) return { intent: "YES" };
  if (/^(NO|N|CANCEL|STOP)$/.test(upper)) return { intent: "NO" };
  if (/^(HELP|HI|HELLO|MENU|START|0)$/.test(upper)) return { intent: "HELP" };
  if (/^UNDO$/.test(upper) || upper === "5") return { intent: "UNDO" };

  const issue = upper.match(/^ISSUE ([A-Z0-9]{4,12}) (\d{1,2}) (FREE|PAID)$/);
  if (issue) {
    const qty = parseInt(issue[2], 10);
    if (qty < 1 || qty > 20) return { intent: "UNKNOWN", raw: text };
    return { intent: "ISSUE", code: issue[1], qty, padType: issue[3].toLowerCase() as "free" | "paid" };
  }

  const save = upper.match(/^SAVE ([A-Z0-9]{4,12}) (\d{1,7})$/);
  if (save) return { intent: "SAVE", code: save[1], amount: parseInt(save[2], 10) };

  const bal = upper.match(/^BAL(?:ANCE)? ([A-Z0-9]{4,12})$/);
  if (bal) return { intent: "BAL", code: bal[1] };

  const stock = upper.match(/^STOCK (\d{1,5})(?: (.+))?$/);
  if (stock) {
    // Preserve the matron's original casing for the free-text reason
    const reasonOriginal = stock[2] ? t.slice(t.length - stock[2].length).trim() : "";
    return { intent: "STOCK", qty: parseInt(stock[1], 10), reason: reasonOriginal };
  }

  if (/^[1-4]$/.test(upper)) return { intent: "MENU_PICK", n: parseInt(upper, 10) };

  // Bare girl code — starts a guided flow
  if (/^[A-Z0-9]{4,12}$/.test(upper) && /[A-Z]/.test(upper)) return { intent: "CODE_ONLY", code: upper };

  return { intent: "UNKNOWN", raw: text };
}

// ── Engine ───────────────────────────────────────────────────────────────────────
export async function processMessage(db: DBClient, phone: string, text: string): Promise<BotResult> {
  const log = async (direction: "in" | "out", raw: string, extra: Record<string, unknown> = {}) => {
    try {
      await db.from("vagin_bot_logs").insert({ direction, phone, raw_text: raw, ...extra });
    } catch { /* logging must never break the flow */ }
  };

  // 0. Config / kill switch
  const { data: cfg } = await db.from("vagin_bot_config").select("*").eq("id", 1).maybeSingle();
  const config: BotConfig = cfg ?? {
    bot_enabled: true, pack_price_ngn: 700, undo_window_min: 15,
    outlier_min_ngn: 50, outlier_max_ngn: 5000, admin_phone: null,
  };
  if (!config.bot_enabled) {
    await log("in", text, { parsed_intent: "REJECTED", error: "bot disabled" });
    return { replies: [], intent: "REJECTED", error: "bot disabled" };
  }

  // 1. Matron verification by phone
  const { data: matron } = await db
    .from("vagin_matrons")
    .select("id, name, phone, school_id, active")
    .eq("phone", phone)
    .eq("active", true)
    .maybeSingle();

  if (!matron) {
    await log("in", text, { parsed_intent: "REJECTED", error: "unknown phone" });
    const reply = "This number is not registered as a VAGIN matron. Please contact the VAGIN team.";
    await log("out", reply, { parsed_intent: "REJECTED" });
    return { replies: [reply], intent: "REJECTED", error: "unknown phone" };
  }

  // 2. Session load / create, expiry, rate limit
  const now = new Date();
  let { data: session } = await db.from("vagin_bot_sessions").select("*").eq("phone", phone).maybeSingle();

  if (session?.blocked_until && new Date(session.blocked_until) > now) {
    await log("in", text, { matron_id: matron.id, parsed_intent: "REJECTED", error: "rate limited" });
    return { replies: [], intent: "REJECTED", error: "rate limited" };
  }

  const windowExpired = !session || new Date(session.window_start).getTime() < now.getTime() - 60_000;
  const count = windowExpired ? 1 : (session.message_count_1m ?? 0) + 1;
  const sessionExpired = !session || new Date(session.expires_at) < now;
  const ctx: SessionCtx = sessionExpired ? {} : ((session?.context as SessionCtx) ?? {});
  const state: string = sessionExpired ? "MENU" : (session?.state ?? "MENU");

  const sessionPatch: Record<string, unknown> = {
    phone,
    matron_id: matron.id,
    message_count_1m: count,
    window_start: windowExpired ? now.toISOString() : session?.window_start,
    expires_at: new Date(now.getTime() + 30 * 60_000).toISOString(),
    updated_at: now.toISOString(),
  };

  if (count > 30) {
    sessionPatch.blocked_until = new Date(now.getTime() + 10 * 60_000).toISOString();
    await db.from("vagin_bot_sessions").upsert({ ...sessionPatch, state: "IDLE", context: {} }, { onConflict: "phone" });
    await log("in", text, { matron_id: matron.id, parsed_intent: "REJECTED", error: "rate limit breached" });
    const reply = "Too many messages. Please wait 10 minutes and try again.";
    await log("out", reply, { matron_id: matron.id });
    return { replies: [reply], intent: "REJECTED", error: "rate limited" };
  }

  const parsed = parseMessage(text);
  await log("in", text, { matron_id: matron.id, parsed_intent: parsed.intent, session_state: state });

  const saveSession = async (newState: string, newCtx: SessionCtx) => {
    await db.from("vagin_bot_sessions").upsert(
      { ...sessionPatch, state: newState, context: newCtx },
      { onConflict: "phone" },
    );
  };

  const reply = async (msgs: string[], intent: string, txId?: string, extra?: Partial<BotResult>): Promise<BotResult> => {
    for (const m of msgs) await log("out", m, { matron_id: matron.id, parsed_intent: intent, tx_id: txId ?? null });
    return { replies: msgs, intent, txId, ...extra };
  };

  // ── Helpers ────────────────────────────────────────────────────────────────────
  const findGirl = async (code: string) => {
    const { data } = await db
      .from("vagin_students")
      .select("id, student_id, name, class, school_id, balance_ngn, free_pads_used, paid_pads_used, pads_received, active")
      .eq("student_id", code)
      .eq("school_id", matron.school_id)   // hard school scoping
      .eq("active", true)
      .maybeSingle();
    return data ?? null;
  };

  const schoolName = async () => {
    const { data } = await db.from("vagin_schools").select("name").eq("id", matron.school_id).maybeSingle();
    return data?.name ?? "your school";
  };

  const greeting = async () =>
    `Welcome ${matron.name} (${await schoolName()}) 👋\n${MENU}`;

  // ── Confirmation handling (YES/NO while an op is pending) ──────────────────────
  if (parsed.intent === "YES" && ctx.pending) {
    const p = ctx.pending;

    if (p.kind === "ISSUE" && p.studentId && p.qty && p.padType) {
      const girl = await db.from("vagin_students").select("*").eq("id", p.studentId).maybeSingle();
      const g = girl.data;
      if (!g) { await saveSession("MENU", {}); return reply(["Girl not found anymore. Start again."], "ISSUE"); }

      const cost = p.padType === "paid" ? p.qty * config.pack_price_ngn : 0;
      if (p.padType === "paid" && (g.balance_ngn ?? 0) < cost) {
        await saveSession("MENU", {});
        return reply(
          [`Insufficient balance: ${naira(g.balance_ngn ?? 0)} available, ${naira(cost)} needed (${naira(config.pack_price_ngn)}/pack × ${p.qty}). Nothing recorded.`],
          "ISSUE",
        );
      }

      const { data: tx, error: txErr } = await db.from("vagin_transactions").insert({
        student_id: g.id,
        matron_id: matron.id,
        type: p.padType === "paid" ? "paid_pads" : "free_pads",
        pads_issued: p.qty,
        amount_ngn: cost,
        source: "whatsapp_bot",
        notes: `Bot issue by ${matron.name}: ${p.qty} ${p.padType} pack(s) to ${g.student_id}`,
      }).select("id").single();
      if (txErr) return reply(["Something went wrong recording that. Nothing was saved — try again."], "ISSUE", undefined, { error: txErr.message });

      const patch: Record<string, unknown> = {
        pads_received: (g.pads_received ?? 0) + p.qty,
      };
      if (p.padType === "paid") {
        patch.paid_pads_used = (g.paid_pads_used ?? 0) + p.qty;
        patch.balance_ngn = (g.balance_ngn ?? 0) - cost;
      } else {
        patch.free_pads_used = (g.free_pads_used ?? 0) + p.qty;
      }
      await db.from("vagin_students").update(patch).eq("id", g.id);

      await saveSession("MENU", { lastTxId: tx.id, lastTxAt: now.toISOString() });
      const newBal = p.padType === "paid" ? (g.balance_ngn ?? 0) - cost : (g.balance_ngn ?? 0);
      return reply(
        [`✅ Done. ${g.name}: ${p.qty} ${p.padType} pack(s) issued${p.padType === "paid" ? `, new balance ${naira(newBal)}` : ""}.`],
        "ISSUE", tx.id,
      );
    }

    if (p.kind === "SAVE" && p.studentId && p.amount) {
      const girl = await db.from("vagin_students").select("*").eq("id", p.studentId).maybeSingle();
      const g = girl.data;
      if (!g) { await saveSession("MENU", {}); return reply(["Girl not found anymore. Start again."], "SAVE"); }

      const flagged = p.amount < config.outlier_min_ngn || p.amount > config.outlier_max_ngn;
      const { data: tx, error: txErr } = await db.from("vagin_transactions").insert({
        student_id: g.id,
        matron_id: matron.id,
        type: "savings_deposit",
        pads_issued: 0,
        amount_ngn: p.amount,
        source: "whatsapp_bot",
        flagged,
        notes: `Bot savings by ${matron.name}: ${naira(p.amount)} for ${g.student_id}${flagged ? " [FLAGGED: outlier amount]" : ""}`,
      }).select("id").single();
      if (txErr) return reply(["Something went wrong recording that. Nothing was saved — try again."], "SAVE", undefined, { error: txErr.message });

      await db.from("vagin_students").update({ balance_ngn: (g.balance_ngn ?? 0) + p.amount }).eq("id", g.id);
      await saveSession("MENU", { lastTxId: tx.id, lastTxAt: now.toISOString() });
      return reply(
        [`✅ Saved. ${g.name}: +${naira(p.amount)}, new balance ${naira((g.balance_ngn ?? 0) + p.amount)}.${flagged ? " (Flagged for admin review — unusual amount.)" : ""}`],
        "SAVE", tx.id,
      );
    }

    if (p.kind === "STOCK" && p.qty) {
      const sName = await schoolName();
      const { data: tx } = await db.from("vagin_transactions").insert({
        student_id: null,
        matron_id: matron.id,
        type: "stock_request",
        pads_issued: p.qty,
        amount_ngn: 0,
        source: "whatsapp_bot",
        notes: `Stock request by ${matron.name} (${sName}): ${p.qty} pack(s)${p.reason ? ` — ${p.reason}` : ""}`,
      }).select("id").single();

      await saveSession("MENU", { lastTxId: tx?.id, lastTxAt: now.toISOString() });
      return reply(
        [`✅ Stock request sent: ${p.qty} pack(s) for ${sName}. The VAGIN team has been notified.`],
        "STOCK", tx?.id,
        { stockRequest: { qty: p.qty, reason: p.reason ?? "", schoolName: sName, matronName: matron.name } },
      );
    }
  }

  if (parsed.intent === "NO" && ctx.pending) {
    await saveSession("MENU", {});
    return reply(["Cancelled. Nothing was recorded."], "CANCEL");
  }

  // ── Direct commands ────────────────────────────────────────────────────────────
  if (parsed.intent === "ISSUE") {
    const g = await findGirl(parsed.code);
    if (!g) return reply([`No girl with code ${parsed.code} at ${await schoolName()}. Check the code.`], "ISSUE");
    const cost = parsed.padType === "paid" ? parsed.qty * config.pack_price_ngn : 0;
    if (parsed.padType === "paid" && (g.balance_ngn ?? 0) < cost) {
      return reply(
        [`Insufficient balance: ${naira(g.balance_ngn ?? 0)} available, ${naira(cost)} needed (${naira(config.pack_price_ngn)}/pack × ${parsed.qty}). Nothing recorded.`],
        "ISSUE",
      );
    }
    await saveSession("ISSUE_CONFIRM", {
      pending: { kind: "ISSUE", studentId: g.id, studentCode: g.student_id, studentName: g.name, qty: parsed.qty, padType: parsed.padType },
      lastTxId: ctx.lastTxId, lastTxAt: ctx.lastTxAt,
    });
    return reply(
      [`⚠ Confirm: ${parsed.qty} ${parsed.padType} pack(s) → ${g.name} (${g.class ?? "—"}).${parsed.padType === "paid" ? ` ${naira(cost)} from her ${naira(g.balance_ngn ?? 0)} balance.` : ""} Reply YES.`],
      "ISSUE",
    );
  }

  if (parsed.intent === "SAVE") {
    const g = await findGirl(parsed.code);
    if (!g) return reply([`No girl with code ${parsed.code} at ${await schoolName()}. Check the code.`], "SAVE");
    await saveSession("SAVE_CONFIRM", {
      pending: { kind: "SAVE", studentId: g.id, studentCode: g.student_id, studentName: g.name, amount: parsed.amount },
      lastTxId: ctx.lastTxId, lastTxAt: ctx.lastTxAt,
    });
    return reply(
      [`⚠ Confirm: save ${naira(parsed.amount)} for ${g.name} (balance ${naira(g.balance_ngn ?? 0)} → ${naira((g.balance_ngn ?? 0) + parsed.amount)}). Reply YES.`],
      "SAVE",
    );
  }

  if (parsed.intent === "BAL") {
    const g = await findGirl(parsed.code);
    if (!g) return reply([`No girl with code ${parsed.code} at ${await schoolName()}. Check the code.`], "BAL");
    await saveSession("MENU", ctx);
    return reply(
      [`${g.name} (${g.class ?? "—"}): balance ${naira(g.balance_ngn ?? 0)}, ${g.pads_received ?? 0} pack(s) received (${g.free_pads_used ?? 0} free, ${g.paid_pads_used ?? 0} paid).`],
      "BAL",
    );
  }

  if (parsed.intent === "STOCK") {
    await saveSession("STOCK_CONFIRM", { pending: { kind: "STOCK", qty: parsed.qty, reason: parsed.reason } });
    return reply(
      [`⚠ Confirm: request ${parsed.qty} pack(s) for ${await schoolName()}${parsed.reason ? ` ("${parsed.reason}")` : ""}. Reply YES.`],
      "STOCK",
    );
  }

  if (parsed.intent === "UNDO") {
    if (!ctx.lastTxId || !ctx.lastTxAt) return reply(["Nothing to undo."], "UNDO");
    const ageMin = (now.getTime() - new Date(ctx.lastTxAt).getTime()) / 60_000;
    if (ageMin > config.undo_window_min) {
      return reply([`Undo window (${config.undo_window_min} min) has passed. Ask the VAGIN team to void it from the dashboard.`], "UNDO");
    }
    const { data: tx } = await db.from("vagin_transactions").select("*").eq("id", ctx.lastTxId).maybeSingle();
    if (!tx || tx.voided) return reply(["That entry was already undone."], "UNDO");

    await db.from("vagin_transactions").update({ voided: true, voided_reason: `Matron UNDO via bot within ${config.undo_window_min}min` }).eq("id", tx.id);

    if (tx.student_id) {
      const { data: g } = await db.from("vagin_students").select("*").eq("id", tx.student_id).maybeSingle();
      if (g) {
        const patch: Record<string, unknown> = {};
        if (tx.type === "paid_pads") {
          patch.paid_pads_used = Math.max(0, (g.paid_pads_used ?? 0) - tx.pads_issued);
          patch.pads_received = Math.max(0, (g.pads_received ?? 0) - tx.pads_issued);
          patch.balance_ngn = (g.balance_ngn ?? 0) + (tx.amount_ngn ?? 0);
        } else if (tx.type === "free_pads") {
          patch.free_pads_used = Math.max(0, (g.free_pads_used ?? 0) - tx.pads_issued);
          patch.pads_received = Math.max(0, (g.pads_received ?? 0) - tx.pads_issued);
        } else if (tx.type === "savings_deposit") {
          patch.balance_ngn = (g.balance_ngn ?? 0) - (tx.amount_ngn ?? 0);
        }
        await db.from("vagin_students").update(patch).eq("id", g.id);
      }
    }
    await saveSession("MENU", {});
    return reply(["✅ Undone. Balances restored."], "UNDO", tx.id);
  }

  // ── Guided flow: bare girl code ────────────────────────────────────────────────
  if (parsed.intent === "CODE_ONLY") {
    const g = await findGirl(parsed.code);
    if (!g) return reply([`No girl with code ${parsed.code} at ${await schoolName()}. Check the code.`], "CODE");
    await saveSession("MENU", ctx);
    return reply(
      [`${g.name} (${g.class ?? "—"}) — balance ${naira(g.balance_ngn ?? 0)}.\nISSUE ${g.student_id} <qty> FREE|PAID · SAVE ${g.student_id} <amt> · BAL ${g.student_id}`],
      "CODE",
    );
  }

  // ── Menu picks (guided mode) ───────────────────────────────────────────────────
  if (parsed.intent === "MENU_PICK") {
    const prompts: Record<number, string> = {
      1: `To issue: ISSUE <girl code> <qty> FREE or PAID (e.g. ISSUE FAADSS2 2 PAID)`,
      2: `To record savings: SAVE <girl code> <amount> (e.g. SAVE FAADSS2 800)`,
      3: `To check balance: BAL <girl code> (e.g. BAL FAADSS2)`,
      4: `To request stock: STOCK <packs> [reason] (e.g. STOCK 200 running low)`,
    };
    await saveSession("MENU", ctx);
    return reply([prompts[parsed.n]], "MENU");
  }

  // ── HELP / first contact ───────────────────────────────────────────────────────
  if (parsed.intent === "HELP") {
    await saveSession("MENU", ctx);
    return reply([await greeting()], "HELP");
  }

  // ── Unknown ────────────────────────────────────────────────────────────────────
  await saveSession(state, ctx);
  return reply([`Didn't understand that. Send 0 for the menu.`], "UNKNOWN");
}
