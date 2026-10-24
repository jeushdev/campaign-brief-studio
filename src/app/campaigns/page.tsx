import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CampaignList } from "@/components/campaign-list";
import { Icon } from "@/components/icon";
import { listBriefs } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Campaigns" };

export default function Campaigns() {
  const briefs = listBriefs();
  const actions = briefs.filter((b) => ["Needs review", "Failed", "Revision requested"].includes(b.status) || b.generationExpired);
  return <AppShell>
    <header className="page-header"><h1>Campaigns</h1><Link className="button" href="/briefs/new"><Icon name="plus"/>New brief</Link></header>
    {briefs.length > 0 ? <>
      <div className="workspace-summary"><span><b>{briefs.length}</b> campaigns</span><Link href="/review"><span className="summary-dot amber"/><b>{actions.length}</b> need attention<Icon name="arrow" size={14}/></Link><span><span className="summary-dot green"/><b>{briefs.filter((b) => b.status === "Approved").length}</b> approved</span></div>
      <CampaignList campaigns={briefs.map((b) => ({id:b.id,businessName:b.brief.businessName,industry:b.brief.industry,objective:b.brief.objective,status:b.status,updatedAt:b.updatedAt}))}/>
    </> : <section className="panel empty"><Icon name="document" size={30}/><h2>No campaigns yet</h2><p>Create a brief to start your first campaign plan.</p><Link className="text-link" href="/demo">Explore a fictional example<Icon name="arrow" size={16}/></Link></section>}
  </AppShell>;
}
