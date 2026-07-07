import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { deployment } from "@/lib/deployment";

export default function ReportsPage() {
  const scores = [
    ["Live app availability", 15, 15],
    ["GitHub repository availability", 10, 10],
    ["README/documentation quality", 14, 15],
    ["Contract address consistency", 20, 20],
    ["Deployment transaction proof", 15, 15],
    ["Reviewer feedback addressed", 13, 15],
    ["Professional presentation", 5, 5],
    ["Risk and mismatch checks", 4, 5],
  ];
  const total = scores.reduce((sum, [, score]) => sum + Number(score), 0);

  return (
    <AppBackground>
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase text-cyan-200">Public report preview</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Review certificate
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Static demo of the report surface that will display validated AI consensus
              output, evidence snapshots, risks, and recommendations.
            </p>
          </div>
          <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
            Demo status · READY_FOR_REVIEW
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6 sm:p-8">
            <p className="text-sm text-slate-400">Submission</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">ProofPilot Smoke Test</h2>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-500">Total score</p>
                <p className="mt-2 text-4xl font-semibold text-cyan-100">{total}/100</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-500">Risk</p>
                <p className="mt-2 text-4xl font-semibold text-emerald-100">LOW</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>Recommendation: APPROVE_FOR_HUMAN_REVIEW</p>
              <p>Confidence: HIGH</p>
              <p>Campaign: {deployment.campaignId}</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Rubric breakdown</h2>
            <div className="mt-6 space-y-4">
              {scores.map(([label, score, max]) => (
                <div key={label}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-medium text-white">{score}/{max}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" style={{ width: `${(Number(score) / Number(max)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[
            ["Evidence snapshot", "Live app, GitHub, docs, contract address, and deployment transaction evidence will be shown with fetch status."],
            ["Warnings", "Failed fetches, missing evidence, and address mismatches are never hidden from public reports."],
            ["On-chain anchor", "Reports will link back to immutable contract state and Bradbury explorer records."],
          ].map(([title, text]) => (
            <GlassCard key={title} className="p-6">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </AppBackground>
  );
}
