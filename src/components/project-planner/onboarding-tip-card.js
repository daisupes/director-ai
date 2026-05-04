import { CheckCircle2, X } from "lucide-react";

import { Pill } from "@/components/ui/pill";

const tips = [
  "Start with a simple brief in plain language.",
  "Choose the details that should stay consistent.",
  "Review the editable AI draft before creating outputs.",
];

export function OnboardingTipCard({ onDismiss }) {
  return (
    <div className="director-ai-suggestion rounded-[24px] border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Pill active>First time here?</Pill>
          <h3 className="mt-3 text-base font-semibold text-white">
            Plan the video before you generate it
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300/85">
            You bring the idea. Director AI helps structure it into consistency
            rules, scenes, and outputs you can edit before using.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {tips.map((tip) => (
              <div
                key={tip}
                className="flex items-start gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-neutral-300"
              >
                <CheckCircle2 size={14} className="mt-0.5 text-violet-100" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-5 text-violet-100/75">
            Nothing here is final. Start rough, review the draft, and refine
            only what matters.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-2xl border border-white/10 bg-white/[0.035] p-2 text-neutral-300 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Dismiss onboarding"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
