import type { BriefStatus } from "@/lib/types";
export function Status({ value }: { value: BriefStatus }) { return <span className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}>{value}</span>; }
