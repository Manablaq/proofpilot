type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const tones = {
  neutral: "border-white/10 bg-white/[0.05] text-slate-200",
  success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  warning: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  danger: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  info: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
};

export function statusTone(value = ""): StatusBadgeProps["tone"] {
  if (["ACTIVE", "REVIEWED", "READY_FOR_REVIEW", "SUCCESS", "APPROVED"].includes(value)) {
    return "success";
  }
  if (["NEEDS_MINOR_FIXES", "REQUEST_MINOR_CHANGES", "MEDIUM", "TRUNCATED", "SUBMITTED"].includes(value)) {
    return "warning";
  }
  if (["NEEDS_MAJOR_FIXES", "NOT_READY", "REJECT_OR_RESUBMIT", "FAILED", "CRITICAL", "HIGH"].includes(value)) {
    return "danger";
  }
  if (["UNDER_REVIEW", "RECHECK_REQUESTED", "PENDING"].includes(value)) {
    return "info";
  }
  return "neutral";
}

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
