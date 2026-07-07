"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Campaign, Submission } from "@/lib/proofpilot-schema";
import { deployment } from "@/lib/deployment";
import { GlassCard } from "@/components/GlassCard";
import { WalletPanel } from "@/components/WalletPanel";
import { RunReviewPanel } from "@/components/RunReviewPanel";
import { CopyButton } from "@/components/CopyButton";

export function SubmissionDetailApp({ submissionId }: { submissionId: string }) {
  const [address, setAddress] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const submissionRes = await fetch(`/api/submissions/${submissionId}`, { cache: "no-store" });
        const submissionJson = await submissionRes.json();
        if (!submissionJson.ok) {
          throw new Error(submissionJson.error || "Submission unavailable");
        }
        const loadedSubmission = submissionJson.data as Submission;
        setSubmission(loadedSubmission);
        const campaignRes = await fetch(`/api/campaigns/${loadedSubmission.campaign_id}`, { cache: "no-store" });
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

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <Link href={submission ? `/campaigns/${submission.campaign_id}` : "/campaigns"} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Back to campaign
          </Link>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            {submission?.project_name ?? submissionId}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            {submission?.summary || (loading ? "Loading submission from Bradbury..." : "No summary provided.")}
          </p>
          {error ? <p className="mt-4 text-amber-200">{error}</p> : null}
        </div>
        <WalletPanel onAddress={setAddress} />
      </div>

      {submission ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-white">Submission evidence</h2>
              <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                {submission.status}
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Submission ID", submission.submission_id],
                ["Campaign ID", submission.campaign_id],
                ["Builder", submission.builder],
                ["Latest report", submission.latest_report_id || "No report yet"],
                ["Review count", String(submission.review_count)],
                ["Live app", submission.live_app_url],
                ["GitHub", submission.github_repo_url],
                ["Docs", submission.docs_url],
                ["Contract", submission.contract_address],
                ["Deployment tx", submission.deployment_tx_hash],
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
            {submission.latest_report_id ? (
              <Link href={`/reports/${submission.latest_report_id}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                Open report
              </Link>
            ) : null}
          </GlassCard>
          <RunReviewPanel address={address} campaign={campaign} submission={submission} />
        </div>
      ) : null}

      {submissionId === deployment.submissionId ? null : (
        <p className="mt-8 text-sm text-slate-500">
          Live v6 reference submission is {deployment.submissionId}; this page supports future submission IDs returned by the contract.
        </p>
      )}
    </section>
  );
}
