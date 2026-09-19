"use client";

import { useState } from "react";
import type { CampaignPlan } from "@/lib/types";

export function formatPlanMarkdown(plan: CampaignPlan): string {
  const lines: string[] = [
    "# Campaign Plan",
    "",
    `**Confidence:** ${plan.confidence}`,
    "",
    "## Brief Summary",
    plan.briefSummary,
    "",
    "## Audience Insights",
    ...plan.audienceInsights.map((insight) => `- ${insight}`),
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
      `### ${item.day} - ${item.channel} (${item.format})`,
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
  ];

  return lines.join("\n");
}

export function ExportControls({ plan }: { plan: CampaignPlan }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const markdown = formatPlanMarkdown(plan);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <button type="button" onClick={handleCopy}>
        {copied ? "Copied!" : "Export Plan as Markdown"}
      </button>
    </div>
  );
}
