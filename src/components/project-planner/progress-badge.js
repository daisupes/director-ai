import { Check } from "lucide-react";
import { flowSteps } from "@/data/project-planner";

export function ProgressBadge({ activeStep, completedSteps }) {
  const totalSteps = flowSteps.length;
  const doneCount = Object.values(completedSteps).filter(Boolean).length;
  const currentStepIndex = flowSteps.findIndex((step) => step.id === activeStep);
  const displayStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/25 bg-violet-400/12 text-violet-100">
        <Check size={13} />
      </span>
      <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Step {displayStep} / {totalSteps}
      </span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,#c4b5fd,#67e8f9)] transition-all duration-500"
          style={{ width: `${(doneCount / totalSteps) * 100}%` }}
        />
      </span>
    </div>
  );
}
