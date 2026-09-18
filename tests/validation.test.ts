import test from "node:test"; import assert from "node:assert/strict"; import { validateBrief, validatePlan } from "../src/lib/validation.ts";
const brief = { businessName: "Northstar", industry: "Software", targetAudience: "Small teams", offer: "A free audit", objective: "Generate leads", brandVoice: "Clear", channels: "Email, LinkedIn", constraints: "No unverified claims." };
test("brief validation identifies required inputs", () => { const result = validateBrief({ ...brief, offer: "" }); assert.equal(result.valid, false); assert.ok(result.errors.offer); });
test("brief normalization trims channels", () => { const result = validateBrief(brief); assert.equal(result.valid, true); assert.deepEqual(result.brief.channels, ["Email", "LinkedIn"]); });
test("plan validation rejects incomplete structured output", () => { assert.equal(validatePlan({ briefSummary: "x" }).valid, false); });
