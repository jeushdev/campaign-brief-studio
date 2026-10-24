import { AppShell } from "@/components/app-shell";
import { BriefForm } from "@/components/brief-form";

export default function NewBrief() {
  return (
    <AppShell>
      <header className="page-header compact">
        <div>
          <h1>New campaign brief</h1>
          <p>Add your details, then review before generating.</p>
        </div>
      </header>
      <BriefForm />
    </AppShell>
  );
}
