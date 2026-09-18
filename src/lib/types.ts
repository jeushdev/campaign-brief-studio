export const STATUSES = ["Draft", "Submitted", "Generating", "Needs review", "Approved", "Rejected", "Revision requested", "Failed"] as const;
export type BriefStatus = (typeof STATUSES)[number];
export type CampaignBrief = { businessName: string; industry: string; targetAudience: string; offer: string; objective: string; brandVoice: string; channels: string[]; constraints: string; sourceMaterial?: string };
export type CampaignPlan = { briefSummary: string; audienceInsights: string[]; messagingAngles: { title: string; rationale: string; sample: string }[]; landingPageOutline: { section: string; purpose: string }[]; sevenDayContentPlan: { day: string; channel: string; format: string; topic: string; CTA: string }[]; assumptions: string[]; risks: string[]; reviewQuestions: string[]; confidence: "high" | "medium" | "low" };
export type Activity = { id: string; at: string; action: string; detail: string; reviewer?: string };
export type StoredBrief = { id: string; createdAt: string; updatedAt: string; status: BriefStatus; brief: CampaignBrief; plan?: CampaignPlan; reviewNote?: string; activities: Activity[] };
