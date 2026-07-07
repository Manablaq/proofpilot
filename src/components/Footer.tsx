import Link from "next/link";
import { deployment } from "@/lib/deployment";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 text-sm text-slate-400 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">ProofPilot</p>
          <p className="mt-1">AI consensus review for the builder economy.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/reports" className="hover:text-white">
            Reports
          </Link>
          <Link href="/builders" className="hover:text-white">
            Builders
          </Link>
          <a
            href={deployment.explorerContract}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            Explorer
          </a>
        </div>
      </div>
    </footer>
  );
}
