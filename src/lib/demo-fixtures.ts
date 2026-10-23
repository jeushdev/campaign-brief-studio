import { createDemoPlan } from "./demo-plan.ts";
import type { CampaignBrief, CampaignPlan } from "./types";

export type DemoStatus = "Draft" | "Needs review" | "Revision requested" | "Approved" | "Rejected";
export type DemoHistoryItem = { action: string; detail: string; at: string };
export type DemoCase = {
  id: "normal" | "low-confidence" | "revision";
  title: string;
  description: string;
  status: DemoStatus;
  revision: number;
  brief: CampaignBrief;
  plan: CampaignPlan;
  revisionNote: string;
  history: DemoHistoryItem[];
  previousPlans?: { revision: number; plan: CampaignPlan; brief: CampaignBrief; note: string }[];
};

export function canEditDemo(status: DemoStatus) {
  return status === "Draft" || status === "Revision requested";
}

export function canGenerateDemo(status: DemoStatus) {
  return status === "Draft";
}

export function canRequestRevision(status: DemoStatus, note: string) {
  return status === "Needs review" && note.trim().length >= 8;
}

export function parseDemoChannels(input: string) {
  return input.split(",").map((channel) => channel.trim()).filter(Boolean);
}

export function canApproveDemo(status: DemoStatus, confidence: CampaignPlan["confidence"], acknowledged: boolean, note: string) {
  return status === "Needs review" && (confidence !== "low" || (acknowledged && note.trim().length >= 8));
}

export function canRejectDemo(status: DemoStatus, note: string) {
  return status === "Needs review" && note.trim().length >= 8;
}

export function canExportDemo(status: DemoStatus) {
  return status === "Approved";
}

const normalBrief: CampaignBrief = {
  businessName: "Harborlight Coffee",
  industry: "Coffee shop",
  targetAudience: "people who work or study near the waterfront",
  offer: "a weekday coffee and pastry pairing",
  objective: "Encourage weekday visits",
  brandVoice: "Warm, neighborly, and clear",
  channels: ["Instagram", "Email"],
  constraints: "Confirm menu availability and prices before publishing.",
  sourceMaterial: "Fictional example business and offer created for this demonstration.",
};

const lowConfidenceBrief: CampaignBrief = {
  businessName: "Northline Movement Studio",
  industry: "Wellness studio",
  targetAudience: "adults returning to a regular movement routine",
  offer: "an introductory small-group session",
  objective: "Invite class enquiries",
  brandVoice: "Supportive, grounded, and practical",
  channels: ["LinkedIn", "Email"],
  constraints: "Do not promise health outcomes or imply medical advice.",
  sourceMaterial: "Fictional example. No instructor credentials or outcomes are asserted.",
};

const revisionBrief: CampaignBrief = {
  businessName: "Paper & Pine Studio",
  industry: "Professional services",
  targetAudience: "independent shops preparing a seasonal product launch",
  offer: "a 45-minute campaign planning session",
  objective: "Book planning enquiries",
  brandVoice: "Thoughtful, specific, and encouraging",
  channels: ["Email", "LinkedIn"],
  constraints: "State session length clearly and avoid guaranteed sales outcomes.",
  sourceMaterial: "Fictional example business created for this demonstration.",
};

function planFor(brief: CampaignBrief, confidence: CampaignPlan["confidence"] = "medium") {
  return { ...createDemoPlan(brief), confidence };
}

export function createDemoCases(): DemoCase[] {
  const oldPlan = planFor(revisionBrief, "medium");
  const previousRevisionPlan = planFor({ ...revisionBrief, offer: "a 60-minute seasonal launch planning session" }, "medium");
  const lowPlan = planFor(lowConfidenceBrief, "low");
  return [
    {
      id: "normal",
      title: "Weekday visits",
      description: "A straightforward local campaign ready for review.",
      status: "Needs review",
      revision: 1,
      brief: { ...normalBrief, channels: [...normalBrief.channels] },
      plan: planFor(normalBrief),
      revisionNote: "",
      history: [
        { action: "Brief submitted", detail: "The sample brief was checked and normalized.", at: "Example record" },
        { action: "Plan prepared", detail: "A deterministic fictional plan is ready for human review.", at: "Example record" },
      ],
    },
    {
      id: "low-confidence",
      title: "Introductory session",
      description: "A cautious draft with limited audience evidence and an explicit approval safeguard.",
      status: "Needs review",
      revision: 1,
      brief: { ...lowConfidenceBrief, channels: [...lowConfidenceBrief.channels] },
      plan: lowPlan,
      revisionNote: "",
      history: [
        { action: "Brief submitted", detail: "The example contains no connected audience research.", at: "Example record" },
        { action: "Plan prepared", detail: "Confidence is marked low to demonstrate the additional review step.", at: "Example record" },
      ],
    },
    {
      id: "revision",
      title: "Seasonal planning session",
      description: "A prior revision request is preserved so the updated brief can be resubmitted.",
      status: "Revision requested",
      revision: 2,
      brief: { ...revisionBrief, channels: [...revisionBrief.channels] },
      plan: oldPlan,
      revisionNote: "Please make the session length and intended audience clearer. Keep the copy free of guaranteed sales results.",
      history: [
        { action: "Brief submitted", detail: "The initial fictional brief was checked.", at: "Earlier example" },
        { action: "Plan prepared", detail: "Revision 1 was generated from the original brief.", at: "Earlier example" },
        { action: "Revision requested", detail: "Please clarify session length and intended audience; avoid guaranteed sales results.", at: "Earlier example" },
      ],
      previousPlans: [{ revision: 1, plan: previousRevisionPlan, brief: { ...revisionBrief, offer: "a 60-minute seasonal launch planning session" }, note: "Please make the session length and intended audience clearer. Keep the copy free of guaranteed sales results." }],
    },
  ];
}
