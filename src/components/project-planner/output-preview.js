import { Pill } from "@/components/ui/pill";

function getGeneratedOutput(activeTab, generatedOutputs) {
  if (!generatedOutputs) return "";

  if (activeTab === "Storyboard") return generatedOutputs.storyboard || "";
  if (activeTab === "Shot List") return generatedOutputs.shotList || "";
  if (activeTab === "Prompt Pack") return generatedOutputs.promptPack || "";

  return "";
}

function GeneratedItem({ item }) {
  if (typeof item === "string") {
    return <p className="text-sm leading-7 text-neutral-300">{item}</p>;
  }

  if (!item || typeof item !== "object") return null;

  return (
    <div className="space-y-2">
      {Object.entries(item).map(([key, value]) => (
        <p key={key} className="text-sm leading-7 text-neutral-300">
          <span className="font-semibold capitalize text-white">
            {key.replace(/([A-Z])/g, " $1")}:{" "}
          </span>
          {value}
        </p>
      ))}
    </div>
  );
}

export function OutputPreview({
  activeTab,
  scenes,
  projectTitle,
  platform,
  generatedOutputs,
}) {
  const generatedOutput = getGeneratedOutput(activeTab, generatedOutputs);

  if (Array.isArray(generatedOutput) && generatedOutput.length > 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-white">
          Generated {activeTab}
        </p>
        {activeTab === "Prompt Pack" &&
        generatedOutputs?.globalContinuityPrompt ? (
          <div className="rounded-2xl border border-violet-300/20 bg-violet-400/[0.07] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-violet-200/80">
              Global Continuity Prompt
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-300">
              {generatedOutputs.globalContinuityPrompt}
            </p>
          </div>
        ) : null}
        {generatedOutput.map((item, index) => (
          <div
            key={`${activeTab}-${index}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <GeneratedItem item={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof generatedOutput === "string" && generatedOutput) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-semibold text-white">
          Generated {activeTab}
        </p>
        <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-300">
          {generatedOutput}
        </pre>
      </div>
    );
  }

  if (activeTab === "Storyboard") {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-6 text-neutral-400">
          Preview from the current scene plan. Generate outputs when you want a
          fuller editable draft.
        </p>
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Pill active>{scene.label}</Pill>
              <Pill soft>{scene.duration}</Pill>
            </div>
            <p className="text-sm font-semibold text-white">{scene.title}</p>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              {scene.objective}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === "Shot List") {
    return (
      <div>
        <p className="mb-3 text-sm leading-6 text-neutral-400">
          Preview from the current scene plan. Generate outputs to add fuller
          production detail.
        </p>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[110px_1fr_140px] border-b border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-neutral-400">
          <span>Scene</span>
          <span>Shot</span>
          <span>Duration</span>
        </div>
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="grid grid-cols-[110px_1fr_140px] border-b border-white/10 px-4 py-3 text-sm text-neutral-300 last:border-b-0"
          >
            <span>{scene.label}</span>
            <span>{scene.shotType}</span>
            <span>{scene.duration}</span>
          </div>
        ))}
      </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm font-semibold text-white">
        Prompt Pack optimized for {platform || "selected platform"}: {projectTitle}
      </p>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
        Preview from the current scene plan. Generate outputs for a provider-shaped
        prompt pack with stronger continuity language.
      </p>
      <div className="mt-4 space-y-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-violet-200/70">
              {scene.label}
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-300">
              {scene.title} · {scene.shotType} · {scene.duration}. {scene.objective} Camera:{" "}
              {scene.camera} Lighting: {scene.lighting} Continuity: {scene.continuity} Anchors:{" "}
              {scene.continuityAnchors} Locked: {scene.lockedElements} Transitions:{" "}
              {scene.transitionIn} / {scene.transitionOut}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
