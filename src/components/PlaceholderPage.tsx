import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-ink px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-0 bg-grid bg-[length:64px_64px] opacity-20" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            ProofPilot
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Back home
          </Link>
        </nav>
        <section className="flex min-h-[70vh] items-center py-20">
          <GlassCard className="w-full p-8 sm:p-12">
            <p className="text-sm font-semibold uppercase text-cyan-200">App preview</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>
            <div className="mt-10 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-slate-400">
              Live contract integration will connect this surface to ProofPilot campaigns,
              submissions, review reports, and builder profiles.
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
