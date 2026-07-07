import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section className={`rounded-lg border border-white/10 bg-slate-950/55 shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur-xl ${className}`}>
      {children}
    </section>
  );
}
