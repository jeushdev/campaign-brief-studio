import test from "node:test";
import assert from "node:assert/strict";
import { requestCampaignPlan } from "../src/lib/webhook.ts";
import { brief, plan } from "./fixtures.ts";
test("app validates envelope, attempt ids, failures and complete plans before persistence", async (t) => {
  const oldUrl = process.env.N8N_WEBHOOK_URL, oldSecret = process.env.N8N_WEBHOOK_SECRET;
  process.env.N8N_WEBHOOK_URL = "http://example.invalid/test"; process.env.N8N_WEBHOOK_SECRET = "test-only-secret";
  t.after(() => { if (oldUrl === undefined) delete process.env.N8N_WEBHOOK_URL; else process.env.N8N_WEBHOOK_URL = oldUrl; if (oldSecret === undefined) delete process.env.N8N_WEBHOOK_SECRET; else process.env.N8N_WEBHOOK_SECRET = oldSecret; });
  const envelope = { ok: true, contractVersion: 1, briefId: "brief", attemptId: "attempt", plan: plan() };
  for (const [body, status, expected] of [[envelope, 200, true], [{ ...envelope, attemptId: "old" }, 200, false], [{ ...envelope, plan: { ...plan(), landingPageOutline: [] } }, 200, false], [{ ...envelope, ok: false, error: { code: "refusal", message: "Declined" } }, 502, false]] as const) {
    const mock = t.mock.method(globalThis, "fetch", async () => Response.json(body, { status }));
    assert.equal((await requestCampaignPlan("brief", "attempt", brief)).ok, expected); mock.mock.restore();
  }
  const mock = t.mock.method(globalThis, "fetch", async () => { throw new DOMException("timeout", "TimeoutError"); });
  assert.match((await requestCampaignPlan("brief", "attempt", brief)).error!, /timed out/); mock.mock.restore();
  delete process.env.N8N_WEBHOOK_SECRET;
  assert.match((await requestCampaignPlan("brief", "attempt", brief)).error!, /required/);
});
