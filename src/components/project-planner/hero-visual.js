import { Clapperboard } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="hidden w-full xl:block">
      <div className="w-full rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-violet-100">
            <Clapperboard size={12} />
            Scene Planner
          </div>

          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] text-neutral-300">
            AI-assisted
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              <span>Scene 1</span>
              <span>Hook</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[78%] rounded-full bg-[linear-gradient(90deg,#c4b5fd,#67e8f9)]" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              <span>Scene 2</span>
              <span>Hero</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[54%] rounded-full bg-white/30" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              <span>Scene 3</span>
              <span>Payoff</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[68%] rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
