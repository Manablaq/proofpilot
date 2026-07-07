"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import type { ReviewReport } from "@/lib/proofpilot-schema";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { EmptyState } from "@/components/app/EmptyState";
import { LoadingState } from "@/components/app/LoadingState";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";

export function AppReports() {
  const [ids, setIds] = useState<string[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/reports?campaignId=${deployment.campaignId}&limit=100`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Reports unavailable");
        }
        const nextIds = Array.isArray(json.data) ? json.data : [];
        setIds(nextIds);
        const loaded = await Promise.all(nextIds.map(async (id: string) => {
          const reportRes = await fetch(`/api/reports/${id}`, { cache: "no-store" });
          const reportJson = await reportRes.json();
          return reportJson.ok ? reportJson.data as ReviewReport : null;
        }));
        setReports(loaded.filter(Boolean) as ReviewReport[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load reports");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => reports.filter((report) => {
    const text = `${report.report_id} ${report.submission_id} ${report.campaign_id} ${report.status}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "ALL" || report.status === status);
  }), [reports, query, status]);

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Review certificates"
        description="Public review outputs with score, risk, evidence health, and raw JSON available for audit."
      />
      <SectionCard className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by report, submission, campaign, or status"
            className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
          >
            <option value="ALL">All statuses</option>
            <option value="READY_FOR_REVIEW">READY_FOR_REVIEW</option>
            <option value="NEEDS_MINOR_FIXES">NEEDS_MINOR_FIXES</option>
            <option value="NEEDS_MAJOR_FIXES">NEEDS_MAJOR_FIXES</option>
            <option value="NOT_READY">NOT_READY</option>
          </select>
        </div>
      </SectionCard>
      {loading ? <LoadingState rows={3} /> : null}
      {error ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p> : null}
      {!loading && !error && ids.length === 0 ? <EmptyState title="No reports" description="Reports appear after successful run_review transactions." /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((report) => (
          <SectionCard key={report.report_id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{report.report_id}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{report.submission_id}</h2>
              </div>
              <StatusBadge tone={statusTone(report.status)}>{report.status}</StatusBadge>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="Score" value={String(report.total_score)} />
              <Metric label="Risk" value={report.risk_level} />
              <Metric label="Confidence" value={report.confidence} />
            </div>
            <Link href={`/app/reports/${report.report_id}`} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
              Open certificate
            </Link>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
