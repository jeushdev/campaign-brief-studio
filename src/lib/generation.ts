import { createDemoPlan } from "./demo-plan";
import { completeAttempt, failAttempt, getBrief } from "./store";
import { requestCampaignPlan } from "./webhook";
export async function runGeneration(briefId: string, attemptId: string) {
  try {
    const current = getBrief(briefId);
    const attempt = current?.attempts.find((item) => item.id === attemptId);
    const revision = current?.revisions.find((item) => item.id === attempt?.revisionId);
    if (!current || !attempt || !revision) throw new Error("Generation attempt could not be loaded.");
    if (!process.env.N8N_WEBHOOK_URL) {
      const demo = createDemoPlan(revision.brief);
      if (revision.instructions) demo.assumptions.push("Revision instructions supplied for review: " + revision.instructions);
      completeAttempt(briefId, attemptId, demo, "Demo"); return { mode: "demo" as const };
    }
    const result = await requestCampaignPlan(briefId, attemptId, revision.brief, revision.instructions);
    if (!result.ok || !result.plan) throw new Error(result.error ?? "No valid plan returned.");
    completeAttempt(briefId, attemptId, result.plan, "Webhook"); return { mode: "webhook" as const };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Generation failed.";
    try { failAttempt(briefId, attemptId, detail); } catch { /* A newer attempt may already own the brief. Never overwrite it. */ }
    return { error: detail };
  }
}
