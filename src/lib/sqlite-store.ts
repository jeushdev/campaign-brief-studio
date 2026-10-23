import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { validateBrief, validatePlan } from "./validation.ts";
import { STATUSES } from "./types.ts";
import type { CampaignBrief, CampaignPlan, StoredBrief, StoredPlan, BriefStatus } from "./types.ts";

export class ConflictError extends Error {}
export class NotFoundError extends Error {}
type Row = { id: string; created_at: string; updated_at: string; version: number; status: BriefStatus; brief_json: string; current_plan_id: string | null; current_attempt_id: string | null; review_note: string | null };
type AttemptRow = { id: string; revision_id: string; operation_key: string; status: "Generating" | "Succeeded" | "Failed" | "Expired"; started_at: string; expires_at: string; error: string | null };
type RevisionRow = { id: string; revision_number: number; brief_json: string; instructions: string | null; created_at: string };
type PlanRow = { id: string; revision_id: string; attempt_id: string; created_at: string; plan_json: string; mode: StoredPlan["mode"] };
const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => [key, canonical(v)])) : value;
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const now = () => new Date().toISOString();
const readPlan = (raw: string) => { const checked = validatePlan(JSON.parse(raw)); if (!checked.valid || !checked.plan) throw new Error("Stored plan is corrupt: " + checked.errors.join("; ")); return checked.plan; };
const readBrief = (raw: string) => { const checked = validateBrief(JSON.parse(raw)); if (!checked.valid) throw new Error("Stored brief is corrupt."); return checked.brief; };

