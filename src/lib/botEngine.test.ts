import { describe, it, expect, beforeEach } from "vitest";
import { parseMessage, processMessage, type DBClient } from "./botEngine";

/* ═══════════════════════════════════════════════════════════════════════════════
   In-memory mock of the supabase-js query builder — just enough surface for
   the engine: from().select().eq().maybeSingle()/single(), insert().select().single(),
   update().eq(), upsert(, {onConflict}), order(), limit(), thenable execution.
   ═══════════════════════════════════════════════════════════════════════════════ */

type Row = Record<string, any>;

class Query {
  private filters: [string, any][] = [];
  private op: "select" | "insert" | "update" | "upsert" = "select";
  private payload: Row | null = null;
  private conflictKey: string | null = null;

  constructor(private tables: Record<string, Row[]>, private table: string) {}

  select(_cols?: string) { return this; }
  order(_c?: string, _o?: unknown) { return this; }
  limit(_n?: number) { return this; }
  eq(k: string, v: any) { this.filters.push([k, v]); return this; }
  insert(p: Row) { this.op = "insert"; this.payload = p; return this; }
  update(p: Row) { this.op = "update"; this.payload = p; return this; }
  upsert(p: Row, opts?: { onConflict?: string }) {
    this.op = "upsert"; this.payload = p; this.conflictKey = opts?.onConflict ?? null; return this;
  }

  private rows(): Row[] {
    const all = this.tables[this.table] ?? (this.tables[this.table] = []);
    return all.filter(r => this.filters.every(([k, v]) => r[k] === v));
  }

  private run(single: boolean): { data: any; error: any } {
    const all = this.tables[this.table] ?? (this.tables[this.table] = []);
    if (this.op === "insert") {
      const row = { id: crypto.randomUUID(), ...this.payload };
      all.push(row);
      return { data: single ? row : [row], error: null };
    }
    if (this.op === "update") {
      for (const r of this.rows()) Object.assign(r, this.payload);
      return { data: null, error: null };
    }
    if (this.op === "upsert") {
      const key = this.conflictKey ?? "id";
      const existing = all.find(r => r[key] === (this.payload as Row)[key]);
      if (existing) Object.assign(existing, this.payload);
      else all.push({ id: crypto.randomUUID(), ...this.payload });
      return { data: null, error: null };
    }
    const matched = this.rows();
    return { data: single ? (matched[0] ?? null) : matched, error: null };
  }

  maybeSingle() { return Promise.resolve(this.run(true)); }
  single() { return Promise.resolve(this.run(true)); }
  then(resolve: (v: any) => void, _reject?: (e: any) => void) { resolve(this.run(false)); }
}

const makeDB = (tables: Record<string, Row[]>): DBClient & { tables: Record<string, Row[]> } => ({
  tables,
  from: (table: string) => new Query(tables, table) as any,
});

// ── Seed fixtures ────────────────────────────────────────────────────────────────
const MATRON_PHONE = "+2348000000001";
const SCHOOL_A = "school-a";
const SCHOOL_B = "school-b";

const seed = () => ({
  vagin_bot_config: [{
    id: 1, bot_enabled: true, pack_price_ngn: 700, undo_window_min: 15,
    outlier_min_ngn: 50, outlier_max_ngn: 5000, admin_phone: null,
  }],
  vagin_matrons: [
    { id: "matron-1", name: "Mrs Demo", phone: MATRON_PHONE, school_id: SCHOOL_A, active: true },
  ],
  vagin_schools: [
    { id: SCHOOL_A, name: "Clegg Girls Senior High" },
    { id: SCHOOL_B, name: "Other School" },
  ],
  vagin_students: [
    { id: "girl-1", student_id: "FAADSS2", name: "Fatima A.", class: "SS2", school_id: SCHOOL_A, balance_ngn: 1450, free_pads_used: 0, paid_pads_used: 0, pads_received: 0, active: true },
    { id: "girl-2", student_id: "BEOTSS1", name: "Blessing O.", class: "SS1", school_id: SCHOOL_B, balance_ngn: 5000, free_pads_used: 0, paid_pads_used: 0, pads_received: 0, active: true },
  ],
  vagin_bot_sessions: [] as Row[],
  vagin_bot_logs: [] as Row[],
  vagin_transactions: [] as Row[],
});

