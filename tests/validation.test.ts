import test from "node:test";
import assert from "node:assert/strict";
import { validateBrief, validatePlan } from "../src/lib/validation.ts";
import { brief, plan } from "./fixtures.ts";
test("normalizes typed input and rejects malformed bodies, unknown keys and blank channels", () => {
  assert.deepEqual(validateBrief({ ...brief, channels: "Email, LinkedIn" }).brief.channels, ["Email", "LinkedIn"]);
  for (const value of [null, [], 3, "text", { ...brief, extra: true }, { ...brief, offer: {} }, { ...brief, sourceMaterial: 1 }, { ...brief, channels: ["Email", 1] }, { ...brief, channels: ["Email", " "] }]) assert.equal(validateBrief(value).valid, false);
});
test("plan contract rejects every missing section, wrong type, blank nested field and wrong count", () => {
  assert.equal(validatePlan(plan()).valid, true);
  for (const key of Object.keys(plan())) { const value = { ...plan() } as Record<string, unknown>; delete value[key]; assert.equal(validatePlan(value).valid, false, key); }
  const invalid = [null, [], { ...plan(), extra: 1 }, { ...plan(), confidence: ["high"] }, { ...plan(), landingPageOutline: [] }, { ...plan(), messagingAngles: [] }, { ...plan(), sevenDayContentPlan: plan().sevenDayContentPlan.slice(1) }, { ...plan(), assumptions: [" "] }, { ...plan(), audienceInsights: 1 }];
  for (const value of invalid) assert.equal(validatePlan(value).valid, false);
  for (const key of ["messagingAngles", "landingPageOutline", "sevenDayContentPlan"] as const) {
    for (const field of Object.keys(plan()[key][0])) { const value = plan(); Object.assign(value[key][0], { [field]: " " }); assert.equal(validatePlan(value).valid, false); }
    const value = plan(); Object.assign(value[key][0], { unexpected: "value" }); assert.equal(validatePlan(value).valid, false);
  }
});
