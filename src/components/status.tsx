import type { BriefStatus } from "@/lib/types";
import { Icon } from "./icon";
export function Status({ value }: { value: BriefStatus }) {
  return <span className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}>{value === "Approved" ? <Icon name="check" size={12}/> : value === "Generating" ? <Icon name="clock" size={12}/> : <span className="status-dot"/>}{value}</span>;
}
