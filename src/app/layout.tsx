import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Campaign Brief Studio", template: "%s · Campaign Brief Studio" },
  description: "A thoughtful workspace for campaign briefs, messaging, content plans, and human review.",
  applicationName: "Campaign Brief Studio",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
