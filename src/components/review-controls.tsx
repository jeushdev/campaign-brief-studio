"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "./use-mutation";
export function ReviewControls({ id, version, lowConfidence }: { id: string; version: number; lowConfidence: boolean }) {
  const router = useRouter(), mutation = useMutation(`/api/briefs/${id}/review`);
  const [note, setNote] = useState(""), [acknowledgeLowConfidence, setAcknowledged] = useState(false);
  async function decide(decision: "Approved" | "Rejected" | "Revision requested") {
    const result = await mutation.submit({ version, decision, note, acknowledgeLowConfidence });
    if (result) router.refresh();
  }
  return <section className="review-box"><h2>Human decision</h2><p>Local operator review. No authenticated reviewer identity is recorded.</p>
    <label>Reviewer notes<textarea value={note} readOnly={mutation.busy || mutation.uncertain} onChange={(event) => setNote(event.target.value)} rows={3} /></label>
    {lowConfidence && <label className="acknowledgment"><input type="checkbox" checked={acknowledgeLowConfidence} disabled={mutation.busy || mutation.uncertain} onChange={(event) => setAcknowledged(event.target.checked)} />I acknowledge the low confidence and have explained my approval in the notes.</label>}
    {mutation.error && <p role="alert" className="error">{mutation.error}</p>}
    <div className="actions">{mutation.uncertain ? <button disabled={mutation.busy} onClick={() => void decide("Approved")}>Retry same decision</button> : <>
      <button disabled={mutation.busy} onClick={() => void decide("Approved")}>Approve draft</button>
      <button className="secondary" disabled={mutation.busy} onClick={() => void decide("Revision requested")}>Request revision</button>
      <button className="secondary" disabled={mutation.busy} onClick={() => void decide("Rejected")}>Reject</button>
    </>}</div>
  </section>;
}
