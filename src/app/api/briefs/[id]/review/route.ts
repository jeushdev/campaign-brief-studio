import { NextResponse } from "next/server";
import { reviewBrief } from "@/lib/store";
import { errorResponse, operationKey, readJson, requireLocalMutation } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guarded = requireLocalMutation(request);
  if (guarded) return guarded;

  const parsed = await readJson(request);
  if ("response" in parsed) return parsed.response;
  const body = parsed.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Review body must be an object." }, { status: 422 });
  }

  const value = body as Record<string, unknown>;
  if (
    !Number.isInteger(value.version) ||
    typeof value.decision !== "string" ||
    !["Approved", "Rejected", "Revision requested"].includes(value.decision) ||
    typeof value.note !== "string" ||
    (value.acknowledgeLowConfidence !== undefined && typeof value.acknowledgeLowConfidence !== "boolean") ||
    Object.keys(value).some((key) => !["version", "decision", "note", "acknowledgeLowConfidence"].includes(key))
  ) {
    return NextResponse.json({ error: "Valid review fields are required." }, { status: 422 });
  }

  try {
    const item = reviewBrief(
      (await params).id,
      value.version as number,
      value.decision as "Approved" | "Rejected" | "Revision requested",
      value.note,
      value.acknowledgeLowConfidence === true,
      operationKey(request)
    );

    if (value.decision === "Approved" && process.env.N8N_APPROVED_WEBHOOK_URL) {
      fetch(process.env.N8N_APPROVED_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-campaign-webhook-secret": process.env.N8N_WEBHOOK_SECRET || "",
        },
        body: JSON.stringify({ brief: item.brief, plan: item.plan }),
      }).catch(() => {});
    }

    return NextResponse.json(item);
  } catch (error) {
    return errorResponse(error);
  }
}
