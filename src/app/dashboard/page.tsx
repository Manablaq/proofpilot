import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { deployment } from "@/lib/deployment";

export default function DashboardPage() {
  const metrics = [
    ["Campaigns", "1", "campaign_1 active on Bradbury"],
    ["Submissions", "0", "No builder submissions integrated yet"],
    ["Reviews", "0", "AI report reads are next"],
    ["Appeals", "0", "No appeals opened"],
    ["Builder Profiles", "0", "Profiles populate after reviews"],
  ];

  return (
    <AppBackground>
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-200">Operator Preview</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
              ProofPilot dashboard
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Read-only dashboard preview. Live contract reads are the next integration step.
            </p>
          </div>
          <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
            Smoke test passed · validators {deployment.validatorAgreement}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map(([label, value, note]) => (
            <GlassCard key={label} className="p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{note}</p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-cyan-200">Active campaign</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {deployment.campaignTitle}
                </h2>
              </div>
              <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                {deployment.campaignStatus}
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Campaign ID", deployment.campaignId],
                ["Network", deployment.network],
                ["Validator agreement", deployment.validatorAgreement],
                ["Live status", "Bradbury Live"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 break-all font-medium text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase text-violet-200">Deployment</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Contract anchor</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Contract address</p>
                <code className="mt-2 block break-all text-slate-100">{deployment.contractAddress}</code>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a href={deployment.explorerContract} target="_blank" rel="noreferrer" className="rounded-full bg-cyan-300 px-5 py-3 text-center font-semibold text-slate-950 hover:bg-cyan-200">
                  View Contract
                </a>
                <a href={deployment.explorerTx} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-3 text-center font-semibold text-white hover:bg-white/10">
                  Deployment Tx
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </AppBackground>
  );
}
