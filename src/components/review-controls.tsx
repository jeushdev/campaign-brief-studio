"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "./use-mutation";

export function ReviewControls({ id, version, lowConfidence }: { id: string; version: number; lowConfidence: boolean }) {
  const router = useRouter(), mutation = useMutation(`/api/briefs/${id}/review`);
  const [note, setNote] = useState(""), [acknowledgeLowConfidence, setAcknowledged] = useState(false);
  const [lastDecision, setLastDecision] = useState<"Approved" | "Rejected" | "Revision requested">("Approved");
  const [confirming, setConfirming] = useState(false), [noteError, setNoteError] = useState("");
  const noteField = useRef<HTMLTextAreaElement>(null);

  async function decide(decision: "Approved" | "Rejected" | "Revision requested") {
    if (!mutation.uncertain && (decision !== "Approved" || lowConfidence) && !note.trim()) {
      setNoteError(decision === "Approved" ? "Explain why you are approving this low-confidence plan." : "Add a note so the next step has a clear direction.");
      noteField.current?.focus(); return;
    }
    setNoteError("");
    setLastDecision(decision);
    const result = await mutation.submit({ version, decision, note, acknowledgeLowConfidence });
    if (result?.ok) { setConfirming(false); router.refresh(); }
  }

  return (
    <section className="review-box" id="review-decision" aria-labelledby="decision-title">
      <h2 id="decision-title">Your call.</h2>
      <p>Review the assumptions and watch points above. Approve when the plan is ready, or give it a clearer direction.</p>
      <label>
        Reviewer notes
        <textarea
          ref={noteField}
          aria-invalid={!!noteError}
          aria-describedby={noteError ? "review-note-error" : "review-note-help"}
          value={note}
          readOnly={mutation.busy || mutation.uncertain}
          onChange={(event) => { setNote(event.target.value); setNoteError(""); }}
          rows={3}
          placeholder="What should stay, change, or be checked?"
        />
      </label>
      <small id="review-note-help">Required for a revision, rejection, or low-confidence approval.</small>
      {noteError && <p className="error" id="review-note-error" role="alert">{noteError}</p>}
      {lowConfidence && (
        <label className="acknowledgment">
          <input
            type="checkbox"
            checked={acknowledgeLowConfidence}
            disabled={mutation.busy || mutation.uncertain}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          I acknowledge the low confidence and have explained my approval in the notes.
        </label>
      )}
      {mutation.error && <p role="alert" className="error">{mutation.error}</p>}
      {confirming && !mutation.uncertain && <div className="approval-confirmation"><b>Ready to approve this version?</b><p>This records your decision and enables export. It does not publish the campaign.</p><div className="actions"><button disabled={mutation.busy || (lowConfidence && !acknowledgeLowConfidence)} onClick={() => void decide("Approved")}>{mutation.busy ? "Saving decision…" : "Confirm approval"}</button><button className="secondary" disabled={mutation.busy} onClick={() => setConfirming(false)}>Keep reviewing</button></div></div>}
      <div className="actions">
        {mutation.uncertain ? (
          <button disabled={mutation.busy} onClick={() => void decide(lastDecision)}>
            Retry same decision
          </button>
        ) : !confirming ? (
          <>
            <button disabled={mutation.busy || (lowConfidence && !acknowledgeLowConfidence)} onClick={() => setConfirming(true)}>
              Approve draft
            </button>
            <button className="secondary" disabled={mutation.busy} onClick={() => void decide("Revision requested")}>
              Request revision
            </button>
            <button className="tertiary" disabled={mutation.busy} onClick={() => void decide("Rejected")}>
              Reject
            </button>
          </>
        ) : null}
      </div>
      <p className="review-footnote">Recorded on this device. Reviewer identity is not authenticated.</p>
    </section>
  );
}
