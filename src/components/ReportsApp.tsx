"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { GlassCard } from "@/components/GlassCard";

export function ReportsApp() {
  const [reports, setReports] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/reports?campaignId=${deployment.campaignId}&limit=50`, { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Reports unavailable");
        }
        setReports(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load reports");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <p className="text-sm font-semibold uppercase text-cyan-200">Reports</p>
      <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Public review reports</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        Reports are read directly from ProofPilot contract state. Failed fetches, unsupported proof, and risk warnings stay visible.
      </p>
      {loading ? <p className="mt-8 text-slate-400">Loading reports from Bradbury...</p> : null}
      {error ? <p className="mt-8 text-amber-200">{error}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {reports.length === 0 && !loading && !error ? (
          <GlassCard className="p-6 text-slate-300">No reports returned for {deployment.campaignId}.</GlassCard>
        ) : reports.map((id) => (
          <GlassCard key={id} className="p-6">
            <p className="text-sm text-slate-400">Report ID</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{id}</h2>
            <p className="mt-3 text-sm text-slate-400">
              Open the report to inspect score, findings, risks, missing evidence, fetch failures, and evidence snapshot.
            </p>
            <Link href={`/reports/${id}`} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
              Open report
            </Link>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
