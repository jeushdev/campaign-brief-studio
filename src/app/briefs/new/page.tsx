import { AppShell } from "@/components/app-shell";
import { BriefForm } from "@/components/brief-form";

export default function NewBrief() {
  return (
    <AppShell>
      <header className="page-header compact">
        <div>
          <h1>Start with a clear brief.</h1>
          <p>Share the context, audience, and guardrails. We’ll shape them into a campaign draft for your review.</p>
        </div>
      </header>
      <BriefForm />
    </AppShell>
  );
}
