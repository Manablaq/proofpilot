import { SectionCard } from "@/components/app/SectionCard";

type StatCardProps = {
  label: string;
  value: string;
  note?: string;
  tone?: "cyan" | "violet" | "emerald" | "amber";
};

const tones = {
  cyan: "text-cyan-100",
  violet: "text-violet-100",
  emerald: "text-emerald-100",
  amber: "text-amber-100",
};

export function StatCard({ label, value, note, tone = "cyan" }: StatCardProps) {
  return (
    <SectionCard className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
      {note ? <p className="mt-3 text-sm leading-6 text-slate-500">{note}</p> : null}
    </SectionCard>
  );
}
