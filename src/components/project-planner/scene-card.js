import { ArrowDown, ArrowUp, ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui/pill";

export function SceneCard({
  scene,
  selected,
  collapsed,
  onToggleCollapse,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  return (
    <div
      className={cn(
        "relative w-full rounded-[24px] border p-5 text-left transition duration-200",
        selected
          ? "director-reveal scale-[1.006] border-violet-300/50 bg-[linear-gradient(180deg,rgba(139,92,246,0.18),rgba(255,255,255,0.04))] shadow-[0_18px_42px_rgba(76,29,149,0.24)]"
          : "border-white/8 bg-white/[0.02] opacity-85 hover:bg-white/[0.045] hover:opacity-100"
      )}
    >
      {selected && (
        <div className="absolute inset-y-5 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,#c4b5fd,#67e8f9)]" />
      )}

      <button
        type="button"
        onClick={() => {
          onSelect(scene.id);
          onToggleCollapse(scene.id);
        }}
        className="w-full pl-2 text-left"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Pill active={selected}>{scene.label}</Pill>
            <Pill soft>{scene.shotType}</Pill>
            <Pill soft>{scene.duration}</Pill>
            {selected && <Pill active>Selected</Pill>}
          </div>

          <ChevronDown
            size={18}
            className={cn(
              "text-neutral-400 transition-transform duration-300",
              collapsed ? "" : "rotate-180"
            )}
          />
        </div>

        <h3 className="text-lg font-semibold text-white md:text-xl">
          {scene.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-neutral-400">
          {scene.objective}
        </p>
      </button>

      {!collapsed && (
        <div className="pl-2">
          <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-neutral-300">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Advanced
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Transition In
                </p>
                <p className="mt-1 text-neutral-300">{scene.transitionIn}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Transition Out
                </p>
                <p className="mt-1 text-neutral-300">{scene.transitionOut}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Anchors
                </p>
                <p className="mt-1 text-neutral-300">
                  {scene.continuityAnchors}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Locked
                </p>
                <p className="mt-1 text-neutral-300">{scene.lockedElements}</p>
              </div>
            </div>
          </details>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(scene.id)}
              className="rounded-xl border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-100 transition hover:bg-violet-400/15"
            >
              <Pencil size={12} className="mr-1 inline-block" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDuplicate(scene.id)}
              className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-200"
            >
              <Copy size={12} className="mr-1 inline-block" />
              Duplicate
            </button>

            <button
              type="button"
              disabled={!canMoveUp}
              onClick={() => onMoveUp(scene.id)}
              className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp size={12} className="mr-1 inline-block" />
              Up
            </button>

            <button
              type="button"
              disabled={!canMoveDown}
              onClick={() => onMoveDown(scene.id)}
              className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDown size={12} className="mr-1 inline-block" />
              Down
            </button>

            <button
              type="button"
              onClick={() => onDelete(scene.id)}
              className="rounded-xl border border-red-400/10 bg-red-400/[0.035] px-3 py-2 text-xs text-red-200/75 transition hover:bg-red-400/[0.08] hover:text-red-100"
            >
              <Trash2 size={12} className="mr-1 inline-block" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
