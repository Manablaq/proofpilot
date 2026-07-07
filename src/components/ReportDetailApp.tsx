"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EvidenceSnapshot, ReviewReport } from "@/lib/proofpilot-schema";
import { parseJsonField } from "@/lib/proofpilot-schema";
import { GlassCard } from "@/components/GlassCard";
import { CopyButton } from "@/components/CopyButton";

export function ReportDetailApp({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [snapshot, setSnapshot] = useState<EvidenceSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const reportRes = await fetch(`/api/reports/${reportId}`, { cache: "no-store" });
        const reportJson = await reportRes.json();
        if (!reportJson.ok) {
          throw new Error(reportJson.error || "Report unavailable");
        }
        const loadedReport = reportJson.data as ReviewReport;
        setReport(loadedReport);
        if (loadedReport.snapshot_id) {
          const snapRes = await fetch(`/api/snapshots/${loadedReport.snapshot_id}`, { cache: "no-store" });
          const snapJson = await snapRes.json();
          if (snapJson.ok) {
            setSnapshot(snapJson.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reportId]);

  const scores = parseJsonField<Record<string, number>>(report?.scores_json, {});
  const findings = parseJsonField<string[]>(report?.findings_json, []);
  const risks = parseJsonField<string[]>(report?.risks_json, []);
  const missing = parseJsonField<string[]>(report?.missing_evidence_json, []);
  const failures = parseJsonField<string[]>(report?.fetch_failures_json, []);
  const sourceUrls = parseJsonField<Record<string, string>>(snapshot?.source_urls_json, {});
  const fetchResults = parseJsonField<Record<string, { status?: string; http_status?: number; used_method?: string; error?: string }>>(snapshot?.fetch_results_json, {});
  const warnings = parseJsonField<string[]>(snapshot?.warnings_json, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <Link href={report ? `/submissions/${report.submission_id}` : "/reports"} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
        Back to submission
      </Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{reportId}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Public on-chain review report from ProofPilot v6.
          </p>
        </div>
        {report ? (
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-5 py-4">
            <p className="text-sm text-cyan-100">Total score</p>
            <p className="text-4xl font-semibold text-white">{report.total_score}</p>
          </div>
        ) : null}
      </div>
      {loading ? <p className="mt-8 text-slate-400">Loading report from Bradbury...</p> : null}
      {error ? <p className="mt-8 text-amber-200">{error}</p> : null}

      {report ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Certificate</h2>
            <div className="mt-6 grid gap-4">
              {[
                ["Report ID", report.report_id],
                ["Submission ID", report.submission_id],
                ["Campaign ID", report.campaign_id],
                ["Builder", report.builder],
                ["Snapshot", report.snapshot_id],
                ["Status", report.status],
                ["Recommendation", report.recommendation],
                ["Risk", report.risk_level],
                ["Confidence", report.confidence],
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
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Scores by category</h2>
            <div className="mt-6 space-y-3">
              {Object.entries(scores).map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-300">{label.replaceAll("_", " ")}</span>
                    <span className="font-semibold text-white">{score}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${Math.max(0, Math.min(100, Number(score)))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}

      {report ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[["Findings", findings], ["Risks", risks], ["Missing evidence", missing], ["Fetch failures", failures]].map(([label, items]) => (
            <GlassCard key={label as string} className="p-6">
              <h3 className="text-xl font-semibold text-white">{label as string}</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {(items as string[]).length ? (items as string[]).map((item) => <li key={item}>{item}</li>) : <li>None reported.</li>}
              </ul>
            </GlassCard>
          ))}
        </div>
      ) : null}

      {snapshot ? (
        <GlassCard className="mt-6 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Evidence snapshot</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(fetchResults).map(([source, result]) => (
              <div key={source} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="font-semibold text-slate-100">{source}</p>
                <p className="mt-2 text-sm text-slate-400">Status: {result.status ?? "unknown"} {result.http_status ? `(${result.http_status})` : ""}</p>
                <p className="mt-1 text-sm text-slate-500">Method: {result.used_method ?? "unknown"}</p>
                {sourceUrls[source] ? <p className="mt-2 break-all text-xs text-slate-500">{sourceUrls[source]}</p> : null}
              </div>
            ))}
          </div>
          {warnings.length ? <p className="mt-5 text-sm text-amber-200">Warnings: {warnings.join(", ")}</p> : null}
        </GlassCard>
      ) : null}

      {report ? (
        <details className="mt-6 rounded-lg border border-white/10 bg-slate-950/80 p-5">
          <summary className="cursor-pointer text-sm font-semibold text-slate-200">Raw review JSON</summary>
          <pre className="mt-4 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-300">
            {JSON.stringify(parseJsonField<unknown>(report.raw_review_json, report.raw_review_json), null, 2)}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
