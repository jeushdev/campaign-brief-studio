import type { CampaignPlan } from "@/lib/types";
import { Icon } from "./icon";

export function PlanView({ plan, prefix = "" }: { plan: CampaignPlan; prefix?: string }) {
  return <div className="plan">
    <section className="plan-section overview-section" id={`${prefix}overview`} aria-labelledby={`${prefix}overview-title`}>
      <div className="section-heading"><h2 id={`${prefix}overview-title`}>Campaign overview</h2><span className={`confidence confidence-${plan.confidence}`}><span/> {plan.confidence.charAt(0).toUpperCase()+plan.confidence.slice(1)} confidence</span></div>
      <p className="plan-summary">{plan.briefSummary}</p>
      {plan.confidence === "low" && <p className="notice">This plan needs a closer look. Low-confidence approval requires acknowledgment and an explanation.</p>}
      <h3>Understanding the audience</h3><ul className="insight-list">{plan.audienceInsights.map((text,i) => <li key={i}>{text}</li>)}</ul>
    </section>
    <section className="plan-section" id={`${prefix}messaging`} aria-labelledby={`${prefix}messaging-title`}><div className="section-heading"><div><h2 id={`${prefix}messaging-title`}>Messaging angles</h2><p>Three ways to open the conversation.</p></div><Icon name="spark" size={20}/></div><div className="angle-grid">{plan.messagingAngles.map((angle,i) => <article key={i}><h3>{angle.title}</h3><p>{angle.rationale}</p><blockquote>{angle.sample}</blockquote></article>)}</div></section>
    <section className="plan-section" id={`${prefix}landing`} aria-labelledby={`${prefix}landing-title`}><div className="section-heading"><div><h2 id={`${prefix}landing-title`}>The landing page</h2><p>A clear path from interest to action.</p></div><Icon name="document" size={20}/></div><dl className="landing-outline">{plan.landingPageOutline.map((item,i) => <div key={i}><dt>{item.section}</dt><dd>{item.purpose}</dd></div>)}</dl></section>
    <section className="plan-section" id={`${prefix}schedule`} aria-labelledby={`${prefix}schedule-title`}><div className="section-heading"><div><h2 id={`${prefix}schedule-title`}>Seven days. One direction.</h2><p>Your content plan, ready for a considered review.</p></div><Icon name="clock" size={20}/></div><table className="schedule-table"><caption className="sr-only">Seven-day content plan</caption><thead><tr><th scope="col">Day</th><th scope="col">Channel / format</th><th scope="col">The conversation</th><th scope="col">Call to action</th></tr></thead><tbody>{plan.sevenDayContentPlan.map((item,i) => <tr key={i}><th scope="row">{item.day}</th><td><b>{item.channel}</b><small>{item.format}</small></td><td>{item.topic}</td><td>{item.CTA}</td></tr>)}</tbody></table></section>
    <section className="plan-section" id={`${prefix}considerations`} aria-labelledby={`${prefix}considerations-title`}><div className="section-heading"><div><h2 id={`${prefix}considerations-title`}>Before this goes further</h2><p>Good judgment is part of the plan.</p></div><Icon name="shield" size={20}/></div><div className="review-considerations">{(["assumptions","risks","reviewQuestions"] as const).map((key) => <section key={key}><h3>{key === "reviewQuestions" ? "Questions to resolve" : key === "risks" ? "Watch points" : "Working assumptions"}</h3><ul>{plan[key].map((text,i) => <li key={i}>{text}</li>)}</ul></section>)}</div></section>
  </div>;
}
