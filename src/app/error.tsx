"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";

export default function WorkspaceError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <AppShell><section className="panel empty"><Icon name="document" size={28}/><h1>Let’s try that again.</h1><p>The workspace could not finish loading. Try again, or return to your campaigns.</p><div className="actions" style={{justifyContent:"center"}}><button onClick={retry}>Try again</button><Link className="button secondary" href="/">Back to campaigns</Link></div></section></AppShell>;
}
