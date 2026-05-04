import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Pill } from "@/components/ui/pill";

export function StepCompletionCallout({
  status,
  message,
  helper,
  cta,
  items = [],
  onContinue,
}) {
  return (
    <div className="director-success-summary mt-6 rounded-[22px] border border-emerald-200/18 bg-emerald-300/[0.055] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
              <CheckCircle2 size={15} />
            </span>
            <Pill active>{status}</Pill>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">{message}</p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-300/85">
            {helper}
          </p>
          {items.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {items.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-sm text-neutral-200">
                    {item.value || "Not set"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-100/60 focus:ring-offset-2 focus:ring-offset-black"
        >
          {cta}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
