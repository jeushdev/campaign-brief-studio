import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Status } from "@/components/status";
import { Icon } from "@/components/icon";
import { listBriefs } from "@/lib/store";

export const dynamic = "force-dynamic";
export default function ReviewQueue() {
  const briefs = listBriefs();
  const groups = [
    {title:"Ready for your review",description:"Validated drafts waiting for a decision.",status:"Needs review",action:"Review draft"},
    {title:"A clearer direction",description:"Revisions requested. Continue where you left off.",status:"Revision requested",action:"Continue revision"},
    {title:"Needs another try",description:"Saved briefs with a failed or expired generation attempt.",status:"Failed",action:"Open to retry"},
  ];
  const expired = (b: (typeof briefs)[number]) => b.generationExpired;
  const count = briefs.filter((b) => ["Needs review","Revision requested","Failed"].includes(b.status) || expired(b)).length;
  return <AppShell><header className="page-header"><div><h1>A fresh perspective.</h1><p>{count ? `${count} ${count === 1 ? "campaign needs" : "campaigns need"} a little of your attention.` : "Good judgment is what moves a campaign forward."}</p></div><Link href="/" className="text-link">All campaigns<Icon name="arrow" size={16}/></Link></header>
    {count ? groups.map((group) => {
      const items = briefs.filter((b) => b.status === group.status || (group.status === "Failed" && expired(b)));
      return items.length > 0 && <section className="queue-section" key={group.status}><h2>{group.title}<span>{items.length}</span></h2><p className="settings-subtitle">{group.description}</p><div className="queue-list">{items.map((b) => <div className="queue" key={b.id}><div><b>{b.brief.businessName}</b><p>{b.brief.objective}</p></div>{expired(b) ? <span className="status status-failed"><Icon name="clock" size={12}/>Expired</span> : <Status value={b.status}/>}<Link href={`/briefs/${b.id}`}>{group.action}<Icon name="arrow" size={16}/></Link></div>)}</div></section>;
    }) : <section className="panel empty"><Icon name="check" size={30}/><h2>You’re all caught up.</h2><p>New campaign drafts will appear here when they are ready for your review.</p><div className="actions" style={{justifyContent:"center"}}><Link href="/briefs/new" className="button">Start a campaign</Link><Link href="/demo" className="text-link">Explore the demo</Link></div></section>}
  </AppShell>;
}
