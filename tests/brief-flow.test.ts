import test from "node:test";
import assert from "node:assert/strict";
import { createDemoCases } from "../src/lib/demo-fixtures.ts";
import { BRIEF_STEPS, briefInputErrors, firstBriefErrorStep, restoredBriefStep, stepForBriefField } from "../src/lib/brief-flow.ts";

const valid = createDemoCases()[0].brief;

test("guided flow routes validation to the earliest incomplete input step", () => {
  const brief = { ...valid, businessName: "", offer: "", channels: [], constraints: "" };
  assert.equal(firstBriefErrorStep(briefInputErrors(brief)), 0);
  brief.businessName = valid.businessName;
  assert.equal(firstBriefErrorStep(briefInputErrors(brief)), 1);
  brief.offer = valid.offer;
  const remaining = briefInputErrors(brief);
  assert.equal(firstBriefErrorStep(remaining), 2);
  assert.deepEqual(Object.keys(remaining).sort(), ["channels", "constraints"]);
  assert.ok(Object.keys(remaining).every((field) => stepForBriefField(field) === 2));
});

test("every required brief field has a visible input step; optional context and global errors remain reachable", () => {
  for (const field of Object.keys(briefInputErrors({}))) assert.ok(stepForBriefField(field) < 3, field);
  assert.equal(stepForBriefField("sourceMaterial"), 2);
  assert.equal(stepForBriefField("form"), 3);
  assert.equal(stepForBriefField("unexpected"), 3);
  assert.equal(BRIEF_STEPS.length, 4);
});

test("revision instructions are separate from the strict brief schema and belong to Campaign", () => {
  assert.deepEqual(briefInputErrors(valid), {});
  assert.deepEqual(briefInputErrors(valid, "Clarify the offer duration."), {});
  const errors = briefInputErrors(valid, "   ");
  assert.deepEqual(Object.keys(errors), ["instructions"]);
  assert.equal(firstBriefErrorStep(errors), 1);
  assert.ok(briefInputErrors({ ...valid, instructions: "Extra brief key" }).instructions);
});

test("old drafts and invalid saved positions start safely; valid progress restores", () => {
  for (const value of [undefined, null, "2", -1, 4, 1.5, NaN]) assert.equal(restoredBriefStep(value), 0);
  for (let step = 0; step < 4; step++) assert.equal(restoredBriefStep(step), step);
});
