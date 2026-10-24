"use client";

import { useState } from "react";
import { canApproveDemo, canEditDemo, canExportDemo, canGenerateDemo, canRejectDemo, canRequestRevision, createDemoCases, parseDemoChannels, type DemoCase, type DemoHistoryItem, type DemoStatus } from "@/lib/demo-fixtures";
import { createDemoPlan } from "@/lib/demo-plan";
import { validateBrief } from "@/lib/validation";
import { validationMessage } from "@/lib/validation-messages";
import type { CampaignBrief, CampaignPlan } from "@/lib/types";
import { PlanView } from "@/components/plan-view";
import { ExportControls } from "@/components/export-controls";
import styles from "./demo-workspace.module.css";

type ReviewAction = "revision" | "approve" | "reject";
type PreviousPlan = { revision: number; plan: CampaignPlan; brief: CampaignBrief; note: string };

const fields: { key: Exclude<keyof CampaignBrief, "channels">; label: string; multiline?: boolean; help?: string }[] = [
  { key: "businessName", label: "Business name" },
  { key: "industry", label: "Industry" },
  { key: "targetAudience", label: "Target audience", multiline: true },
  { key: "offer", label: "Offer", multiline: true },
  { key: "objective", label: "Campaign objective" },
  { key: "brandVoice", label: "Brand voice" },
  { key: "constraints", label: "Constraints", multiline: true, help: "Use at least eight characters." },
  { key: "sourceMaterial", label: "Source material", multiline: true, help: "Optional context only. This demo does not verify claims." },
];

function initialCase(id: DemoCase["id"]) {
  return createDemoCases().find((item) => item.id === id) ?? createDemoCases()[0];
}

function cloneBrief(brief: CampaignBrief): CampaignBrief {
  return { ...brief, channels: [...brief.channels] };
}

function nowLabel() {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
}

