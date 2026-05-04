import { Film, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function SceneTimeline({
  scenes,
  selectedSceneId,
  onSelect,
  onReorder,
  draggingSceneId,
  setDraggingSceneId,
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Film size={14} className="text-violet-200" />
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Sequence Flow
            </p>
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-400">
            Scan the order like a rough cut. Select one scene to review in
            detail below.
          </p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-neutral-400">
          Drag cards to reorder
        </p>
      </div>

      {scenes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-4 py-5 text-sm leading-6 text-neutral-400">
          No scenes yet. Create a first-pass sequence from the brief, then
          review and edit it here.
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-4">
        {scenes.map((scene, index) => {
          const selected = selectedSceneId === scene.id;
          const dragging = draggingSceneId === scene.id;

          return (
            <button
              key={scene.id}
              type="button"
              draggable
              onDragStart={() => setDraggingSceneId(scene.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingSceneId !== null) onReorder(draggingSceneId, scene.id);
                setDraggingSceneId(null);
              }}
              onDragEnd={() => setDraggingSceneId(null)}
              onClick={() => onSelect(scene.id)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left transition",
                selected
                  ? "border-violet-400/30 bg-violet-400/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                dragging && "opacity-50"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                  {scene.label}
                </span>
                <div className="flex items-center gap-2">
                  <GripVertical size={12} className="text-neutral-600" />
                  <span className="text-[11px] text-neutral-500">{index + 1}</span>
                </div>
              </div>
              <p className="line-clamp-1 text-sm font-medium text-white">
                {scene.title}
              </p>
              <p className="mt-1 text-xs text-neutral-400">{scene.duration}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
