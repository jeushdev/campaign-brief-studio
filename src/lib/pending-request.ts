export type PendingRequest = { version: 1; url: string; key: string; payload: unknown };
type SessionStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const pendingStorageKey = (url: string) => `campaign-brief-studio:pending:v1:${url}`;

export function readPendingRequest(storage: SessionStore, url: string): PendingRequest | undefined {
  try {
    const raw = storage.getItem(pendingStorageKey(url));
    if (!raw) return;
    const value = JSON.parse(raw) as Partial<PendingRequest>;
    if (value.version === 1 && value.url === url && typeof value.key === "string" && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value.key) && value.payload && typeof value.payload === "object" && !Array.isArray(value.payload)) return value as PendingRequest;
    storage.removeItem(pendingStorageKey(url));
  } catch { /* Recovery is best effort when browser storage is unavailable. */ }
}

export function savePendingRequest(storage: SessionStore, pending: PendingRequest) {
  try { storage.setItem(pendingStorageKey(pending.url), JSON.stringify(pending)); } catch { /* The in-memory request still protects same-page retries. */ }
}
export function clearPendingRequest(storage: SessionStore, url: string) {
  try { storage.removeItem(pendingStorageKey(url)); } catch { /* Do not fail a completed server operation because storage is unavailable. */ }
}
