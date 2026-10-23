/** Shared with exported n8n Code node; keep this function self-contained. */
export function validateCallbackDestination(value: unknown, configured: unknown): string {
  if (typeof configured !== "string" || !configured || value !== configured) throw new Error("Callback URL must match the configured CAMPAIGN_CALLBACK_URL.");
  // Use a narrow grammar rather than URL globals that may be absent in n8n's sandbox.
  const match = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal|campaign-brief-studio)(?::([0-9]{1,5}))?\/api\/webhooks\/generation-complete$/i.exec(configured);
  if (!match || (match[2] && (Number(match[2]) < 1 || Number(match[2]) > 65535))) throw new Error("Callback URL must target the local app generation callback.");
  return configured;
}