export function openStore(filename: string, legacyFile = path.join(path.dirname(filename), "briefs.json")) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const connection = new Database(filename);
  try {
    connection.pragma("busy_timeout = 5000");
    connection.pragma("journal_mode = WAL");
    connection.pragma("synchronous = FULL");
    connection.pragma("foreign_keys = ON");
    connection.exec(`
CREATE TABLE IF NOT EXISTS briefs (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, version INTEGER NOT NULL, status TEXT NOT NULL, brief_json TEXT NOT NULL, current_plan_id TEXT, current_attempt_id TEXT, review_note TEXT);
CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY, brief_id TEXT NOT NULL REFERENCES briefs(id), revision_number INTEGER NOT NULL, brief_json TEXT NOT NULL, instructions TEXT, created_at TEXT NOT NULL, UNIQUE(brief_id, revision_number));
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, brief_id TEXT NOT NULL REFERENCES briefs(id), revision_id TEXT NOT NULL REFERENCES revisions(id), operation_key TEXT NOT NULL UNIQUE, status TEXT NOT NULL, started_at TEXT NOT NULL, expires_at TEXT NOT NULL, error TEXT);
CREATE TABLE IF NOT EXISTS plans (id TEXT PRIMARY KEY, brief_id TEXT NOT NULL REFERENCES briefs(id), revision_id TEXT NOT NULL REFERENCES revisions(id), attempt_id TEXT NOT NULL UNIQUE REFERENCES attempts(id), plan_json TEXT NOT NULL, mode TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, brief_id TEXT NOT NULL REFERENCES briefs(id), at TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS operations (operation_key TEXT PRIMARY KEY, operation_type TEXT NOT NULL, request_hash TEXT NOT NULL, response_json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);
    const columns = connection.pragma("table_info(briefs)") as { name: string }[];
    if (!columns.some((column) => column.name === "current_attempt_id")) connection.exec("ALTER TABLE briefs ADD COLUMN current_attempt_id TEXT");
    importLegacy();
  } catch (error) { connection.close(); throw error; }

  function activity(id: string, action: string, detail: string) {
    connection.prepare("INSERT INTO activities VALUES (?,?,?,?,?)").run(randomUUID(), id, now(), action, detail);
  }
  function latestRevision(id: string) {
    const row = connection.prepare("SELECT * FROM revisions WHERE brief_id=? ORDER BY revision_number DESC LIMIT 1").get(id) as RevisionRow | undefined;
    if (!row) throw new Error("Stored brief has no revision.");
    return row;
  }
  function rowFor(id: string) {
    const row = connection.prepare("SELECT * FROM briefs WHERE id=?").get(id) as Row | undefined;
    if (!row) throw new NotFoundError("Brief not found.");
    return row;
  }
  function map(row: Row): StoredBrief {
    const revisions = connection.prepare("SELECT * FROM revisions WHERE brief_id=? ORDER BY revision_number").all(row.id) as RevisionRow[];
    const attempts = connection.prepare("SELECT * FROM attempts WHERE brief_id=? ORDER BY rowid").all(row.id) as AttemptRow[];
    const plans = connection.prepare("SELECT * FROM plans WHERE brief_id=? ORDER BY rowid").all(row.id) as PlanRow[];
    const current = plans.find((plan) => plan.id === row.current_plan_id);
    if (row.current_plan_id && !current) throw new Error("Stored current plan is missing.");
    return { id: row.id, createdAt: row.created_at, updatedAt: row.updated_at, version: row.version, status: row.status, brief: readBrief(row.brief_json),
      ...(current ? { plan: readPlan(current.plan_json), planId: current.id } : {}), ...(row.review_note ? { reviewNote: row.review_note } : {}),
      activities: connection.prepare("SELECT id,at,action,detail FROM activities WHERE brief_id=? ORDER BY rowid").all(row.id) as StoredBrief["activities"],
      revisions: revisions.map((r) => ({ id: r.id, number: r.revision_number, brief: readBrief(r.brief_json), instructions: r.instructions ?? undefined, createdAt: r.created_at })),
      attempts: attempts.map((a) => ({ id: a.id, revisionId: a.revision_id, operationKey: a.operation_key, status: a.status, startedAt: a.started_at, expiresAt: a.expires_at, error: a.error ?? undefined })),
      plans: plans.map((p) => ({ id: p.id, revisionId: p.revision_id, attemptId: p.attempt_id, createdAt: p.created_at, plan: readPlan(p.plan_json), mode: p.mode })) };
  }
  function getBrief(id: string) { const row = connection.prepare("SELECT * FROM briefs WHERE id=?").get(id) as Row | undefined; return row ? map(row) : undefined; }
  function checkVersion(row: Row, version: number) { if (!Number.isSafeInteger(version) || row.version !== version) throw new ConflictError("This brief changed. Refresh before acting."); }
  function checkBrief(brief: CampaignBrief) { const checked = validateBrief(brief); if (!checked.valid) throw new ConflictError("Invalid brief: " + Object.values(checked.errors).join("; ")); return checked.brief; }
  function operation<T>(key: string, type: string, payload: unknown, execute: () => T): T & { replayed: boolean } {
    if (!/^[A-Za-z0-9_-]{8,200}$/.test(key)) throw new ConflictError("A valid Idempotency-Key is required.");
    return connection.transaction(() => {
      const old = connection.prepare("SELECT * FROM operations WHERE operation_key=?").get(key) as { operation_type: string; request_hash: string; response_json: string } | undefined;
      if (old) {
        if (old.operation_type !== type || old.request_hash !== hash(payload)) throw new ConflictError("Idempotency key was already used for a different operation or payload.");
        return { ...JSON.parse(old.response_json) as T, replayed: true };
      }
      const result = execute();
      connection.prepare("INSERT INTO operations VALUES (?,?,?,?,?)").run(key, type, hash(payload), JSON.stringify(result), now());
      return { ...result, replayed: false };
    }).immediate();
  }
  function start(id: string, revisionId: string, key: string) {
    const attemptId = randomUUID();
    connection.prepare("INSERT INTO attempts VALUES (?,?,?,?,?,?,?,NULL)").run(attemptId, id, revisionId, key, "Generating", now(), new Date(Date.now() + 120_000).toISOString());
    connection.prepare("UPDATE briefs SET current_attempt_id=?, current_plan_id=NULL, status='Generating', updated_at=?, version=version+1 WHERE id=?").run(attemptId, now(), id);
    activity(id, "Generation started", "A new generation attempt was created for the current input revision.");
    return { briefId: id, attemptId };
  }
  function currentAttempt(id: string, attemptId: string, allowExpired = false) {
    const row = rowFor(id);
    const attempt = connection.prepare("SELECT * FROM attempts WHERE id=? AND brief_id=?").get(attemptId, id) as AttemptRow | undefined;
    if (!attempt || row.status !== "Generating" || row.current_attempt_id !== attemptId || attempt.status !== "Generating" || latestRevision(id).id !== attempt.revision_id || (!allowExpired && attempt.expires_at <= now())) throw new ConflictError("This generation result is stale or expired.");
    return attempt;
  }
  function createAndStart(input: CampaignBrief, key: string) {
    const brief = checkBrief(input);
    return operation(key, "create", { brief }, () => {
      const id = randomUUID(), revisionId = randomUUID(), at = now();
      connection.prepare("INSERT INTO briefs (id,created_at,updated_at,version,status,brief_json) VALUES (?,?,?,?,?,?)").run(id, at, at, 1, "Submitted", JSON.stringify(brief));
      connection.prepare("INSERT INTO revisions VALUES (?,?,?,?,?,?)").run(revisionId, id, 1, JSON.stringify(brief), null, at);
      activity(id, "Draft created", "Validated inputs saved in SQLite.");
      activity(id, "Submitted", "Initial input revision submitted.");
      return start(id, revisionId, key);
    });
  }
  function retryFailed(id: string, version: number, key: string) {
    return operation(key, "retry", { id, version }, () => {
      const row = rowFor(id); checkVersion(row, version);
      if (row.status === "Generating") {
        const attempt = currentAttempt(id, row.current_attempt_id ?? "", true);
        if (attempt.expires_at > now()) throw new ConflictError("Generation is already in progress.");
        connection.prepare("UPDATE attempts SET status='Expired',error=? WHERE id=? AND status='Generating'").run("Attempt expired before a result was recorded.", attempt.id);
        connection.prepare("UPDATE briefs SET status='Failed' WHERE id=?").run(id);
        activity(id, "Generation expired", "The unfinished attempt expired and was made retryable.");
      } else if (row.status !== "Failed") throw new ConflictError("Only failed or expired attempts can be retried.");
      activity(id, "Retry started", "Retrying the same input revision.");
      return start(id, latestRevision(id).id, key);
    });
  }
  function submitRevision(id: string, version: number, input: CampaignBrief, instructions: string, key: string) {
    const brief = checkBrief(input);
    return operation(key, "revision", { id, version, brief, instructions }, () => {
      const row = rowFor(id); checkVersion(row, version);
      if (row.status !== "Revision requested") throw new ConflictError("Only a requested revision can be submitted.");
      if (typeof instructions !== "string" || !instructions.trim()) throw new ConflictError("Revision instructions are required.");
      const revisionId = randomUUID(), revisionNumber = latestRevision(id).revision_number + 1;
      connection.prepare("INSERT INTO revisions VALUES (?,?,?,?,?,?)").run(revisionId, id, revisionNumber, JSON.stringify(brief), instructions.trim(), now());
      connection.prepare("UPDATE briefs SET status='Submitted',brief_json=?,review_note=NULL,version=version+1 WHERE id=?").run(JSON.stringify(brief), id);
      activity(id, "Revision submitted", "Revision " + revisionNumber + ": " + instructions.trim());
      return start(id, revisionId, key);
    });
  }
  function completeAttempt(id: string, attemptId: string, plan: CampaignPlan, mode: "Webhook" | "Demo" | "webhook" | "demo" = "Webhook") {
    const check = validatePlan(plan);
    if (!check.valid || !check.plan) throw new ConflictError("Invalid campaign plan: " + check.errors.join("; "));
    const normalizedMode: "Webhook" | "Demo" = mode.toLowerCase() === "demo" ? "Demo" : "Webhook";
    return connection.transaction(() => {
      const attempt = currentAttempt(id, attemptId), planId = randomUUID();
      connection.prepare("INSERT INTO plans VALUES (?,?,?,?,?,?,?)").run(planId, id, attempt.revision_id, attemptId, JSON.stringify(check.plan), normalizedMode, now());
      if (connection.prepare("UPDATE attempts SET status='Succeeded' WHERE id=? AND status='Generating'").run(attemptId).changes !== 1) throw new ConflictError("Attempt changed.");
      if (connection.prepare("UPDATE briefs SET status='Needs review',updated_at=?,version=version+1,current_plan_id=? WHERE id=? AND status='Generating' AND current_attempt_id=?").run(now(), planId, id, attemptId).changes !== 1) throw new ConflictError("Generation changed.");
      activity(id, "Generation validated", normalizedMode + " plan passed schema validation and awaits human review.");
      return getBrief(id)!;
    }).immediate();
  }
  function failAttempt(id: string, attemptId: string, detail: string) {
    return connection.transaction(() => {
      currentAttempt(id, attemptId);
      if (connection.prepare("UPDATE attempts SET status='Failed',error=? WHERE id=? AND status='Generating'").run(detail, attemptId).changes !== 1) throw new ConflictError("Attempt changed.");
      if (connection.prepare("UPDATE briefs SET status='Failed',updated_at=?,version=version+1 WHERE id=? AND status='Generating' AND current_attempt_id=?").run(now(), id, attemptId).changes !== 1) throw new ConflictError("Generation changed.");
      activity(id, "Generation failed", detail);
      return getBrief(id)!;
    }).immediate();
  }
  function reviewBrief(id: string, version: number, decision: "Approved" | "Rejected" | "Revision requested", note: string, acknowledgeLowConfidence: boolean, key: string) {
    return operation(key, "review", { id, version, decision, note, acknowledgeLowConfidence }, () => {
      const row = rowFor(id); checkVersion(row, version);
      if (!["Approved", "Rejected", "Revision requested"].includes(decision) || typeof note !== "string" || typeof acknowledgeLowConfidence !== "boolean") throw new ConflictError("Invalid review fields.");
      const brief = getBrief(id)!;
      const plan = brief.plans.find((item) => item.id === row.current_plan_id);
      if (row.status !== "Needs review" || !plan || plan.revisionId !== latestRevision(id).id || plan.attemptId !== row.current_attempt_id || !validatePlan(plan.plan).valid) throw new ConflictError("Only the current validated plan can be reviewed.");
      if (decision !== "Approved" && !note.trim()) throw new ConflictError("A review note is required.");
      const low = plan.plan.confidence === "low" && decision === "Approved";
      if (low && (!acknowledgeLowConfidence || !note.trim())) throw new ConflictError("Low-confidence approval requires an explicit acknowledgment and note.");
      if (connection.prepare("UPDATE briefs SET status=?,review_note=?,updated_at=?,version=version+1 WHERE id=? AND version=? AND status='Needs review'").run(decision, note.trim() || null, now(), id, version).changes !== 1) throw new ConflictError("This decision is stale.");
      activity(id, "Review: " + decision, (low ? "Low confidence explicitly acknowledged. " : "") + (note.trim() || "Approved after local review; operator identity is unauthenticated."));
      return getBrief(id)!;
    });
  }
  function importLegacy() {
    connection.transaction(() => {
      if (connection.prepare("SELECT 1 FROM metadata WHERE key='legacy_import_checked'").get()) return;
      if (connection.prepare("SELECT 1 FROM briefs LIMIT 1").get()) {
        connection.prepare("INSERT INTO metadata VALUES ('legacy_import_checked','existing sqlite database')").run(); return;
      }
      let raw: string;
      try { raw = fs.readFileSync(legacyFile, "utf8"); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") { connection.prepare("INSERT INTO metadata VALUES ('legacy_import_checked','no legacy file')").run(); return; }
        throw new Error("Cannot read legacy database; original retained.", { cause: error });
      }
      let records: unknown;
      try { records = JSON.parse(raw); } catch { throw new Error("Legacy database contains malformed JSON; original retained."); }
      if (!Array.isArray(records)) throw new Error("Legacy database must be an array; original retained.");
      records.forEach((raw, index) => {
        if (!raw || typeof raw !== "object") throw new Error("Invalid legacy record " + index);
        const old = raw as Record<string, unknown>, checked = validateBrief(old.brief);
        const nonblank = (value: unknown) => typeof value === "string" && !!value.trim();
        if (!nonblank(old.id) || !checked.valid || !nonblank(old.createdAt) || !nonblank(old.updatedAt) || !Number.isFinite(Date.parse(old.createdAt as string)) || !Number.isFinite(Date.parse(old.updatedAt as string)) || !STATUSES.includes(old.status as BriefStatus) || !Array.isArray(old.activities) || (old.reviewNote !== undefined && typeof old.reviewNote !== "string")) throw new Error("Invalid legacy record " + index + "; import rolled back.");
        const plan = old.plan === undefined ? undefined : validatePlan(old.plan);
        if ((plan && !plan.valid) || (["Approved", "Needs review", "Revision requested", "Rejected"].includes(old.status as string) && !plan)) throw new Error("Invalid legacy plan at record " + index);
        const id = old.id as string, revisionId = randomUUID();
        const status = ["Draft", "Submitted", "Generating"].includes(old.status as string) ? "Failed" : old.status;
        connection.prepare("INSERT INTO briefs (id,created_at,updated_at,version,status,brief_json,review_note) VALUES (?,?,?,?,?,?,?)").run(id, old.createdAt as string, old.updatedAt as string, 1, status as string, JSON.stringify(checked.brief), old.reviewNote as string ?? null);
        connection.prepare("INSERT INTO revisions VALUES (?,?,?,?,?,?)").run(revisionId, id, 1, JSON.stringify(checked.brief), null, old.createdAt as string);
        for (const entry of old.activities as Record<string, unknown>[]) {
          if (!entry || !nonblank(entry.id) || !nonblank(entry.at) || !Number.isFinite(Date.parse(entry.at as string)) || !nonblank(entry.action) || typeof entry.detail !== "string") throw new Error("Invalid legacy activity at record " + index);
          connection.prepare("INSERT INTO activities VALUES (?,?,?,?,?)").run(entry.id as string, id, entry.at as string, entry.action as string, entry.detail);
        }
        if (plan?.plan) {
          const attemptId = randomUUID(), planId = randomUUID();
          connection.prepare("INSERT INTO attempts VALUES (?,?,?,?,?,?,?,NULL)").run(attemptId, id, revisionId, "legacy-" + attemptId, "Succeeded", old.createdAt as string, old.updatedAt as string);
          connection.prepare("INSERT INTO plans VALUES (?,?,?,?,?,?,?)").run(planId, id, revisionId, attemptId, JSON.stringify(plan.plan), "Legacy", old.updatedAt as string);
          connection.prepare("UPDATE briefs SET current_plan_id=?,current_attempt_id=? WHERE id=?").run(planId, attemptId, id);
        }
        activity(id, "Legacy imported", "Original JSON retained. " + (status !== old.status ? "Unfinished generation made retryable." : "Prior plan and activity preserved."));
      });
      connection.prepare("INSERT INTO metadata VALUES ('legacy_import_checked','imported')").run();
    }).immediate();
  }
  return { createAndStart, retryFailed, submitRevision, completeAttempt, failAttempt, reviewBrief,
    getBrief: connection.transaction(getBrief),
    listBriefs: connection.transaction(() => (connection.prepare("SELECT * FROM briefs ORDER BY updated_at DESC").all() as Row[]).map(map)),
    close: () => connection.close() };
}
