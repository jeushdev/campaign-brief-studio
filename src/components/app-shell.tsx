"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icon";

const destinations: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/campaigns", label: "Campaigns", icon: "campaigns" },
  { href: "/briefs/new", label: "New brief", icon: "plus" },
  { href: "/review", label: "Review", icon: "review" },
  { href: "/settings", label: "Workflow", icon: "settings" },
];

export function AppShell({ children, demo = false }: { children: React.ReactNode; demo?: boolean }) {
  const pathname = usePathname();
  return <div className="shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar" aria-label="Workspace">
      <div className="brand-row">
        <Link href="/" className="brand" aria-label="Campaign Brief Studio home"><span className="brand-mark"><Icon name="document" size={22}/></span><span>Campaign<span className="brand-subtitle">Brief Studio</span></span></Link>
      </div>
      <nav aria-label="Main navigation">{destinations.map(({href, label, icon}) => {
        const active = !demo && (pathname === href || (href === "/campaigns" && pathname.startsWith("/briefs/") && pathname !== "/briefs/new"));
        return <Link key={href} href={href} prefetch={demo ? false : undefined} aria-current={active ? "page" : undefined}><Icon name={icon}/><span>{label}</span></Link>;
      })}</nav>
      <Link href="/demo" className={`demo-link ${demo ? "active" : ""}`} aria-current={demo ? "page" : undefined} prefetch={false}><Icon name="spark"/><span>Try demo</span><Icon name="arrow" size={15}/></Link>
      <div className="sidebar-footer">{demo ? "Fictional demo" : "Local workspace"}</div>
    </aside>
    <div className="workspace-body"><main id="main-content" tabIndex={-1}>{children}</main></div>
  </div>;
}
