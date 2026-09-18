export type MutationResult = { ok: boolean; status: number; id?: string; error?: string; errors?: Record<string, string> };
export async function sendMutation(url: string, payload: unknown, key: string, fetcher: typeof fetch = fetch): Promise<MutationResult> {
  const response = await fetcher(url, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(payload), signal: AbortSignal.timeout(55_000) });
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error("The server response could not be read. Retry the same submission."); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The server returned an unexpected response. Retry the same submission.");
  const result = value as { id?: unknown; error?: unknown; errors?: unknown };
  return { ok: response.ok, status: response.status, ...(typeof result.id === "string" ? { id: result.id } : {}),
    ...(typeof result.error === "string" ? { error: result.error } : {}),
    ...(result.errors && typeof result.errors === "object" && !Array.isArray(result.errors) ? { errors: result.errors as Record<string, string> } : {}) };
}
