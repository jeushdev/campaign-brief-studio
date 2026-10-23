"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CampaignBrief } from "@/lib/types";
import { validationMessage } from "@/lib/validation-messages";
import { validateBrief } from "@/lib/validation";
import { BRIEF_STEPS, briefInputErrors, firstBriefErrorStep, restoredBriefStep, stepForBriefField } from "@/lib/brief-flow";
import { useMutation } from "./use-mutation";
import styles from "./brief-form.module.css";

type Revision = { id: string; version: number; brief: CampaignBrief; instructions: string };
type FormValues = Omit<CampaignBrief, "sourceMaterial"> & {
  sourceMaterial: string;
  instructions: string;
  channelInput: string;
};
type StoredDraft = { version: 1; values: FormValues; step?: number };

const knownChannels = ["LinkedIn", "Email", "Instagram", "Facebook", "TikTok", "YouTube", "Website"];
const sample: FormValues = {
  businessName: "Forma Studio",
  industry: "Design studio",
  targetAudience: "Small business founders",
  offer: "Brand clarity workshop",
  objective: "Book discovery calls",
  brandVoice: "Clear, thoughtful, confident",
  channels: ["LinkedIn", "Email"],
  constraints: "No unsupported claims",
  sourceMaterial: "",
  instructions: "",
  channelInput: "",
};

function initialValues(revision?: Revision): FormValues {
  return {
    businessName: revision?.brief.businessName ?? "",
    industry: revision?.brief.industry ?? "",
    targetAudience: revision?.brief.targetAudience ?? "",
    offer: revision?.brief.offer ?? "",
    objective: revision?.brief.objective ?? "",
    brandVoice: revision?.brief.brandVoice ?? "",
    channels: revision?.brief.channels ?? [],
    constraints: revision?.brief.constraints ?? "",
    sourceMaterial: revision?.brief.sourceMaterial ?? "",
    instructions: revision?.instructions ?? "",
    channelInput: "",
  };
}

function isStoredDraft(value: unknown): value is StoredDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<StoredDraft>;
  const values = draft.values;
  return draft.version === 1 && !!values && typeof values === "object" &&
    ["businessName", "industry", "targetAudience", "offer", "objective", "brandVoice", "constraints", "sourceMaterial", "instructions", "channelInput"]
      .every((key) => typeof values[key as keyof FormValues] === "string") &&
    Array.isArray(values.channels) && values.channels.every((channel) => typeof channel === "string");
}

