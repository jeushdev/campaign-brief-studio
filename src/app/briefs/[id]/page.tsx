import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Status } from "@/components/status";
import { ReviewControls } from "@/components/review-controls";
import { RetryControl } from "@/components/retry-control";
import { BriefForm } from "@/components/brief-form";
import { PlanView } from "@/components/plan-view";
import { getBrief } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function BriefDetail({ params }: { params: Promise<{ id: string }> }) {
  const brief = getBrief((await params).id); if (!brief) notFound();
  const lastAttempt = brief.attempts.at(-1);
  const expired = brief.status === "Generating" && lastAttempt && Date.parse(lastAttempt.expiresAt) <= Date.now();
  return <AppShell>
    <header className="page-header compact"><div><p className="eyebrow">Campaign draft</p><h1>{brief.brief.businessName}</h1><p>{brief.brief.objective} · {brief.brief.industry}</p></div><Status value={brief.status} /></header>
    <div className="notice">Generated material requires human review before external use. Brief-derived hypotheses are not verified research.</div>
    {brief.reviewNote && <section className="panel"><h2>Latest review note</h2><p>{brief.reviewNote}</p></section>}
    {(brief.status === "Failed" || expired) && <section className="panel"><h2>{expired ? "Generation expired" : "Generation failed"}</h2><p>{lastAttempt?.error ?? "No result was recorded. Retry the saved input revision."}</p><RetryControl id={brief.id} version={brief.version} /></section>}
    {brief.status === "Generating" && !expired && <section className="panel"><p>Generation is in progress. Refresh to check the result. An interrupted attempt becomes retryable after two minutes.</p><a href={`/briefs/${brief.id}`}>Refresh brief</a></section>}
    {brief.status === "Revision requested" && <section className="panel"><h2>Revise and resubmit</h2><BriefForm key={brief.version} revision={{ id: brief.id, version: brief.version, brief: brief.brief, instructions: brief.reviewNote ?? "" }} /></section>}
    <div className="detail-grid"><section className="panel"><h2>Brief inputs</h2><dl>{Object.entries(brief.brief).map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{Array.isArray(value) ? value.join(", ") : value || "Not provided"}</dd></div>)}</dl></section>
      <section className="panel"><h2>Current campaign plan</h2>{brief.plan ? <PlanView plan={brief.plan} /> : <p>No validated plan for the current attempt.</p>}
        {brief.status === "Needs review" && brief.plan && <ReviewControls key={brief.version} id={brief.id} version={brief.version} lowConfidence={brief.plan.confidence === "low"} />}
      </section></div>
    <section className="panel"><h2>Revision and plan history</h2>{brief.revisions.map((revision) => <details key={revision.id}><summary>Revision {revision.number} · {new Date(revision.createdAt).toLocaleString()}</summary><p>{revision.instructions ?? "Initial brief"}</p><dl>{Object.entries(revision.brief).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{Array.isArray(value) ? value.join(", ") : value}</dd></div>)}</dl>
      {brief.plans.filter((plan) => plan.revisionId === revision.id).map((record) => <details key={record.id}><summary>{record.id === brief.planId ? "Current" : "Historical"} plan · {record.mode}</summary><PlanView plan={record.plan} /></details>)}
      {brief.attempts.filter((attempt) => attempt.revisionId === revision.id).map((attempt) => <p key={attempt.id}>Attempt {attempt.status} · {new Date(attempt.startedAt).toLocaleString()}{attempt.error ? ": " + attempt.error : ""}</p>)}
    </details>)}</section>
    <section className="panel activity"><h2>Activity log</h2>{brief.activities.slice().reverse().map((activity) => <div key={activity.id}><b>{activity.action}</b><span>{new Date(activity.at).toLocaleString()}</span><p>{activity.detail}</p></div>)}</section>
  </AppShell>;
}
