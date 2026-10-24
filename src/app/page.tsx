import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon, type IconName } from "@/components/icon";

export const metadata = { title: "Home" };

const tools: { href: string; title: string; description: string; icon: IconName }[] = [
  { href: "/campaigns", title: "Your campaigns", description: "Find saved briefs, drafts, and approved plans.", icon: "campaigns" },
  { href: "/review", title: "Review queue", description: "Review a draft, continue a revision, or retry an attempt.", icon: "review" },
  { href: "/settings", title: "Workflow setup", description: "Check how plans are generated and stored.", icon: "settings" },
];

export default function Home() {
  return <AppShell>
    <section className="home-intro" aria-labelledby="home-title">
      <div className="home-copy">
        <h1 id="home-title">Turn your brief into a campaign plan.</h1>
        <p>Describe your business, audience, and offer. Generate a draft, refine it, and export the plan you approve.</p>
        <div className="actions">
          <Link className="button" href="/briefs/new">Create a brief<Icon name="arrow" size={16}/></Link>
          <Link className="button secondary" href="/demo">Try the demo</Link>
        </div>
      </div>
      <div className="home-outputs">
        <h2>What’s in your plan</h2>
        <ul>
          <li><Icon name="check"/><span>Three messaging angles</span></li>
          <li><Icon name="check"/><span>A landing-page outline</span></li>
          <li><Icon name="check"/><span>A seven-day content plan</span></li>
        </ul>
        <p>Review assumptions and risks before approving. Export as Markdown or a content calendar CSV.</p>
      </div>
    </section>
    <section className="home-tools" aria-labelledby="home-tools-title">
      <h2 id="home-tools-title">Continue your work</h2>
      <div>{tools.map((tool) => <Link href={tool.href} className="home-tool" key={tool.href}>
        <Icon name={tool.icon} size={21}/>
        <span><strong>{tool.title}</strong><span>{tool.description}</span></span>
        <Icon name="arrow" size={18}/>
      </Link>)}</div>
    </section>
    <p className="home-note">This is a local workspace. The demo uses fictional examples and template-generated plans.</p>
  </AppShell>;
}
