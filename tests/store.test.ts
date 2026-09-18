import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import Database from "better-sqlite3";
import { openStore } from "../src/lib/sqlite-store.ts";
import { brief, plan } from "./fixtures.ts";
function fixture(t: TestContext) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "campaign-store-"));
  const file = path.join(directory, "test.sqlite");
  const store = openStore(file);
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  return { store, file, directory };
}
test("idempotency, transitions, revisions, plan history and stale decisions", (t) => {
  const { store } = fixture(t);
  const a = store.createAndStart(brief, "create-key-001");
  assert.equal(store.createAndStart(brief, "create-key-001").attemptId, a.attemptId);
  assert.throws(() => store.createAndStart({ ...brief, offer: "Changed" }, "create-key-001"), /different/);
  assert.throws(() => store.completeAttempt(a.briefId, a.attemptId, { ...plan(), landingPageOutline: [] }, "Demo"), /Invalid campaign plan/);
  const ready = store.completeAttempt(a.briefId, a.attemptId, plan(), "Demo");
  assert.throws(() => store.retryFailed(a.briefId, ready.version, "retry-key-001"), /failed/);
  const requested = store.reviewBrief(a.briefId, ready.version, "Revision requested", "Change the offer", false, "review-key-001");
  assert.throws(() => store.reviewBrief(a.briefId, ready.version, "Approved", "", false, "review-key-002"), /changed/);
  const revision = store.submitRevision(a.briefId, requested.version, { ...brief, offer: "Revised offer" }, "Use the updated offer", "revision-key-001");
  assert.equal(store.getBrief(a.briefId)?.plan, undefined);
  assert.throws(() => store.completeAttempt(a.briefId, a.attemptId, plan(), "Demo"), /stale/);
  assert.throws(() => store.failAttempt(a.briefId, a.attemptId, "late failure"), /stale/);
  const finished = store.completeAttempt(a.briefId, revision.attemptId, plan(), "Demo");
  assert.equal(finished.plans.length, 2); assert.equal(finished.revisions.length, 2);
  const approved = store.reviewBrief(a.briefId, finished.version, "Approved", "", false, "approve-key-001");
  assert.throws(() => store.reviewBrief(a.briefId, approved.version, "Rejected", "reason", false, "reject-key-001"), /validated/);
});
test("expired attempt recovery cannot be poisoned by old callbacks; low confidence is explicit", (t) => {
  const { store, file } = fixture(t);
  const a = store.createAndStart(brief, "create-key-001");
  const sql = new Database(file); sql.prepare("UPDATE attempts SET expires_at='2000-01-01' WHERE id=?").run(a.attemptId); sql.close();
  const retry = store.retryFailed(a.briefId, store.getBrief(a.briefId)!.version, "retry-key-001");
  assert.equal(store.getBrief(a.briefId)!.attempts[0].status, "Expired");
  assert.throws(() => store.completeAttempt(a.briefId, a.attemptId, plan(), "Demo"), /stale/);
  assert.throws(() => store.failAttempt(a.briefId, a.attemptId, "late error"), /stale/);
  assert.equal(store.getBrief(a.briefId)!.status, "Generating");
  const ready = store.completeAttempt(a.briefId, retry.attemptId, { ...plan(), confidence: "low" }, "Demo");
  for (const [note, ack] of [["", true], ["Reviewed", false]] as const) assert.throws(() => store.reviewBrief(a.briefId, ready.version, "Approved", note, ack, "review-key-001"), /acknowledgment/);
  const final = store.reviewBrief(a.briefId, ready.version, "Approved", "Reviewed risks", true, "review-key-001");
  assert.match(final.activities.at(-1)!.detail, /explicitly acknowledged/);
});
test("corrupt persisted plans cannot be approved and failures preserve history", (t) => {
  const { store, file } = fixture(t); const a = store.createAndStart(brief, "create-key-001");
  const ready = store.completeAttempt(a.briefId, a.attemptId, plan(), "Demo");
  const sql = new Database(file); sql.prepare("UPDATE plans SET plan_json='{}'").run(); sql.close();
  assert.throws(() => store.reviewBrief(a.briefId, ready.version, "Approved", "", false, "review-key-001"), /corrupt/);
  const check = new Database(file); assert.equal((check.prepare("SELECT status FROM briefs").get() as { status: string }).status, "Needs review"); check.close();
});
test("legacy import preserves plans and original file; one bad record rolls back all records", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "campaign-legacy-")); t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "store.sqlite"), legacy = path.join(directory, "briefs.json");
  const record = { id: "legacy-id", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "Approved", brief, plan: plan(), activities: [] };
  fs.writeFileSync(legacy, JSON.stringify([record, { id: "bad" }]));
  assert.throws(() => openStore(file), /Invalid legacy/);
  const sql = new Database(file); assert.equal((sql.prepare("SELECT COUNT(*) AS count FROM briefs").get() as { count: number }).count, 0); sql.close();
  fs.writeFileSync(legacy, JSON.stringify([record]));
  const original = fs.readFileSync(legacy, "utf8"), store = openStore(file);
  assert.deepEqual(store.getBrief("legacy-id")?.plan, record.plan); assert.equal(fs.readFileSync(legacy, "utf8"), original); store.close();
  fs.writeFileSync(path.join(directory, "bad.sqlite"), "not sqlite");
  assert.throws(() => openStore(path.join(directory, "bad.sqlite")));
});
test("separate processes race on the same create key without duplicate briefs", async (t) => {
  const { file, store } = fixture(t);
  const run = () => new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["--experimental-strip-types", "tests/store-worker.ts", file], { stdio: ["ignore", "ignore", "pipe"] });
    let error = ""; child.stderr.on("data", (chunk) => error += chunk); child.on("error", reject); child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(error)));
  });
  await Promise.all([run(), run(), run()]);
  assert.equal(store.listBriefs().length, 1); assert.equal(store.listBriefs()[0].attempts.length, 1);
});
