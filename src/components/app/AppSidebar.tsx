"use client";

import Link from "next/link";
import { deployment } from "@/lib/deployment";

const nav = [
  ["Overview", "/app"],
  ["Campaigns", "/app/campaigns"],
  ["Submit Project", "/app/submit"],
  ["Review Queue", `/app/submissions/${deployment.submissionId}`],
  ["Reports", "/app/reports"],
  ["Builders", "/app/builders"],
  ["Transactions", "/app/transactions"],
  ["Docs/Verify", "/app/docs"],
] as const;

export function AppSidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div>
      <Link href="/" className="flex items-center gap-3 px-2" onClick={onNavigate}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
          PP
        </div>
        <div>
          <p className="font-semibold text-white">ProofPilot</p>
          <p className="text-xs text-slate-500">AI consensus review</p>
        </div>
      </Link>
      <nav className="mt-8 space-y-1">
        {nav.map(([label, href]) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-cyan-300/12 text-cyan-100" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Live case</p>
        <p className="mt-2 text-sm font-semibold text-white">{deployment.campaignId}</p>
        <p className="mt-1 text-xs text-slate-500">{deployment.reportId} · score {deployment.reviewScore}</p>
      </div>
    </div>
  );
}
