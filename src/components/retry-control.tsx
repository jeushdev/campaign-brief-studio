"use client";
import { useRouter } from "next/navigation";
import { useMutation } from "./use-mutation";
export function RetryControl({ id, version }: { id: string; version: number }) {
  const router = useRouter(), mutation = useMutation(`/api/briefs/${id}/retry`);
  return <div><button disabled={mutation.busy} onClick={async () => { const result = await mutation.submit({ version }); if (result) router.refresh(); }}>{mutation.busy ? "Generating…" : mutation.uncertain ? "Retry same request" : "Retry generation"}</button>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}</div>;
}
