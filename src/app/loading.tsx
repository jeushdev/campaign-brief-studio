import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";

export default function Loading() {
  return <AppShell><section className="panel empty" role="status"><Icon name="clock" size={28}/><h2>Opening your workspace…</h2><p>Your campaigns will be here in a moment.</p></section></AppShell>;
}
