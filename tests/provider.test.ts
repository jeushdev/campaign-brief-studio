import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
import { buildProviderRequest, parseProviderResponse } from "../src/lib/provider-contract.ts";
import { buildWorkflow } from "../scripts/workflow.ts";
import { brief, plan } from "./fixtures.ts";
const context = { contractVersion: 1, briefId: "test-brief", attemptId: "test-attempt", brief, revisionInstructions: "Use revised inputs" };
const raw = (value: unknown = plan()) => ({ status: "completed", output: [{ type: "reasoning" }, { type: "message", status: "completed", content: [{ type: "output_text", text: JSON.stringify(value) }] }] });
test("provider adapter uses strict object body and rejects unsupported providers", () => {
  const request = buildProviderRequest("openai", "gpt-4.1-mini", context);
  assert.equal(request.text.format.strict, true);
  assert.match(request.input[1].content, /Use revised inputs/);
  assert.throws(() => buildProviderRequest("claude", "some-model", context), /Unsupported/);
  assert.throws(() => buildProviderRequest("openai", "gpt-4.1-mini", { ...context, brief: { ...brief, channels: [] } }), /item count/);
});
test("raw Responses extraction handles all content and failure paths", () => {
  assert.deepEqual(parseProviderResponse(raw()), { ok: true, plan: plan() });
  const errors: [unknown, string][] = [
    [{ statusCode: 429, body: { error: {} } }, "http_error"],
    [{ error: "ETIMEDOUT" }, "timeout"], [{ error: "connection refused" }, "transport_error"],
    [{ statusCode: 200, body: { error: { message: "bad" } } }, "provider_error"],
    [{ ...raw(), status: "incomplete", incomplete_details: { reason: "max_output_tokens" } }, "incomplete"],
    [{ ...raw(), output: [{ type: "message", content: [{ type: "refusal", refusal: "No" }] }] }, "refusal"],
    [{ ...raw(), output: [{ type: "message", content: [{ type: "output_text", text: "{" }] }] }, "invalid_json"],
    [{ ...raw(), output: [] }, "invalid_response"], [raw({ ...plan(), landingPageOutline: [] }), "invalid_plan"],
    [raw({ ...plan(), messagingAngles: "wrong" }), "invalid_plan"],
  ];
  for (const [value, code] of errors) { const result = parseProviderResponse(value); assert.equal(result.ok, false); if (!result.ok) assert.equal(result.error.code, code); }
});
test("exported n8n node code executes shared validation and fixture round trip", () => {
  const workflow = JSON.parse(fs.readFileSync("n8n/campaign-brief-studio.json", "utf8"));
  assert.deepEqual(workflow, buildWorkflow());
  const node = (name: string) => workflow.nodes.find((item: { name: string }) => item.name === name) as unknown as { parameters: { authentication: string; options: { timeout: number }; jsonBody: string; jsCode: string }; onError: string };
  assert.equal(node("Campaign webhook").parameters.authentication, "headerAuth");
  assert.equal(node("OpenAI response").parameters.authentication, "genericCredentialType");
  assert.equal(node("OpenAI response").parameters.options.timeout, 35000);
  assert.equal(node("OpenAI response").onError, "continueRegularOutput");
  assert.equal(node("OpenAI response").parameters.jsonBody, "={{ $json.request }}");
  const prepare = (body: unknown) => vm.runInNewContext("(function(){" + node("Prepare request").parameters.jsCode + "})()", { $json: { body } })[0].json;
  const prepared = prepare(context);
  assert.equal(prepared.request.text.format.strict, true);
  assert.equal(prepare({ ...context, brief: null }).statusCode, 422);
  const execute = (response: unknown) => vm.runInNewContext("(function(){" + node("Validate response").parameters.jsCode + "})()", { $json: response, $: () => ({ first: () => ({ json: prepared }) }) })[0].json;
  const result = execute({ statusCode: 200, body: raw() });
  assert.equal(result.statusCode, 200); assert.equal(result.body.attemptId, context.attemptId);
  assert.deepEqual(JSON.parse(JSON.stringify(result.body.plan)), plan());
  assert.equal(execute({ error: "ESOCKETTIMEDOUT" }).statusCode, 504);
  assert.equal(execute({ statusCode: 200, body: raw({ ...plan(), risks: [] }) }).body.error.code, "invalid_plan");
});
