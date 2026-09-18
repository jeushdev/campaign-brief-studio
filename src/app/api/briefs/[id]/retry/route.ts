import { NextResponse } from "next/server";
import { createDemoPlan } from "@/lib/demo-plan";
import { beginGeneration, failBrief, getBrief, saveGeneratedPlan } from "@/lib/store";
import { requestCampaignPlan } from "@/lib/webhook";

export const runtime = "nodejs";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const current = await getBrief(id);
  if (!current) return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  if (!["Failed", "Revision requested"].includes(current.status)) return NextResponse.json({ error: "Only failed or revision-requested briefs can be generated." }, { status: 409 });
  try { await beginGeneration(id, current.status === "Failed" ? "Retry started" : "Revision resubmitted"); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start generation." }, { status: 409 }); }
  if (!process.env.N8N_WEBHOOK_URL) { const saved = await saveGeneratedPlan(id, createDemoPlan(current.brief), "Demo"); return NextResponse.json({ id: saved?.id, mode: "demo" }); }
  const result = await requestCampaignPlan(id, current.brief);
  if (!result.ok || !result.plan) { await failBrief(id, result.error ?? "No valid plan returned."); return NextResponse.json({ id, error: result.error }, { status: 502 }); }
  const saved = await saveGeneratedPlan(id, result.plan, "Webhook"); return NextResponse.json({ id: saved?.id, mode: "webhook" });
}
