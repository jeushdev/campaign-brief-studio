import { AppShell } from "@/components/app-shell";
export const dynamic = "force-dynamic";
export default function Settings() {
  const configured = Boolean(process.env.N8N_WEBHOOK_URL), secret = Boolean(process.env.N8N_WEBHOOK_SECRET);
  return <AppShell><header className="page-header compact"><div><p className="eyebrow">Workflow & settings</p><h1>Local workflow configuration.</h1><p>Credentials remain server-side; configured does not mean connection-tested.</p></div></header><section className="panel settings">
    <div className="setting"><b>Generation</b><span>{configured ? secret ? "Webhook configured — not verified" : "Webhook secret missing" : "Deterministic demo mode"}</span><p>The app requires both N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET for webhook generation. Configure matching Header Auth inside n8n.</p></div>
    <div className="setting"><b>Provider</b><span>OpenAI adapter</span><p>Select a separate Authorization Header Auth credential in n8n and configure the model in Prepare request. Claude is not implemented.</p></div>
    <div className="setting"><b>Persistence and access</b><span>SQLite · local operator</span><p>Revision, attempt, plan and activity history are stored on this machine. The app binds to loopback and requires same-origin mutations. No authenticated reviewer identity is recorded.</p></div>
  </section></AppShell>;
}
