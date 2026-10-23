import { timingSafeEqual } from "node:crypto";
import { CONTRACT_VERSION, CAMPAIGN_PLAN_JSON_SCHEMA, validateSchema } from "./schema.ts";
import { ConflictError, NotFoundError } from "./sqlite-store.ts";
import { readBoundedJson, RequestBodyError } from "./body-reader.ts";
import type { CampaignPlan } from "./types.ts";

type CallbackStore = {
  completeAttempt: (briefId: string, attemptId: string, plan: CampaignPlan, mode: "webhook") => unknown;
  failAttempt: (briefId: string, attemptId: string, message: string) => unknown;
};
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, maximum: number): value is string => typeof value === "string" && !!value.trim() && value.length <= maximum;
/** Reject the entire envelope before any mutation, including mixed success/error fields. */
export function validCallback(body: unknown): body is { contractVersion: number; briefId: string; attemptId: string } & ({ ok: true; plan: CampaignPlan } | { ok: false; error: { code: string; message: string } }) {
  if (!record(body) || body.contractVersion !== CONTRACT_VERSION || !text(body.briefId, 200) || !text(body.attemptId, 200) || typeof body.ok !== "boolean") return false;
  const keys = ["ok", "contractVersion", "briefId", "attemptId", body.ok ? "plan" : "error"];
  if (Object.keys(body).length !== keys.length || Object.keys(body).some((key) => !keys.includes(key))) return false;
  if (body.ok) return validateSchema(body.plan, CAMPAIGN_PLAN_JSON_SCHEMA, "plan").length === 0;
  return record(body.error) && Object.keys(body.error).length === 2 && text(body.error.code, 100) && text(body.error.message, 8000);
}
export async function handleGenerationCallback(request: Request, store: CallbackStore, configuration: Record<string, string | undefined> = process.env): Promise<Response> {
  const secret = configuration.N8N_CALLBACK_SECRET;
  if (!configuration.N8N_WEBHOOK_URL || !secret?.trim() || secret === configuration.N8N_WEBHOOK_SECRET) {
    return Response.json({ ok: false, error: "Generation callbacks are not configured." }, { status: 503 });
  }
  const provided = Buffer.from(request.headers.get("x-campaign-callback-secret") ?? "");
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return Response.json({ ok: false, error: "Unauthorized callback." }, { status: 401 });
  let body: unknown;
  try { body = await readBoundedJson(request); }
  catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ ok: false, error: error.message }, { status: error.status });
    throw error;
  }
  if (!validCallback(body)) return Response.json({ ok: false, error: "Invalid generation callback envelope or contract version." }, { status: 422 });
  try {
    if (body.ok) store.completeAttempt(body.briefId, body.attemptId, body.plan, "webhook");
    else store.failAttempt(body.briefId, body.attemptId, body.error.code + ": " + body.error.message);
    return Response.json({ ok: true, disposition: "applied" });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) return Response.json({ ok: true, disposition: "ignored_stale" });
    console.error("Generation callback storage failed:", error);
    return Response.json({ ok: false, error: "Callback storage failed. Retry delivery and check the server log." }, { status: 500 });
  }
}
