"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Campaign } from "@/lib/proofpilot-schema";
import { deployment } from "@/lib/deployment";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";
import { LoadingState } from "@/components/app/LoadingState";
import { EmptyState } from "@/components/app/EmptyState";
import { CopyButton } from "@/components/CopyButton";

export function AppCampaignDetail({ campaignId }: { campaignId: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [reports, setReports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [campaignRes, submissionsRes, reportsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`, { cache: "no-store" }),
          fetch(`/api/submissions?campaignId=${encodeURIComponent(campaignId)}&limit=50`, { cache: "no-store" }),
          fetch(`/api/reports?campaignId=${encodeURIComponent(campaignId)}&limit=50`, { cache: "no-store" }),
        ]);
        const [campaignJson, submissionsJson, reportsJson] = await Promise.all([
          campaignRes.json(),
          submissionsRes.json(),
          reportsRes.json(),
        ]);
        if (!campaignJson.ok) {
          throw new Error(campaignJson.error || "Campaign unavailable");
        }
        setCampaign(campaignJson.data);
        setSubmissions(Array.isArray(submissionsJson.data) ? submissionsJson.data : []);
        setReports(Array.isArray(reportsJson.data) ? reportsJson.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load campaign");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/app/campaigns" }, { label: campaignId }]}
        eyebrow="Campaign"
        title={campaign?.title ?? campaignId}
        description={campaign?.description ?? "Live campaign detail loaded from the ProofPilot contract."}
        actions={<Link href={`/app/submit?campaignId=${campaignId}`} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">Submit project</Link>}
      />

      {loading ? <LoadingState rows={4} /> : null}
      {error ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p> : null}

      {campaign ? (
        <div className="space-y-6">
          <SectionCard className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Overview</h2>
                <p className="mt-2 text-sm text-slate-400">Campaign state and ownership from Bradbury.</p>
              </div>
              <StatusBadge tone={statusTone(campaign.status)}>{campaign.status}</StatusBadge>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Campaign ID", campaign.campaign_id],
                ["Owner", campaign.owner],
                ["Submissions", String(submissions.length)],
                ["Reports", String(reports.length)],
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
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Submissions</h2>
              <div className="mt-5 space-y-3">
                {submissions.length ? submissions.map((id) => (
                  <Link key={id} href={`/app/submissions/${id}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.07]">
                    <span className="font-medium text-white">{id}</span>
                    {id === deployment.submissionId ? <StatusBadge tone="success">Live reviewed case</StatusBadge> : null}
                  </Link>
                )) : <EmptyState title="No submissions yet" description="Builder submissions will appear here after wallet-signed submit_project transactions." action={{ label: "Submit project", href: `/app/submit?campaignId=${campaignId}` }} />}
              </div>
            </SectionCard>

            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Reports</h2>
              <div className="mt-5 space-y-3">
                {reports.length ? reports.map((id) => (
                  <Link key={id} href={`/app/reports/${id}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.07]">
                    <span className="font-medium text-white">{id}</span>
                    {id === deployment.reportId ? <StatusBadge tone="warning">Score {deployment.reviewScore}</StatusBadge> : null}
                  </Link>
                )) : <EmptyState title="No reports yet" description="Reports appear after an eligible submission is reviewed." />}
              </div>
            </SectionCard>
          </div>

          <SectionCard className="p-6">
            <h2 className="text-2xl font-semibold text-white">Settings / Policy</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {[
                ["Rubric", "rubric_v1"],
                ["Review trigger", "Campaign owner"],
                ["Contract behavior", "Append-only reports and snapshots"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-sm text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="p-6">
            <h2 className="text-2xl font-semibold text-white">On-chain proof</h2>
            <p className="mt-2 text-sm text-slate-400">ProofPilot contract and live Bradbury deployment anchors.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={deployment.explorerContract} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">Open contract</a>
              <a href={`${deployment.explorerBase}/tx/${deployment.runReviewTx}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Open review tx</a>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
