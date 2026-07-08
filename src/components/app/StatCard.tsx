import { SectionCard } from "@/components/app/SectionCard";

type StatCardProps = {
  label: string;
  value: string;
  note?: string;
  tone?: "cyan" | "violet" | "emerald" | "amber";
  valueSize?: "default" | "compact";
  className?: string;
  children?: React.ReactNode;
};

const tones = {
  cyan: "text-cyan-100",
  violet: "text-violet-100",
  emerald: "text-emerald-100",
  amber: "text-amber-100",
};

export function StatCard({ label, value, note, tone = "cyan", valueSize = "default", className = "", children }: StatCardProps) {
  return (
    <SectionCard className={`min-w-0 p-5 ${className}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-3 min-w-0 font-semibold ${tones[tone]} ${
          valueSize === "compact" ? "truncate font-mono text-lg sm:text-xl" : "break-words text-3xl"
        }`}
        title={value}
      >
        {value}
      </p>
      {note ? <p className="mt-3 text-sm leading-6 text-slate-500">{note}</p> : null}
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </SectionCard>
  );
}
