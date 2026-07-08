"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import type { BuilderProfile, ReviewReport, Submission } from "@/lib/proofpilot-schema";
import { parseJsonField, shortHash } from "@/lib/proofpilot-schema";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";
import { LoadingState } from "@/components/app/LoadingState";
import { EmptyState } from "@/components/app/EmptyState";
import { CopyButton } from "@/components/CopyButton";

type State = {
  loading: boolean;
  error: string;
  campaigns: string[];
  submission: Submission | null;
  report: ReviewReport | null;
  profile: BuilderProfile | null;
};

export function AppOverview() {
  const [state, setState] = useState<State>({
    loading: true,
    error: "",
    campaigns: [],
    submission: null,
    report: null,
    profile: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const [campaignsRes, submissionRes, reportRes, profileRes] = await Promise.all([
          fetch("/api/campaigns", { cache: "no-store" }),
          fetch(`/api/submissions/${deployment.submissionId}`, { cache: "no-store" }),
          fetch(`/api/reports/${deployment.reportId}`, { cache: "no-store" }),
          fetch(`/api/builders/${deployment.builderAddress}`, { cache: "no-store" }),
        ]);
        const [campaignsJson, submissionJson, reportJson, profileJson] = await Promise.all([
          campaignsRes.json(),
          submissionRes.json(),
          reportRes.json(),
          profileRes.json(),
        ]);
        setState({
          loading: false,
          error: "",
          campaigns: Array.isArray(campaignsJson.data) ? campaignsJson.data : [],
          submission: submissionJson.ok ? submissionJson.data : null,
          report: reportJson.ok ? reportJson.data : null,
          profile: profileJson.ok ? profileJson.data : null,
        });
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Live reads unavailable",
        }));
      }
    }
    load();
  }, []);

  const scoreItems = useMemo(() => parseJsonField<Record<string, number>>(state.report?.scores_json, {}), [state.report]);
  const prettyValue = (value: string) => value.replaceAll("_", " ");

  return (
    <div>
      <PageHeader
        eyebrow="Product Home"
        title="ProofPilot operations console"
        description="Live Bradbury state, report output, and wallet-signed review workflows in one workspace."
        actions={
          <>
            <Link href="/app/campaigns/new" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
              Create campaign
            </Link>
            <Link href="/app/submit" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Submit project
            </Link>
          </>
        }
      />

      {state.error ? <p className="mb-6 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{state.error}</p> : null}

      {state.loading ? (
        <LoadingState rows={4} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Active campaigns" value={String(state.campaigns.length)} note="Read from list_campaigns" />
            <StatCard label="Submissions" value={state.submission ? "1" : "0"} note={state.submission?.status ?? "No live submission loaded"} tone="violet" />
            <StatCard label="Reports" value={state.report ? "1" : "0"} note={state.report?.report_id ?? "No report loaded"} tone="emerald" />
            <StatCard label="Average score" value={String(state.profile?.average_score ?? state.report?.total_score ?? 0)} note="Builder profile" tone="amber" />
            <StatCard label="Contract" value={shortHash(deployment.contractAddress)} note="Bradbury v6" valueSize="compact">
              <CopyButton value={deployment.contractAddress} />
              <a className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-white/10" href={deployment.explorerContract} target="_blank" rel="noreferrer">
                Explorer
              </a>
            </StatCard>
            <StatCard label="Network" value="Bradbury" note="GenLayer testnet" tone="emerald" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Recent live case</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{deployment.campaignTitle}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {deployment.submissionId} reviewed into {deployment.reportId}.
                  </p>
                </div>
                {state.report ? <StatusBadge tone={statusTone(state.report.status)}>{state.report.status}</StatusBadge> : null}
              </div>
              {state.report ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-4">
                  {[
                    ["Score", String(state.report.total_score)],
                    ["Risk", prettyValue(state.report.risk_level)],
                    ["Confidence", prettyValue(state.report.confidence)],
                    ["Recommendation", prettyValue(state.report.recommendation)],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase text-slate-500">{label}</p>
                      <p className="mt-2 text-sm font-semibold capitalize leading-5 text-white">{value.toLowerCase()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No report loaded" description="The live report endpoint did not return a report. Try refreshing or inspect the contract directly." />
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/app/reports/${deployment.reportId}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                  Open report certificate
                </Link>
                <Link href={`/app/submissions/${deployment.submissionId}`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                  Open submission
                </Link>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">On-chain anchors</h2>
              <div className="mt-5 space-y-4">
                {[
                  ["Contract", deployment.contractAddress],
                  ["Deployment tx", deployment.deploymentTx],
                  ["Run review tx", deployment.runReviewTx],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <code className="min-w-0 break-all rounded-md bg-slate-950/60 px-2 py-1 font-mono text-xs leading-6 text-slate-100 sm:text-sm">{value}</code>
                      <div className="flex shrink-0 gap-2">
                        <CopyButton value={value} />
                        <a className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-white/10" href={`${deployment.explorerBase}/${label === "Contract" ? "address" : "tx"}/${value}`} target="_blank" rel="noreferrer">
                          Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard className="mt-8 p-6">
            <h2 className="text-2xl font-semibold text-white">Score breakdown</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {Object.keys(scoreItems).length ? Object.entries(scoreItems).map(([label, score]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-300">{label.replaceAll("_", " ")}</span>
                    <span className="font-semibold text-white">{score}</span>
                  </div>
                </div>
              )) : <EmptyState title="No score data" description="Score data appears after a report read succeeds." />}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
