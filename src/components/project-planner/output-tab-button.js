import { cn } from "@/lib/utils";

export function OutputTabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-violet-400/30 bg-violet-400/12 text-violet-100"
          : "border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.05]"
      )}
    >
      {label}
    </button>
  );
}
