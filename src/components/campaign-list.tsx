"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STATUSES, type BriefStatus } from "@/lib/types";
import { Icon } from "./icon";
import { Status } from "./status";

export type CampaignRow = { id: string; businessName: string; industry: string; objective: string; status: BriefStatus; updatedAt: string };
export function CampaignList({ campaigns }: { campaigns: CampaignRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => campaigns.filter((c) => (filter === "All" || c.status === filter) && `${c.businessName} ${c.industry} ${c.objective}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => sort === "name" ? a.businessName.localeCompare(b.businessName) : sort === "oldest" ? a.updatedAt.localeCompare(b.updatedAt) : b.updatedAt.localeCompare(a.updatedAt)), [campaigns, filter, query, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice((currentPage - 1) * 12, currentPage * 12);
  function reset() { setQuery(""); setFilter("All"); setPage(1); }
  return <section className="campaign-library" aria-label="Campaign library">
    <div className="library-tools"><label className="search-field"><Icon name="search"/><span className="sr-only">Search campaigns</span><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search campaigns…"/></label><div className="library-selects"><label><span className="sr-only">Filter by status</span><select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}><option value="All">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label><label><span className="sr-only">Sort campaigns</span><select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="recent">Recently updated</option><option value="oldest">Oldest updated</option><option value="name">Name A–Z</option></select></label></div></div>
    <div className="library-heading"><h2>All campaigns <span>{campaigns.length}</span></h2><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "campaign" : "campaigns"}{filter !== "All" || query ? " found" : " in your workspace"}</p></div>
    {shown.length ? <table className="campaign-table"><thead><tr><th scope="col">Campaign</th><th scope="col">Objective</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col"><span className="sr-only">Open campaign</span></th></tr></thead><tbody>{shown.map((campaign) => <tr key={campaign.id}><td><div className="campaign-name"><span className="campaign-avatar" aria-hidden="true">{campaign.businessName.slice(0,2).toUpperCase()}</span><div><Link href={`/briefs/${campaign.id}`} className="campaign-title">{campaign.businessName}</Link><small>{campaign.industry}</small></div></div></td><td className="campaign-objective">{campaign.objective}</td><td><Status value={campaign.status}/></td><td className="campaign-date"><time dateTime={campaign.updatedAt}>{new Intl.DateTimeFormat("en", {day:"numeric", month:"short", year:"numeric"}).format(new Date(campaign.updatedAt))}</time></td><td><Link className="row-link" href={`/briefs/${campaign.id}`} aria-label={`Open ${campaign.businessName}`}><Icon name="arrow"/></Link></td></tr>)}</tbody></table> : <div className="empty compact-empty"><Icon name="search" size={26}/><h3>No campaigns match.</h3><p>Try a different name, objective, or status.</p><button className="secondary" onClick={reset}>Clear filters</button></div>}
    {pages > 1 && <nav className="pagination" aria-label="Campaign pages"><button className="secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage-1)}>Previous</button><span>Page {currentPage} of {pages}</span><button className="secondary" disabled={currentPage === pages} onClick={() => setPage(currentPage+1)}>Next</button></nav>}
  </section>;
}
