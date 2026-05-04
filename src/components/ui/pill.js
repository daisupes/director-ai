import { cn } from "@/lib/utils";

export function Pill({ children, active = false, soft = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs",
        active
          ? "border-violet-400/30 bg-violet-400/12 text-violet-100"
          : soft
            ? "border-white/8 bg-white/[0.03] text-neutral-400"
            : "border-white/10 bg-white/[0.04] text-neutral-300"
      )}
    >
      {children}
    </span>
  );
}
