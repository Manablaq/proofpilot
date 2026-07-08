"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { WalletProvider } from "@/components/WalletProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <WalletProvider>
      <main className="min-h-screen bg-ink text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(34,211,238,0.12),transparent_28rem),radial-gradient(circle_at_88%_12%,rgba(124,58,237,0.12),transparent_30rem)]" />
        <div className="fixed inset-0 bg-grid bg-[length:64px_64px] opacity-[0.14]" />
        <div className="noise fixed inset-0 opacity-20" />

        <div className="relative z-10 lg:grid lg:min-h-screen lg:grid-cols-[280px_1fr]">
          <aside className="hidden border-r border-white/10 bg-slate-950/70 px-4 py-5 backdrop-blur-xl lg:block">
            <AppSidebar pathname={pathname} />
          </aside>

          <div className="min-w-0">
            <AppTopbar onMenu={() => setOpen((value) => !value)} />
            <div className="sticky top-[73px] z-20 px-4 sm:px-6 lg:hidden">
              {open ? (
                <div className="mt-4 rounded-lg border border-white/10 bg-slate-950 p-3 lg:hidden">
                  <AppSidebar pathname={pathname} onNavigate={() => setOpen(false)} />
                </div>
              ) : null}
            </div>
            <div className="px-4 py-8 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </WalletProvider>
  );
}
