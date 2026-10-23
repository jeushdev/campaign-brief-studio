"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { Icon, type IconName } from "./icon";

const destinations: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Campaigns", icon: "campaigns" },
  { href: "/briefs/new", label: "New brief", icon: "plus" },
  { href: "/review", label: "Review queue", icon: "review" },
  { href: "/settings", label: "Workflow", icon: "settings" },
];

export function AppShell({ children, demo = false }: { children: React.ReactNode; demo?: boolean }) {
  const pathname = usePathname();
  const [glass, setGlass] = useState(true);
  useEffect(() => {
    let choice = document.documentElement.dataset.glassEffects;
    try { choice = localStorage.getItem("campaign-studio:glass-effects") ?? choice; } catch { /* The current page still supports appearance changes. */ }
    const explicit = choice === "on" || choice === "off";
    document.documentElement.dataset.glassEffects = explicit ? choice : "auto";
    startTransition(() => setGlass(explicit ? choice === "on" : !matchMedia("(prefers-reduced-transparency: reduce)").matches));
  }, []);
  function toggleGlass() {
    const enabled = !glass;
    setGlass(enabled);
    const choice = enabled ? "on" : "off";
    document.documentElement.dataset.glassEffects = choice;
    try { localStorage.setItem("campaign-studio:glass-effects", choice); } catch { /* Appearance changes remain usable without storage. */ }
  }
  return <div className="shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar" aria-label="Workspace">
      <div className="brand-row">
        <Link href={demo ? "/demo" : "/"} className="brand" aria-label="Campaign Brief Studio home"><span className="brand-mark"><Icon name="document" size={22}/></span><span>Campaign<span className="brand-subtitle">Brief Studio</span></span></Link>
        <button type="button" className="glass-switch" aria-label="Glass effects" aria-pressed={glass} onClick={toggleGlass} title={`Glass effects ${glass ? "on" : "off"}`}><Icon name="glass" size={16}/><span>Glass effects</span><i aria-hidden="true"/></button>
      </div>
      <div className="workspace-label">Workspace <span>Personal</span></div>
      <nav aria-label="Main navigation">{destinations.map(({href, label, icon}) => {
        const active = !demo && (href === "/" ? pathname === "/" || (pathname.startsWith("/briefs/") && pathname !== "/briefs/new") : pathname === href);
        return <Link key={href} href={href} prefetch={demo ? false : undefined} aria-current={active ? "page" : undefined}><Icon name={icon}/><span>{label}</span></Link>;
      })}</nav>
      <Link href="/demo" className={`demo-link ${demo ? "active" : ""}`} aria-current={demo ? "page" : undefined} prefetch={false}><Icon name="spark"/><span>Explore the demo</span><Icon name="arrow" size={15}/></Link>
      <div className="sidebar-footer"><span className="workspace-dot"/>{demo ? "Fictional demo" : "Local workspace"}<p>{demo ? "Explore freely. Nothing is sent." : "A considered brief. A clearer campaign."}</p></div>
    </aside>
    <div className="workspace-body"><div className="workspace-topbar"><span>Campaign Brief Studio</span><span className="topbar-state"><span className="workspace-dot"/>{demo ? "Demo environment" : "Your workspace"}</span></div><main id="main-content" tabIndex={-1}>{children}</main><footer className="workspace-footer"><span>Made for thoughtful campaigns.</span><span>Human review, always.</span></footer></div>
  </div>;
}