// ═══════════════════════════ Parser unit tests ═══════════════════════════════════
describe("parseMessage", () => {
  it("parses ISSUE with qty and type", () => {
    expect(parseMessage("ISSUE FAADSS2 2 PAID")).toEqual({ intent: "ISSUE", code: "FAADSS2", qty: 2, padType: "paid" });
    expect(parseMessage("issue faadss2 1 free")).toEqual({ intent: "ISSUE", code: "FAADSS2", qty: 1, padType: "free" });
  });
  it("rejects ISSUE with qty out of bounds", () => {
    expect(parseMessage("ISSUE FAADSS2 0 PAID").intent).toBe("UNKNOWN");
    expect(parseMessage("ISSUE FAADSS2 21 PAID").intent).toBe("UNKNOWN");
  });
  it("parses SAVE", () => {
    expect(parseMessage("SAVE FAADSS2 800")).toEqual({ intent: "SAVE", code: "FAADSS2", amount: 800 });
  });
  it("parses BAL and BALANCE", () => {
    expect(parseMessage("BAL FAADSS2")).toEqual({ intent: "BAL", code: "FAADSS2" });
    expect(parseMessage("balance FAADSS2")).toEqual({ intent: "BAL", code: "FAADSS2" });
  });
  it("parses STOCK with and without reason", () => {
    expect(parseMessage("STOCK 200 running low")).toEqual({ intent: "STOCK", qty: 200, reason: "running low" });
    expect(parseMessage("STOCK 50")).toEqual({ intent: "STOCK", qty: 50, reason: "" });
  });
  it("parses UNDO, YES, NO, HELP variants", () => {
    expect(parseMessage("undo").intent).toBe("UNDO");
    expect(parseMessage("YES").intent).toBe("YES");
    expect(parseMessage("cancel").intent).toBe("NO");
    expect(parseMessage("hi").intent).toBe("HELP");
    expect(parseMessage("0").intent).toBe("HELP");
  });
  it("parses menu picks and bare girl codes", () => {
    expect(parseMessage("1")).toEqual({ intent: "MENU_PICK", n: 1 });
    expect(parseMessage("FAADSS2")).toEqual({ intent: "CODE_ONLY", code: "FAADSS2" });
  });
  it("returns UNKNOWN for garbage", () => {
    expect(parseMessage("!!!").intent).toBe("UNKNOWN");
    expect(parseMessage("").intent).toBe("UNKNOWN");
  });
});

