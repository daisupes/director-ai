import { CheckCircle2, Pencil } from "lucide-react";

import { Pill } from "@/components/ui/pill";

export function CollapsibleStepSummary({
  stepLabel,
  title,
  badge,
  message,
  items = [],
  onEdit,
}) {
  return (
    <div className="director-success-summary director-reveal rounded-[24px] border border-emerald-200/15 bg-emerald-300/[0.045] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill soft>{stepLabel}</Pill>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
              <CheckCircle2 size={13} />
              {badge}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
          {message ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300/80">
              {message}
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {items.slice(0, 4).map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/18 px-3 py-2"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                  {item.label}
                </p>
                <p className="mt-1 break-words text-sm leading-5 text-neutral-200">
                  {item.value || "Not set"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-200/50"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>
    </div>
  );
}
