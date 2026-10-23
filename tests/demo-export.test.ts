import test from "node:test";
import assert from "node:assert/strict";
import { canApproveDemo, canEditDemo, canExportDemo, canGenerateDemo, canRejectDemo, canRequestRevision, createDemoCases, parseDemoChannels } from "../src/lib/demo-fixtures.ts";
import { createDemoPlan } from "../src/lib/demo-plan.ts";
import { exportFileStem, formatPlanCsv, formatPlanMarkdown } from "../src/lib/plan-export.ts";
import type { CampaignPlan } from "../src/lib/types.ts";
import { brief } from "./fixtures.ts";

test("fictional cases cover normal, low-confidence and revision review states", () => {
  const cases = createDemoCases();
  assert.deepEqual(cases.map((item) => item.id), ["normal", "low-confidence", "revision"]);
  assert.equal(cases[1].plan.confidence, "low");
  assert.equal(cases[2].status, "Revision requested");
  assert.match(cases[2].revisionNote, /session length/);
  assert.equal(cases[2].history.at(-1)?.action, "Revision requested");
  assert.equal(cases[2].brief.offer, "a 45-minute campaign planning session");
  assert.equal(cases[2].previousPlans?.[0].brief.offer, "a 60-minute seasonal launch planning session");
  for (const item of cases) {
    assert.equal(item.plan.messagingAngles.length, 3);
    assert.equal(item.plan.sevenDayContentPlan.length, 7);
    assert.equal(item.brief.sourceMaterial?.includes("Fictional"), true);
  }
});

test("review safeguards require explicit low-confidence acknowledgment and export follows approval", () => {
  assert.equal(canEditDemo("Draft"), true);
  assert.equal(canEditDemo("Revision requested"), true);
  assert.equal(canEditDemo("Needs review"), false);
  assert.equal(canEditDemo("Approved"), false);
  assert.equal(canGenerateDemo("Draft"), true);
  assert.equal(canGenerateDemo("Needs review"), false);
  assert.equal(canRequestRevision("Needs review", "Please clarify the offer details."), true);
  assert.equal(canRequestRevision("Approved", "Please clarify the offer details."), false);
  assert.equal(canRequestRevision("Needs review", "Fix"), false);
  assert.equal(canApproveDemo("Needs review", "medium", false, ""), true);
  assert.equal(canApproveDemo("Needs review", "low", false, "Reviewed carefully"), false);
  assert.equal(canApproveDemo("Needs review", "low", true, "brief"), false);
  assert.equal(canApproveDemo("Needs review", "low", true, "Reviewed with the limits in mind"), true);
  assert.equal(canRejectDemo("Needs review", "Because"), false);
  assert.equal(canRejectDemo("Needs review", "The offer details are incomplete."), true);
  assert.equal(canApproveDemo("Revision requested", "medium", false, ""), false);
  assert.equal(canExportDemo("Needs review"), false);
  assert.equal(canExportDemo("Revision requested"), false);
  assert.equal(canExportDemo("Rejected"), false);
  assert.equal(canExportDemo("Approved"), true);
});

test("channel text stays parseable with a trailing delimiter until submission", () => {
  assert.deepEqual(parseDemoChannels("Email,"), ["Email"]);
  assert.deepEqual(parseDemoChannels("Email, LinkedIn,"), ["Email", "LinkedIn"]);
  assert.deepEqual(parseDemoChannels(" , , "), []);
});

test("deterministic plans use channel-appropriate formats and strategy varies by brief", () => {
  const emailPlan = createDemoPlan({ ...brief, channels: ["Email"] });
  const socialPlan = createDemoPlan({ ...brief, industry: "Coffee shop", channels: ["Instagram"] });
  assert.equal(emailPlan.sevenDayContentPlan.length, 7);
  assert.equal(emailPlan.sevenDayContentPlan.every((entry) => /email/i.test(entry.format)), true);
  assert.equal(socialPlan.sevenDayContentPlan.every((entry) => !/email/i.test(entry.format)), true);
  assert.notDeepEqual(emailPlan.messagingAngles.map((angle) => angle.title), socialPlan.messagingAngles.map((angle) => angle.title));
  assert.equal(socialPlan.messagingAngles.length, 3);
  assert.equal(socialPlan.landingPageOutline.length >= 5, true);
});

test("Markdown includes campaign, revision, and review metadata with the complete plan", () => {
  const plan = createDemoPlan(brief);
  const markdown = formatPlanMarkdown(plan, { businessName: "Test Studio", revision: 3, status: "Approved" });
  assert.match(markdown, /\*\*Business:\*\* Test Studio/);
  assert.match(markdown, /\*\*Revision:\*\* 3/);
  assert.match(markdown, /\*\*Status:\*\* Approved/);
  assert.match(markdown, /## Review Questions/);
  assert.equal((markdown.match(/^### Day /gm) ?? []).length, 7);
});

test("CSV includes metadata and quotes cells while neutralizing spreadsheet formulas", () => {
  const unsafePlan: CampaignPlan = {
    ...createDemoPlan(brief),
    sevenDayContentPlan: createDemoPlan(brief).sevenDayContentPlan.map((item, index) => index === 0
      ? { ...item, topic: "  =IMPORTXML(\"https://example.invalid\",\"//x\")", CTA: "-run" }
      : item),
  };
  const csv = formatPlanCsv(unsafePlan, { businessName: "=2+2", revision: 2, status: "Approved" });
  assert.match(csv, /"'=2\+2"/);
  assert.match(csv, /"'  =IMPORTXML\(""https:\/\/example\.invalid"",""\/\/x""\)"/);
  assert.match(csv, /"'-run"/);
  assert.match(csv, /^"Campaign","Revision","Status","Confidence","Day","Channel","Format","Topic","Call to action"/);
  assert.equal(csv.split(/\r\n/).filter((line) => line.includes('"Day ')).length, 7);
});

test("export filenames are normalized and bounded", () => {
  assert.equal(exportFileStem("Harborlight Coffee"), "harborlight-coffee");
  assert.equal(exportFileStem("💡"), "campaign-plan");
  assert.ok(exportFileStem("a".repeat(100)).length <= 64);
});
