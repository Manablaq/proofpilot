"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BuilderProfile } from "@/lib/proofpilot-schema";
import { parseJsonField, shortHash } from "@/lib/proofpilot-schema";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { SectionCard } from "@/components/app/SectionCard";
import { LoadingState } from "@/components/app/LoadingState";
import { EmptyState } from "@/components/app/EmptyState";
import { CopyButton } from "@/components/CopyButton";

export function AppBuilderProfile({ address }: { address: string }) {
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/builders/${address}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Builder profile unavailable");
        }
        setProfile(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [address]);

  const reports = useMemo(() => parseJsonField<string[]>(profile?.latest_report_ids_json, []), [profile]);
  const campaigns = useMemo(() => parseJsonField<string[]>(profile?.campaign_history_json, []), [profile]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Builders", href: "/app/builders" }, { label: shortHash(address) }]}
        eyebrow="Builder"
        title={profile?.display_name || shortHash(address)}
        description="Builder profile, review history, average score, and campaign participation from ProofPilot state."
      />
      {loading ? <LoadingState rows={4} /> : null}
      {error ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p> : null}
      {profile ? (
        <>
          <SectionCard className="mb-6 p-6">
            <p className="text-sm text-slate-500">Builder address</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="break-all text-slate-100">{profile.builder}</code>
              <CopyButton value={profile.builder} />
            </div>
          </SectionCard>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Average score" value={String(profile.average_score)} note="From stored reviews" />
            <StatCard label="Submissions" value={String(profile.submission_count)} note="Submitted projects" tone="violet" />
            <StatCard label="Reports" value={String(profile.review_count)} note="Completed AI reviews" tone="emerald" />
            <StatCard label="Approvals" value={String(profile.approved_count)} note="Approve recommendations" tone="amber" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Latest reports</h2>
              <div className="mt-5 space-y-3">
                {reports.length ? reports.map((id) => (
                  <Link key={id} href={`/app/reports/${id}`} className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 text-slate-100 hover:bg-white/[0.07]">{id}</Link>
                )) : <EmptyState title="No reports linked" description="Reports are linked after successful reviews." />}
              </div>
            </SectionCard>
            <SectionCard className="p-6">
              <h2 className="text-2xl font-semibold text-white">Campaign history</h2>
              <div className="mt-5 space-y-3">
                {campaigns.length ? campaigns.map((id) => (
                  <Link key={id} href={`/app/campaigns/${id}`} className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 text-slate-100 hover:bg-white/[0.07]">{id}</Link>
                )) : <EmptyState title="No campaign history" description="Campaign history appears after submissions." />}
              </div>
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
