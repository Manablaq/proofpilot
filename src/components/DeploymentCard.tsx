import { deployment } from "@/lib/deployment";
import { GlassCard } from "@/components/GlassCard";

function shortHash(value: string) {
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

export function DeploymentCard() {
  const rows = [
    ["Network", deployment.network],
    ["Contract", deployment.contractAddress],
    ["Deployment tx", deployment.deploymentTx],
    ["Smoke test tx", deployment.smokeTestTx],
    ["Run review tx", deployment.runReviewTx],
    ["Validators", deployment.validatorAgreement],
  ];

  return (
    <GlassCard className="p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-200">Live Deployment</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Bradbury verified</h3>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
          Smoke test passed
        </span>
      </div>
      <div className="mt-7 space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm sm:grid-cols-[140px_1fr]"
          >
            <span className="text-slate-400">{label}</span>
            <code className="break-all text-slate-100">
              {value.startsWith("0x") ? shortHash(value) : value}
            </code>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={deployment.explorerContract}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          Open Contract
        </a>
        <a
          href={deployment.explorerTx}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Open Deployment Tx
        </a>
      </div>
    </GlassCard>
  );
}
