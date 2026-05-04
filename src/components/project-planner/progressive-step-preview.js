import { Lock, Sparkles } from "lucide-react";

import { Pill } from "@/components/ui/pill";

export function ProgressiveStepPreview({
  stepLabel,
  title,
  helper,
  status = "Up next",
  ready = false,
  cta,
  onContinue,
}) {
  return (
    <div className="director-future-section director-reveal rounded-[24px] border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-neutral-300">
            {ready ? <Sparkles size={16} /> : <Lock size={15} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill soft>{stepLabel}</Pill>
              <Pill active={ready}>{status}</Pill>
            </div>
            <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
              {helper}
            </p>
          </div>
        </div>

        {ready && cta ? (
          <button
            type="button"
            onClick={onContinue}
            className="rounded-2xl border border-violet-200/20 bg-violet-300/10 px-4 py-2.5 text-sm text-violet-50 transition hover:bg-violet-300/15 focus:outline-none focus:ring-2 focus:ring-violet-200/50"
          >
            {cta}
          </button>
        ) : null}
      </div>
    </div>
  );
}
