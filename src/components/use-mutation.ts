"use client";
import { useRef, useState } from "react";
import { sendMutation, type MutationResult } from "@/lib/client-request";
export function useMutation(url: string) {
  const pending = useRef<{ key: string; payload: unknown } | null>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [error, setError] = useState("");
  async function submit(payload: unknown): Promise<MutationResult | undefined> {
    if (running.current) return;
    running.current = true; setBusy(true); setError("");
    pending.current ??= { key: crypto.randomUUID(), payload };
    try {
      const result = await sendMutation(url, pending.current.payload, pending.current.key);
      pending.current = null; setUncertain(false);
      if (!result.ok) setError(result.error ?? "Request failed. Check the fields or refresh the brief.");
      return result;
    } catch {
      setUncertain(true);
      setError("The result is uncertain. Retry the same submission to recover it without creating duplicates.");
    } finally { running.current = false; setBusy(false); }
  }
  return { submit, busy, uncertain, error };
}
