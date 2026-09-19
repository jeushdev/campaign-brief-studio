import test from "node:test";
import assert from "node:assert/strict";
import { requestCampaignPlan } from "../src/lib/webhook.ts";
import { brief } from "./fixtures.ts";

test("app handles webhook dispatch, response status codes, timeouts, and required configuration", async (t) => {
  const oldUrl = process.env.N8N_WEBHOOK_URL, oldSecret = process.env.N8N_WEBHOOK_SECRET;
  process.env.N8N_WEBHOOK_URL = "http://example.invalid/test";
  process.env.N8N_WEBHOOK_SECRET = "test-only-secret";
  t.after(() => {
    if (oldUrl === undefined) delete process.env.N8N_WEBHOOK_URL; else process.env.N8N_WEBHOOK_URL = oldUrl;
    if (oldSecret === undefined) delete process.env.N8N_WEBHOOK_SECRET; else process.env.N8N_WEBHOOK_SECRET = oldSecret;
  });

  let interceptedBody: Record<string, unknown> | undefined;
  let interceptedHeaders: Headers | undefined;
  const mockSuccess = t.mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => {
    interceptedHeaders = new Headers(init?.headers);
    interceptedBody = JSON.parse(init?.body as string);
    return new Response(JSON.stringify({ ok: true }), { status: 202 });
  });

  const result202 = await requestCampaignPlan("brief", "attempt", brief);
  assert.equal(result202.ok, true);
  assert.equal(interceptedHeaders?.get("x-campaign-webhook-secret"), "test-only-secret");
  assert.equal(interceptedBody?.briefId, "brief");
  assert.equal(interceptedBody?.attemptId, "attempt");
  assert.match(interceptedBody?.callbackUrl as string, /\/api\/webhooks\/generation-complete$/);
  mockSuccess.mock.restore();

  const mockError = t.mock.method(globalThis, "fetch", async () => {
    return new Response(JSON.stringify({ ok: false, error: { code: "provider_error", message: "Failed upstream" } }), { status: 502 });
  });
  const result502 = await requestCampaignPlan("brief", "attempt", brief);
  assert.equal(result502.ok, false);
  assert.match(result502.error!, /provider_error: Failed upstream/);
  mockError.mock.restore();

  const mockTimeout = t.mock.method(globalThis, "fetch", async () => {
    throw new DOMException("timeout", "TimeoutError");
  });
  assert.match((await requestCampaignPlan("brief", "attempt", brief)).error!, /timed out/);
  mockTimeout.mock.restore();

  delete process.env.N8N_WEBHOOK_SECRET;
  assert.match((await requestCampaignPlan("brief", "attempt", brief)).error!, /required/);
});
