import { AppShell } from "@/components/app-shell";
import { BriefForm } from "@/components/brief-form";

export default function NewBrief() {
  return (
    <AppShell>
      <header className="page-header compact">
        <div>
          <h1>Create a campaign brief.</h1>
          <p>Four focused steps. Review the details together before generating a draft.</p>
        </div>
      </header>
      <BriefForm />
    </AppShell>
  );
}
