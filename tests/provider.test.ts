import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
import { buildProviderRequest, parseProviderResponse } from "../src/lib/provider-contract.ts";
import { buildWorkflow } from "../scripts/workflow.ts";
import { brief, plan } from "./fixtures.ts";
const context = { contractVersion: 1, briefId: "test-brief", attemptId: "test-attempt", brief, revisionInstructions: "Use revised inputs" };
const raw = (value: unknown = plan()) => ({ choices: [{ message: { content: JSON.stringify(value) }, finish_reason: "stop" }] });
test("provider adapter uses strict object body and rejects unsupported providers", () => {
  const request = buildProviderRequest("groq", "openai/gpt-oss-120b", context);
  assert.equal(request.response_format.json_schema.strict, true);
  assert.match(request.messages[1].content, /Use revised inputs/);
  assert.throws(() => buildProviderRequest("claude", "some-model", context), /Unsupported/);
  assert.throws(() => buildProviderRequest("openai", "gpt-4.1-mini", context), /Unsupported/);
  assert.throws(() => buildProviderRequest("groq", "openai/gpt-oss-120b", { ...context, brief: { ...brief, channels: [] } }), /item count/);
});
test("raw Responses extraction handles all content and failure paths", () => {
  assert.deepEqual(parseProviderResponse(raw()), { ok: true, plan: plan() });
  const errors: [unknown, string][] = [
    [{ statusCode: 429, body: { error: {} } }, "http_error"],
    [{ error: "ETIMEDOUT" }, "timeout"], [{ error: "connection refused" }, "transport_error"],
    [{ statusCode: 200, body: { error: { message: "bad" } } }, "provider_error"],
    [{ choices: [{ message: { content: JSON.stringify(plan()) }, finish_reason: "length" }] }, "incomplete"],
    [{ choices: [{ message: { content: "" }, finish_reason: "content_filter" }] }, "refusal"],
    [{ choices: [{ message: { content: "{" }, finish_reason: "stop" }] }, "invalid_json"],
    [{ choices: [] }, "invalid_response"], [raw({ ...plan(), landingPageOutline: [] }), "invalid_plan"],
    [raw({ ...plan(), messagingAngles: "wrong" }), "invalid_plan"],
  ];
  for (const [value, code] of errors) { const result = parseProviderResponse(value); assert.equal(result.ok, false); if (!result.ok) assert.equal(result.error.code, code); }
});
test("exported n8n node code executes shared validation and fixture round trip", () => {
  const workflow = JSON.parse(fs.readFileSync("n8n/campaign-brief-studio.json", "utf8"));
  assert.deepEqual(workflow, buildWorkflow());
  const node = (name: string) => workflow.nodes.find((item: { name: string }) => item.name === name) as unknown as { parameters: { authentication: string; options: { timeout: number }; jsonBody: string; jsCode: string }; onError: string };
  assert.equal(node("Campaign webhook").parameters.authentication, "headerAuth");
  assert.equal(node("Groq response").parameters.authentication, "genericCredentialType");
  assert.equal(node("Groq response").parameters.options.timeout, 35000);
  assert.equal(node("Groq response").onError, "continueRegularOutput");
  assert.equal(node("Groq response").parameters.jsonBody, "={{ $json.request }}");
  const prepare = (body: unknown) => vm.runInNewContext("(function(){" + node("Prepare request").parameters.jsCode + "})()", { $json: { body } })[0].json;
  const prepared = prepare(context);
  assert.equal(prepared.request.response_format.json_schema.strict, true);
  assert.equal(prepare({ ...context, brief: null }).statusCode, 422);
  const execute = (response: unknown) => vm.runInNewContext("(function(){" + node("Validate response").parameters.jsCode + "})()", { $json: response, $: () => ({ first: () => ({ json: prepared }) }) })[0].json;
  const result = execute({ statusCode: 200, body: raw() });
  assert.equal(result.statusCode, 200); assert.equal(result.body.attemptId, context.attemptId);
  assert.deepEqual(JSON.parse(JSON.stringify(result.body.plan)), plan());
  assert.equal(execute({ error: "ESOCKETTIMEDOUT" }).statusCode, 504);
  assert.equal(execute({ statusCode: 200, body: raw({ ...plan(), risks: [] }) }).body.error.code, "invalid_plan");
});
