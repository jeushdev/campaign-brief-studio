import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";
export default function Settings() {
  const configured = Boolean(process.env.N8N_WEBHOOK_URL);
  const credentialsReady = Boolean(process.env.N8N_WEBHOOK_SECRET?.trim() && process.env.N8N_CALLBACK_SECRET?.trim() && process.env.N8N_WEBHOOK_SECRET !== process.env.N8N_CALLBACK_SECRET);
  const mode = !configured ? "Deterministic demo" : !credentialsReady ? "Configuration incomplete" : "Webhook configured · not connection-tested";
  return <AppShell><header className="page-header"><h1>Workflow</h1></header>
    <section className="panel" aria-labelledby="workflow-setup"><h2 id="workflow-setup" className="settings-title">Current setup</h2>
      <div className="setting"><h3>Generation mode</h3><div><span>{mode}</span><p>{configured ? "Briefs go to your n8n workflow. Verify a complete generation before relying on this connection." : "Plans use local templates. No AI provider is contacted."}</p></div></div>
      <div className="setting"><h3>Provider</h3><div><span>{configured ? "Groq via n8n" : "No provider in demo mode"}</span></div></div>
      <div className="setting"><h3>Callback verification</h3><div><span>{!configured ? "Not used in local demo" : credentialsReady ? "Credentials configured · not connection-tested" : "Distinct credentials required"}</span><p>Live results require separate dispatch and callback credentials.</p></div></div>
      <div className="setting"><h3>Review & history</h3><div><span>Saved on this device</span><p>Briefs, versions, and decisions stay in this single-user workspace. Approval enables export; it does not publish content.</p></div></div>
      <div className="setting"><h3>Approval notifications</h3><div><span>{process.env.N8N_APPROVED_WEBHOOK_URL ? "Configured · delivery not verified" : "Not configured"}</span><p>Notification delivery is separate from approval and is best effort.</p></div></div>
    </section>
    <details className="brief-context"><summary>Connect a live workflow<span>For the operator configuring n8n.</span></summary><ol className="settings-subtitle"><li>Import the generated campaign workflow into n8n.</li><li>Configure distinct inbound, provider, and callback credentials. Keep all keys server-side.</li><li>Set <code>N8N_WEBHOOK_URL</code>, <code>N8N_WEBHOOK_SECRET</code>, and a distinct <code>N8N_CALLBACK_SECRET</code> for the app.</li><li>Make <code>APP_URL</code> reachable from n8n; pin <code>CAMPAIGN_CALLBACK_URL</code> in n8n to the matching callback endpoint.</li><li>Restart the app, submit a fictional brief, and verify the matching attempt completes before relying on the connection.</li></ol><p className="settings-note">The README includes the exact setup and verification steps. This page never displays credential values.</p></details>
  </AppShell>;
}
