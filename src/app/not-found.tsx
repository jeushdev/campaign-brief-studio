import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return <AppShell><section className="panel empty"><Icon name="search" size={28}/><h1>This page isn’t here.</h1><p>The campaign may not exist in this workspace. Your other campaigns are a click away.</p><Link className="button" href="/campaigns">Back to campaigns<Icon name="arrow" size={16}/></Link></section></AppShell>;
}
