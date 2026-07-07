"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Campaign } from "@/lib/proofpilot-schema";
import { deployment } from "@/lib/deployment";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge, statusTone } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { LoadingState } from "@/components/app/LoadingState";

export function AppCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const listRes = await fetch("/api/campaigns", { cache: "no-store" });
        const listJson = await listRes.json();
        if (!listJson.ok) {
          throw new Error(listJson.error || "Campaign list unavailable");
        }
        const ids = Array.isArray(listJson.data) ? listJson.data : [];
        const loaded = await Promise.all(ids.map(async (id: string) => {
          const res = await fetch(`/api/campaigns/${id}`, { cache: "no-store" });
          const json = await res.json();
          return json.ok ? json.data as Campaign : null;
        }));
        setCampaigns(loaded.filter(Boolean) as Campaign[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load campaigns");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => campaigns.filter((campaign) => {
    const text = `${campaign.campaign_id} ${campaign.title} ${campaign.description}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "ALL" || campaign.status === status);
  }), [campaigns, query, status]);

  return (
    <div>
      <PageHeader
        eyebrow="Campaigns"
        title="Program workspaces"
        description="Create review programs, inspect live campaign state, and route builder submissions into on-chain review."
        actions={<Link href="/app/campaigns/new" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">Create campaign</Link>}
      />

      <SectionCard className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label>
            <span className="sr-only">Search campaigns</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaign id, title, or description"
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
            />
          </label>
          <label>
            <span className="sr-only">Filter campaign status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PAUSED">PAUSED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </label>
        </div>
      </SectionCard>

      {loading ? <LoadingState rows={3} /> : null}
      {error ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState title="No campaigns match" description="Create a campaign or adjust the filters. Live contract reads remain the source of truth." action={{ label: "Create campaign", href: "/app/campaigns/new" }} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((campaign) => (
          <SectionCard key={campaign.campaign_id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{campaign.campaign_id}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{campaign.title}</h2>
              </div>
              <StatusBadge tone={statusTone(campaign.status)}>{campaign.status}</StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{campaign.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/app/campaigns/${campaign.campaign_id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                Open
              </Link>
              {campaign.campaign_id === deployment.campaignId ? (
                <Link href={`/app/submissions/${deployment.submissionId}`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                  Live case
                </Link>
              ) : null}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
