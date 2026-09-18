"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CampaignBrief } from "@/lib/types";
import { useMutation } from "./use-mutation";
const fields = [{ name: "businessName", label: "Business name" }, { name: "industry", label: "Industry" }, { name: "targetAudience", label: "Target audience" }, { name: "offer", label: "Offer" }, { name: "objective", label: "Campaign objective" }, { name: "brandVoice", label: "Brand voice" }] as const;
export function BriefForm({ revision }: { revision?: { id: string; version: number; brief: CampaignBrief; instructions: string } }) {
  const router = useRouter(), mutation = useMutation(revision ? `/api/briefs/${revision.id}/revision` : "/api/briefs");
  const [errors, setErrors] = useState<Record<string, string>>({}), [savedId, setSavedId] = useState("");
  async function submit(form: HTMLFormElement) {
    setErrors({});
    const data = Object.fromEntries(new FormData(form));
    const { instructions, ...brief } = data;
    const result = await mutation.submit(revision ? { version: revision.version, brief, instructions } : brief);
    if (!result) return;
    if (result.id) setSavedId(result.id);
    if (!result.ok) { setErrors(result.errors ?? {}); if (revision) router.refresh(); return; }
    if (result.id) { router.push(`/briefs/${result.id}`); router.refresh(); }
  }
  const locked = mutation.busy || mutation.uncertain || !!savedId;
  return <form className="form" onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }} noValidate>
    {fields.map((field) => <label key={field.name}>{field.label}<input name={field.name} defaultValue={revision?.brief[field.name]} readOnly={locked} aria-invalid={!!errors[field.name]} />{errors[field.name] && <em>{errors[field.name]}</em>}</label>)}
    <label>Preferred channels<span>Separate channels with commas.</span><input name="channels" defaultValue={revision?.brief.channels.join(", ")} readOnly={locked} placeholder="LinkedIn, Email" />{errors.channels && <em>{errors.channels}</em>}</label>
    <label>Constraints and compliance notes<span>Include restrictions or “None known.”</span><textarea name="constraints" defaultValue={revision?.brief.constraints} readOnly={locked} rows={3} />{errors.constraints && <em>{errors.constraints}</em>}</label>
    <label>Source or context material<span>Optional; include only material suitable for the configured provider.</span><textarea name="sourceMaterial" defaultValue={revision?.brief.sourceMaterial} readOnly={locked} rows={3} />{errors.sourceMaterial && <em>{errors.sourceMaterial}</em>}</label>
    {revision && <label className="full-width">Revision instructions<textarea name="instructions" defaultValue={revision.instructions} readOnly={locked} rows={3} required /></label>}
    {(errors.form || mutation.error) && <p role="alert" className="error full-width">{errors.form || mutation.error}</p>}
    <div className="form-footer"><p>Every generated plan requires human review.</p>{savedId ? <Link href={`/briefs/${savedId}`}>Open saved brief to review or retry</Link> : <button disabled={mutation.busy}>{mutation.busy ? "Generating…" : mutation.uncertain ? "Retry same submission" : revision ? "Submit revised brief" : "Create campaign draft"}</button>}</div>
  </form>;
}
