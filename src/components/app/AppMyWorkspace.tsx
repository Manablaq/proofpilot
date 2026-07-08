"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { canonicalAddress, sameAddress } from "@/lib/address";
import type { BuilderProfile, Campaign, ReviewReport, Submission } from "@/lib/proofpilot-schema";
import { parseJsonField, shortHash } from "@/lib/proofpilot-schema";
import { getLocalTxHistory, type LocalTxEntry } from "@/lib/tx-history";
import { useWallet } from "@/components/WalletProvider";
import { WalletPanel } from "@/components/WalletPanel";
import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { LoadingState } from "@/components/app/LoadingState";

type WorkspaceState = {
  loading: boolean;
  error: string;
  refreshedAt: string;
  profile: BuilderProfile | null;
  campaignsOwned: Campaign[];
  submissions: Submission[];
  reports: ReviewReport[];
  localTxs: LocalTxEntry[];
};

async function readApi<T>(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Read unavailable");
  }
  return json.data as T;
}

function normalizeIds(value: unknown, key: string) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }
  return value
    .map((item) => typeof item === "string" ? item : typeof item === "object" && item && key in item ? String((item as Record<string, unknown>)[key] ?? "") : "")
    .filter(Boolean);
}

export function AppMyWorkspace() {
  const wallet = useWallet();
  const walletReadAddress = wallet.address ? canonicalAddress(wallet.address) : "";
  const [state, setState] = useState<WorkspaceState>({
    loading: false,
    error: "",
    refreshedAt: "",
    profile: null,
    campaignsOwned: [],
    submissions: [],
    reports: [],
    localTxs: [],
  });
  const [reloadNonce, setReloadNonce] = useState(0);

  const reload = useCallback(() => setReloadNonce((value) => value + 1), []);

  useEffect(() => {
    if (!walletReadAddress) {
      setState((current) => ({ ...current, loading: false, localTxs: [] }));
      return;
    }

    let active = true;

    async function loadWorkspace() {
      setState((current) => ({ ...current, loading: true, error: "", localTxs: getLocalTxHistory(walletReadAddress) }));
      try {
        const [profileResult, campaignListRaw, submissionListRaw] = await Promise.all([
          readApi<BuilderProfile>(`/api/builders/${encodeURIComponent(walletReadAddress)}`).catch(() => null),
          readApi<unknown>("/api/campaigns").catch(() => []),
          readApi<unknown>(`/api/submissions?builder=${encodeURIComponent(walletReadAddress)}&offset=0&limit=50`).catch(() => []),
        ]);
        const campaignIds = normalizeIds(campaignListRaw, "campaign_id");
        const submissionIds = normalizeIds(submissionListRaw, "submission_id");

        const campaigns = (await Promise.all(
          campaignIds.map((campaignId) => readApi<Campaign>(`/api/campaigns/${encodeURIComponent(campaignId)}`).catch(() => null)),
        )).filter((campaign): campaign is Campaign => Boolean(campaign));

        const owned = campaigns.filter((campaign) => sameAddress(campaign.owner, walletReadAddress));
        const submissions = (await Promise.all(
          submissionIds.map((submissionId) => readApi<Submission>(`/api/submissions/${encodeURIComponent(submissionId)}`).catch(() => null)),
        )).filter((submission): submission is Submission => Boolean(submission));

        const reports = (await Promise.all(
          submissions
            .map((submission) => submission.latest_report_id)
            .filter(Boolean)
            .map((reportId) => readApi<ReviewReport>(`/api/reports/${encodeURIComponent(reportId)}`).catch(() => null)),
        )).filter((report): report is ReviewReport => Boolean(report));

        if (!active) {
          return;
        }

        setState({
          loading: false,
          error: "",
          refreshedAt: new Date().toISOString(),
          profile: profileResult,
          campaignsOwned: owned,
          submissions,
          reports,
          localTxs: getLocalTxHistory(walletReadAddress),
        });
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : "Workspace reads unavailable",
            localTxs: getLocalTxHistory(walletReadAddress),
          }));
        }
      }
    }

    loadWorkspace();
    return () => {
      active = false;
    };
  }, [reloadNonce, walletReadAddress]);

  const averageScore = useMemo(() => {
    if (state.profile?.average_score) {
      return state.profile.average_score;
    }
    if (!state.reports.length) {
      return null;
    }
    return Math.round(state.reports.reduce((sum, report) => sum + report.total_score, 0) / state.reports.length);
  }, [state.profile, state.reports]);

  const activity = useMemo(() => {
    const live = [
      ...state.submissions.map((submission) => ({
        id: submission.submission_id,
        title: `Submitted ${submission.project_name || submission.submission_id}`,
        meta: `${submission.campaign_id} · ${submission.status}`,
        href: `/app/submissions/${submission.submission_id}`,
        source: "Bradbury live",
      })),
      ...state.reports.map((report) => ({
        id: report.report_id,
        title: `Received report ${report.report_id}`,
        meta: `Score ${report.total_score} · ${report.status}`,
        href: `/app/reports/${report.report_id}`,
        source: "Bradbury live",
      })),
      ...state.campaignsOwned.map((campaign) => ({
        id: campaign.campaign_id,
        title: `Owns campaign ${campaign.title || campaign.campaign_id}`,
        meta: campaign.status,
        href: `/app/campaigns/${campaign.campaign_id}`,
        source: "Bradbury live",
      })),
    ];

    const browser = state.localTxs.map((tx) => ({
      id: tx.id,
      title: `${tx.method} transaction ${tx.status}`,
      meta: tx.evmTx ? shortHash(tx.evmTx) : tx.updatedAt,
      href: tx.evmTx ? `${deployment.explorerBase}/tx/${tx.evmTx}` : "",
      source: "This browser",
    }));

    return [...browser, ...live].slice(0, 12);
  }, [state.campaignsOwned, state.localTxs, state.reports, state.submissions]);

  if (!wallet.address) {
    return (
      <div>
        <PageHeader
          eyebrow="Personal workspace"
          title="My workspace"
          description="Connect wallet to view your ProofPilot submissions, reports, campaigns, and browser-local transaction activity."
        />
        <SectionCard className="p-6 sm:p-8">
          <EmptyState
            title="Connect wallet to view your ProofPilot workspace."
            description="Your wallet address is used only for public Bradbury reads and local browser activity. No private keys are requested or stored."
          />
          <div className="mx-auto mt-6 max-w-xl">
            <WalletPanel />
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Personal workspace"
        title="My workspace"
        description="Your submissions, reports, campaigns, and wallet activity on ProofPilot."
        actions={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reload} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Refresh
            </button>
            <Link href="/app/submit" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
              Submit project
            </Link>
          </div>
        }
      />

      <SectionCard className="mb-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Connected wallet</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="break-all rounded-md bg-slate-950/60 px-2 py-1 font-mono text-sm text-slate-100">{shortHash(wallet.address)}</code>
              <CopyButton value={wallet.address} />
              <StatusBadge tone={wallet.wrongNetwork ? "warning" : "success"}>{wallet.wrongNetwork ? "Wrong network" : "Bradbury"}</StatusBadge>
              <StatusBadge tone="info">Bradbury live</StatusBadge>
            </div>
          </div>
          <WalletPanel variant="compact" />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {state.loading ? "Refreshing Bradbury live reads..." : state.refreshedAt ? `Last refreshed ${new Date(state.refreshedAt).toLocaleString()}` : "Bradbury live reads load when the wallet connects."}
        </p>
      </SectionCard>

      {state.error ? <p className="mb-6 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{state.error}</p> : null}

      {state.loading && !state.submissions.length && !state.reports.length && !state.campaignsOwned.length ? <LoadingState rows={4} /> : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Total submissions" value={String(state.submissions.length)} note="Bradbury live" />
            <StatCard label="Reviewed" value={String(state.submissions.filter((submission) => submission.status === "REVIEWED").length)} note="Submissions with review status" tone="emerald" />
            <StatCard label="Reports received" value={String(state.reports.length)} note="Latest report reads" tone="violet" />
            <StatCard label="Average score" value={averageScore === null ? "N/A" : String(averageScore)} note="Profile or report average" tone="amber" />
            <StatCard label="Campaigns owned" value={String(state.campaignsOwned.length)} note="Owner match" />
            <StatCard label="Local txs" value={String(state.localTxs.length)} note="This browser" tone="emerald" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard className="p-6">
              <SectionTitle title="My submissions" source="Bradbury live" />
              {state.submissions.length ? (
                <div className="mt-5 space-y-3">
                  {state.submissions.map((submission) => (
                    <RecordCard key={submission.submission_id}>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{submission.project_name || submission.submission_id}</p>
                        <p className="mt-1 font-mono text-xs text-slate-500">{submission.submission_id} · {submission.campaign_id}</p>
                      </div>
                      <StatusBadge tone={statusTone(submission.status)}>{submission.status}</StatusBadge>
                      <div className="flex flex-wrap gap-2">
                        <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={`/app/submissions/${submission.submission_id}`}>View submission</Link>
                        {submission.latest_report_id ? <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={`/app/reports/${submission.latest_report_id}`}>View report</Link> : null}
                      </div>
                    </RecordCard>
                  ))}
                </div>
              ) : <EmptyState title="No submissions yet." description="Submit a Web3 Project to create your first builder record." action={{ label: "Submit project", href: "/app/submit" }} />}
            </SectionCard>

            <SectionCard className="p-6">
              <SectionTitle title="My reports" source="Bradbury live" />
              {state.reports.length ? (
                <div className="mt-5 space-y-3">
                  {state.reports.map((report) => (
                    <RecordCard key={report.report_id}>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{report.report_id}</p>
                        <p className="mt-1 text-sm text-slate-400">Score {report.total_score} · {report.submission_id}</p>
                      </div>
                      <StatusBadge tone={statusTone(report.risk_level)}>{report.risk_level}</StatusBadge>
                      <div className="text-sm text-slate-400">
                        <p>{report.status.replaceAll("_", " ")}</p>
                        <p>{report.recommendation.replaceAll("_", " ")}</p>
                      </div>
                      <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={`/app/reports/${report.report_id}`}>Open report certificate</Link>
                    </RecordCard>
                  ))}
                </div>
              ) : <EmptyState title="No reports received yet." description="Reports appear after a campaign owner runs review for one of your submissions." />}
            </SectionCard>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard className="p-6">
              <SectionTitle title="Campaigns I own" source="Bradbury live" />
              {state.campaignsOwned.length ? (
                <div className="mt-5 space-y-3">
                  {state.campaignsOwned.map((campaign) => (
                    <RecordCard key={campaign.campaign_id}>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{campaign.title || campaign.campaign_id}</p>
                        <p className="mt-1 font-mono text-xs text-slate-500">{campaign.campaign_id}</p>
                      </div>
                      <StatusBadge tone={statusTone(campaign.status)}>{campaign.status}</StatusBadge>
                      <div className="flex flex-wrap gap-2">
                        <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={`/app/campaigns/${campaign.campaign_id}`}>Open campaign</Link>
                        <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={`/app/submit?campaignId=${campaign.campaign_id}`}>Submit project</Link>
                      </div>
                    </RecordCard>
                  ))}
                </div>
              ) : <EmptyState title="No campaigns owned yet." description="Create a campaign to start collecting builder submissions." action={{ label: "Create campaign", href: "/app/campaigns/new" }} />}
            </SectionCard>

            <SectionCard className="p-6">
              <SectionTitle title="Activity" source="Bradbury live + this browser" />
              {activity.length ? (
                <div className="mt-5 space-y-3">
                  {activity.map((item) => (
                    <div key={`${item.source}-${item.id}`} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{item.title}</p>
                          <StatusBadge tone={item.source === "Bradbury live" ? "success" : "info"}>{item.source}</StatusBadge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                      </div>
                      {item.href ? (
                        <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>
                          Open
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No local transactions in this browser." description="Wallet-signed ProofPilot transactions will appear here after you prepare or send them from this browser." />}
            </SectionCard>
          </div>

          {state.profile ? (
            <SectionCard className="mt-8 p-6">
              <SectionTitle title="Builder profile" source="Bradbury live" />
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ProfileLine label="Latest reports" value={parseJsonField<string[]>(state.profile.latest_report_ids_json, []).join(", ") || "None"} />
                <ProfileLine label="Re-checks" value={String(state.profile.recheck_count)} />
                <ProfileLine label="Appeals" value={String(state.profile.appeal_count)} />
              </div>
            </SectionCard>
          ) : null}
        </>
      )}
    </div>
  );
}

function SectionTitle({ title, source }: { title: string; source: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <StatusBadge tone={source.includes("browser") ? "info" : "success"}>{source}</StatusBadge>
    </div>
  );
}

function RecordCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto]">
      {children}
    </div>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm text-slate-200">{value}</p>
    </div>
  );
}
