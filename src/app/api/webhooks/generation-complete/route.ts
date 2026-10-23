import { completeAttempt, failAttempt } from "@/lib/store";
import { handleGenerationCallback } from "@/lib/generation-callback";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return handleGenerationCallback(request, { completeAttempt, failAttempt });
}
