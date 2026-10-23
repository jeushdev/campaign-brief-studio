"use client";

import { useEffect, useRef, useState } from "react";
import type { CampaignPlan } from "@/lib/types";
import { exportFileStem, formatPlanCsv, formatPlanMarkdown, type ExportMetadata } from "@/lib/plan-export";

export { formatPlanMarkdown } from "@/lib/plan-export";

export function ExportControls({ plan, metadata }: { plan: CampaignPlan; metadata?: ExportMetadata }) {
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stem = exportFileStem(metadata?.businessName);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  function announce(message: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 4500);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatPlanMarkdown(plan, metadata));
      announce("Markdown copied. You can paste the approved plan into your next document.");
    } catch {
      announce("Clipboard access was blocked. Use Download Markdown to save a copy instead.");
    }
  }

  function download(contents: string, filename: string, mimeType: string) {
    let url: string | undefined;
    try {
      const blob = new Blob([contents], { type: mimeType });
      url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      announce(`${filename} downloaded.`);
    } catch {
      announce(`Could not download ${filename}. Try copying the Markdown instead.`);
    } finally {
      if (url) window.setTimeout(() => URL.revokeObjectURL(url!), 1000);
    }
  }

  return <div className="export-controls">
    <div className="actions">
      <button className="secondary" type="button" onClick={handleCopy}>Copy Markdown</button>
      <button className="secondary" type="button" onClick={() => download(formatPlanMarkdown(plan, metadata), `${stem}-plan.md`, "text/markdown;charset=utf-8")}>Download Markdown</button>
      <button className="secondary" type="button" onClick={() => download(formatPlanCsv(plan, metadata), `${stem}-content-calendar.csv`, "text/csv;charset=utf-8")}>Download calendar CSV</button>
    </div>
    <p className="export-feedback" aria-live="polite" role="status">{feedback}</p>
  </div>;
}