export function BriefForm({ revision }: { revision?: Revision }) {
  const router = useRouter();
  const mutation = useMutation(revision ? `/api/briefs/${revision.id}/revision` : "/api/briefs");
  const storageKey = `campaign-brief-studio:brief-draft:v1:${revision ? `revision:${revision.id}:v${revision.version}` : "new"}`;
  const [values, setValues] = useState(() => initialValues(revision));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState("");
  const [readyForKey, setReadyForKey] = useState("");
  const [draftEnabled, setDraftEnabled] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [step, setStep] = useState(0);
  const [fieldToFocus, setFieldToFocus] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusStep = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const locked = mutation.busy || mutation.uncertain || !!savedId;

  useEffect(() => {
    const freshValues = initialValues(revision);
    let foundDraft = false;
    let restoredValues: FormValues | undefined;
    let restoredStep = 0;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStoredDraft(parsed)) {
          restoredValues = parsed.values;
          foundDraft = true;
          restoredStep = restoredBriefStep(parsed.step);
        }
      }
    } catch {
      // Storage can be unavailable in private browsing or restricted contexts.
    }
    startTransition(() => {
      setValues(restoredValues ?? freshValues);
      setHasDraft(foundDraft);
      setRestoredDraft(foundDraft);
      setDraftEnabled(foundDraft);
      setReadyForKey(storageKey);
      setStep(restoredStep);
    });
  }, [storageKey, revision]);

  useEffect(() => {
    if (readyForKey !== storageKey || !draftEnabled) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, values, step } satisfies StoredDraft));
      if (!hasDraft) startTransition(() => setHasDraft(true));
    } catch {
      // Keep the form usable when session storage is full or disabled.
    }
  }, [draftEnabled, hasDraft, readyForKey, storageKey, values, step]);

  useEffect(() => {
    if (mutation.uncertain) startTransition(() => setStep(3));
  }, [mutation.uncertain]);

  useEffect(() => {
    if (focusStep.current) { stepHeadingRef.current?.focus(); focusStep.current = false; }
    if (fieldToFocus) { document.getElementById(fieldToFocus)?.focus(); }
  }, [step, fieldToFocus]);

  useEffect(() => {
    if (Object.keys(errors).length || mutation.error) summaryRef.current?.focus();
  }, [errors, mutation.error]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.currentTarget;
    setDraftEnabled(true);
    setValues((current) => ({ ...current, [name]: value }));
  }

  function changeValues(next: FormValues) {
    setDraftEnabled(true);
    setValues(next);
  }

  function clearDraft() {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Clearing the visible form still works when storage is unavailable.
    }
    setValues(initialValues(revision));
    setDraftEnabled(false);
    setHasDraft(false);
    setRestoredDraft(false);
    setErrors({});
    setFieldToFocus("");
    setStep(0);
    if (step === 0) stepHeadingRef.current?.focus();
    else focusStep.current = true;
  }

  function briefValues(): CampaignBrief {
    const { businessName, industry, offer, targetAudience, objective, brandVoice, channels, constraints, sourceMaterial } = values;
    return { businessName, industry, offer, targetAudience, objective, brandVoice, channels, constraints, sourceMaterial };
  }

  function goToStep(next: number) {
    if (locked || next === step) return;
    setFieldToFocus("");
    if (next > step) {
      const allErrors = briefInputErrors(briefValues(), revision ? values.instructions : undefined);
      const blocking = Object.fromEntries(Object.entries(allErrors).filter(([field]) => stepForBriefField(field) < next));
      if (Object.keys(blocking).length) {
        setErrors(blocking);
        setStep(firstBriefErrorStep(blocking));
        return;
      }
    }
    setErrors({});
    focusStep.current = true;
    setStep(next);
  }

  function revealField(field: string) {
    if (stepForBriefField(field) === step) { document.getElementById(field)?.focus(); return; }
    setStep(stepForBriefField(field));
    setFieldToFocus(field);
  }

  function addChannel() {
    const channel = values.channelInput.trim();
    if (!channel || values.channels.some((item) => item.toLowerCase() === channel.toLowerCase())) {
      setValues((current) => ({ ...current, channelInput: "" }));
      return;
    }
    changeValues({ ...values, channels: [...values.channels, channel], channelInput: "" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.busy) return;
    if (step < 3 && !mutation.uncertain) { goToStep(step + 1); return; }
    if (!mutation.uncertain) {
      const checked = briefInputErrors(briefValues(), revision ? values.instructions : undefined);
      if (Object.keys(checked).length) { setErrors(checked); setStep(firstBriefErrorStep(checked)); return; }
    }
    setErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const instructions = String(data.instructions ?? "");
    delete data.instructions;
    delete data.channelInput;
    delete data.channels;
    const briefFields = data;
    const payload = revision
      ? { version: revision.version, brief: { ...briefFields, channels: values.channels }, instructions }
      : { ...briefFields, channels: values.channels };
    const result = await mutation.submit(payload);
    if (!result) return;
    if (result.id) setSavedId(result.id);
    if (!result.ok) {
      setErrors(result.errors ?? {});
      setStep(result.id ? 3 : firstBriefErrorStep(result.errors ?? {}));
      if (revision) router.refresh();
      return;
    }
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Successful submission must not depend on storage being available.
    }
    setDraftEnabled(false);
    setHasDraft(false);
    if (result.id) {
      router.push(`/briefs/${result.id}`);
      router.refresh();
    }
  }

  const issueEntries = Object.entries(errors).filter(([key, message]) => !!message && stepForBriefField(key) === step);
  const formMessage = errors.form || mutation.error;
  const pendingPayload = mutation.pendingRequest?.payload;
  const pendingEnvelope = pendingPayload && typeof pendingPayload === "object" && !Array.isArray(pendingPayload) ? pendingPayload as Record<string, unknown> : undefined;
  const recovered = mutation.uncertain && pendingEnvelope ? validateBrief(revision ? pendingEnvelope.brief : pendingEnvelope) : undefined;
  const reviewValues: FormValues = recovered?.valid ? { ...values, ...recovered.brief, instructions: typeof pendingEnvelope?.instructions === "string" ? pendingEnvelope.instructions : values.instructions } : values;

  const reviewGroups = [
    { title: "Business", fields: [["Business name", reviewValues.businessName], ["Industry", reviewValues.industry]] },
    { title: "Campaign", fields: [["Offer", reviewValues.offer], ["Audience", reviewValues.targetAudience], ["Objective", reviewValues.objective], ["Brand voice", reviewValues.brandVoice], ...(revision ? [["Revision instructions", reviewValues.instructions]] : [])] },
    { title: "Channels & guardrails", fields: [["Channels", reviewValues.channels.join(", ")], ["Guardrails", reviewValues.constraints], ["Additional context", reviewValues.sourceMaterial || "Not added"]] },
  ];

  return (
    <form className={styles.form} onSubmit={(event) => void submit(event)} noValidate aria-busy={mutation.busy}>
      <div className={styles.draftBar}>
        <div>
          <p className={styles.draftTitle}>{restoredDraft ? "Welcome back to your brief." : "Your brief, one step at a time."}</p>
          <p className={styles.draftDetail}>{restoredDraft ? "Your saved answers and place were restored in this tab." : "Answers stay in this tab when storage is available."}</p>
        </div>
        <div className={styles.draftActions}>
          {!revision && <button type="button" className="tertiary" onClick={() => changeValues({ ...sample })} disabled={locked}>Fill sample</button>}
          <button type="button" className="tertiary" onClick={clearDraft} disabled={locked}>Clear draft</button>
        </div>
      </div>
      <div className={styles.wizard}>
        <nav aria-label="Brief progress" className={styles.progress}>
          <ol>{BRIEF_STEPS.map((item, index) => <li key={item.label}>
            <button type="button" aria-current={step === index ? "step" : undefined} disabled={locked || step === index} onClick={() => goToStep(index)}>
              <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span><span>{item.label}</span>
            </button>
          </li>)}</ol>
        </nav>
        <div className={styles.stepBody}>
          <header className={styles.sectionIntro}>
            <div className={styles.headingRow}><h2 ref={stepHeadingRef} tabIndex={-1}>{BRIEF_STEPS[step].heading}</h2><span className={styles.stepCount}>{step + 1} / 4</span></div>
            <p>{mutation.uncertain ? "The original submission is shown below. Retry checks that same request without creating a duplicate." : BRIEF_STEPS[step].description}</p>
          </header>
          {(issueEntries.length > 0 || formMessage) && <div className={`error ${styles.errorSummary}`} role="alert" tabIndex={-1} ref={summaryRef}>
            <strong>{mutation.uncertain ? "Check the original submission." : "A few details need your attention."}</strong>
            {formMessage && <p>{formMessage}</p>}
            {issueEntries.length > 0 && <ul>{issueEntries.map(([key, message]) => <li key={key}>
              {key === "form" ? message : <a href={`#${key}`} onClick={(event) => { event.preventDefault(); revealField(key); }}>{validationMessage(key, message)}</a>}
            </li>)}</ul>}
          </div>}

          <section className={styles.section} hidden={step !== 0} aria-label="Business details">
            <div className={styles.fields}>
              <Field name="businessName" label="Business name" value={values.businessName} onChange={updateField} error={errors.businessName} locked={locked} placeholder="e.g. Harborlight Coffee" />
              <Field name="industry" label="What does the business do?" helper="A short industry or business description is enough." value={values.industry} onChange={updateField} error={errors.industry} locked={locked} placeholder="e.g. Neighborhood coffee shop" />
            </div>
          </section>

          <section className={styles.section} hidden={step !== 1} aria-label="Campaign details">
            <div className={styles.fields}>
              <Field name="offer" label="What are you promoting?" helper="Describe the product, service, or offer people should consider." value={values.offer} onChange={updateField} error={errors.offer} locked={locked} multiline placeholder="e.g. A weekday coffee and pastry pairing" />
              <Field name="targetAudience" label="Who is it for?" helper="Be specific about the people you want to reach." value={values.targetAudience} onChange={updateField} error={errors.targetAudience} locked={locked} multiline placeholder="e.g. People who work or study near the waterfront" />
              <Field name="objective" label="What should people do?" value={values.objective} onChange={updateField} error={errors.objective} locked={locked} placeholder="e.g. Visit on a weekday afternoon" />
              <Field name="brandVoice" label="How should the campaign sound?" value={values.brandVoice} onChange={updateField} error={errors.brandVoice} locked={locked} placeholder="e.g. Warm, neighborly, and clear" />
              {revision && <Field name="instructions" label="What should change in this revision?" value={values.instructions} onChange={updateField} error={errors.instructions} locked={locked} multiline helper="Keep the reviewer's request here and add any further direction." />}
            </div>
          </section>

          <section className={styles.section} hidden={step !== 2} aria-label="Channels and guardrails">
            <div className={styles.fields}>
          <div className={`${styles.field} ${styles.wide}`}>
            <div className={styles.fieldHeading}>
              <span className={styles.label} id="channels-label">Preferred channels</span>
              <span className={styles.helper} id="channels-help">Choose suggestions or add a channel of your own.</span>
            </div>
            <input type="hidden" name="channels" value={values.channels.join(", ")} />
            <div className={styles.channelList} role="group" aria-labelledby="channels-label" aria-describedby={`channels-help${errors.channels ? " channels-error" : ""}`}>
              {knownChannels.map((channel) => {
                const selected = values.channels.some((item) => item.toLowerCase() === channel.toLowerCase());
                return (
                  <button
                    key={channel}
                    type="button"
                    className={`${styles.channelChip} ${selected ? styles.selectedChip : ""}`}
                    aria-pressed={selected}
                    disabled={locked}
                    onClick={() => changeValues({ ...values, channels: selected ? values.channels.filter((item) => item.toLowerCase() !== channel.toLowerCase()) : [...values.channels, channel] })}
                  >
                    {channel}
                  </button>
                );
              })}
              {values.channels.filter((channel) => !knownChannels.some((known) => known.toLowerCase() === channel.toLowerCase())).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  className={`${styles.channelChip} ${styles.selectedChip}`}
                  aria-label={`Remove ${channel}`}
                  disabled={locked}
                  onClick={() => changeValues({ ...values, channels: values.channels.filter((item) => item !== channel) })}
                >
                  {channel}<span aria-hidden="true"> ×</span>
                </button>
              ))}
            </div>
            <div className={styles.customChannel}>
              <label className={styles.srOnly} htmlFor="channels">Add another channel</label>
              <input id="channels" value={values.channelInput} onChange={updateField} name="channelInput" placeholder="Add another channel" readOnly={locked} aria-invalid={!!errors.channels} aria-describedby={`channels-help${errors.channels ? " channels-error" : ""}`} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addChannel(); } }} />
              <button type="button" className="secondary" onClick={addChannel} disabled={locked || !values.channelInput.trim()}>Add channel</button>
            </div>
            {errors.channels && <span className="error" id="channels-error">{validationMessage("channels",errors.channels)}</span>}
          </div>

              <Field name="constraints" label="Anything the campaign should avoid?" value={values.constraints} onChange={updateField} error={errors.constraints} locked={locked} multiline helper="Include claims, restrictions, or required disclosures. If there are none, write ‘None known.’" placeholder="e.g. Confirm prices and availability before publishing" />
              <details className={styles.optionalContext} open={errors.sourceMaterial ? true : undefined}>
                <summary>Add supporting context <span>Optional</span></summary>
                <Field name="sourceMaterial" label="Source or context material" value={values.sourceMaterial} onChange={updateField} error={errors.sourceMaterial} locked={locked} multiline helper="Include only material suitable for the configured provider." />
              </details>
            </div>
          </section>

          <section className={styles.section} hidden={step !== 3} aria-label="Review your brief">
            {(!mutation.uncertain || recovered?.valid) && <div className={styles.reviewGroups}>{reviewGroups.map((group, index) => <section key={group.title} className={styles.reviewGroup}>
              <header><h3>{group.title}</h3><button type="button" className="tertiary" disabled={locked} aria-label={`Edit ${group.title.toLowerCase()}`} onClick={() => goToStep(index)}>Edit</button></header>
              <dl>{group.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not provided"}</dd></div>)}</dl>
            </section>)}</div>}
            {mutation.uncertain && !recovered?.valid && <p>The original request is retained for an exact retry. Its contents could not be displayed; the answers from this form will not replace that request.</p>}
          </section>
        </div>
        <div className={styles.footer}>
          {step > 0 && !locked && <button className="secondary" type="button" onClick={() => goToStep(step - 1)}>Back</button>}
          <p>{step < 3 ? "Nothing is generated until you finish Review." : "Every generated plan needs a human review."}</p>
          {savedId ? <Link className="button" href={`/briefs/${savedId}`}>Open saved brief</Link> : <button className="button" type="submit" disabled={mutation.busy}>
            {mutation.busy ? "Generating…" : mutation.uncertain ? "Retry same submission" : step < 3 ? "Continue" : revision ? "Submit revised brief" : "Create campaign draft"}
          </button>}
        </div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  locked,
  multiline,
  wide,
  helper,
  placeholder,
}: {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  locked: boolean;
  multiline?: boolean;
  wide?: boolean;
  helper?: string;
  placeholder?: string;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;
  const describedBy = [helper ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      {helper && <span className={styles.helper} id={helpId}>{helper}</span>}
      {multiline ? (
        <textarea id={name} name={name} value={value} onChange={onChange} readOnly={locked} aria-invalid={!!error} aria-describedby={describedBy} placeholder={placeholder} rows={2} />
      ) : (
        <input id={name} name={name} value={value} onChange={onChange} readOnly={locked} aria-invalid={!!error} aria-describedby={describedBy} placeholder={placeholder} />
      )}
      {error && <span className="error" id={errorId}>{validationMessage(name,error)}</span>}
    </div>
  );
}
