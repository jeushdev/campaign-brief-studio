import type { CampaignBrief, CampaignPlan } from "./types.ts";
import { CONTRACT_VERSION } from "./schema.ts";
import { validatePlan } from "./validation.ts";
export async function requestCampaignPlan(briefId: string, attemptId: string, brief: CampaignBrief, revisionInstructions?: string): Promise<{ ok: boolean; plan?: CampaignPlan; error?: string }> {
  const url = process.env.N8N_WEBHOOK_URL, secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, error: "Both N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET are required." };
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-campaign-webhook-secret": secret }, body: JSON.stringify({ contractVersion: CONTRACT_VERSION, briefId, attemptId, brief, ...(revisionInstructions ? { revisionInstructions } : {}) }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(45_000) });
    let value: unknown;
    try { value = await response.json(); } catch { return { ok: false, error: "Webhook returned unreadable JSON (HTTP " + response.status + ")." }; }
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Invalid webhook response." };
    const result = value as Record<string, unknown>;
    if (result.contractVersion !== CONTRACT_VERSION || result.briefId !== briefId || result.attemptId !== attemptId) return { ok: false, error: "Webhook response does not match this contract and generation attempt (HTTP " + response.status + ")." };
    if (!response.ok || result.ok !== true) {
      const error = result.error as { code?: unknown; message?: unknown } | undefined;
      return { ok: false, error: typeof error?.code === "string" && typeof error.message === "string" ? error.code + ": " + error.message : "Webhook failed (HTTP " + response.status + ")." };
    }
    const check = validatePlan(result.plan);
    return check.valid ? { ok: true, plan: check.plan } : { ok: false, error: "Invalid workflow output: " + check.errors.join("; ") };
  } catch (error) {
    return { ok: false, error: error instanceof Error && error.name === "TimeoutError" ? "Webhook timed out after 45 seconds." : "Webhook connection failed. Check the URL, workflow, and credentials." };
  }
}
