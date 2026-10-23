import type { CampaignPlan } from "./types";

export type ExportMetadata = { businessName?: string; revision?: number; status?: string };

function metadataLines(metadata: ExportMetadata = {}) {
  return [
    `**Business:** ${metadata.businessName?.trim() || "Campaign"}`,
    `**Revision:** ${metadata.revision ?? 1}`,
    `**Status:** ${metadata.status?.trim() || "Draft"}`,
  ];
}

export function formatPlanMarkdown(plan: CampaignPlan, metadata: ExportMetadata = {}): string {
  return [
    "# Campaign Plan",
    "",
    ...metadataLines(metadata),
    `**Confidence:** ${plan.confidence}`,
    "",
    "## Brief Summary",
    plan.briefSummary,
    "",
    "## Audience Insights",
    ...plan.audienceInsights.map((item) => `- ${item}`),
    "",
    "## Messaging Angles",
    ...plan.messagingAngles.flatMap((angle) => [
      `### ${angle.title}`,
      `- **Rationale:** ${angle.rationale}`,
      `- **Sample:** ${angle.sample}`,
      "",
    ]),
    "## Landing Page Outline",
    ...plan.landingPageOutline.map((item) => `- **${item.section}:** ${item.purpose}`),
    "",
    "## 7-Day Content Plan",
    ...plan.sevenDayContentPlan.flatMap((item) => [
      `### ${item.day} — ${item.channel} (${item.format})`,
      `- **Topic:** ${item.topic}`,
      `- **CTA:** ${item.CTA}`,
      "",
    ]),
    "## Assumptions",
    ...plan.assumptions.map((item) => `- ${item}`),
    "",
    "## Risks",
    ...plan.risks.map((item) => `- ${item}`),
    "",
    "## Review Questions",
    ...plan.reviewQuestions.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function protectSpreadsheetFormula(value: string) {
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string) {
  const safe = protectSpreadsheetFormula(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function formatPlanCsv(plan: CampaignPlan, metadata: ExportMetadata = {}): string {
  const businessName = metadata.businessName?.trim() || "Campaign";
  const revision = String(metadata.revision ?? 1);
  const status = metadata.status?.trim() || "Draft";
  const rows = [
    ["Campaign", "Revision", "Status", "Confidence", "Day", "Channel", "Format", "Topic", "Call to action"],
    ...plan.sevenDayContentPlan.map((item) => [businessName, revision, status, plan.confidence, item.day, item.channel, item.format, item.topic, item.CTA]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function exportFileStem(businessName?: string) {
  const slug = (businessName || "campaign-plan")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || "campaign-plan";
}
