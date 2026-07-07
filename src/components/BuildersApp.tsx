"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import type { BuilderProfile } from "@/lib/proofpilot-schema";
import { parseJsonField, shortHash } from "@/lib/proofpilot-schema";
import { GlassCard } from "@/components/GlassCard";
import { CopyButton } from "@/components/CopyButton";

export function BuildersApp() {
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/builders/${deployment.builderAddress}`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Builder profile unavailable");
        }
        setProfile(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load builder profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const reports = parseJsonField<string[]>(profile?.latest_report_ids_json, []);
  const campaigns = parseJsonField<string[]>(profile?.campaign_history_json, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <p className="text-sm font-semibold uppercase text-cyan-200">Builder profiles</p>
      <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Builder reputation</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        Profile data is read from the deployed ProofPilot contract. Reputation updates only after stored reports.
      </p>
      {loading ? <p className="mt-8 text-slate-400">Loading builder profile from Bradbury...</p> : null}
      {error ? <p className="mt-8 text-amber-200">{error}</p> : null}

      {profile ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xl font-semibold text-cyan-100">
                PP
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white">{profile.display_name || "ProofPilot Builder"}</h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                  <span>{shortHash(profile.builder)}</span>
                  <CopyButton value={profile.builder} />
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Average score", String(profile.average_score), "From stored review reports"],
              ["Completed reviews", String(profile.review_count), "AI reports stored"],
              ["Submissions", String(profile.submission_count), "Projects submitted"],
              ["Approvals", String(profile.approved_count), "Approve recommendations"],
            ].map(([label, value, note]) => (
              <GlassCard key={label} className="p-5">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
                <p className="mt-3 text-sm text-slate-500">{note}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : null}

      {profile ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white">Latest reports</h3>
            <div className="mt-4 space-y-3">
              {reports.length ? reports.map((id) => (
                <Link key={id} href={`/reports/${id}`} className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 text-slate-100 hover:bg-white/[0.07]">
                  {id}
                </Link>
              )) : <p className="text-slate-400">No reports linked yet.</p>}
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white">Campaign history</h3>
            <div className="mt-4 space-y-3">
              {campaigns.length ? campaigns.map((id) => (
                <Link key={id} href={`/campaigns/${id}`} className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 text-slate-100 hover:bg-white/[0.07]">
                  {id}
                </Link>
              )) : <p className="text-slate-400">No campaign history linked yet.</p>}
            </div>
          </GlassCard>
        </div>
      ) : null}
    </section>
  );
}
