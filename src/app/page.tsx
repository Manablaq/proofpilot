import { DeploymentCard } from "@/components/DeploymentCard";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/GlassCard";
import { HowItWorks } from "@/components/HowItWorks";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusPill } from "@/components/StatusPill";
import { UseCases } from "@/components/UseCases";
import { VideoHero } from "@/components/VideoHero";

const trust = [
  "Deployed on GenLayer Bradbury",
  "Live smoke test passed",
  "Validators agreed 5/5",
  "On-chain review reports",
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-ink">
      <VideoHero />

      <section className="relative px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item, index) => (
            <GlassCard key={item} className="p-4">
              <p className="text-xs uppercase text-slate-500">Status 0{index + 1}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <GlassCard className="p-7 sm:p-10">
            <StatusPill tone="violet">Problem</StatusPill>
            <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
              Review workflows are too slow, opaque, and fragmented.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Builders wait too long for review, feedback is unclear, and proof is
              scattered across live apps, GitHub, docs, and explorer links.
            </p>
          </GlassCard>
          <GlassCard className="p-7 sm:p-10">
            <StatusPill>Solution</StatusPill>
            <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
              ProofPilot turns evidence into an auditable review record.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              ProofPilot fetches evidence, runs AI consensus review, validates reports,
              and stores transparent results on-chain.
            </p>
          </GlassCard>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Workflow"
            title="From campaign setup to public review certificate."
            description="A complete review flow for grants, hackathons, bounties, DAOs, and ecosystem programs that need evidence-backed decisions."
          />
          <div className="mt-14">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Use cases"
            title="Built for serious builder evaluation."
            description="ProofPilot gives programs a consistent evidence layer for submissions where live state, repository quality, deployment proof, and reviewer feedback all matter."
          />
          <div className="mt-14">
            <UseCases />
          </div>
        </div>
      </section>

      <section id="deployment" className="px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-200">
              Live on Bradbury
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
              Deployed, reviewed, and ready for live contract reads.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              The deployed ProofPilot v6 contract has created a campaign, accepted a
              submission, and stored its first on-chain AI review report on GenLayer
              Bradbury with 5/5 validator agreement.
            </p>
          </div>
          <DeploymentCard />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-lg border border-cyan-200/20 bg-gradient-to-br from-cyan-300/15 via-blue-500/10 to-violet-500/15 p-8 text-center shadow-glow sm:p-14">
          <h2 className="text-3xl font-semibold text-white sm:text-5xl">
            Start reviewing builder submissions with AI consensus.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Launch the dashboard preview, inspect public report surfaces, and prepare
            campaigns for live on-chain review workflows.
          </p>
          <a
            href="/dashboard"
            className="mt-9 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Launch Dashboard
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
