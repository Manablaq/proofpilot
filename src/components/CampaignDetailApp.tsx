"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Campaign } from "@/lib/proofpilot-schema";
import { deployment } from "@/lib/deployment";
import { GlassCard } from "@/components/GlassCard";
import { WalletPanel } from "@/components/WalletPanel";
import { SubmissionForm } from "@/components/SubmissionForm";
import { CopyButton } from "@/components/CopyButton";

export function CampaignDetailApp({ campaignId }: { campaignId: string }) {
  const [address, setAddress] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [campaignRes, submissionsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`, { cache: "no-store" }),
          fetch(`/api/submissions?campaignId=${encodeURIComponent(campaignId)}&limit=50`, { cache: "no-store" }),
        ]);
        const campaignJson = await campaignRes.json();
        const submissionsJson = await submissionsRes.json();
        if (!campaignJson.ok) {
          throw new Error(campaignJson.error || "Campaign unavailable");
        }
        setCampaign(campaignJson.data);
        setSubmissions(Array.isArray(submissionsJson.data) ? submissionsJson.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load campaign");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <Link href="/campaigns" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">Back to campaigns</Link>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            {campaign?.title ?? campaignId}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            {campaign?.description ?? (loading ? "Loading campaign from Bradbury..." : "Campaign details unavailable.")}
          </p>
          {error ? <p className="mt-4 text-amber-200">{error}</p> : null}
          {campaign ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Campaign ID", campaign.campaign_id],
                ["Status", campaign.status],
                ["Owner", campaign.owner],
                ["Contract", deployment.contractAddress],
              ].map(([label, value]) => (
                <GlassCard key={label} className="p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="break-all text-sm text-slate-100">{value}</code>
                    <CopyButton value={value} />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : null}
        </div>
        <WalletPanel onAddress={setAddress} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-white">Submissions</h2>
          <div className="mt-5 space-y-3">
            {submissions.length === 0 ? (
              <p className="text-slate-400">No submissions returned for this campaign.</p>
            ) : submissions.map((id) => (
              <Link
                key={id}
                href={`/submissions/${id}`}
                className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 text-slate-100 transition hover:bg-white/[0.07]"
              >
                {id}
              </Link>
            ))}
          </div>
        </GlassCard>
        <SubmissionForm address={address} campaignId={campaignId} />
      </div>
    </section>
  );
}
