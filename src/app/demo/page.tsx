import { AppShell } from "@/components/app-shell";
import { DemoWorkspace } from "@/components/demo-workspace";

export const metadata = {
  title: "Interactive demo",
  description: "Explore a fictional, client-side campaign brief and review workflow.",
};

export default function DemoPage() {
  return <AppShell demo><DemoWorkspace /></AppShell>;
}
