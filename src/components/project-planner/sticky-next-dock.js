import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Pill } from "@/components/ui/pill";

export function StickyNextDock({
  visible,
  status,
  nextLabel,
  helper,
  cta,
  onContinue,
}) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 px-4 sm:px-6">
      <div className="director-next-dock pointer-events-auto mx-auto max-w-4xl rounded-[26px] border border-violet-200/20 bg-black/72 p-3 shadow-[0_22px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
              <CheckCircle2 size={17} />
            </div>
            <div>
              <Pill active>{status}</Pill>
              <p className="mt-2 text-sm font-semibold text-white">
                {nextLabel}
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
                {helper}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-violet-200/60 focus:ring-offset-2 focus:ring-offset-black"
          >
            {cta}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
