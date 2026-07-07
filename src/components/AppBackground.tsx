import type { ReactNode } from "react";

export function AppBackground({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.16),transparent_30rem),radial-gradient(circle_at_86%_18%,rgba(124,58,237,0.16),transparent_28rem)]" />
      <div className="absolute inset-0 bg-grid bg-[length:64px_64px] opacity-20" />
      <div className="noise absolute inset-0 opacity-25" />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
