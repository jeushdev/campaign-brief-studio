import type { CampaignBrief, CampaignPlan } from "./types.ts";
import { CONTRACT_VERSION } from "./schema.ts";
import { validateCallbackDestination } from "./callback-destination.ts";

export async function requestCampaignPlan(
  briefId: string,
  attemptId: string,
  brief: CampaignBrief,
  revisionInstructions?: string
): Promise<{ ok: boolean; plan?: CampaignPlan; error?: string; uncertain?: boolean }> {
  const url = process.env.N8N_WEBHOOK_URL, secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, error: "Both N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET are required." };
  if (!process.env.N8N_CALLBACK_SECRET?.trim() || process.env.N8N_CALLBACK_SECRET === secret) return { ok: false, error: "A separate N8N_CALLBACK_SECRET is required for authenticated callbacks." };
  const callbackUrl = (process.env.APP_URL || "http://localhost:3000") + "/api/webhooks/generation-complete";
  try { validateCallbackDestination(callbackUrl, callbackUrl); }
  catch { return { ok: false, error: "APP_URL must be the local app origin, without a path, query, or credentials." }; }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-campaign-webhook-secret": secret },
      body: JSON.stringify({
        contractVersion: CONTRACT_VERSION,
        briefId,
        attemptId,
        brief,
        callbackUrl,
        ...(revisionInstructions ? { revisionInstructions } : {}),
      }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      let detail = "Webhook failed (HTTP " + response.status + ").";
      try {
        const value = (await response.json()) as Record<string, unknown>;
        const error = value?.error as { code?: unknown; message?: unknown } | undefined;
        if (typeof error?.code === "string" && typeof error.message === "string") {
          detail = error.code + ": " + error.message;
        }
      } catch {}
      return { ok: false, error: detail };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      uncertain: true,
      error:
        error instanceof Error && error.name === "TimeoutError"
          ? "Webhook dispatch timed out; awaiting a callback until the attempt expires."
          : "Webhook dispatch could not be confirmed; awaiting a callback until the attempt expires.",
    };
  }
}
