import Link from "next/link";
import { deployment } from "@/lib/deployment";
import { StatusPill } from "@/components/StatusPill";

export function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-ink/70 px-6 py-5 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-5">
          <Link href="/" className="text-xl font-semibold text-white">
            ProofPilot
          </Link>
          <div className="lg:hidden">
            <StatusPill>Bradbury Live</StatusPill>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <Link href="/app" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/app/campaigns" className="hover:text-white">
            Campaigns
          </Link>
          <Link href="/app/reports" className="hover:text-white">
            Reports
          </Link>
          <Link href="/app/builders" className="hover:text-white">
            Builders
          </Link>
          <a href={deployment.explorerContract} target="_blank" rel="noreferrer" className="hover:text-white">
            Explorer
          </a>
          <div className="hidden lg:block">
            <StatusPill>Bradbury Live</StatusPill>
          </div>
        </nav>
      </div>
    </header>
  );
}
