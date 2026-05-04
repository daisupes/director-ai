import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clapperboard,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stepIcons = {
  brief: FileText,
  scenes: Clapperboard,
  outputs: Sparkles,
};

export function StepCard({
  item,
  activeStep,
  onClick,
  isComplete,
  focusLabel,
  subSteps = [],
}) {
  const active = activeStep === item.id;
  const StepIcon = stepIcons[item.id] || Circle;

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={cn(
        "group w-full rounded-[24px] border p-4 text-left transition-all duration-300 will-change-transform",
        active
          ? "active-step-glow border-violet-400/30 bg-[linear-gradient(180deg,rgba(139,92,246,0.16),rgba(139,92,246,0.08))] shadow-[0_10px_30px_rgba(76,29,149,0.18)]"
          : "border-white/10 bg-white/[0.03] hover:-translate-y-[2px] hover:bg-white/[0.05] hover:shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300",
              active
                ? "border-violet-400/30 bg-violet-400/12 text-violet-100 shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                : "border-white/10 bg-white/[0.04] text-neutral-300 group-hover:border-white/20 group-hover:bg-white/[0.07]"
            )}
          >
            {isComplete ? <CheckCircle2 size={16} /> : <StepIcon size={16} />}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Step {item.step}
            </p>
            <p className="text-sm font-semibold text-white">{item.label}</p>
          </div>
        </div>

        <ChevronRight
          size={16}
          className={active ? "text-violet-100" : "text-neutral-600"}
        />
      </div>

      <p className="text-sm leading-6 text-neutral-400">{item.description}</p>
      {active && focusLabel ? (
        <div className="mt-3 rounded-2xl border border-violet-200/15 bg-violet-300/10 px-3 py-2 text-xs text-violet-50">
          {focusLabel}
        </div>
      ) : null}

      {active && subSteps.length > 0 ? (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {subSteps.map((subStep) => (
            <div
              key={subStep.id}
              className={cn(
                "flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs transition",
                subStep.active
                  ? "border-violet-200/25 bg-violet-300/10 text-violet-50"
                  : subStep.complete
                    ? "border-emerald-200/15 bg-emerald-300/[0.06] text-neutral-200"
                    : "border-white/8 bg-black/15 text-neutral-500"
              )}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <CheckCircle2
                  size={13}
                  className={
                    subStep.complete ? "text-emerald-300" : "text-neutral-600"
                  }
                />
                <span className="truncate">{subStep.label}</span>
              </span>
              {subStep.active ? (
                <span className="shrink-0 rounded-full bg-violet-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-violet-100">
                  Active
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
}
