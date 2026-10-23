"use client";
import { startTransition, useEffect, useRef, useState } from "react";
import { sendMutation, type MutationResult } from "@/lib/client-request";
import { readPendingRequest, savePendingRequest, clearPendingRequest, type PendingRequest } from "@/lib/pending-request";
export function useMutation(url: string) {
  const pending = useRef<PendingRequest | null>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest>();
  useEffect(() => {
    let recovered: PendingRequest | undefined;
    try { recovered = readPendingRequest(window.sessionStorage, url); } catch {}
    pending.current = recovered ?? null;
    startTransition(() => {
      setUncertain(!!recovered);
      setPendingRequest(recovered);
      setError(recovered ? "An unfinished request was recovered in this tab. Retry the same submission to check its saved result without creating a duplicate." : "");
      setReady(true);
    });
  }, [url]);
  async function submit(payload: unknown): Promise<MutationResult | undefined> {
    if (running.current) return;
    if (!ready) {
      try { pending.current ??= readPendingRequest(window.sessionStorage, url) ?? null; } catch {}
    }
    running.current = true; setBusy(true); setError("");
    pending.current ??= { version: 1, url, key: crypto.randomUUID(), payload };
    try { savePendingRequest(window.sessionStorage, pending.current); } catch {}
    try {
      const result = await sendMutation(url, pending.current.payload, pending.current.key);
      pending.current = null; setUncertain(false);
      setPendingRequest(undefined);
      try { clearPendingRequest(window.sessionStorage, url); } catch {}
      if (!result.ok) setError(result.error ?? "Request failed. Check the fields or refresh the brief.");
      return result;
    } catch {
      setPendingRequest(pending.current ?? undefined);
      setUncertain(true);
      setError("The result is uncertain. Retry the same submission to recover it without creating duplicates.");
    } finally { running.current = false; setBusy(false); }
  }
  return { submit, busy, uncertain, error, pendingRequest };
}