export function DemoWorkspace() {
  const [selectedId, setSelectedId] = useState<DemoCase["id"]>("normal");
  const [editorOpen, setEditorOpen] = useState(false);
  const [submittedBrief, setSubmittedBrief] = useState<CampaignBrief>(() => cloneBrief(initialCase("normal").brief));
  const [workingBrief, setWorkingBrief] = useState<CampaignBrief>(() => cloneBrief(initialCase("normal").brief));
  const [channelsInput, setChannelsInput] = useState(() => initialCase("normal").brief.channels.join(", "));
  const [plan, setPlan] = useState<CampaignPlan | null>(() => initialCase("normal").plan);
  const [status, setStatus] = useState<DemoStatus>("Needs review");
  const [revision, setRevision] = useState(1);
  const [revisionNote, setRevisionNote] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [history, setHistory] = useState<DemoHistoryItem[]>(() => initialCase("normal").history);
  const [previousPlans, setPreviousPlans] = useState<PreviousPlan[]>([]);
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [lowConfidenceAcknowledged, setLowConfidenceAcknowledged] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");

  const editable = canEditDemo(status);
  const exportable = canExportDemo(status);

  function addHistory(action: string, detail: string) {
    setHistory((items) => [...items, { action, detail, at: nowLabel() }]);
  }

  function selectExample(id: DemoCase["id"]) {
    const example = initialCase(id);
    const exampleBrief = cloneBrief(example.brief);
    setSelectedId(id);
    setEditorOpen(false);
    setSubmittedBrief(exampleBrief);
    setWorkingBrief(cloneBrief(exampleBrief));
    setChannelsInput(exampleBrief.channels.join(", "));
    setPlan(example.plan);
    setStatus(example.status);
    setRevision(example.revision);
    setRevisionNote(example.revisionNote);
    setDecisionNote("");
    setHistory(example.history);
    setPreviousPlans(example.previousPlans ?? []);
    setReviewAction(null);
    setLowConfidenceAcknowledged(false);
    setErrors({});
    setFormMessage("");
  }

  function resetExample() {
    selectExample(selectedId);
  }

  function startNewExample() {
    const exampleBrief = cloneBrief(initialCase(selectedId).brief);
    setSubmittedBrief(exampleBrief);
    setWorkingBrief(cloneBrief(exampleBrief));
    setChannelsInput(exampleBrief.channels.join(", "));
    setEditorOpen(true);
    setPlan(null);
    setStatus("Draft");
    setRevision(1);
    setRevisionNote("");
    setDecisionNote("");
    setHistory([{ action: "New fictional example started", detail: "Edit the sample brief, then generate a deterministic plan for review.", at: nowLabel() }]);
    setPreviousPlans([]);
    setReviewAction(null);
    setLowConfidenceAcknowledged(false);
    setErrors({});
    setFormMessage("");
  }

  function updateField(key: keyof CampaignBrief, value: string) {
    if (!editable) return;
    if (key === "channels") {
      setChannelsInput(value);
    } else {
      setWorkingBrief((current) => ({ ...current, [key]: value }));
    }
    setErrors((current) => ({ ...current, [key]: "" }));
    setFormMessage("");
  }

  function validateWorkingBrief() {
    const checked = validateBrief({ ...workingBrief, channels: parseDemoChannels(channelsInput) });
    if (!checked.valid) {
      setErrors(checked.errors);
      setFormMessage("Review the highlighted fields, then continue.");
      setEditorOpen(true);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return undefined;
    }
    return checked.brief;
  }

  function generateSamplePlan() {
    if (!canGenerateDemo(status)) return;
    const checkedBrief = validateWorkingBrief();
    if (!checkedBrief) return;
    setSubmittedBrief(checkedBrief);
    setWorkingBrief(cloneBrief(checkedBrief));
    setChannelsInput(checkedBrief.channels.join(", "));
    setEditorOpen(false);
    setPlan(createDemoPlan(checkedBrief));
    setStatus("Needs review");
    setRevision(1);
    setErrors({});
    setFormMessage("");
    addHistory("Plan prepared", "A deterministic plan was generated from the edited fictional brief.");
  }

  function submitRevision() {
    if (!plan || status !== "Revision requested") return;
    const checkedBrief = validateWorkingBrief();
    if (!checkedBrief) return;
    const nextRevision = revision + 1;
    setPreviousPlans((items) => [...items, { revision, plan, brief: cloneBrief(submittedBrief), note: revisionNote }]);
    setSubmittedBrief(checkedBrief);
    setWorkingBrief(cloneBrief(checkedBrief));
    setChannelsInput(checkedBrief.channels.join(", "));
    setEditorOpen(false);
    setPlan(createDemoPlan(checkedBrief));
    setRevision(nextRevision);
    setStatus("Needs review");
    setReviewAction(null);
    setDecisionNote("");
    setLowConfidenceAcknowledged(false);
    setErrors({});
    setFormMessage("");
    addHistory("Revision resubmitted", `Revision ${nextRevision} was prepared from the edited brief. The reviewer request was: ${revisionNote}`);
    setRevisionNote("");
  }

  function requestRevision() {
    const note = decisionNote.trim();
    if (!canRequestRevision(status, note)) {
      setFormMessage("Add a revision note with at least eight characters so the requested change is clear.");
      return;
    }
    setWorkingBrief(cloneBrief(submittedBrief));
    setChannelsInput(submittedBrief.channels.join(", "));
    setEditorOpen(true);
    setRevisionNote(note);
    setStatus("Revision requested");
    setReviewAction(null);
    setDecisionNote("");
    setFormMessage("");
    addHistory("Revision requested", note);
  }

  function decide(nextStatus: "Approved" | "Rejected") {
    if (!plan) return;
    const note = decisionNote.trim();
    if (nextStatus === "Rejected" && !canRejectDemo(status, note)) {
      setFormMessage("Add a short reason with at least eight characters before rejecting this plan.");
      return;
    }
    if (nextStatus === "Approved" && !canApproveDemo(status, plan.confidence, lowConfidenceAcknowledged, note)) {
      setFormMessage("Acknowledge the low-confidence warning and add a review note before approving.");
      return;
    }
    const detail = note ? `Reviewer note: ${note}` : "Human reviewer approved the current fictional plan.";
    setStatus(nextStatus);
    setEditorOpen(false);
    setReviewAction(null);
    setDecisionNote("");
    setFormMessage("");
    addHistory(nextStatus === "Approved" ? "Plan approved" : "Plan rejected", detail);
  }

  return <div className={styles.workspace}>
    <header className={styles.header}>
      <div>
        <h1>Interactive demo</h1>
      </div>
      <div className={styles.headerActions}>
        <button className="secondary" type="button" onClick={resetExample}>Reset this example</button>
        <button className="button" type="button" onClick={startNewExample}>Start a new example</button>
      </div>
    </header>

    <div className={`${styles.simulation} notice`} role="note">
      <strong>Fictional demo</strong>
      <span>Template-generated plans. Changes are lost when you leave or reset.</span>
    </div>

    <div className={styles.layout}>
      <aside className={styles.context} aria-label="Demo example and original brief">
        <section className={styles.examplePicker}>
          <label htmlFor="demo-example">Choose an example</label>
          <select id="demo-example" value={selectedId} onChange={(event) => selectExample(event.target.value as DemoCase["id"])}>
            {createDemoCases().map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <p>{createDemoCases().find((item) => item.id === selectedId)?.description}</p>
        </section>

        <section className={styles.briefSection}>
          <div className={styles.sectionTitle}>
            <div><h2>Campaign context</h2><p>{editable ? "Edit the brief before preparing this sample." : "The submitted brief stays connected to this plan."}</p></div>
          </div>
          <details className={styles.briefDisclosure} open={editorOpen} onToggle={(event) => setEditorOpen(event.currentTarget.open)}>
            <summary>{editable ? "View brief and edit fields" : "View submitted brief"}</summary>
            <dl className={styles.briefList}>
              <div><dt>Business</dt><dd>{submittedBrief.businessName}</dd></div>
              <div><dt>Industry</dt><dd>{submittedBrief.industry}</dd></div>
              <div><dt>Audience</dt><dd>{submittedBrief.targetAudience}</dd></div>
              <div><dt>Offer</dt><dd>{submittedBrief.offer}</dd></div>
              <div><dt>Objective</dt><dd>{submittedBrief.objective}</dd></div>
              <div><dt>Brand voice</dt><dd>{submittedBrief.brandVoice}</dd></div>
              <div><dt>Channels</dt><dd>{submittedBrief.channels.join(", ")}</dd></div>
              <div><dt>Constraints</dt><dd>{submittedBrief.constraints}</dd></div>
              {submittedBrief.sourceMaterial && <div><dt>Source material</dt><dd>{submittedBrief.sourceMaterial}</dd></div>}
            </dl>
            {editable && <>
              {status === "Revision requested" && <p className={styles.revisionContext}><strong>Reviewer request:</strong> {revisionNote}</p>}
              <p className={styles.formIntro}>{status === "Draft" ? "Edit any sample field, then prepare a deterministic plan for review." : "Make the requested changes, then update and resubmit this revision."}</p>
              <div id="demo-brief-errors" className={styles.briefForm}>
                {fields.map(({ key, label, multiline, help }) => <label className={styles.field} key={key}>
                  <span>{label}</span>
                  {multiline ? <textarea aria-label={label} rows={key === "constraints" ? 3 : 2} value={workingBrief[key] ?? ""} onChange={(event) => updateField(key, event.target.value)} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `demo-error-${key}` : help ? `demo-help-${key}` : undefined} />
                    : <input aria-label={label} value={workingBrief[key] ?? ""} onChange={(event) => updateField(key, event.target.value)} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `demo-error-${key}` : help ? `demo-help-${key}` : undefined} />}
                  {help && <small id={`demo-help-${key}`}>{help}</small>}
                  {errors[key] && <span className="error" id={`demo-error-${key}`}>{validationMessage(key,errors[key])}</span>}
                </label>)}
                <label className={styles.field}>
                  <span>Channels</span>
                  <input aria-label="Channels" value={channelsInput} onChange={(event) => updateField("channels", event.target.value)} aria-invalid={Boolean(errors.channels)} aria-describedby={errors.channels ? "demo-error-channels" : undefined} />
                  {errors.channels && <span className="error" id="demo-error-channels">{validationMessage("channels",errors.channels)}</span>}
                </label>
              </div>
            </>}
          </details>
        </section>
      </aside>

      <article className={styles.document} aria-label={plan ? "Demo campaign plan" : "New demo brief"}>
        {plan ? <>
          <div className={styles.documentHeader}>
            <div><p className={styles.documentBusiness}>{submittedBrief.businessName}</p><h2 id="demo-document-title">{submittedBrief.objective}</h2><p>Revision {revision} <span aria-hidden="true">·</span> <span className={styles.status}>{status}</span></p></div>
            <span className={styles.confidence}>Confidence: {plan.confidence}</span>
          </div>
          <p className={styles.scopeNote}>Planning hypotheses from the submitted brief. No external research or publishing is connected.</p>

          <PlanView plan={plan} prefix="demo-plan" />

          {previousPlans.length > 0 && <section className={styles.history} aria-labelledby="previous-plans-title">
            <h3 id="previous-plans-title">Previous plan versions</h3>
            {previousPlans.map((item) => <details key={item.revision}>
              <summary>Revision {item.revision} <span>· {item.plan.confidence} confidence</span></summary>
              <p><strong>Submitted brief:</strong> {item.brief.businessName} offered {item.brief.offer} to {item.brief.targetAudience}.</p>
              <p>{item.plan.briefSummary}</p>
              <p><strong>Reviewer request:</strong> {item.note}</p>
              <h4>Previous messaging directions</h4>
              <ul>{item.plan.messagingAngles.map((angle) => <li key={angle.title}><strong>{angle.title}:</strong> {angle.rationale}</li>)}</ul>
            </details>)}
          </section>}

          <section className={styles.review} aria-labelledby="review-actions-title">
            <div className={styles.sectionTitle}><div><h3 id="review-actions-title">Human review</h3><p>Approve, request a revision, or reject this draft.</p></div></div>
            {status === "Needs review" && <div className={styles.actionButtons}>
              <button className="secondary" type="button" onClick={() => { setReviewAction("revision"); setDecisionNote(""); setFormMessage(""); }}>Request a revision</button>
              <button className="secondary" type="button" onClick={() => { setReviewAction("reject"); setDecisionNote(""); setFormMessage(""); }}>Reject plan</button>
              <button className="button" type="button" onClick={() => { setReviewAction("approve"); setDecisionNote(""); setFormMessage(""); }}>Approve plan</button>
            </div>}

            {status === "Revision requested" && <div className={styles.revisionPrompt}>
              <p><strong>Revision requested:</strong> {revisionNote}</p>
              <button className="button" type="button" onClick={submitRevision}>Update and resubmit</button>
            </div>}

            {reviewAction && status === "Needs review" && <div className={styles.decisionForm}>
              {reviewAction === "revision" && <label htmlFor="demo-decision-note">What should change? <span>Required</span></label>}
              {reviewAction === "reject" && <label htmlFor="demo-decision-note">Reason for rejection <span>Required</span></label>}
              {reviewAction === "approve" && <label htmlFor="demo-decision-note">Review note {plan.confidence === "low" && <span>Required for low confidence</span>}</label>}
              {reviewAction === "approve" && plan.confidence === "low" && <label className={styles.acknowledgment}>
                <input type="checkbox" checked={lowConfidenceAcknowledged} onChange={(event) => setLowConfidenceAcknowledged(event.target.checked)} />
                <span>I reviewed the low-confidence warning and understand the audience insights are unverified hypotheses.</span>
              </label>}
              <textarea id="demo-decision-note" rows={3} value={decisionNote} onChange={(event) => { setDecisionNote(event.target.value); setFormMessage(""); }} placeholder={reviewAction === "revision" ? "For example: clarify the offer duration and remove any implied guarantee." : reviewAction === "reject" ? "Explain why this draft should not move forward." : "Record any context for this decision."} />
              {formMessage && <p className="error" role="alert">{formMessage}</p>}
              <div className={styles.actionButtons}>
                <button className="tertiary" type="button" onClick={() => { setReviewAction(null); setFormMessage(""); }}>Cancel</button>
                {reviewAction === "revision" && <button className="button" type="button" onClick={requestRevision}>Record revision request</button>}
                {reviewAction === "reject" && <button className="secondary" type="button" onClick={() => decide("Rejected")}>Record rejection</button>}
                {reviewAction === "approve" && <button className="button" type="button" onClick={() => decide("Approved")}>Confirm approval</button>}
              </div>
            </div>}

            {status === "Approved" && <div className={styles.approved}>
              <p><strong>Approved for export.</strong> The decision is part of this tab’s temporary demo history.</p>
              <ExportControls plan={plan} metadata={{ businessName: submittedBrief.businessName, revision, status }} />
            </div>}
            {status === "Rejected" && <p className={styles.rejected}><strong>Plan rejected.</strong> This example is closed. Reset it or start a new example to explore another path.</p>}
            {formMessage && !reviewAction && <p className="error" role="alert">{formMessage}</p>}
            {!exportable && <p className={styles.exportHint}>Export becomes available after the current plan is approved.</p>}
          </section>

          <section className={styles.activity} aria-labelledby="demo-history-title">
            <h3 id="demo-history-title">Decision history</h3>
            <ol>{[...history].reverse().map((event, index) => <li key={`${event.action}-${index}`}>
              <div><strong>{event.action}</strong><span>{event.at}</span></div><p>{event.detail}</p>
            </li>)}</ol>
          </section>
        </> : <section className={styles.draft} aria-labelledby="demo-document-title">
          <p className={styles.documentBusiness}>{workingBrief.businessName}</p>
          <h2 id="demo-document-title">A new fictional brief</h2>
          <p>Make the sample fields your own, then generate a deterministic plan for review. The submitted brief will be saved only in this page’s temporary state.</p>
          <button className="button" type="button" onClick={generateSamplePlan}>Generate sample plan</button>
          {formMessage && <p className="error" role="alert">{formMessage}</p>}
        </section>}
      </article>
    </div>
  </div>;
}