// ═══════════════════════════ Engine flow tests ═══════════════════════════════════
describe("processMessage", () => {
  let db: ReturnType<typeof makeDB>;
  beforeEach(() => { db = makeDB(seed()); });

  it("rejects an unknown phone politely and logs it", async () => {
    const r = await processMessage(db, "+2340000000000", "hi");
    expect(r.intent).toBe("REJECTED");
    expect(r.replies[0]).toContain("not registered");
    expect(db.tables.vagin_bot_logs.some(l => l.error === "unknown phone")).toBe(true);
  });

  it("greets a verified matron with name + school on HELP", async () => {
    const r = await processMessage(db, MATRON_PHONE, "hi");
    expect(r.intent).toBe("HELP");
    expect(r.replies[0]).toContain("Mrs Demo");
    expect(r.replies[0]).toContain("Clegg Girls Senior High");
  });

  it("completes a paid issue in exactly 2 bot messages, updating balances atomically", async () => {
    const r1 = await processMessage(db, MATRON_PHONE, "ISSUE FAADSS2 2 PAID");
    expect(r1.replies).toHaveLength(1);
    expect(r1.replies[0]).toContain("Confirm");
    const r2 = await processMessage(db, MATRON_PHONE, "YES");
    expect(r2.replies).toHaveLength(1);
    expect(r2.replies[0]).toContain("Done");
    const tx = db.tables.vagin_transactions[0];
    expect(tx.source).toBe("whatsapp_bot");
    expect(tx.type).toBe("paid_pads");
    expect(tx.pads_issued).toBe(2);
    expect(tx.amount_ngn).toBe(1400);
    const girl = db.tables.vagin_students.find(s => s.id === "girl-1")!;
    expect(girl.balance_ngn).toBe(50);
    expect(girl.paid_pads_used).toBe(2);
    expect(girl.pads_received).toBe(2);
  });

  it("refuses paid issue with insufficient balance and writes nothing", async () => {
    const r = await processMessage(db, MATRON_PHONE, "ISSUE FAADSS2 3 PAID"); // 2100 > 1450
    expect(r.replies[0]).toContain("Insufficient balance");
    expect(db.tables.vagin_transactions).toHaveLength(0);
    const girl = db.tables.vagin_students.find(s => s.id === "girl-1")!;
    expect(girl.balance_ngn).toBe(1450);
  });

  it("enforces school scoping — matron cannot see another school's girl", async () => {
    const r = await processMessage(db, MATRON_PHONE, "BAL BEOTSS1");
    expect(r.replies[0]).toContain("No girl with code BEOTSS1");
  });

  it("flags outlier savings deposits but still records them", async () => {
    await processMessage(db, MATRON_PHONE, "SAVE FAADSS2 10000");
    const r = await processMessage(db, MATRON_PHONE, "YES");
    expect(r.replies[0]).toContain("Flagged");
    const tx = db.tables.vagin_transactions[0];
    expect(tx.flagged).toBe(true);
    const girl = db.tables.vagin_students.find(s => s.id === "girl-1")!;
    expect(girl.balance_ngn).toBe(11450);
  });

  it("UNDO within the window voids the tx and restores balances", async () => {
    await processMessage(db, MATRON_PHONE, "SAVE FAADSS2 800");
    await processMessage(db, MATRON_PHONE, "YES");
    expect(db.tables.vagin_students.find(s => s.id === "girl-1")!.balance_ngn).toBe(2250);
    const r = await processMessage(db, MATRON_PHONE, "UNDO");
    expect(r.replies[0]).toContain("Undone");
    expect(db.tables.vagin_transactions[0].voided).toBe(true);
    expect(db.tables.vagin_students.find(s => s.id === "girl-1")!.balance_ngn).toBe(1450);
  });

  it("kill switch silences the bot entirely", async () => {
    db.tables.vagin_bot_config[0].bot_enabled = false;
    const r = await processMessage(db, MATRON_PHONE, "hi");
    expect(r.replies).toHaveLength(0);
    expect(r.intent).toBe("REJECTED");
  });

  it("rate-limits after 30 messages in a minute", async () => {
    db.tables.vagin_bot_sessions.push({
      id: "s1", phone: MATRON_PHONE, matron_id: "matron-1", state: "MENU", context: {},
      message_count_1m: 30, window_start: new Date().toISOString(),
      blocked_until: null, expires_at: new Date(Date.now() + 60_000).toISOString(),
    });
    const r = await processMessage(db, MATRON_PHONE, "hi");
    expect(r.error).toBe("rate limited");
    expect(r.replies[0]).toContain("Too many messages");
  });

  it("BAL costs exactly one reply", async () => {
    const r = await processMessage(db, MATRON_PHONE, "BAL FAADSS2");
    expect(r.replies).toHaveLength(1);
    expect(r.replies[0]).toContain("Fatima A.");
  });

  it("stock request records a transaction and surfaces the forward payload", async () => {
    await processMessage(db, MATRON_PHONE, "STOCK 200 running low");
    const r = await processMessage(db, MATRON_PHONE, "YES");
    expect(r.stockRequest).toBeDefined();
    expect(r.stockRequest!.qty).toBe(200);
    expect(r.stockRequest!.schoolName).toBe("Clegg Girls Senior High");
    expect(db.tables.vagin_transactions[0].type).toBe("stock_request");
  });

  it("NO cancels a pending confirmation without writing", async () => {
    await processMessage(db, MATRON_PHONE, "ISSUE FAADSS2 2 PAID");
    const r = await processMessage(db, MATRON_PHONE, "NO");
    expect(r.replies[0]).toContain("Cancelled");
    expect(db.tables.vagin_transactions).toHaveLength(0);
  });
});
