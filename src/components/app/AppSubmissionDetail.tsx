"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Campaign, Submission } from "@/lib/proofpilot-schema";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";
import { LoadingState } from "@/components/app/LoadingState";
import { CopyButton } from "@/components/CopyButton";
import { WalletPanel } from "@/components/WalletPanel";
import { RunReviewPanel } from "@/components/RunReviewPanel";

export function AppSubmissionDetail({ submissionId }: { submissionId: string }) {
  const [address, setAddress] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Submission unavailable");
        }
        const nextSubmission = json.data as Submission;
        setSubmission(nextSubmission);
        const campaignRes = await fetch(`/api/campaigns/${nextSubmission.campaign_id}`, { cache: "no-store" });
        const campaignJson = await campaignRes.json();
        if (campaignJson.ok) {
          setCampaign(campaignJson.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load submission");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [submissionId]);

  const reviewed = submission?.status === "REVIEWED" && submission.latest_report_id;
  const reviewable = submission && ["SUBMITTED", "RECHECK_REQUESTED"].includes(submission.status);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Campaigns", href: "/app/campaigns" },
          { label: submission?.campaign_id ?? "Campaign", href: submission ? `/app/campaigns/${submission.campaign_id}` : undefined },
          { label: submissionId },
        ]}
        eyebrow="Submission"
        title={submission?.project_name ?? submissionId}
        description={submission?.summary || "Submission evidence and review state from the ProofPilot contract."}
        actions={reviewed ? <Link href={`/app/reports/${submission.latest_report_id}`} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">View report</Link> : null}
      />

      {loading ? <LoadingState rows={4} /> : null}
      {error ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p> : null}

      {submission ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <SectionCard className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Review status</h2>
                  <p className="mt-2 text-sm text-slate-400">Current state, report link, and review count.</p>
                </div>
                <StatusBadge tone={statusTone(submission.status)}>{submission.status}</StatusBadge>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Latest report", submission.latest_report_id || "No report yet"],
                  ["Review count", String(submission.review_count)],
                  ["Builder", submission.builder],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="break-all text-sm text-slate-100">{value}</span>
                      {value.startsWith("0x") || value.includes("_") ? <CopyButton value={value} /> : null}
                    </div>
                  </div>
                ))}
              </div>
              {reviewed ? (
                <div className="mt-6 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="font-semibold text-emerald-100">Review complete</p>
                  <p className="mt-1 text-sm text-emerald-50/80">This submission already has a stored report. Review actions are not shown as the primary path.</p>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Evidence fields</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["Live app", submission.live_app_url],
                  ["GitHub", submission.github_repo_url],
                  ["Docs", submission.docs_url],
                  ["Contract address", submission.contract_address],
                  ["Deployment tx", submission.deployment_tx_hash],
                  ["Campaign", submission.campaign_id],
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
            </SectionCard>
          </div>

          <div className="space-y-6">
            <WalletPanel onAddress={setAddress} />
            {reviewable ? (
              <RunReviewPanel address={address} campaign={campaign} submission={submission} />
            ) : (
              <SectionCard className="p-6">
                <h2 className="text-2xl font-semibold text-white">Review action</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Run review is available only for `SUBMITTED` or `RECHECK_REQUESTED` submissions and only to the campaign owner.
                </p>
                {reviewed ? (
                  <Link href={`/app/reports/${submission.latest_report_id}`} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                    View completed report
                  </Link>
                ) : null}
              </SectionCard>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
