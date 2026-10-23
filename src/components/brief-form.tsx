"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CampaignBrief } from "@/lib/types";
import { validationMessage } from "@/lib/validation-messages";
import { useMutation } from "./use-mutation";
import styles from "./brief-form.module.css";

type Revision = { id: string; version: number; brief: CampaignBrief; instructions: string };
type FormValues = Omit<CampaignBrief, "sourceMaterial"> & {
  sourceMaterial: string;
  instructions: string;
  channelInput: string;
};
type StoredDraft = { version: 1; values: FormValues };

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
  const summaryRef = useRef<HTMLDivElement>(null);
  const locked = mutation.busy || mutation.uncertain || !!savedId;

  useEffect(() => {
    const freshValues = initialValues(revision);
    let foundDraft = false;
    let restoredValues: FormValues | undefined;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isStoredDraft(parsed)) {
          restoredValues = parsed.values;
          foundDraft = true;
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
    });
  }, [storageKey, revision]);

  useEffect(() => {
    if (readyForKey !== storageKey || !draftEnabled) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, values } satisfies StoredDraft));
      if (!hasDraft) startTransition(() => setHasDraft(true));
    } catch {
      // Keep the form usable when session storage is full or disabled.
    }
  }, [draftEnabled, hasDraft, readyForKey, storageKey, values]);

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

  const issueEntries = Object.entries(errors).filter(([, message]) => !!message);
  const formMessage = errors.form || mutation.error;

  return (
    <form className={styles.form} onSubmit={(event) => void submit(event)} noValidate aria-busy={mutation.busy}>
      {(issueEntries.length > 0 || formMessage) && (
        <div className={`error ${styles.errorSummary}`} role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>There’s a problem with this brief.</strong>
          {formMessage && <p>{formMessage}</p>}
          {issueEntries.length > 0 && (
            <ul>
              {issueEntries.map(([key, message]) => (
                <li key={key}>
                  {key === "form" ? message : <a href={`#${key}`}>{validationMessage(key,message)}</a>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className={styles.section} aria-labelledby="business-heading">
        <div className={styles.sectionIntro}>
          <h2 id="business-heading">Business</h2>
          <p>Start with the basics so the campaign has the right context.</p>
        </div>
        <div className={styles.fields}>
          <Field name="businessName" label="Business name" value={values.businessName} onChange={updateField} error={errors.businessName} locked={locked} />
          <Field name="industry" label="Industry" value={values.industry} onChange={updateField} error={errors.industry} locked={locked} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="audience-heading">
        <div className={styles.sectionIntro}>
          <h2 id="audience-heading">Audience &amp; offer</h2>
          <p>Describe who this is for and the value you want them to consider.</p>
        </div>
        <div className={styles.fields}>
          <Field name="targetAudience" label="Who do you want to reach?" value={values.targetAudience} onChange={updateField} error={errors.targetAudience} locked={locked} multiline />
          <Field name="offer" label="What are you offering?" value={values.offer} onChange={updateField} error={errors.offer} locked={locked} multiline />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="direction-heading">
        <div className={styles.sectionIntro}>
          <h2 id="direction-heading">Direction</h2>
          <p>Set the outcome and voice. Clear guidance helps keep the first draft useful.</p>
        </div>
        <div className={styles.fields}>
          <Field name="objective" label="Campaign objective" value={values.objective} onChange={updateField} error={errors.objective} locked={locked} multiline />
          <Field name="brandVoice" label="Brand voice" value={values.brandVoice} onChange={updateField} error={errors.brandVoice} locked={locked} multiline />
          {revision && (
            <Field name="instructions" label="Revision instructions" value={values.instructions} onChange={updateField} error={errors.instructions} locked={locked} multiline wide helper="Tell the workflow what to change in this version." />
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="channels-heading">
        <div className={styles.sectionIntro}>
          <h2 id="channels-heading">Channels &amp; guardrails</h2>
          <p>Choose where the campaign belongs and note claims or restrictions to avoid.</p>
        </div>
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
          <Field name="constraints" label="Constraints and compliance notes" value={values.constraints} onChange={updateField} error={errors.constraints} locked={locked} multiline helper="Include restrictions or claims that must be avoided." />
          <Field name="sourceMaterial" label="Source or context material" value={values.sourceMaterial} onChange={updateField} error={errors.sourceMaterial} locked={locked} multiline helper="Optional. Include only material suitable for the configured provider." />
        </div>
      </section>

      <div className={styles.draftBar}>
        <div>
          <p className={styles.draftTitle}>{restoredDraft ? "Your brief was restored in this tab." : hasDraft ? "Your changes are saved in this tab." : "Your unfinished brief stays here."}</p>
          <p className={styles.draftDetail}>Unsent input is kept in this tab when storage is available. Clear it any time.</p>
        </div>
        <div className={styles.draftActions}>
          {!revision && <button type="button" className="tertiary" onClick={() => changeValues({ ...sample })} disabled={locked}>Fill sample</button>}
          <button type="button" className="tertiary" onClick={clearDraft} disabled={locked}>Clear draft</button>
        </div>
      </div>

      <div className={styles.footer}>
        <p>Every generated plan needs a human review before it is used externally.</p>
        {savedId ? (
          <Link className="button" href={`/briefs/${savedId}`}>Open saved brief</Link>
        ) : (
          <button className="button" type="submit" disabled={mutation.busy}>
            {mutation.busy ? "Generating…" : mutation.uncertain ? "Retry same submission" : revision ? "Submit revised brief" : "Create campaign draft"}
          </button>
        )}
      </div>
      {mutation.uncertain && <p className={`notice ${styles.uncertainNotice}`}>The result is uncertain. Your answers are locked while you retry the original request, so it cannot create a duplicate.</p>}
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
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;
  const describedBy = [helper ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      {helper && <span className={styles.helper} id={helpId}>{helper}</span>}
      {multiline ? (
        <textarea id={name} name={name} value={value} onChange={onChange} readOnly={locked} aria-invalid={!!error} aria-describedby={describedBy} rows={3} />
      ) : (
        <input id={name} name={name} value={value} onChange={onChange} readOnly={locked} aria-invalid={!!error} aria-describedby={describedBy} />
      )}
      {error && <span className="error" id={errorId}>{validationMessage(name,error)}</span>}
    </div>
  );
}
