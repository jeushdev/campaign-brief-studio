import "server-only";
import path from "node:path";
import { openStore } from "./sqlite-store.ts";
export { ConflictError, NotFoundError } from "./sqlite-store.ts";
let store: ReturnType<typeof openStore> | undefined;
const db = () => store ??= openStore(process.env.CAMPAIGN_DB_PATH || path.join(process.cwd(), "data", "campaign-brief-studio.sqlite"));
export const createAndStart = (...args: Parameters<ReturnType<typeof openStore>["createAndStart"]>) => db().createAndStart(...args);
export const retryFailed = (...args: Parameters<ReturnType<typeof openStore>["retryFailed"]>) => db().retryFailed(...args);
export const submitRevision = (...args: Parameters<ReturnType<typeof openStore>["submitRevision"]>) => db().submitRevision(...args);
export const completeAttempt = (...args: Parameters<ReturnType<typeof openStore>["completeAttempt"]>) => db().completeAttempt(...args);
export const failAttempt = (...args: Parameters<ReturnType<typeof openStore>["failAttempt"]>) => db().failAttempt(...args);
export const reviewBrief = (...args: Parameters<ReturnType<typeof openStore>["reviewBrief"]>) => db().reviewBrief(...args);
export const getBrief = (id: string) => {
  const brief = db().getBrief(id), attempt = brief?.attempts.at(-1);
  return brief ? { ...brief, generationExpired: brief.status === "Generating" && !!attempt && Date.parse(attempt.expiresAt) <= Date.now() } : undefined;
};
export const listBriefs = () => db().listBriefs().map((brief) => {
  const attempt = brief.attempts.at(-1);
  return { ...brief, generationExpired: brief.status === "Generating" && !!attempt && Date.parse(attempt.expiresAt) <= Date.now() };
});
