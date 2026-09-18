import type { CampaignPlan } from "@/lib/types";
export function PlanView({ plan }: { plan: CampaignPlan }) {
  return <div className="plan">
    <p><b>Confidence:</b> {plan.confidence}</p>{plan.confidence === "low" && <p className="notice">Low confidence: review risks carefully. Approval requires acknowledgment and a note.</p>}
    <h3>Summary</h3><p>{plan.briefSummary}</p>
    <h3>Audience insights</h3><ul>{plan.audienceInsights.map((text, i) => <li key={i}>{text}</li>)}</ul>
    <h3>Messaging angles</h3><div className="cards">{plan.messagingAngles.map((angle, i) => <article key={i}><b>{angle.title}</b><p>{angle.rationale}</p><small>{angle.sample}</small></article>)}</div>
    <h3>Landing-page outline</h3><ol>{plan.landingPageOutline.map((item, i) => <li key={i}><b>{item.section}:</b> {item.purpose}</li>)}</ol>
    <h3>Seven-day content plan</h3><div className="table-wrap"><table><thead><tr><th>Day</th><th>Channel</th><th>Format</th><th>Topic</th><th>CTA</th></tr></thead><tbody>{plan.sevenDayContentPlan.map((item, i) => <tr key={i}><td>{item.day}</td><td>{item.channel}</td><td>{item.format}</td><td>{item.topic}</td><td>{item.CTA}</td></tr>)}</tbody></table></div>
    {(["assumptions", "risks", "reviewQuestions"] as const).map((key) => <section key={key}><h3>{key === "reviewQuestions" ? "Questions requiring review" : key === "risks" ? "Potential risks" : "Assumptions"}</h3><ul>{plan[key].map((text, i) => <li key={i}>{text}</li>)}</ul></section>)}
  </div>;
}
