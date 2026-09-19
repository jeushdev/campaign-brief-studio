import { NextResponse } from "next/server";
import { validatePlan } from "@/lib/validation";
import { completeAttempt, failAttempt } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const briefId = typeof body?.briefId === "string" ? body.briefId : "";
  const attemptId = typeof body?.attemptId === "string" ? body.attemptId : "";

  if (!briefId || !attemptId) {
    return NextResponse.json({ ok: false, error: "briefId and attemptId are required." }, { status: 400 });
  }

  if (body.ok === true) {
    const check = validatePlan(body.plan);
    if (check.valid && check.plan) {
      try {
        completeAttempt(briefId, attemptId, check.plan, "webhook");
      } catch {
        // Attempt or brief may have changed or been superseded
      }
      return NextResponse.json({ ok: true });
    }

    const errorMessage = "Invalid campaign plan: " + check.errors.join("; ");
    try {
      failAttempt(briefId, attemptId, errorMessage, "webhook");
    } catch {}
    return NextResponse.json({ ok: true });
  }

  const errorObj = body.error as { code?: unknown; message?: unknown } | undefined;
  const errorMessage =
    typeof errorObj?.message === "string"
      ? errorObj.message
      : typeof body.error === "string"
      ? body.error
      : "Generation failed.";

  try {
    failAttempt(briefId, attemptId, errorMessage, "webhook");
  } catch {}

  return NextResponse.json({ ok: true });
}
