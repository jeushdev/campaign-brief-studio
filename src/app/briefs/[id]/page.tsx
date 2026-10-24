import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Status } from "@/components/status";
import { Icon } from "@/components/icon";
import { ReviewControls } from "@/components/review-controls";
import { RetryControl } from "@/components/retry-control";
import { BriefForm } from "@/components/brief-form";
import { PlanView } from "@/components/plan-view";
import { AutoRefresh } from "@/components/auto-refresh";
import { ExportControls } from "@/components/export-controls";
import { getBrief } from "@/lib/store";
import type { CampaignBrief } from "@/lib/types";

export const dynamic = "force-dynamic";
const date = (value: string) => new Intl.DateTimeFormat("en", {dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
const fieldNames: Record<keyof CampaignBrief,string> = {businessName:"Business",industry:"Industry",targetAudience:"Audience",offer:"Offer",objective:"Objective",brandVoice:"Brand voice",channels:"Channels",constraints:"Guardrails",sourceMaterial:"Source material"};
function BriefInputs({brief}: {brief:CampaignBrief}) {
  return <dl className="brief-inputs">{Object.entries(brief).map(([key,value]) => <div key={key}><dt>{fieldNames[key as keyof CampaignBrief]}</dt><dd>{Array.isArray(value) ? value.join(", ") : value || "Not provided"}</dd></div>)}</dl>;
}

export default async function BriefDetail({params}: {params:Promise<{id:string}>}) {
  const brief = getBrief((await params).id);
  if (!brief) notFound();
  const lastAttempt = brief.attempts.at(-1);
  const revision = brief.revisions.at(-1);
  const currentPlan = brief.plans.find((p) => p.id === brief.planId);
  const mode = currentPlan?.mode === "Demo" ? "Deterministic demo" : currentPlan?.mode === "Webhook" ? "Generated through n8n" : currentPlan?.mode === "Legacy" ? "Imported plan" : undefined;
  const reviewing = brief.status === "Needs review" && !!brief.plan;
  return <AppShell>
    <div className="breadcrumb"><Link href="/campaigns">Campaigns</Link><Icon name="chevron" size={12}/><span>Campaign detail</span></div>
    <header className="page-header campaign-header"><div><h1>{brief.brief.businessName}</h1><p>{brief.brief.objective}</p></div><div className="actions"><Status value={brief.status}/>{reviewing && <a className="button secondary" href="#review-decision">Review draft<Icon name="arrow" size={15}/></a>}</div></header>
    <div className="campaign-meta"><span><Icon name="document" size={14}/>Revision {revision?.number ?? 1}</span><span>{brief.brief.industry}</span><span>{brief.brief.channels.join(" · ")}</span>{mode && <span>{mode}</span>}</div>
    {brief.reviewNote && <div className="notice"><b>Latest review note</b><p style={{margin:"6px 0 0",whiteSpace:"pre-wrap"}}>{brief.reviewNote}</p></div>}
    {(brief.status === "Failed" || brief.generationExpired) && <section className="panel generation-state"><Icon name="clock" size={22}/><div><h2>{brief.generationExpired ? "Generation expired" : "This attempt needs another try."}</h2><p>{lastAttempt?.error ?? "No result arrived within the attempt window. Your brief is saved; retry when you are ready."}</p><RetryControl id={brief.id} version={brief.version}/></div></section>}
    {brief.status === "Generating" && !brief.generationExpired && <section className="panel generation-state" role="status"><Icon name="clock" size={22}/><div><h2>Your campaign is taking shape.</h2><p>Waiting for the generation result. This page updates automatically.</p><small>Your brief is saved. An interrupted attempt becomes retryable after two minutes.</small><AutoRefresh/></div></section>}
    {brief.status === "Revision requested" && <section className="panel"><h2>Revise and resubmit</h2><p className="settings-subtitle">Keep what works. Give the next version a clearer direction.</p><BriefForm key={brief.version} revision={{id:brief.id,version:brief.version,brief:brief.brief,instructions:brief.reviewNote ?? ""}}/></section>}
    <details className="brief-context"><summary>The original brief<span>Your inputs and guardrails, always close at hand.</span></summary><BriefInputs brief={brief.brief}/></details>
    {brief.plan ? <article className="campaign-document" aria-label="Current campaign plan">
      <nav className="document-nav" aria-label="Campaign sections"><a href="#overview">Overview</a><a href="#messaging">Messaging</a><a href="#landing">Landing page</a><a href="#schedule">Content plan</a><a href="#considerations">Review considerations</a></nav>
      <PlanView plan={brief.plan}/>
      {reviewing && <ReviewControls key={brief.version} id={brief.id} version={brief.version} lowConfidence={brief.plan.confidence === "low"}/>}
      {brief.status === "Approved" && <section className="export-panel"><h2>A plan ready to take forward.</h2><p>Download the approved version or copy it into your next document. Exporting does not publish anything.</p><ExportControls plan={brief.plan} metadata={{businessName:brief.brief.businessName,revision:revision?.number ?? 1,status:brief.status}}/></section>}
    </article> : brief.status !== "Generating" && <section className="panel empty"><Icon name="document" size={24}/><h2>No current plan yet.</h2><p>Your brief and previous versions are safe. A validated result will appear here.</p></section>}
    <section className="history-section" aria-labelledby="history-title"><h2 id="history-title">Every version has a story.</h2><p className="settings-subtitle">Inputs, attempts, and previous plans remain connected.</p>{brief.revisions.slice().reverse().map((r) => <details className="history-row" key={r.id}><summary>Revision {r.number} · {date(r.createdAt)}</summary><p>{r.instructions ?? "The starting brief."}</p><BriefInputs brief={r.brief}/>{brief.attempts.filter((a) => a.revisionId === r.id).map((a) => <p key={a.id}>Attempt: {a.status} · {date(a.startedAt)}{a.error ? ` — ${a.error}` : ""}</p>)}{brief.plans.filter((p) => p.revisionId === r.id).map((p) => <details className="history-plan" key={p.id}><summary>{p.id === brief.planId ? "Current" : "Historical"} plan · {p.mode}</summary><PlanView plan={p.plan} prefix={`history-${p.id}-`}/></details>)}</details>)}</section>
    <section className="history-section" aria-labelledby="activity-title"><h2 id="activity-title">Activity</h2><ol className="activity-list">{brief.activities.slice().reverse().map((a) => <li key={a.id}><b>{a.action}</b><time dateTime={a.at}>{date(a.at)}</time><p>{a.detail}</p></li>)}</ol></section>
  </AppShell>;
}
