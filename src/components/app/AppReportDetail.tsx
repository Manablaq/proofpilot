"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EvidenceSnapshot, ReviewReport } from "@/lib/proofpilot-schema";
import { parseJsonField } from "@/lib/proofpilot-schema";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";
import { LoadingState } from "@/components/app/LoadingState";
import { EmptyState } from "@/components/app/EmptyState";
import { CopyButton } from "@/components/CopyButton";

export function AppReportDetail({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [snapshot, setSnapshot] = useState<EvidenceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/reports/${reportId}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Report unavailable");
        }
        const nextReport = json.data as ReviewReport;
        setReport(nextReport);
        const snapRes = await fetch(`/api/snapshots/${nextReport.snapshot_id}`, { cache: "no-store" });
        const snapJson = await snapRes.json();
        if (snapJson.ok) {
          setSnapshot(snapJson.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reportId]);

  const scores = useMemo(() => parseJsonField<Record<string, number>>(report?.scores_json, {}), [report]);
  const findings = useMemo(() => parseJsonField<string[]>(report?.findings_json, []), [report]);
  const risks = useMemo(() => parseJsonField<string[]>(report?.risks_json, []), [report]);
  const missing = useMemo(() => parseJsonField<string[]>(report?.missing_evidence_json, []), [report]);
  const failures = useMemo(() => parseJsonField<string[]>(report?.fetch_failures_json, []), [report]);
  const fetchResults = useMemo(() => parseJsonField<Record<string, { status?: string; http_status?: number; used_method?: string; error?: string }>>(snapshot?.fetch_results_json, {}), [snapshot]);
  const sourceUrls = useMemo(() => parseJsonField<Record<string, string>>(snapshot?.source_urls_json, {}), [snapshot]);
  const warnings = useMemo(() => parseJsonField<string[]>(snapshot?.warnings_json, []), [snapshot]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Reports", href: "/app/reports" },
          { label: reportId },
        ]}
        eyebrow="Report certificate"
        title={reportId}
        description="The public output of ProofPilot review: scoring, recommendation, risk, evidence health, and raw JSON audit data."
        actions={report ? <Link href={`/app/submissions/${report.submission_id}`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Open submission</Link> : null}
      />
      {loading ? <LoadingState rows={4} /> : null}
      {error ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p> : null}

      {report ? (
        <>
          <SectionCard className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
                <p className="text-sm text-slate-500">Total score</p>
                <p className="mt-3 text-7xl font-semibold tracking-tight text-cyan-100">{report.total_score}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <StatusBadge tone={statusTone(report.status)}>{report.status}</StatusBadge>
                  <StatusBadge tone={statusTone(report.risk_level)}>{report.risk_level} risk</StatusBadge>
                  <StatusBadge tone="success">{report.confidence} confidence</StatusBadge>
                </div>
                <p className="mt-6 text-sm leading-6 text-slate-400">
                  Recommendation: <span className="font-semibold text-white">{report.recommendation}</span>
                </p>
              </div>
              <div className="p-6 lg:p-8">
                <h2 className="text-2xl font-semibold text-white">Certificate identity</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Report ID", report.report_id],
                    ["Submission ID", report.submission_id],
                    ["Campaign ID", report.campaign_id],
                    ["Builder", report.builder],
                    ["Snapshot", report.snapshot_id],
                    ["Rubric", report.rubric_version],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-slate-500">{label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="break-all text-sm text-slate-100">{value}</span>
                        <CopyButton value={value} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Score breakdown</h2>
              <div className="mt-6 space-y-4">
                {Object.entries(scores).map(([label, score]) => (
                  <div key={label}>
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="capitalize text-slate-300">{label.replaceAll("_", " ")}</span>
                      <span className="font-semibold text-white">{score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Evidence health</h2>
              <div className="mt-5 space-y-3">
                {Object.entries(fetchResults).map(([source, result]) => (
                  <div key={source} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{source}</p>
                      <StatusBadge tone={statusTone(result.status)}>{result.status ?? "UNKNOWN"}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {result.http_status ? `HTTP ${result.http_status}` : "Metadata proof"} · {result.used_method ?? "unknown"}
                    </p>
                    {sourceUrls[source] ? <p className="mt-2 break-all text-xs text-slate-500">{sourceUrls[source]}</p> : null}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            <ListCard title="Findings" items={findings} />
            <ListCard title="Risks" items={risks} />
            <ListCard title="Missing evidence" items={missing} />
            <ListCard title="Fetch failures" items={failures} />
          </div>

          {warnings.length ? (
            <SectionCard className="mt-6 p-6">
              <h2 className="text-xl font-semibold text-white">Snapshot warnings</h2>
              <ul className="mt-4 space-y-2 text-sm text-amber-100">
                {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </SectionCard>
          ) : null}

          <details className="mt-6 rounded-lg border border-white/10 bg-slate-950/70 p-5">
            <summary className="cursor-pointer text-sm font-semibold text-slate-200">Technical raw review JSON</summary>
            <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-300">
              {JSON.stringify(parseJsonField<unknown>(report.raw_review_json, report.raw_review_json), null, 2)}
            </pre>
          </details>
        </>
      ) : !loading && !error ? (
        <EmptyState title="Report not found" description="The contract did not return this report id." />
      ) : null}
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionCard className="p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>None reported.</li>}
      </ul>
    </SectionCard>
  );
}
