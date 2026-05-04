import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  visualReferenceCategories,
  visualReferenceInfluenceTargets,
} from "@/data/project-planner";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export function VisualReferenceBoard({
  references,
  onAddFiles,
  onUpdate,
  onRemove,
  onMove,
}) {
  function handleDrop(event) {
    event.preventDefault();
    onAddFiles(event.dataTransfer.files);
  }

  function toggleInfluence(reference, targetId) {
    const current = reference.influence || {};
    const next = {
      continuity: current.continuity !== false,
      scenePlan: current.scenePlan !== false,
      outputs: current.outputs !== false,
      [targetId]: !current[targetId],
    };

    if (!Object.values(next).some(Boolean)) {
      next[targetId] = true;
    }

    onUpdate(reference.id, "influence", next);
  }

  function setAllInfluence(reference) {
    onUpdate(reference.id, "influence", {
      continuity: true,
      scenePlan: true,
      outputs: true,
    });
  }

  return (
    <div className="director-reveal rounded-[24px] border border-white/10 bg-white/[0.025] p-6 md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-100">
            <ImagePlus size={18} />
          </div>
          <div>
            <Pill soft>Optional</Pill>
            <h3 className="mt-3 text-lg font-semibold text-white">
              Visual References
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
              Add frame grabs, campaign stills, product photos, or mood
              references to guide style and consistency.
            </p>
          </div>
        </div>
        <Pill soft>Best with 3-6 references</Pill>
      </div>

      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-violet-300/25 bg-black/20 px-5 py-8 text-center transition hover:border-violet-300/40 hover:bg-violet-400/[0.06]"
      >
        <UploadCloud size={24} className="text-violet-100" />
        <span className="mt-3 text-sm font-semibold text-white">
          Drop images here or click to upload
        </span>
        <span className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
          These references help the AI understand visual tone, materials,
          styling, lighting, composition, and atmosphere.
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            onAddFiles(event.target.files);
            event.target.value = "";
          }}
          className="sr-only"
        />
      </label>

      {references.length > 0 ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {references.map((reference, index) => (
            <div
              key={reference.id}
              className="rounded-[22px] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-5"
            >
              <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="aspect-[16/9] w-full">
                  {reference.dataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={reference.dataUrl}
                      alt={reference.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-600">
                      <ImagePlus size={22} />
                    </div>
                  )}
                </div>

                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                  <Pill soft>Reference {index + 1}</Pill>
                  {reference.primary ? <Pill active>Primary</Pill> : null}
                </div>

                <div className="absolute right-3 top-3 flex gap-1 rounded-2xl border border-white/10 bg-black/45 p-1 backdrop-blur">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate(reference.id, "primary", !reference.primary)
                    }
                    className={cn(
                      "rounded-xl border p-2 transition",
                      reference.primary
                        ? "border-amber-200/25 bg-amber-300/10 text-amber-100"
                        : "border-white/10 text-neutral-300 hover:bg-white/[0.08]"
                    )}
                    aria-label={
                      reference.primary
                        ? "Unset primary reference"
                        : "Set primary reference"
                    }
                  >
                    <Star
                      size={13}
                      fill={reference.primary ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(reference.id, -1)}
                    disabled={index === 0}
                    className="rounded-xl border border-white/10 p-2 text-neutral-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Move reference left"
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(reference.id, 1)}
                    disabled={index === references.length - 1}
                    className="rounded-xl border border-white/10 p-2 text-neutral-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Move reference right"
                  >
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(reference.id)}
                    className="rounded-xl border border-red-400/10 p-2 text-red-200/75 transition hover:bg-red-400/[0.08]"
                    aria-label="Remove reference"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={reference.name}
                    title={reference.name}
                    autoComplete="off"
                    onChange={(event) =>
                      onUpdate(reference.id, "name", event.target.value)
                    }
                    className="text-[15px] font-medium md:text-base"
                  />
                </div>

                <div>
                  <Label>Purpose</Label>
                  <Select
                    value={reference.category}
                    onChange={(event) =>
                      onUpdate(reference.id, "category", event.target.value)
                    }
                  >
                    {visualReferenceCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </Select>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Influences
                    </span>
                    <button
                      type="button"
                      onClick={() => setAllInfluence(reference)}
                      className="text-xs text-violet-100/80 transition hover:text-violet-50"
                    >
                      All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visualReferenceInfluenceTargets.map((target) => {
                      const checked = reference.influence?.[target.id] !== false;

                      return (
                        <button
                          key={target.id}
                          type="button"
                          onClick={() => toggleInfluence(reference, target.id)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs transition",
                            checked
                              ? "border-violet-300/30 bg-violet-300/10 text-violet-50"
                              : "border-white/10 bg-white/[0.02] text-neutral-500 hover:text-neutral-300"
                          )}
                        >
                          {target.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Note</Label>
                  <Textarea
                    rows={5}
                    value={reference.note}
                    onChange={(event) =>
                      onUpdate(reference.id, "note", event.target.value)
                    }
                    placeholder="What should AI notice? Materials, mood, lighting, styling, composition..."
                    className="min-h-32 resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
