import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { openStore } from "../src/lib/sqlite-store.ts";
import { handleGenerationCallback } from "../src/lib/generation-callback.ts";
import { validateCallbackDestination } from "../src/lib/callback-destination.ts";
import { readBoundedJson, MAX_REQUEST_BYTES, RequestBodyError } from "../src/lib/body-reader.ts";
import { brief, plan } from "./fixtures.ts";

const config = { N8N_WEBHOOK_URL: "http://localhost:5678/webhook", N8N_WEBHOOK_SECRET: "dispatch-only", N8N_CALLBACK_SECRET: "callback-only" };
const request = (body: unknown, secret: string | undefined = config.N8N_CALLBACK_SECRET) => new Request("http://localhost/api/webhooks/generation-complete", { method: "POST", headers: secret === undefined ? {} : { "x-campaign-callback-secret": secret }, body: JSON.stringify(body) });
function fixture(t: TestContext) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "campaign-callback-"));
  const file = path.join(directory, "store.sqlite"), store = openStore(file);
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  const started = store.createAndStart(brief, "callback-create-key");
  const success = { ok: true, contractVersion: 1, briefId: started.briefId, attemptId: started.attemptId, plan: plan() };
  const failure = { ok: false, contractVersion: 1, briefId: started.briefId, attemptId: started.attemptId, error: { code: "provider_error", message: "Fixture provider failure" } };
  return { store, file, started, success, failure };
}
test("callback authentication and full envelope validation fail before mutation", async (t) => {
  const { store, success, started } = fixture(t), before = store.getBrief(started.briefId);
  assert.equal((await handleGenerationCallback(request(success, ""), store, config)).status, 401);
  assert.equal((await handleGenerationCallback(request(success, "wrong"), store, config)).status, 401);
  assert.equal((await handleGenerationCallback(request(success), store, { ...config, N8N_CALLBACK_SECRET: "" })).status, 503);
  assert.equal((await handleGenerationCallback(request(success), store, { ...config, N8N_CALLBACK_SECRET: config.N8N_WEBHOOK_SECRET })).status, 503);
  assert.equal((await handleGenerationCallback(request(success), store, { ...config, N8N_WEBHOOK_URL: "" })).status, 503);
  for (const body of [null, [], {}, { ...success, contractVersion: 2 }, { ...success, ok: "true" }, { ...success, briefId: "" }, { ...success, plan: {} }, { ...success, extra: true }, { ...success, error: { code: "bad", message: "mixed" } }, { ok: false, contractVersion: 1, briefId: started.briefId, attemptId: started.attemptId, error: "wrong" }, { ok: false, contractVersion: 1, briefId: started.briefId, attemptId: started.attemptId, error: { code: " ", message: "bad" } }]) {
    assert.equal((await handleGenerationCallback(request(body), store, config)).status, 422, JSON.stringify(body));
    assert.deepEqual(store.getBrief(started.briefId), before);
  }
  const malformed = new Request("http://localhost", { method: "POST", headers: { "x-campaign-callback-secret": config.N8N_CALLBACK_SECRET }, body: "{" });
  assert.equal((await handleGenerationCallback(malformed, store, config)).status, 400);
});
test("valid success applies once; duplicate or conflicting late errors cannot change it", async (t) => {
  const { store, started, success, failure } = fixture(t);
  assert.deepEqual(await (await handleGenerationCallback(request(success), store, config)).json(), { ok: true, disposition: "applied" });
  const before = store.getBrief(started.briefId)!;
  assert.equal(before.status, "Needs review"); assert.equal(before.plans.length, 1);
  for (const body of [success, failure, { ...success, briefId: "unknown" }]) assert.equal((await (await handleGenerationCallback(request(body), store, config)).json()).disposition, "ignored_stale");
  assert.deepEqual(store.getBrief(started.briefId), before);
});
test("valid failure applies once; stale and expired callbacks cannot poison retries", async (t) => {
  const { store, file, started, success, failure } = fixture(t);
  assert.equal((await handleGenerationCallback(request(failure), store, config)).status, 200);
  assert.equal(store.getBrief(started.briefId)!.status, "Failed");
  assert.equal(store.getBrief(started.briefId)!.attempts[0].error, "provider_error: Fixture provider failure");
  const retry = store.retryFailed(started.briefId, store.getBrief(started.briefId)!.version, "callback-retry-key");
  assert.equal((await (await handleGenerationCallback(request(failure), store, config)).json()).disposition, "ignored_stale");
  const sql = new Database(file); sql.prepare("UPDATE attempts SET expires_at='2000-01-01' WHERE id=?").run(retry.attemptId); sql.close();
  for (const body of [success, failure]) assert.equal((await (await handleGenerationCallback(request({ ...body, attemptId: retry.attemptId }), store, config)).json()).disposition, "ignored_stale");
  assert.equal(store.getBrief(started.briefId)!.status, "Generating");
  assert.equal(store.getBrief(started.briefId)!.plans.length, 0);
});
test("unexpected storage errors return retryable 500 and are observable", async (t) => {
  const { success } = fixture(t);
  const error = new Error("disk full"), logged = t.mock.method(console, "error", () => {});
  const store = { completeAttempt: () => { throw error; }, failAttempt: () => { throw error; } };
  assert.equal((await handleGenerationCallback(request(success), store, config)).status, 500);
  assert.equal(logged.mock.calls.length, 1); assert.equal(logged.mock.calls[0].arguments[1], error);
});
test("JSON byte limits apply to Content-Length and actual streamed bytes", async () => {
  const cases: Record<string, string>[] = [{}, { "content-length": "1" }, { "content-length": String(MAX_REQUEST_BYTES + 1) }];
  for (const headers of cases) {
    await assert.rejects(readBoundedJson(new Request("http://localhost", { method: "POST", headers, body: JSON.stringify("é".repeat(MAX_REQUEST_BYTES)) })), (error: unknown) => error instanceof RequestBodyError && error.status === 413);
  }
  assert.deepEqual(await readBoundedJson(new Request("http://localhost", { method: "POST", body: '{"ok":true}' })), { ok: true });
});
test("callback destination is pinned and restricted to the local callback path", () => {
  const allowed = "http://campaign-brief-studio:3000/api/webhooks/generation-complete";
  assert.equal(validateCallbackDestination(allowed, allowed), allowed);
  assert.throws(() => validateCallbackDestination(allowed, undefined), /Callback URL/);
  for (const candidate of ["http://evil.test/api/webhooks/generation-complete", "http://localhost.evil.test/api/webhooks/generation-complete", "http://user:password@localhost/api/webhooks/generation-complete", "http://localhost/api/briefs", "http://localhost/api/webhooks/generation-complete?key=secret", "http://localhost/api/webhooks/generation-complete#secret", "file:///api/webhooks/generation-complete"]) assert.throws(() => validateCallbackDestination(candidate, candidate), /Callback URL/);
  assert.throws(() => validateCallbackDestination("http://localhost:3001/api/webhooks/generation-complete", allowed), /match/);
});
