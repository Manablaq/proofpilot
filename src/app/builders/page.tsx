import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";

export default function BuildersPage() {
  const history = [
    ["campaign_1", "ProofPilot Smoke Test", "ACTIVE", "Smoke test campaign created"],
    ["future", "Grant milestone reviews", "Preview", "Submissions will appear after live reads"],
    ["future", "Hackathon judging", "Preview", "Reports will update builder reputation"],
  ];

  return (
    <AppBackground>
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase text-cyan-200">Builder profile preview</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xl font-semibold text-cyan-100">
                PP
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white">ProofPilot Builder</h1>
                <p className="mt-2 break-all text-sm text-slate-400">
                  0x1f87Ae197af539253978d435aD45cCf28Fb95024
                </p>
              </div>
            </div>
            <p className="mt-8 text-lg leading-8 text-slate-300">
              Static reputation preview for future on-chain builder profiles. Live reads
              will populate submission counts, approvals, average scores, appeals, and
              recent review reports.
            </p>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Reputation score", "0", "Pending first review"],
              ["Completed reviews", "0", "No AI reports yet"],
              ["Approvals", "0", "No human decisions yet"],
              ["Re-checks", "0", "No re-check requests"],
            ].map(([label, value, note]) => (
              <GlassCard key={label} className="p-5">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
                <p className="mt-3 text-sm text-slate-500">{note}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <GlassCard className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Campaign history</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
            {history.map(([id, title, status, note]) => (
              <div key={`${id}-${title}`} className="grid gap-3 border-b border-white/10 bg-white/[0.03] p-4 text-sm last:border-b-0 md:grid-cols-[120px_1fr_120px_1.4fr]">
                <code className="text-cyan-100">{id}</code>
                <span className="text-white">{title}</span>
                <span className="text-slate-300">{status}</span>
                <span className="text-slate-400">{note}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </AppBackground>
  );
}
