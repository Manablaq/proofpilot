type StatusPillProps = {
  children: React.ReactNode;
  tone?: "cyan" | "violet" | "blue";
};

const tones = {
  cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  blue: "border-blue-300/25 bg-blue-300/10 text-blue-100",
};

export function StatusPill({ children, tone = "cyan" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_14px_currentColor]" />
      {children}
    </span>
  );
}
