import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillBridge — Understand Any Policy in Plain English",
  description:
    "BillBridge translates complex legislation and policy proposals into plain English. Understand who's affected, key tradeoffs, and debate arguments — for free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
