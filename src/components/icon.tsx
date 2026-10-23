import type { CSSProperties, ReactNode } from "react";

export type IconName = "campaigns" | "plus" | "review" | "settings" | "arrow" | "search" | "document" | "check" | "clock" | "spark" | "chevron" | "external" | "shield" | "close" | "glass";
const paths: Record<IconName, ReactNode> = {
  campaigns: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  review: <><path d="M9 4H5v17h14V4h-4"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 3 3 5-6"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
  document: <><path d="M14 2H5v20h14V7zM14 2v5h5M8 11h8M8 15h8M8 18h5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  spark: <path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7z"/>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  external: <path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>,
  shield: <><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="m8 11 3 3 5-5"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  glass: <><rect x="8" y="3" width="13" height="13" rx="3"/><path d="M16 16v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h2"/></>,
};
export function Icon({ name, size = 18, className, style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} style={style}>{paths[name]}</svg>;
}
