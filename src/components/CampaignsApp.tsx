"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import type { Campaign } from "@/lib/proofpilot-schema";
import { GlassCard } from "@/components/GlassCard";
import { WalletPanel } from "@/components/WalletPanel";
import { CampaignForm } from "@/components/CampaignForm";
import { CopyButton } from "@/components/CopyButton";

export function CampaignsApp() {
  const [address, setAddress] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const listRes = await fetch("/api/campaigns", { cache: "no-store" });
        const listJson = await listRes.json();
        if (!listJson.ok) {
          throw new Error(listJson.error || "Campaign list unavailable");
        }
        const campaignIds = Array.isArray(listJson.data) ? listJson.data : [];
        setIds(campaignIds);
        const loaded = await Promise.all(
          campaignIds.map(async (id: string) => {
            const res = await fetch(`/api/campaigns/${id}`, { cache: "no-store" });
            const json = await res.json();
            return json.ok ? json.data as Campaign : null;
          }),
        );
        setCampaigns(loaded.filter(Boolean) as Campaign[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load campaigns");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-200">Campaigns</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Review programs on-chain</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Browse live campaigns, inspect campaign state, and create new programs with browser wallet signing.
          </p>
          <div className="mt-6">
            <WalletPanel onAddress={setAddress} />
          </div>
        </div>
        <CampaignForm address={address} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-white">Public campaign list</h2>
        {loading ? <p className="mt-4 text-slate-400">Loading campaigns from Bradbury...</p> : null}
        {error ? <p className="mt-4 text-amber-200">{error}</p> : null}
        {!loading && !error && ids.length === 0 ? (
          <GlassCard className="mt-4 p-6 text-slate-300">No campaigns returned by the contract.</GlassCard>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <GlassCard key={campaign.campaign_id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{campaign.campaign_id}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{campaign.title}</h3>
                </div>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  {campaign.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{campaign.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <span>Owner {campaign.owner}</span>
                <CopyButton value={campaign.owner} />
              </div>
              <div className="mt-5 flex gap-3">
                <Link href={`/campaigns/${campaign.campaign_id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                  Open campaign
                </Link>
                {campaign.campaign_id === deployment.campaignId ? (
                  <Link href={`/submissions/${deployment.submissionId}`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                    Live submission
                  </Link>
                ) : null}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
