"use client";

import { deployment } from "@/lib/deployment";
import { shortHash } from "@/lib/proofpilot-schema";
import { WalletPanel } from "@/components/WalletPanel";
import { StatusBadge } from "@/components/app/StatusBadge";

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white lg:hidden"
        >
          Menu
        </button>
        <div className="hidden items-center gap-3 lg:flex">
          <StatusBadge tone="success">Bradbury live</StatusBadge>
          <StatusBadge tone="info">{shortHash(deployment.contractAddress)}</StatusBadge>
        </div>
        <div className="min-w-0 flex-1 lg:max-w-xl">
          <WalletPanel />
        </div>
      </div>
    </header>
  );
}
