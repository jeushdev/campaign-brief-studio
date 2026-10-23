import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import { openStore } from "../src/lib/sqlite-store.ts";
import { createDemoPlan } from "../src/lib/demo-plan.ts";
import { brief } from "../tests/fixtures.ts";

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "campaign-production-"));
const file = path.join(directory, "smoke.sqlite"), store = openStore(file);
const secret = "local-test-secret-" + randomUUID();
const callbackSecret = "local-test-callback-secret-" + randomUUID();
const workflow = JSON.parse(fs.readFileSync("n8n/campaign-brief-studio.json", "utf8"));
const code = (name: string) => workflow.nodes.find((node: { name: string }) => node.name === name).parameters.jsCode as string;
let failNext = false, calls = 0;
const stub = createServer(async (request, response) => {
  if (request.headers["x-campaign-webhook-secret"] !== secret) { response.writeHead(401); response.end("Unauthorized"); return; }
  try {
    let raw = ""; for await (const chunk of request) raw += chunk;
    const context = JSON.parse(raw), prepared = vm.runInNewContext("(function(){" + code("Prepare request") + "})()", { URL, $env: { CAMPAIGN_CALLBACK_URL: origin + "/api/webhooks/generation-complete" }, $json: { body: context } })[0].json;
    if (!prepared.request) { response.writeHead(prepared.statusCode, { "Content-Type": "application/json" }); response.end(JSON.stringify(prepared.body)); return; }
    calls++;
    const plan = createDemoPlan(context.brief);
    const result = failNext ? { statusCode: 429, body: {} } : { statusCode: 200, body: { choices: [{ message: { content: JSON.stringify(plan) }, finish_reason: "stop" }] } };
    failNext = false;
    const output = vm.runInNewContext("(function(){" + code("Validate response") + "})()", { $json: result, $: () => ({ first: () => ({ json: prepared }) }) })[0].json;
    const delivered = await callback(output.body);
    assert.equal(delivered.status, 200);
    assert.equal(delivered.body.disposition, "applied");
    // Mirror the exported asynchronous workflow: dispatch acknowledgment is not provider output.
    response.writeHead(202, { "Content-Type": "application/json" }); response.end(JSON.stringify({ ok: true }));
  } catch (error) { response.writeHead(500); response.end(String(error)); }
});
stub.listen(0, "127.0.0.1"); await once(stub, "listening");
const stubPort = (stub.address() as { port: number }).port;
const portProbe = createServer(); portProbe.listen(0, "127.0.0.1"); await once(portProbe, "listening");
const port = (portProbe.address() as { port: number }).port; await new Promise<void>((resolve) => portProbe.close(() => resolve()));
const origin = "http://127.0.0.1:" + port;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  windowsHide: true, env: { ...process.env, APP_URL: origin, CAMPAIGN_DB_PATH: file, N8N_WEBHOOK_URL: "http://127.0.0.1:" + stubPort, N8N_WEBHOOK_SECRET: secret, N8N_CALLBACK_SECRET: callbackSecret, N8N_APPROVED_WEBHOOK_URL: "", NODE_ENV: "production" }, stdio: ["ignore", "pipe", "pipe"],
});
let logs = ""; child.stdout.on("data", (chunk) => logs += chunk); child.stderr.on("data", (chunk) => logs += chunk);
async function post(route: string, body: unknown, key = randomUUID()) {
  const response = await fetch(origin + route, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
const html = (route: string) => fetch(origin + route).then((response) => response.text());
async function callback(body: unknown, credential: string | undefined = callbackSecret) {
  const result = await fetch(origin + "/api/webhooks/generation-complete", { method: "POST", headers: { "Content-Type": "application/json", ...(credential ? { "x-campaign-callback-secret": credential } : {}) }, body: JSON.stringify(body) });
  return { status: result.status, body: await result.json() };
}
try {
  for (let attempt = 0; ; attempt++) {
    try { const response = await fetch(origin); if (response.ok) break; } catch {}
    if (attempt > 60 || child.exitCode !== null) throw new Error("Production server failed to start:\n" + logs);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.equal((await fetch("http://127.0.0.1:" + stubPort, { method: "POST", body: "{}" })).status, 401);
  assert.equal((await fetch(origin + "/api/briefs", { method: "POST", headers: { Origin: "http://evil.test", "Content-Type": "application/json" }, body: "{}" })).status, 403);
  const foreignHostStatus = await new Promise<number | undefined>((resolve, reject) => {
    const request = httpRequest(origin, { headers: { Host: "evil.test" } }, (response) => { response.resume(); resolve(response.statusCode); });
    request.on("error", reject); request.end();
  });
  assert.equal(foreignHostStatus, 403);
  assert.equal((await fetch(origin + "/api/briefs", { method: "POST", headers: { Origin: origin }, body: "{" })).status, 400);
  assert.equal((await post("/api/briefs", null)).status, 422);
  const name = "Freshness-" + randomUUID(), key = randomUUID(), input = { ...brief, businessName: name };
  const [created, duplicate] = await Promise.all([post("/api/briefs", input, key), post("/api/briefs", input, key)]);
  assert.equal(created.body.id, duplicate.body.id); assert.equal(calls, 1); assert.equal(store.listBriefs().length, 1);
  const id = created.body.id as string;
  const callbackEnvelope = { ok: true, contractVersion: 1, briefId: id, attemptId: store.getBrief(id)!.attempts[0].id, plan: createDemoPlan(input) };
  const beforeCallbacks = store.getBrief(id)!;
  assert.equal((await callback(callbackEnvelope, "")).status, 401);
  assert.equal((await callback(callbackEnvelope, "wrong")).status, 401);
  assert.equal((await callback({ ...callbackEnvelope, contractVersion: 999 })).status, 422);
  assert.equal((await callback({ ...callbackEnvelope, plan: {} })).status, 422);
  assert.equal((await callback(callbackEnvelope)).body.disposition, "ignored_stale");
  assert.equal((await callback({ ok: false, contractVersion: 1, briefId: id, attemptId: callbackEnvelope.attemptId, error: { code: "late_error", message: "Late error must not replace success." } })).body.disposition, "ignored_stale");
  assert.deepEqual(store.getBrief(id), beforeCallbacks);
  assert.match(await html("/"), new RegExp(name));
  assert.match(await html("/review"), new RegExp(id));
  assert.equal((await post("/api/briefs", { ...input, offer: "Changed" }, key)).status, 409);
  const current = () => store.getBrief(id)!;
  assert.equal((await post("/api/briefs/" + id + "/review", { version: current().version, decision: ["Approved"], note: "" })).status, 422);
  const requested = await post("/api/briefs/" + id + "/review", { version: current().version, decision: "Revision requested", note: "Update offer" });
  assert.equal(requested.status, 200);
  assert.match(await html("/briefs/" + id), /Revise and resubmit/);
  const revised = await post("/api/briefs/" + id + "/revision", { version: current().version, brief: { ...input, offer: "Revised approved offer" }, instructions: "Update offer and respect constraints" });
  assert.equal(revised.status, 200); assert.equal(current().revisions.length, 2); assert.equal(current().plans.length, 2);
  assert.match(await html("/briefs/" + id), /Revised approved offer/);
  assert.equal((await post("/api/briefs/" + id + "/review", { version: current().version, decision: "Approved", note: "" })).status, 200);
  assert.match(await html("/"), /Approved/); assert.doesNotMatch(await html("/review"), new RegExp(id));
  assert.equal((await post("/api/briefs/" + id + "/retry", { version: current().version })).status, 409);
  failNext = true;
  const failed = await post("/api/briefs", { ...brief, businessName: "Retry fixture" });
  assert.equal(failed.status, 201); assert.ok(failed.body.id);
  assert.equal(store.getBrief(failed.body.id)!.status, "Failed");
  assert.match(store.getBrief(failed.body.id)!.attempts[0].error!, /http_error/);
  const failedId = failed.body.id as string, version = store.getBrief(failedId)!.version, retryKey = randomUUID(), beforeRetry = calls;
  assert.match(await html("/briefs/" + failedId), /Retry generation/);
  const retries = await Promise.all([post("/api/briefs/" + failedId + "/retry", { version }, retryKey), post("/api/briefs/" + failedId + "/retry", { version }, retryKey)]);
  assert.ok(retries.every((result) => result.status === 200)); assert.equal(calls, beforeRetry + 1);
  assert.equal(store.getBrief(failedId)!.attempts.length, 2);
  assert.equal((await post("/api/briefs/" + failedId + "/review", { version: store.getBrief(failedId)!.version, decision: "Rejected", note: "Not suitable" })).status, 200);
  assert.match(await html("/"), /Rejected/); assert.doesNotMatch(await html("/review"), new RegExp(failedId));
  console.log("PASS production freshness, revision/resubmission, approval/rejection, failure callback/retry, duplicate prevention, strict authenticated callback envelopes, stale results, malformed input, Host/Origin guards and simulated exported-workflow round trip.");
  console.log("No real n8n/Groq request was made.");
} catch (error) { console.error(logs); throw error; }
finally {
  child.kill(); if (child.exitCode === null) await once(child, "exit");
  await new Promise<void>((resolve) => stub.close(() => resolve()));
  store.close(); fs.rmSync(directory, { recursive: true, force: true });
}
