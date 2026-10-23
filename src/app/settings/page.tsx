import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";
export default function Settings() {
  const configured = Boolean(process.env.N8N_WEBHOOK_URL);
  const credentialsReady = Boolean(process.env.N8N_WEBHOOK_SECRET?.trim() && process.env.N8N_CALLBACK_SECRET?.trim() && process.env.N8N_WEBHOOK_SECRET !== process.env.N8N_CALLBACK_SECRET);
  const mode = !configured ? "Deterministic demo" : !credentialsReady ? "Configuration incomplete" : "Webhook configured · not connection-tested";
  return <AppShell><header className="page-header"><div><h1>Behind the workflow.</h1><p>A clear view of how your campaign moves from brief to reviewed plan.</p></div><Link className="text-link" href="/demo">Try the example<Icon name="arrow" size={16}/></Link></header>
    <section className="workflow-intro"><Icon name="shield" size={27}/><div><h2>A human stays in the loop.</h2><p>Generation creates a draft. Your review gives it direction. Nothing is published automatically, and no external delivery is implied by an approval.</p></div></section>
    <section className="panel" aria-labelledby="workflow-setup"><h2 id="workflow-setup" className="settings-title">Your setup</h2><p className="settings-subtitle">Configuration is visible here. Secrets stay on the server.</p>
      <div className="setting"><h3>Generation mode</h3><div><span>{mode}</span><p>{configured ? "New briefs are sent to the configured n8n workflow. A successful local test does not establish that a live connection works." : "Plans are created from local templates. No AI provider is contacted. Explore the complete review flow without credentials."}</p></div></div>
      <div className="setting"><h3>Provider</h3><div><span>{configured ? "Groq via n8n" : "No provider in demo mode"}</span><p>The included workflow uses Groq chat completions. Provider and model selection live in the workflow source; OpenAI and Claude API adapters are not implemented.</p></div></div>
      <div className="setting"><h3>Callback verification</h3><div><span>{!configured ? "Not used in local demo" : credentialsReady ? "Credentials configured · not connection-tested" : "Distinct credentials required"}</span><p>Live results require a dedicated callback secret, a valid contract version, and a matching generation attempt. Dispatch and callback credentials must be different.</p></div></div>
      <div className="setting"><h3>Review & history</h3><div><span>Local operator workspace</span><p>Briefs, versions, attempts, and decisions are saved on this device. There are no shared accounts or authenticated reviewer identities. Keep a backup before changing your environment.</p></div></div>
      <div className="setting"><h3>Approval notifications</h3><div><span>{process.env.N8N_APPROVED_WEBHOOK_URL ? "Configured · delivery not verified" : "Not configured"}</span><p>Optional downstream notifications are best effort. Approval and notification delivery are separate outcomes.</p></div></div>
    </section>
    <details className="brief-context"><summary>Connect a live workflow<span>For the operator configuring n8n.</span></summary><ol className="settings-subtitle"><li>Import the generated campaign workflow into n8n.</li><li>Configure distinct inbound, provider, and callback credentials. Keep all keys server-side.</li><li>Set <code>N8N_WEBHOOK_URL</code>, <code>N8N_WEBHOOK_SECRET</code>, and a distinct <code>N8N_CALLBACK_SECRET</code> for the app.</li><li>Make <code>APP_URL</code> reachable from n8n; pin <code>CAMPAIGN_CALLBACK_URL</code> in n8n to the matching callback endpoint.</li><li>Restart the app, submit a fictional brief, and verify the matching attempt completes before relying on the connection.</li></ol><p className="settings-note">The README includes the exact setup and verification steps. This page never displays credential values.</p></details>
  </AppShell>;
}
