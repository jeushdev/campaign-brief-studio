export const MAX_REQUEST_BYTES = 256 * 1024;
export class RequestBodyError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}
/** Bound actual streamed bytes as well as the untrusted Content-Length header. */
export async function readBoundedJson(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && Number(length) > MAX_REQUEST_BYTES) throw new RequestBodyError("Request body exceeds 256 KiB.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("Request body must be valid JSON.", 400);
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) { await reader.cancel(); throw new RequestBodyError("Request body exceeds 256 KiB.", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError("Request body must be valid JSON.", 400);
  } finally { reader.releaseLock(); }
}
