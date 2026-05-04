import { Input, Label, Textarea } from "@/components/ui/form-controls";
import { Pill } from "@/components/ui/pill";

export function SceneEditor({ scene, onChange }) {
  if (!scene) return null;

  return (
    <div className="director-ai-suggestion rounded-[24px] border p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Pill active>{scene.label}</Pill>
        <Pill soft>AI suggestion, editable</Pill>
        <Pill soft>{scene.shotType}</Pill>
        <Pill soft>{scene.duration}</Pill>
      </div>
      <p className="mb-5 max-w-3xl text-sm leading-6 text-neutral-300/80">
        This scene was suggested by AI from your brief and consistency rules.
        Edit only the parts that change the creative intent.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Scene Title</Label>
          <Input
            value={scene.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Keep this short enough to scan in the sequence view.
          </p>
        </div>

        <div className="md:col-span-2">
          <Label>Objective</Label>
          <Textarea
            rows={3}
            value={scene.objective}
            onChange={(e) => onChange("objective", e.target.value)}
          />
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Describe what this scene should accomplish in the overall flow.
          </p>
        </div>

        <details className="md:col-span-2 rounded-[22px] border border-white/10 bg-black/20 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white">
            Refine details
          </summary>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Open this when timing, shot type, camera, or lighting needs a pass.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Shot Type</Label>
              <Input
                value={scene.shotType}
                onChange={(e) => onChange("shotType", e.target.value)}
              />
            </div>

            <div>
              <Label>Duration</Label>
              <Input
                value={scene.duration}
                onChange={(e) => onChange("duration", e.target.value)}
              />
            </div>

            <div>
              <Label>Camera</Label>
              <Textarea
                rows={3}
                value={scene.camera}
                onChange={(e) => onChange("camera", e.target.value)}
              />
            </div>

            <div>
              <Label>Lighting</Label>
              <Textarea
                rows={3}
                value={scene.lighting}
                onChange={(e) => onChange("lighting", e.target.value)}
              />
            </div>
          </div>
        </details>

        <details className="md:col-span-2 rounded-[22px] border border-white/10 bg-black/20 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white">
            Advanced continuity and transition details
          </summary>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            These fields help with precision. You can leave them as-is until the
            main scene flow feels right.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Continuity</Label>
              <Textarea
                rows={4}
                value={scene.continuity}
                onChange={(e) => onChange("continuity", e.target.value)}
              />
            </div>

            <div>
              <Label>Continuity Anchors</Label>
              <Textarea
                rows={4}
                value={scene.continuityAnchors}
                onChange={(e) => onChange("continuityAnchors", e.target.value)}
              />
            </div>

            <div>
              <Label>Transition In</Label>
              <Textarea
                rows={3}
                value={scene.transitionIn}
                onChange={(e) => onChange("transitionIn", e.target.value)}
              />
            </div>

            <div>
              <Label>Transition Out</Label>
              <Textarea
                rows={3}
                value={scene.transitionOut}
                onChange={(e) => onChange("transitionOut", e.target.value)}
              />
            </div>

            <div>
              <Label>Locked Details</Label>
              <Textarea
                rows={4}
                value={scene.lockedElements}
                onChange={(e) => onChange("lockedElements", e.target.value)}
              />
            </div>

            <div>
              <Label>Flexible Details</Label>
              <Textarea
                rows={4}
                value={scene.variableElements}
                onChange={(e) => onChange("variableElements", e.target.value)}
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
