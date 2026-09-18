import { NextResponse } from "next/server";
import { createAndStart } from "@/lib/store";
import { errorResponse, operationKey, readJson, requireLocalMutation } from "@/lib/http";
import { validateBrief } from "@/lib/validation";
import { runGeneration } from "@/lib/generation";
export const runtime = "nodejs";
export async function POST(request: Request) { const guarded = requireLocalMutation(request); if (guarded) return guarded; const parsed = await readJson(request); if ("response" in parsed) return parsed.response; const checked = validateBrief(parsed.body); if (!checked.valid) return NextResponse.json({ errors: checked.errors }, { status: 422 }); try { const started = createAndStart(checked.brief, operationKey(request)); if (started.replayed) return NextResponse.json({ id: started.briefId, replayed: true }); const outcome = await runGeneration(started.briefId, started.attemptId); return outcome.error ? NextResponse.json({ id: started.briefId, error: outcome.error }, { status: 502 }) : NextResponse.json({ id: started.briefId, mode: outcome.mode }, { status: 201 }); } catch (error) { return errorResponse(error); } }
