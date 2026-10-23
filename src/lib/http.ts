import { NextResponse } from "next/server";
import { ConflictError, NotFoundError } from "./store";
import { mutationProblem } from "./local-access";
import { readBoundedJson, RequestBodyError } from "./body-reader";
export function requireLocalMutation(request: Request) { const problem = mutationProblem(request); return problem ? NextResponse.json({ error: problem }, { status: 403 }) : undefined; }
export async function readJson(request: Request): Promise<{ body: unknown } | { response: NextResponse }> {
  try { return { body: await readBoundedJson(request) }; } catch (error) { return { response: NextResponse.json({ error: error instanceof RequestBodyError ? error.message : "Request body must be valid JSON." }, { status: error instanceof RequestBodyError ? error.status : 400 }) }; }
}
export function operationKey(request: Request) { return request.headers.get("idempotency-key")?.trim() || ""; }
export function errorResponse(error: unknown) {
  if (error instanceof NotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
  if (error instanceof ConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
  console.error("Campaign operation failed:", error);
  return NextResponse.json({ error: "Storage or server operation failed. Existing data was not replaced; check the server log." }, { status: 500 });
}
