"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { subscribeProofPilotMutation } from "@/lib/live-refresh";
import type { BuilderProfile, Campaign, ReviewReport, Submission } from "@/lib/proofpilot-schema";
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
  const reloadTimer = useRef<number | null>(null);
  const [state, setState] = useState<State>({
    loading: true,
    error: "",
    campaigns: [],
    submission: null,
    report: null,
    profile: null,
  });

  const load = useCallback(async (initial = false) => {
    if (initial) {
      setState((current) => ({ ...current, loading: true }));
    }
    try {
      const campaignsRes = await fetch("/api/campaigns", { cache: "no-store" });
      const campaignsJson = await campaignsRes.json();
      if (!campaignsRes.ok || !campaignsJson.ok) throw new Error(campaignsJson.error || "Campaign list unavailable");
      const campaignIds = Array.isArray(campaignsJson.data) ? campaignsJson.data.filter((id: unknown): id is string => typeof id === "string") : [];
      const campaigns = await Promise.all(campaignIds.map(async (campaignId: string) => {
        const res = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}`, { cache: "no-store" });
        const json = await res.json();
        return res.ok && json.ok ? json.data as Campaign : null;
      }));
      const selectedCampaign = campaigns.find((campaign): campaign is Campaign => Boolean(campaign));
      const submissionIds = selectedCampaign ? await fetch(`/api/submissions?campaignId=${encodeURIComponent(selectedCampaign.campaign_id)}&limit=1`, { cache: "no-store" })
        .then(async (res) => { const json = await res.json(); return res.ok && json.ok && Array.isArray(json.data) ? json.data : []; }) : [];
      const submissionId = submissionIds.find((id: unknown): id is string => typeof id === "string") ?? "";
      const submission = submissionId ? await fetch(`/api/submissions/${encodeURIComponent(submissionId)}`, { cache: "no-store" })
        .then(async (res) => { const json = await res.json(); return res.ok && json.ok ? json.data as Submission : null; }) : null;
      const report = submission?.latest_report_id ? await fetch(`/api/reports/${encodeURIComponent(submission.latest_report_id)}`, { cache: "no-store" })
        .then(async (res) => { const json = await res.json(); return res.ok && json.ok ? json.data as ReviewReport : null; }) : null;
      setState({
        loading: false,
        error: "",
        campaigns: campaignIds,
        submission,
        report,
        profile: null,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Live reads unavailable",
      }));
    }
  }, []);

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) {
      window.clearTimeout(reloadTimer.current);
    }
    reloadTimer.current = window.setTimeout(() => {
      load(false);
    }, 800);
  }, [load]);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeProofPilotMutation(() => scheduleReload());
    const interval = window.setInterval(() => scheduleReload(), 10_000);
    const onFocus = () => scheduleReload();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        scheduleReload();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (reloadTimer.current) {
        window.clearTimeout(reloadTimer.current);
      }
    };
  }, [scheduleReload]);

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
            <StatCard label="Contract" value={shortHash(deployment.contractAddress)} note="Finalized on Bradbury" valueSize="compact">
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
                  <p className="text-sm text-slate-500">End-to-end status</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{state.report ? "Finalized review fixture" : "No review fixture yet"}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {state.report ? "The public fixture has a stored on-chain report. Human program owners retain the final program decision." : "The contract is finalized and readable. Create a campaign, submit public evidence, then run an independent validator review."}
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
                <EmptyState title="No report yet" description="Create a campaign and run a review to establish a public, end-to-end verification record." />
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/app/campaigns/new" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                  Create campaign
                </Link>
                <Link href="/app/campaigns" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                  Inspect campaigns
                </Link>
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">On-chain anchors</h2>
              <div className="mt-5 space-y-4">
                {[
                  ["Contract", deployment.contractAddress],
                  ["Deployment tx", deployment.deploymentTx],
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
