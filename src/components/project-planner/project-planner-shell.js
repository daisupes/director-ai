"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  Bot,
  Box,
  Brush,
  Camera,
  CheckCircle2,
  Clapperboard,
  Clipboard,
  Clock3,
  Copy,
  Download,
  Eye,
  Files,
  Film,
  FolderOpen,
  Info,
  Layers3,
  ListChecks,
  MapPin,
  MonitorPlay,
  Palette,
  PanelLeftClose,
  Plus,
  RotateCcw,
  Save,
  ScanLine,
  Search,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Stars,
  Trash2,
  UserRound,
  Wand2,
  X,
} from "lucide-react";

import {
  aspectRatioOptions,
  creativeCategoryOptions,
  durationOptions,
  flowSteps,
  formatOptionsByCategory,
  modeOptions,
  outputTabs,
  platformOptions,
  sceneCountPresets,
  starterTemplates,
} from "@/data/project-planner";
import { ContextCard, NavCard, ShellCard } from "@/components/ui/cards";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { Pill } from "@/components/ui/pill";
import { SectionTitle } from "@/components/ui/section-title";
import { CollapsibleStepSummary } from "@/components/project-planner/collapsible-step-summary";
import { EmptyOutputCard } from "@/components/project-planner/empty-output-card";
import { FieldHint, GuidedFieldGroup } from "@/components/project-planner/guided-field-group";
import { HeroStat } from "@/components/project-planner/hero-stat";
import { HeroVisual } from "@/components/project-planner/hero-visual";
import { OnboardingTipCard } from "@/components/project-planner/onboarding-tip-card";
import { OutputPreview } from "@/components/project-planner/output-preview";
import { OutputTabButton } from "@/components/project-planner/output-tab-button";
import { ProgressBadge } from "@/components/project-planner/progress-badge";
import { QuickStat } from "@/components/project-planner/quick-stat";
import { SaveStatusBadge } from "@/components/project-planner/save-status-badge";
import { SceneCard } from "@/components/project-planner/scene-card";
import { SceneEditor } from "@/components/project-planner/scene-editor";
import { SceneTimeline } from "@/components/project-planner/scene-timeline";
import { ProgressiveStepPreview } from "@/components/project-planner/progressive-step-preview";
import { StepCompletionCallout } from "@/components/project-planner/step-completion-callout";
import { StickyNextDock } from "@/components/project-planner/sticky-next-dock";
import { StepCard } from "@/components/project-planner/step-card";
import { VisualReferenceBoard } from "@/components/project-planner/visual-reference-board";
import { useProjectPlannerState } from "@/hooks/use-project-planner-state";
import { useStepTransition } from "@/hooks/use-step-transition";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

function subscribeToClientSnapshot() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function CompletionBadge({ complete, label }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border bg-black/20 px-3 py-1.5 text-xs text-neutral-300",
        complete
          ? "director-complete border-emerald-300/20"
          : "border-white/10",
      ].join(" ")}
    >
      <CheckCircle2
        size={14}
        className={complete ? "text-emerald-300" : "text-neutral-600"}
      />
      {label}
    </span>
  );
}

function MiniProgressItem({ label, complete, active }) {
  return (
    <div
      className={[
        "rounded-2xl border px-3 py-2 transition",
        active
          ? "director-reveal border-violet-300/35 bg-violet-400/12 text-white shadow-[0_10px_28px_rgba(76,29,149,0.18)]"
          : complete
            ? "director-complete border-emerald-300/20 bg-emerald-300/[0.06] text-neutral-200"
            : "border-white/10 bg-black/20 text-neutral-500",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2
          size={14}
          className={complete ? "text-emerald-300" : "text-neutral-600"}
        />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}

function SubtleIcon({ icon: Icon }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-violet-100">
      <Icon size={16} />
    </span>
  );
}

const exportOptions = [
  ["brief", "Project brief"],
  ["continuity", "Continuity bible"],
  ["scenes", "Scene plan"],
  ["storyboard", "Storyboard"],
  ["shotList", "Shot list"],
  ["promptPack", "Prompt pack"],
  ["full", "Full project"],
];

const STYLE_SUGGESTIONS = [
  "Cinematic",
  "Minimal",
  "Bold",
  "Luxury",
  "Emotional",
  "Documentary",
];

const ONBOARDING_DISMISS_KEY = "director-ai-onboarding-dismissed-v1";

export default function ProjectPlannerShell() {
  const isClient = useSyncExternalStore(
    subscribeToClientSnapshot,
    getClientSnapshot,
    getServerSnapshot
  );
  const {
    activeStep,
    setActiveStep,
    projectTitle,
    setProjectTitle,
    creativeCategory,
    setCreativeCategory,
    format,
    setFormat,
    sceneCountPreset,
    setSceneCountPreset,
    customSceneCount,
    setCustomSceneCount,
    sceneCount,
    duration,
    setDuration,
    platform,
    setPlatform,
    aspectRatio,
    setAspectRatio,
    mode,
    setMode,
    creativeBrief,
    setCreativeBrief,
    visualStyle,
    setVisualStyle,
    subjects,
    setSubjects,
    references,
    setReferences,
    visualReferences,
    addVisualReferenceFiles,
    updateVisualReference,
    removeVisualReference,
    moveVisualReference,
    continuityBible,
    setContinuityField,
    generateContinuityBibleWithAi,
    enhanceContinuityBibleWithAi,
    scenes,
    selectedScene,
    selectedSceneId,
    selectedSceneFieldLocks,
    sceneLockFields,
    selectScene,
    draggingSceneId,
    setDraggingSceneId,
    collapsedScenes,
    activeOutputTab,
    setActiveOutputTab,
    sceneSearch,
    setSceneSearch,
    isSaved,
    lastSavedAt,
    copyFeedback,
    projectFeedback,
    exportFeedback,
    sceneAssistFeedback,
    savedProjects,
    activeProject,
    activeProjectId,
    activeProjectSnapshots,
    isGeneratingScenePlan,
    isGeneratingContinuity,
    isGeneratingOutputs,
    isGeneratingOutputVariants,
    apiError,
    continuityError,
    effectiveGeneratedOutputs,
    outputVariants,
    activeOutputVariantId,
    preferredOutputVariantId,
    filteredScenes,
    estimatedRuntime,
    projectSummary,
    completedSteps,
    goToNextStep,
    resetProject,
    saveCurrentProject,
    createNewProject,
    loadSavedProject,
    renameSavedProject,
    duplicateSavedProject,
    deleteSavedProject,
    saveProjectSnapshot,
    restoreProjectSnapshot,
    duplicateProjectFromSnapshot,
    deleteProjectSnapshot,
    keepSequenceAsIs,
    refineSequenceWithAi,
    refineSelectedSceneWithAi,
    copyCurrentOutput,
    selectOutputVariant,
    markOutputVariantPreferred,
    copyProjectExport,
    downloadProjectExport,
    addManualScene,
    generateSceneWithAi,
    duplicateScene,
    deleteScene,
    updateSelectedScene,
    setSelectedSceneFieldLock,
    clearSelectedSceneFieldLocks,
    regenerateSelectedSceneWithAi,
    moveSceneUp,
    moveSceneDown,
    reorderScenes,
    toggleSceneCollapse,
    expandAllScenes,
    collapseAllScenes,
    generateScenePlan,
    generateOutputs,
    generateOutputVariants,
  } = useProjectPlannerState();

  const briefReady = Boolean(
    projectTitle.trim() &&
      creativeBrief.trim() &&
      visualStyle.trim() &&
      subjects.trim()
  );
  const continuityReady = Boolean(
    continuityBible.mainCharacter?.trim() &&
      continuityBible.productDescription?.trim() &&
      continuityBible.environment?.trim()
  );
  const sceneFlowReviewed = scenes.length > 0;
  const selectedSceneReviewed = Boolean(
    selectedScene?.title && selectedScene?.objective
  );
  const currentFormatOptions =
    formatOptionsByCategory[creativeCategory] ||
    formatOptionsByCategory.Commercial;
  const activeOutputVariant =
    outputVariants.find((variant) => variant.id === activeOutputVariantId) ||
    null;
  const [showOnboarding, setShowOnboarding] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(ONBOARDING_DISMISS_KEY) !== "true"
  );
  const stepTransition = useStepTransition({
    initialActiveStep: "step-1a",
    initialRevealedSteps: ["step-1a"],
    observedStepIds: [
      "step-1a",
      "step-1b",
      "step-2a",
      "step-2b",
      "step-2d",
      "step-3",
    ],
  });
  const stepFocusLabel = useMemo(() => {
    const labels = {
      "step-1a": "Focus: Define brief",
      "step-1b": "Focus: Lock continuity",
      "step-2a": "Focus: Review sequence",
      "step-2b": "Focus: Review selected scene",
      "step-2d": "Focus: Approve plan",
      "step-3": "Focus: Generate outputs",
    };

    return labels[stepTransition.activeStepId] || "";
  }, [stepTransition.activeStepId]);

  function dismissOnboarding() {
    window.localStorage.setItem(ONBOARDING_DISMISS_KEY, "true");
    setShowOnboarding(false);
  }

  function addStyleSuggestion(suggestion) {
    const current = visualStyle.trim();
    const exists = current
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .includes(suggestion.toLowerCase());

    if (exists) return;
    setVisualStyle(current ? `${current}, ${suggestion.toLowerCase()}` : suggestion);
  }

  useEffect(() => {
    if (!briefReady) {
      stepTransition.setStepCollapsed("step-1a", false);
    }
  }, [briefReady, stepTransition]);

  useEffect(() => {
    if (activeStep === "brief") {
      stepTransition.revealStep("step-1a");
      if (!["step-1a", "step-1b"].includes(stepTransition.activeStepId)) {
        stepTransition.activateStep("step-1a");
      }
    }

    if (activeStep === "scenes") {
      stepTransition.revealStep("step-2a");
      if (!stepTransition.activeStepId.startsWith("step-2")) {
        stepTransition.activateStep("step-2a");
      }
    }

    if (activeStep === "outputs") {
      stepTransition.revealStep("step-3");
      if (stepTransition.activeStepId !== "step-3") {
        stepTransition.activateStep("step-3");
      }
    }
  }, [activeStep, stepTransition]);

  const briefSummaryItems = [
    { label: "Goal", value: projectTitle },
    { label: "Tone", value: visualStyle },
    { label: "Subject", value: subjects },
    { label: "Format", value: `${creativeCategory} · ${format}` },
  ];
  const continuitySummaryItems = [
    {
      label: "Subject styling",
      value: continuityBible.lockCharacter ? "Locked" : "Editable",
    },
    {
      label: "Hero subject",
      value: continuityBible.productDescription,
    },
    {
      label: "Environment",
      value: continuityBible.lockLocation
        ? `${continuityBible.environment} · locked`
        : continuityBible.environment,
    },
    {
      label: "Lighting mood",
      value: continuityBible.lightingRule || continuityBible.colorPalette,
    },
  ];
  const continueToContinuity = () =>
    stepTransition.continueToStep({
      fromStepId: "step-1a",
      toStepId: "step-1b",
    });
  const continueToScenes = () =>
    stepTransition.continueToStep({
      fromStepId: "step-1b",
      toStepId: "step-2a",
      onBeforeScroll: () => setActiveStep("scenes"),
    });

  function handleWorkflowStepClick(stepId) {
    setActiveStep(stepId);

    if (stepId === "brief") {
      stepTransition.scrollToStep("step-1a");
    }

    if (stepId === "scenes") {
      stepTransition.scrollToStep("step-2a");
    }

    if (stepId === "outputs") {
      stepTransition.scrollToStep("step-3");
    }
  }

  const sidebarSubsteps = {
    brief: [
      {
        id: "step-1a",
        label: "Creative brief",
        complete: briefReady,
        active: stepTransition.activeStepId === "step-1a",
      },
      {
        id: "step-1b",
        label: "Continuity setup",
        complete: continuityReady,
        active: stepTransition.activeStepId === "step-1b",
      },
    ],
    scenes: [
      {
        id: "step-2a",
        label: "Review sequence",
        complete: sceneFlowReviewed,
        active: stepTransition.activeStepId === "step-2a",
      },
      {
        id: "step-2b",
        label: "Selected scene",
        complete: selectedSceneReviewed,
        active: stepTransition.activeStepId === "step-2b",
      },
      {
        id: "step-2d",
        label: "Approve plan",
        complete: activeStep === "outputs",
        active: stepTransition.activeStepId === "step-2d",
      },
    ],
    outputs: [
      {
        id: "step-3",
        label: "Create outputs",
        complete: completedSteps.outputs,
        active: stepTransition.activeStepId === "step-3",
      },
    ],
  };
  const nextDock =
    activeStep === "brief" &&
    briefReady &&
    !stepTransition.isStepRevealed("step-1b")
      ? {
          status: "Brief ready",
          nextLabel: "Up next: Choose consistency rules",
          helper:
            "The system has enough direction to guide the next step. Now choose what should stay consistent.",
          cta: "Continue to Continuity Setup",
          onContinue: continueToContinuity,
        }
      : activeStep === "brief" && continuityReady
        ? {
            status: "Continuity ready",
            nextLabel: "Up next: Review your first-pass scene sequence",
            helper:
              "These rules will be carried forward so the scene draft stays more consistent.",
            cta: "Continue to Scene Plan",
            onContinue: continueToScenes,
          }
        : null;

  if (!isClient) {
    return <main className={`${jakarta.className} min-h-screen bg-[#06070b]`} />;
  }

  function renderStepIntro() {
    if (activeStep === "brief") {
      return {
        eyebrow: "Step 1",
        title: "Start with the brief",
        description:
          "Describe the idea, tone, and visual direction. Then choose what should stay consistent across scenes.",
      };
    }

    if (activeStep === "scenes") {
      return {
        eyebrow: "Step 2",
        title: "Review the scene sequence",
        description:
          "Review the AI’s first-pass sequence, then refine one selected scene at a time.",
      };
    }

    return {
        eyebrow: "Step 3",
        title: "Create first-draft outputs",
        description:
        "Turn the approved scene sequence into editable storyboard beats, shot lists, and prompt packs.",
    };
  }

  function renderMainContent() {
    if (activeStep === "brief") {
      return (
        <ShellCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionTitle {...renderStepIntro()} />
            <div className="flex flex-wrap items-center gap-3">
              <SaveStatusBadge isSaved={isSaved} lastSavedAt={lastSavedAt} />
              <ProgressBadge
                activeStep={activeStep}
                completedSteps={completedSteps}
              />
            </div>
          </div>

          {showOnboarding ? (
            <div className="mt-6">
              <OnboardingTipCard onDismiss={dismissOnboarding} />
            </div>
          ) : null}

          <div className="mt-6 rounded-[22px] border border-violet-300/20 bg-violet-400/[0.07] px-4 py-3 text-sm leading-6 text-violet-50">
            <span className="font-semibold text-white">What to do now: </span>
            Start simple. Describe the idea, tone, and visual direction. You
            can edit everything before generating.
          </div>

          <div className="mt-10 space-y-10">
            {stepTransition.isStepCollapsed("step-1a") ? (
              <CollapsibleStepSummary
                stepLabel="Step 1A"
                title="Creative brief defined"
                badge="Brief ready"
                message="The system now has enough direction to guide the next step."
                items={briefSummaryItems}
                onEdit={() => stepTransition.editStep("step-1a")}
              />
            ) : (
              <>
            <div
              ref={stepTransition.registerStep("step-1a")}
              data-step-transition-id="step-1a"
              tabIndex={-1}
              onAnimationEnd={() => stepTransition.clearHighlight()}
              className={[
                "director-reveal rounded-[24px] border p-6 md:p-7",
                stepTransition.isStepHighlighted("step-1a")
                  ? "director-destination-highlight"
                  : "",
                "director-active-section",
              ].join(" ")}
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Pill active>Step 1A</Pill>
                  <h3
                    ref={stepTransition.registerFocusTarget("step-1a")}
                    tabIndex={-1}
                    className="mt-3 text-lg font-semibold text-white outline-none"
                  >
                    Define the creative brief
                  </h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
                    Describe the idea, tone, and visual direction for your
                    video. The AI will use this to suggest a first-pass plan.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-violet-100/75">
                    Start simple — you can refine it later.
                  </p>
                </div>
                <CompletionBadge complete={briefReady} label="Brief ready" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2 grid gap-4 md:grid-cols-4">
                  <QuickStat label="Creative Mode" value={creativeCategory} />
                  <QuickStat label="Format" value={format} />
                  <QuickStat label="Scenes" value={`${sceneCount}`} />
                  <QuickStat label="Delivery" value={platform} />
                </div>

                <div className="director-ai-suggestion md:col-span-2 rounded-[22px] border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Pill soft>How this works</Pill>
                      <p className="mt-2 text-sm font-semibold text-white">
                        You define the direction. AI suggests a first pass.
                      </p>
                      <p className="mt-1 text-sm leading-6 text-neutral-300/85">
                        Keep this brief simple. Director AI will turn it into an
                        editable scene sequence after you review the consistency
                        rules.
                      </p>
                    </div>
                    <Pill>Editable later</Pill>
                  </div>
                </div>

                {!briefReady ? (
                  <div className="md:col-span-2 rounded-[22px] border border-dashed border-violet-200/18 bg-black/18 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Pill soft>Need a starting point?</Pill>
                        <p className="mt-2 text-sm font-semibold text-white">
                          A good brief can be rough.
                        </p>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
                          Name the goal, the subject, and the feeling. Director
                          AI will help shape it into an editable first pass.
                        </p>
                      </div>
                      <Pill>Not final</Pill>
                    </div>
                  </div>
                ) : null}

                <div className="md:col-span-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                  <p className="text-sm font-semibold text-white">Concept</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    What are you making, and what should the video accomplish?
                  </p>
                  </div>
                  <Pill soft>User input</Pill>
                </div>

                <div>
                  <Label>Project Goal</Label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Director AI"
                  />
                  <FieldHint example="Create a premium 20-second launch film for a new running shoe, focused on elegance, motion, and performance.">
                    Briefly name what this video should achieve.
                  </FieldHint>
                </div>

                <div>
                  <Label>Creative Mode</Label>
                  <Select
                    value={creativeCategory}
                    onChange={(e) => setCreativeCategory(e.target.value)}
                  >
                    {creativeCategoryOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                  <FieldHint>
                    Choose the broad creative context. This keeps formats and
                    AI suggestions relevant.
                  </FieldHint>
                </div>

                <div>
                  <Label>Format</Label>
                  <Select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    {currentFormatOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                  <FieldHint>
                    Pick the closest output shape. You can still adapt the
                    generated plan later.
                  </FieldHint>
                </div>

                <div>
                  <Label>Workflow Mode</Label>
                  <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                    {modeOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                  <FieldHint>
                    This describes the planning emphasis, not a permanent lock.
                  </FieldHint>
                </div>

            <div>
              <Label>Duration</Label>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                {durationOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              <FieldHint>
                Use a rough target. The scene plan will stay editable.
              </FieldHint>
            </div>

            <div>
              <Label>Target Platform</Label>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                {platformOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              <FieldHint>
                Outputs and prompt packs will be shaped for this platform.
              </FieldHint>
            </div>

            <div>
              <Label>Aspect Ratio</Label>
              <Select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                {aspectRatioOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              <FieldHint>
                Choose the delivery frame the scenes should be planned around.
              </FieldHint>
            </div>

            <GuidedFieldGroup
              className="md:col-span-2"
              title="Sequence Length"
              description="Choose the planned sequence length. Director AI will use this as the target number of scenes."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {sceneCountPresets.map((preset) => {
                  const active = sceneCountPreset === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setSceneCountPreset(preset.value)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left transition",
                        active
                          ? "border-violet-300/35 bg-violet-400/12 text-white"
                          : "border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold">
                        {preset.label}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {preset.helper}
                      </span>
                    </button>
                  );
                })}
              </div>
              {sceneCountPreset === "custom" ? (
                <div className="mt-4 max-w-xs">
                  <Label>Custom Scene Count</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={customSceneCount}
                    onChange={(e) => setCustomSceneCount(e.target.value)}
                    placeholder="1-12"
                  />
                </div>
              ) : null}
            </GuidedFieldGroup>

            <div className="md:col-span-2">
              <Label>Short Concept</Label>
              <Textarea
                rows={6}
                value={creativeBrief}
                onChange={(e) => setCreativeBrief(e.target.value)}
                placeholder="Summarize what the piece should communicate, how it should feel, and what kind of visual world it should create."
              />
              <FieldHint example="A sleek performance film built around elegance, motion, and controlled energy.">
                Describe the idea in plain language. AI suggestions are
                editable before you move on.
              </FieldHint>
                </div>

                <div className="md:col-span-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                  <p className="text-sm font-semibold text-white">
                    Visual Direction
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Describe the look, mood, references, setting, and camera
                    feel. This guides the AI’s first pass.
                  </p>
                  </div>
                  <Pill soft>User guidance</Pill>
                </div>

                <div>
                  <Label>Tone / Style</Label>
              <Input
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="cinematic, premium, atmospheric"
              />
              <FieldHint>
                Choose a few words that describe the emotional and visual feel.
              </FieldHint>
              <div className="mt-3 flex flex-wrap gap-2">
                {STYLE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addStyleSuggestion(suggestion)}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-neutral-300 transition hover:border-violet-200/25 hover:bg-violet-300/10 hover:text-violet-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-start justify-between gap-3">
              <div>
              <p className="text-sm font-semibold text-white">Subject</p>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Tell the system who or what should remain central.
              </p>
              </div>
              <Pill soft>Carry forward</Pill>
            </div>

            <div>
              <Label>Main Subject</Label>
              <Input
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="model, product, camera operator"
              />
              <FieldHint>
                Name the person, product, object, or world the sequence should
                focus on.
              </FieldHint>
            </div>

            <div className="md:col-span-2">
              <Label>Visual Direction</Label>
              <Textarea
                rows={4}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Reference pacing, lighting, mood, brand examples, film language..."
              />
              <FieldHint example="Soft morning light, clean studio reflections, slow tracking camera, luxury sportswear campaigns.">
                You can describe mood, lighting, setting, camera feel, or
                references. This is guidance, not a final lock.
              </FieldHint>
            </div>
          </div>
            </div>

            <VisualReferenceBoard
              references={visualReferences}
              onAddFiles={addVisualReferenceFiles}
              onUpdate={updateVisualReference}
              onRemove={removeVisualReference}
              onMove={moveVisualReference}
            />
            {briefReady && !stepTransition.isStepRevealed("step-1b") ? (
              <StepCompletionCallout
                status="Brief complete"
                message="The system now has enough direction to guide the next step."
                helper="Next, choose the consistency rules that should stay visible across scenes."
                cta="Continue to Continuity Setup"
                items={briefSummaryItems}
                onContinue={continueToContinuity}
              />
            ) : null}
              </>
            )}

            {!stepTransition.isStepRevealed("step-1b") ? (
              <ProgressiveStepPreview
                stepLabel="Step 1B"
                title="Continuity Setup"
                status={briefReady ? "Ready to unlock" : "Up next"}
                ready={briefReady}
                helper="Choose the character, product, world, lighting, and style details that should stay consistent."
                cta="Continue to Continuity Setup"
                onContinue={continueToContinuity}
              />
            ) : null}

            {stepTransition.isStepRevealed("step-1b") ? (
              stepTransition.isStepCollapsed("step-1b") ? (
                <CollapsibleStepSummary
                  stepLabel="Step 1B"
                  title="Consistency rules locked"
                  badge="Continuity ready"
                  message="These rules will now be carried forward to keep scenes more consistent."
                  items={continuitySummaryItems}
                  onEdit={() => stepTransition.editStep("step-1b")}
                />
              ) : (
            <div
              ref={stepTransition.registerStep("step-1b")}
              data-step-transition-id="step-1b"
              tabIndex={-1}
              onAnimationEnd={() => stepTransition.clearHighlight()}
              className={[
                "director-reveal rounded-[24px] border p-6 md:p-7",
                stepTransition.isStepHighlighted("step-1b")
                  ? "director-destination-highlight"
                  : "",
                briefReady
                  ? "director-active-section"
                  : "director-future-section",
              ].join(" ")}
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-3xl">
                  <Pill active>Step 1B</Pill>
                  <p
                    ref={stepTransition.registerFocusTarget("step-1b")}
                    tabIndex={-1}
                    className="text-sm font-semibold text-white outline-none"
                  >
                    Continuity Setup
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    Choose the details the system should keep consistent across
                    scenes, such as styling, subject appearance, setting, and mood.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-violet-100/75">
                    Locked details help the system keep scenes more consistent.
                  </p>
                </div>
                <CompletionBadge
                  complete={continuityReady}
                  label="Continuity ready"
                />
              </div>

              <div className="mb-5 rounded-[22px] border border-violet-300/15 bg-violet-400/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-100">
                    <Info size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      What are consistency rules?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-neutral-300/80">
                      These are the details AI should carry forward so the
                      first-pass scene sequence feels coherent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm leading-6 text-neutral-400">
                  Start with your own input or let AI suggest a first draft.
                  Suggestions are editable before you move on.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={generateContinuityBibleWithAi}
                    disabled={isGeneratingContinuity}
                    className="director-ai-action-glow inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={16} />
                    {isGeneratingContinuity
                      ? "Suggesting consistency rules..."
                      : "Let AI suggest rules"}
                  </button>
                  <button
                    type="button"
                    onClick={enhanceContinuityBibleWithAi}
                    disabled={isGeneratingContinuity}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Wand2 size={16} />
                    {isGeneratingContinuity
                      ? "Refining rules..."
                      : "Refine with AI"}
                  </button>
                </div>
              </div>

              {continuityError ? (
                <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-100">
                  {continuityError}
                </div>
              ) : null}

              <div className="mb-5 grid gap-3 md:grid-cols-5">
                {[
                  [UserRound, "Character"],
                  [Shirt, "Wardrobe"],
                  [Box, "Subject"],
                  [MapPin, "World"],
                  [Clock3, "Time"],
                ].map(([Icon, label]) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-neutral-300"
                  >
                    <Icon size={14} className="text-violet-100" />
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Main Person / Character</Label>
                  <Input
                    value={continuityBible.mainCharacter}
                    onChange={(e) =>
                      setContinuityField("mainCharacter", e.target.value)
                    }
                    placeholder="Who must remain visually consistent?"
                  />
                  <FieldHint example="Same hand model, calm posture, minimal jewelry.">
                    Describe the person or character traits that should not
                    drift between scenes.
                  </FieldHint>
                </div>

                <div>
                  <Label>Wardrobe</Label>
                  <Input
                    value={continuityBible.wardrobe}
                    onChange={(e) =>
                      setContinuityField("wardrobe", e.target.value)
                    }
                    placeholder="Consistent wardrobe, styling, silhouette"
                  />
                  <FieldHint example="Black tailored jacket, clean silhouette, no bright accessories.">
                    Note styling, wardrobe, or grooming details to preserve.
                  </FieldHint>
                </div>

                <div>
                  <Label>Hero Subject / Product</Label>
                  <Input
                    value={continuityBible.productDescription}
                    onChange={(e) =>
                      setContinuityField(
                        "productDescription",
                        e.target.value
                      )
                    }
                    placeholder="The hero product or object"
                  />
                  <FieldHint example="Frosted glass perfume bottle with chrome cap and cool violet reflections.">
                    Define the main product, object, or visual anchor.
                  </FieldHint>
                </div>

                <div>
                  <Label>Subject Details</Label>
                  <Input
                    value={continuityBible.productDetails}
                    onChange={(e) =>
                      setContinuityField("productDetails", e.target.value)
                    }
                    placeholder="Materials, UI, labels, proportions"
                  />
                  <FieldHint>
                    Add details that help the AI avoid accidental changes.
                  </FieldHint>
                </div>

                <div>
                  <Label>Setting / World</Label>
                  <Input
                    value={continuityBible.environment}
                    onChange={(e) =>
                      setContinuityField("environment", e.target.value)
                    }
                    placeholder="Location and set rules"
                  />
                  <FieldHint example="Reflective studio set with dark glass, soft haze, and controlled highlights.">
                    Describe the world or environment that should carry through.
                  </FieldHint>
                </div>

                <div>
                  <Label>Time of Day</Label>
                  <Input
                    value={continuityBible.timeOfDay}
                    onChange={(e) =>
                      setContinuityField("timeOfDay", e.target.value)
                    }
                    placeholder="Morning, golden hour, night interior"
                  />
                  <FieldHint>
                    Use this when time or color temperature matters.
                  </FieldHint>
                </div>

              </div>

              <details className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-white">
                  Optional style and lock settings
                </summary>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Use these when you want more control. AI can work with the
                  essentials above.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Brush size={14} className="text-violet-100" />
                      <Label>Lighting Rule</Label>
                    </div>
                    <Textarea
                      rows={3}
                      value={continuityBible.lightingRule}
                      onChange={(e) =>
                        setContinuityField("lightingRule", e.target.value)
                      }
                      placeholder="What lighting logic should never drift?"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Camera size={14} className="text-violet-100" />
                      <Label>Camera Rule</Label>
                    </div>
                    <Textarea
                      rows={3}
                      value={continuityBible.cameraRule}
                      onChange={(e) =>
                        setContinuityField("cameraRule", e.target.value)
                      }
                      placeholder="Lens language, movement, screen direction"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Palette size={14} className="text-violet-100" />
                      <Label>Color Palette</Label>
                    </div>
                    <Input
                      value={continuityBible.colorPalette}
                      onChange={(e) =>
                        setContinuityField("colorPalette", e.target.value)
                      }
                      placeholder="Palette and color temperature"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-violet-100" />
                      <Label>Changes to Avoid</Label>
                    </div>
                    <Textarea
                      rows={3}
                      value={continuityBible.forbiddenChanges}
                      onChange={(e) =>
                        setContinuityField("forbiddenChanges", e.target.value)
                      }
                      placeholder="Changes AI should avoid"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    ["lockCharacter", "Character"],
                    ["lockWardrobe", "Wardrobe"],
                    ["lockProduct", "Product"],
                    ["lockLocation", "Location"],
                    ["lockStyle", "Style"],
                  ].map(([field, label]) => (
                    <label
                      key={field}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-neutral-200 transition hover:bg-white/[0.06]"
                    >
                      <input
                        type="checkbox"
                        checked={continuityBible[field]}
                        onChange={(e) =>
                          setContinuityField(field, e.target.checked)
                        }
                        className="h-3.5 w-3.5 accent-violet-300"
                      />
                      Keep {label} consistent
                    </label>
                  ))}
                </div>
              </details>
              {continuityReady ? (
                <StepCompletionCallout
                  status="Continuity complete"
                  message="Your key visual rules are set."
                  helper="These rules will now be carried forward to keep scenes more consistent."
                  cta="Continue to Scene Plan"
                  items={continuitySummaryItems}
                  onContinue={continueToScenes}
                />
              ) : null}
            </div>
              )
            ) : null}

            <ProgressiveStepPreview
              stepLabel="Step 2"
              title="Scene Plan"
              status={continuityReady ? "Ready to enter" : "After continuity"}
              ready={continuityReady}
              helper={
                continuityReady
                  ? "Review the AI’s first-pass scene sequence before moving into generation."
                  : "Once your consistency rules are ready, the next guided phase is reviewing the scene sequence."
              }
              cta="Continue to Scene Plan"
              onContinue={continueToScenes}
            />
          </div>

          <div className="mt-8 rounded-[22px] border border-violet-400/15 bg-[linear-gradient(180deg,rgba(139,92,246,0.10),rgba(255,255,255,0.02))] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-100">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  AI will create an editable first-pass scene sequence
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-300/80">
                  Based on your brief and consistency rules, Director AI
                  proposes {sceneCount} scenes you can review, reorder, and
                  refine before generating outputs.
                </p>
              </div>
            </div>
          </div>

          {apiError && activeStep === "brief" ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-100">
              {apiError}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateScenePlan}
              disabled={isGeneratingScenePlan}
              className="rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingScenePlan
                ? "Reviewing your brief and applying consistency rules..."
                : `Create ${sceneCount}-Scene Sequence`}
            </button>
            <button
              type="button"
              onClick={resetProject}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/[0.05]"
            >
              <RotateCcw size={15} />
              Reset Project
            </button>
          </div>
        </ShellCard>
      );
    }

    if (activeStep === "scenes") {
      return (
        <ShellCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionTitle {...renderStepIntro()} />
            <div className="flex flex-wrap items-center gap-3">
              <SaveStatusBadge isSaved={isSaved} lastSavedAt={lastSavedAt} />
              <ProgressBadge
                activeStep={activeStep}
                completedSteps={completedSteps}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-violet-300/20 bg-violet-400/[0.07] px-4 py-3 text-sm leading-6 text-violet-50">
            <span className="font-semibold text-white">What to do now: </span>
            Review the AI’s first-pass scene sequence before moving into
            generation. This is a draft, not a final lock, and you can edit any
            scene before creating outputs.
          </div>

          <div className="sticky top-4 z-20 mt-5 rounded-[22px] border border-white/10 bg-black/70 p-3 shadow-[0_18px_42px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="grid gap-2 md:grid-cols-4">
              <MiniProgressItem
                label="2A Review order"
                complete={sceneFlowReviewed}
                active
              />
              <MiniProgressItem
                label="2B Check one scene"
                complete={selectedSceneReviewed}
                active={sceneFlowReviewed}
              />
              <MiniProgressItem label="2C Optional tools" complete={false} />
              <MiniProgressItem label="2D Approve draft" complete={false} />
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-violet-400/15 bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(255,255,255,0.02))] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <SubtleIcon icon={Clapperboard} />
                <div>
                  <p className="text-sm font-semibold text-white">
                    AI suggested a first-pass scene sequence
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-300/80">
                    Review the order, refine one scene, then approve the plan.
                    You can still edit before creating outputs.
                  </p>
                </div>
              </div>
              <div className="grid min-w-[220px] gap-2 text-sm text-neutral-300">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                  <span>Scenes</span>
                  <span className="font-semibold text-white">{scenes.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                  <span>Runtime</span>
                  <span className="font-semibold text-white">
                    {estimatedRuntime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {apiError && activeStep === "scenes" ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-100">
              {apiError}
            </div>
          ) : null}

          <div
            ref={stepTransition.registerStep("step-2a")}
            data-step-transition-id="step-2a"
            tabIndex={-1}
            onAnimationEnd={() => stepTransition.clearHighlight()}
            className={[
              "director-reveal mt-10 rounded-[24px] border p-6 md:p-7",
              stepTransition.activeStepId === "step-2a"
                ? "director-active-section"
                : "director-quiet-card border-white/10 bg-black/20",
              stepTransition.isStepHighlighted("step-2a")
                ? "director-destination-highlight"
                : "",
            ].join(" ")}
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <SubtleIcon icon={ListChecks} />
                <div>
                  <Pill active>Phase 2A</Pill>
                  <h3
                    ref={stepTransition.registerFocusTarget("step-2a")}
                    tabIndex={-1}
                    className="mt-2 text-lg font-semibold text-white outline-none"
                  >
                    Review the scene sequence
                  </h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
                    Read the order like a rough cut. You are checking whether
                    the beginning, middle, and ending feel clear enough to move
                    forward.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-violet-100/75">
                    You can keep the draft as-is or ask AI for a broader pass.
                  </p>
                </div>
              </div>
              <CompletionBadge
                complete={sceneFlowReviewed}
                label="Sequence ready"
              />
            </div>
            <SceneTimeline
              scenes={scenes}
              selectedSceneId={selectedSceneId}
              onSelect={selectScene}
              onReorder={reorderScenes}
              draggingSceneId={draggingSceneId}
              setDraggingSceneId={setDraggingSceneId}
            />
            <details className="mt-5 rounded-[22px] border border-violet-300/15 bg-violet-400/[0.06] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">
                <span className="inline-flex items-center gap-2">
                  <Wand2 size={15} className="text-violet-100" />
                  Sequence AI Assist
                </span>
                <Pill soft>{sceneAssistFeedback || "Optional"}</Pill>
              </summary>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Use this when the overall flow needs a pass. Manual ordering and
                scene edits stay available either way.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={keepSequenceAsIs}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06]"
                >
                  Keep as is
                </button>
                <button
                  type="button"
                  onClick={() => refineSequenceWithAi("improve")}
                  disabled={isGeneratingScenePlan}
                  className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-2.5 text-sm text-violet-50 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Suggest improvements
                </button>
                <button
                  type="button"
                  onClick={() => refineSequenceWithAi("reorder")}
                  disabled={isGeneratingScenePlan}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reorder for flow
                </button>
                <button
                  type="button"
                  onClick={generateSceneWithAi}
                  disabled={isGeneratingScenePlan}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add bridge scene
                </button>
              </div>
            </details>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-sm leading-6 text-neutral-300">
                If the order feels right, continue to check one selected scene.
              </p>
              <button
                type="button"
                onClick={() =>
                  stepTransition.continueToStep({
                    fromStepId: "step-2a",
                    toStepId: "step-2b",
                    collapseFrom: false,
                  })
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/25 bg-violet-400/10 px-4 py-2.5 text-sm text-violet-50 transition hover:bg-violet-400/15"
              >
                <CheckCircle2 size={15} />
                Continue to selected scene
              </button>
            </div>
          </div>

          <div
            ref={stepTransition.registerStep("step-2b")}
            data-step-transition-id="step-2b"
            tabIndex={-1}
            onAnimationEnd={() => stepTransition.clearHighlight()}
            className={[
              "director-reveal relative mt-10 rounded-[24px] border p-6 md:p-7",
              stepTransition.activeStepId === "step-2b"
                ? "director-active-section"
                : "director-quiet-card border-white/10 bg-black/20",
              stepTransition.isStepHighlighted("step-2b")
                ? "director-destination-highlight"
                : "",
            ].join(" ")}
          >
            <div className="absolute -top-8 left-8 h-8 w-px bg-[linear-gradient(180deg,rgba(196,181,253,0),rgba(196,181,253,0.45))]" />
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <SubtleIcon icon={Eye} />
                <div>
                  <Pill active>Phase 2B</Pill>
                  <h3
                    ref={stepTransition.registerFocusTarget("step-2b")}
                    tabIndex={-1}
                    className="mt-2 text-lg font-semibold text-white outline-none"
                  >
                    {selectedScene?.title || "Choose a scene"}
                  </h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
                    Review one scene closely. You only need to adjust details
                    that affect the plan or continuity.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-violet-100/75">
                    AI suggestions are editable. Locked fields stay fixed during
                    regeneration.
                  </p>
                </div>
              </div>
              {selectedScene ? (
                <div className="flex flex-wrap gap-2">
                  <CompletionBadge
                    complete={selectedSceneReviewed}
                    label="Scene reviewed"
                  />
                  <Pill>{selectedScene.label}</Pill>
                  <Pill soft>{selectedScene.duration}</Pill>
                  <Pill soft>{selectedScene.shotType}</Pill>
                </div>
              ) : null}
            </div>
            <details className="mb-5 rounded-[22px] border border-violet-300/15 bg-violet-400/[0.06] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">
                <span className="inline-flex items-center gap-2">
                  <Wand2 size={15} className="text-violet-100" />
                  Selected Scene AI Assist
                </span>
                <Pill soft>{sceneAssistFeedback || "Optional"}</Pill>
              </summary>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Refine only the selected scene using the brief, continuity
                setup, surrounding scenes, platform, and visual references.
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    Locked details for regeneration
                  </p>
                  <button
                    type="button"
                    onClick={clearSelectedSceneFieldLocks}
                    className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                  >
                    Clear locks
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sceneLockFields.map((field) => (
                    <label
                      key={field}
                      className={[
                        "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs transition",
                        selectedSceneFieldLocks[field]
                          ? "border-violet-300/30 bg-violet-400/10 text-violet-50"
                          : "border-white/10 bg-white/[0.025] text-neutral-300 hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSceneFieldLocks[field]}
                        onChange={(event) =>
                          setSelectedSceneFieldLock(field, event.target.checked)
                        }
                        className="h-3.5 w-3.5 accent-violet-300"
                      />
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => regenerateSelectedSceneWithAi("full")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-2.5 text-sm text-violet-50 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Regenerate scene
                </button>
                <button
                  type="button"
                  onClick={() => refineSelectedSceneWithAi("rewrite")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-2.5 text-sm text-violet-50 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Suggest rewrite
                </button>
                <button
                  type="button"
                  onClick={() => refineSelectedSceneWithAi("continuity")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Improve continuity
                </button>
                <button
                  type="button"
                  onClick={() => refineSelectedSceneWithAi("cinematic")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Make cinematic
                </button>
                <button
                  type="button"
                  onClick={() => refineSelectedSceneWithAi("platform")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tighten for {platform}
                </button>
                <button
                  type="button"
                  onClick={() => refineSelectedSceneWithAi("transition")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Strengthen transition
                </button>
                <button
                  type="button"
                  onClick={() => regenerateSelectedSceneWithAi("continuity")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Only continuity
                </button>
                <button
                  type="button"
                  onClick={() => regenerateSelectedSceneWithAi("cameraLighting")}
                  disabled={isGeneratingScenePlan || !selectedScene}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Camera + lighting
                </button>
              </div>
            </details>
            <SceneEditor scene={selectedScene} onChange={updateSelectedScene} />
            {selectedSceneReviewed ? (
              <StepCompletionCallout
                  status="Scene review complete"
                  message="The selected scene has enough structure to approve."
                helper="This confirms the draft is ready for outputs. You can still come back and edit later."
                cta="Continue to approval"
                items={[
                  { label: "Scene", value: selectedScene?.label },
                  { label: "Title", value: selectedScene?.title },
                  { label: "Shot", value: selectedScene?.shotType },
                  { label: "Duration", value: selectedScene?.duration },
                ]}
                onContinue={() =>
                  stepTransition.continueToStep({
                    fromStepId: "step-2b",
                    toStepId: "step-2d",
                    collapseFrom: false,
                  })
                }
              />
            ) : null}
          </div>

          <details className="director-quiet-card relative mt-12 rounded-[24px] border border-white/10 bg-black/20 p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Pill soft>Phase 2C Optional</Pill>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    Advanced scene tools
                  </h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
                    Open this only when you need full scene management,
                    search, duplication, deletion, reordering, or a generated
                    bridge scene.
                  </p>
                </div>
                <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                  Open tools
                </span>
              </div>
            </summary>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={collapseAllScenes}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.06]"
              >
                Collapse All
              </button>
              <button
                type="button"
                onClick={expandAllScenes}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.06]"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={addManualScene}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.06]"
              >
                <Plus size={16} />
                Add Manual Scene
              </button>
              <button
                type="button"
                onClick={generateSceneWithAi}
                disabled={isGeneratingScenePlan}
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={16} />
                {isGeneratingScenePlan
                  ? "Creating bridge scene..."
                  : "Generate Between Scenes"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <Input
                  className="pl-10 pr-10"
                  value={sceneSearch}
                  onChange={(e) => setSceneSearch(e.target.value)}
                  placeholder="Search scenes by title, shot type, or objective..."
                />
                {sceneSearch ? (
                  <button
                    type="button"
                    onClick={() => setSceneSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-white"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              <Pill soft>
                {filteredScenes.length} / {scenes.length} visible
              </Pill>
            </div>

            <div className="mt-4 grid gap-3">
              {filteredScenes.map((scene) => {
                const realIndex = scenes.findIndex((s) => s.id === scene.id);
                return (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    selected={selectedScene?.id === scene.id}
                    collapsed={collapsedScenes[scene.id]}
                    onToggleCollapse={toggleSceneCollapse}
                    onSelect={selectScene}
                    onEdit={selectScene}
                    onDuplicate={duplicateScene}
                    onDelete={deleteScene}
                    onMoveUp={moveSceneUp}
                    onMoveDown={moveSceneDown}
                    canMoveUp={realIndex > 0}
                    canMoveDown={realIndex < scenes.length - 1}
                  />
                );
              })}
            </div>
          </details>

          <div
            ref={stepTransition.registerStep("step-2d")}
            data-step-transition-id="step-2d"
            tabIndex={-1}
            onAnimationEnd={() => stepTransition.clearHighlight()}
            className={[
              "director-reveal mt-10 rounded-[24px] border border-emerald-300/20 bg-emerald-300/[0.055] p-6",
              stepTransition.activeStepId === "step-2d"
                ? "director-active-section"
                : "",
              stepTransition.isStepHighlighted("step-2d")
                ? "director-destination-highlight"
                : "",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Pill active>Phase 2D</Pill>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  Approve the scene sequence
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-300">
                  When the sequence works and the selected scene is acceptable,
                  move on to first-draft outputs.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CompletionBadge
                    complete={sceneFlowReviewed}
                    label="Sequence reviewed"
                  />
                  <CompletionBadge
                    complete={selectedSceneReviewed}
                    label="Selected scene reviewed"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep("brief")}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/[0.05]"
                >
                  Back to Brief
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95"
                >
                  Approve Scene Sequence
                </button>
              </div>
            </div>
          </div>
        </ShellCard>
      );
    }

    return (
      <ShellCard
        ref={stepTransition.registerStep("step-3")}
        data-step-transition-id="step-3"
        tabIndex={-1}
        onAnimationEnd={() => stepTransition.clearHighlight()}
        className={[
          "p-6 md:p-8",
          stepTransition.isStepHighlighted("step-3")
            ? "director-destination-highlight"
            : "",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle {...renderStepIntro()} />
          <div className="flex flex-wrap items-center gap-3">
            <SaveStatusBadge isSaved={isSaved} lastSavedAt={lastSavedAt} />
            <ProgressBadge
              activeStep={activeStep}
              completedSteps={completedSteps}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-violet-300/20 bg-violet-400/[0.07] px-4 py-3 text-sm leading-6 text-violet-50">
          <span className="font-semibold text-white">What to do now: </span>
          Create first-draft outputs optimized for {platform}, then choose the
          format that matches your next production step. You can compare and
          edit before using them.
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <EmptyOutputCard
            icon={Layers3}
            title="Storyboard"
            description="Use this to review the story visually, scene by scene."
          />
          <EmptyOutputCard
            icon={Film}
            title="Shot List"
            description="Use this for production planning, shots, timing, camera, and lighting."
          />
          <EmptyOutputCard
            icon={MonitorPlay}
            title={`Prompt Pack for ${platform}`}
            description={`Use this when you are ready to generate video clips with ${platform}-shaped prompts.`}
          />
        </div>

        <div className="director-reveal mt-8 rounded-[24px] border border-violet-300/25 bg-[linear-gradient(180deg,rgba(139,92,246,0.12),rgba(255,255,255,0.026))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Pill active>Primary Action</Pill>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Create {platform}-optimized first draft outputs
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-400">
                Director AI creates editable storyboard beats, a shot list, and
                a prompt pack shaped for {platform} from the approved scene
                sequence.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={generateOutputVariants}
                disabled={isGeneratingOutputs || isGeneratingOutputVariants}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Files size={16} />
                {isGeneratingOutputVariants
                  ? "Preparing comparison drafts..."
                  : "Compare variations"}
              </button>
              <button
                type="button"
                onClick={generateOutputs}
                disabled={isGeneratingOutputs || isGeneratingOutputVariants}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wand2 size={16} />
                {isGeneratingOutputs
                  ? "Creating editable first-draft outputs..."
                  : "Create First Draft Outputs"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              Choose what to review
            </p>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Storyboard for narrative, shot list for production, prompt pack
              for AI clip generation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {outputTabs.map((tab) => (
              <OutputTabButton
                key={tab}
                label={tab}
                active={activeOutputTab === tab}
                onClick={() => setActiveOutputTab(tab)}
              />
            ))}
          </div>
        </div>

        {outputVariants.length > 0 ? (
          <div className="director-reveal mt-6 rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <Pill soft>Compare mode</Pill>
                <p className="mt-2 text-sm font-semibold text-white">
                  Choose the strongest {activeOutputTab.toLowerCase()} variation
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Variations keep the same scenes, continuity, platform, and
                  references. Only the output style changes.
                </p>
              </div>
              {activeOutputVariant ? (
                <button
                  type="button"
                  onClick={() =>
                    markOutputVariantPreferred(activeOutputVariant.id)
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-2.5 text-sm text-violet-50 transition hover:bg-violet-400/15"
                >
                  <CheckCircle2 size={15} />
                  {preferredOutputVariantId === activeOutputVariant.id
                    ? "Preferred"
                    : "Set as preferred"}
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {outputVariants.map((variant) => {
                const active = activeOutputVariantId === variant.id;
                const preferred = preferredOutputVariantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => selectOutputVariant(variant.id)}
                    className={[
                      "rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-violet-300/35 bg-violet-400/12"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {variant.label}
                      </span>
                      {preferred ? <Pill active>Preferred</Pill> : null}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-neutral-500">
                      {variant.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">
              {activeOutputTab === "Prompt Pack"
                ? `Prompt Pack optimized for ${platform}`
                : `${activeOutputTab} preview`}
              {activeOutputVariant ? ` · ${activeOutputVariant.label}` : ""}
            </p>
            <button
              type="button"
              onClick={copyCurrentOutput}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.05]"
            >
              <Clipboard size={15} />
              {copyFeedback || "Copy Output"}
            </button>
          </div>
          <OutputPreview
            activeTab={activeOutputTab}
            scenes={scenes}
            projectTitle={projectTitle}
            platform={platform}
            generatedOutputs={effectiveGeneratedOutputs}
          />
        </div>

        {apiError && activeStep === "outputs" ? (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-100">
            {apiError}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveStep("scenes")}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/[0.05]"
          >
            Back to Scenes
          </button>
        </div>
      </ShellCard>
    );
  }

  return (
    <main className={`${jakarta.className} min-h-screen text-white`}>
      <div className="relative min-h-screen overflow-hidden bg-[#06070b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(124,58,237,0.22),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_38%_72%,rgba(59,130,246,0.10),transparent_20%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.2),rgba(5,7,11,0.72))]" />
        <div className="pointer-events-none absolute left-[-180px] top-[18%] h-[420px] w-[420px] rounded-full bg-violet-600/18 blur-3xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[12%] h-[420px] w-[420px] rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[28%] h-[360px] w-[360px] rounded-full bg-blue-500/12 blur-3xl" />

        <div className="relative mx-auto max-w-[1520px] px-5 pb-12 pt-8 md:px-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-neutral-200">
              <Stars size={12} className="text-violet-200" />
              Director AI
            </div>

            <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
              <div className="max-w-4xl pt-6 xl:pt-16">
                <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-white md:text-6xl">
                  AI Video
                  <span className="bg-[linear-gradient(90deg,#ffffff,#c4b5fd,#a5f3fc)] bg-clip-text text-transparent">
                    {" "}
                    Pre-Production
                  </span>
                  <br />
                  <span className="bg-[linear-gradient(90deg,#ffffff,#a5f3fc)] bg-clip-text text-transparent">
                    Planner
                  </span>
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-300/80 md:text-lg">
                  A more guided workspace for planning AI video projects before
                  generation — from brief to AI-generated scene sequencing to
                  structured outputs.
                </p>
              </div>

              <div className="flex flex-col gap-4 xl:ml-auto xl:w-[420px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <HeroStat icon={Bot} label="Creative" value={creativeCategory} />
                  <HeroStat
                    icon={ScanLine}
                    label="Delivery"
                    value={projectSummary}
                  />
                </div>

                <div className="flex xl:justify-end">
                  <HeroVisual />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
            <NavCard className="h-fit p-4">
              <div className="mb-4 flex items-center gap-2 px-2">
                <PanelLeftClose size={16} className="text-neutral-400" />
                <p className="text-sm font-semibold text-white">
                  Guided Workflow
                </p>
              </div>

              <div className="space-y-3">
                {flowSteps.map((item) => (
                  <StepCard
                    key={item.id}
                    item={item}
                    activeStep={activeStep}
                    onClick={handleWorkflowStepClick}
                    isComplete={completedSteps[item.id]}
                    focusLabel={activeStep === item.id ? stepFocusLabel : ""}
                    subSteps={sidebarSubsteps[item.id] || []}
                  />
                ))}
              </div>

              <details className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">
                  <span className="inline-flex items-center gap-2">
                    <FolderOpen size={15} className="text-violet-100" />
                    Projects
                  </span>
                  <Pill soft>{savedProjects.length || 0}</Pill>
                </summary>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Start from template
                    </p>
                    <div className="mt-3 grid gap-2">
                      {starterTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => createNewProject(template.id)}
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left transition hover:bg-white/[0.05]"
                        >
                          <span className="block text-xs font-semibold text-white">
                            {template.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-neutral-500">
                            {template.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveCurrentProject}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#ffffff,#e9e9ff)] px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95"
                  >
                    <Save size={15} />
                    Save Current Project
                  </button>

                  {savedProjects.length > 0 ? (
                    <div className="space-y-2">
                      {savedProjects.map((project) => (
                        <div
                          key={project.id}
                          className={[
                            "rounded-2xl border p-3 transition",
                            project.id === activeProjectId
                              ? "border-violet-300/30 bg-violet-400/10"
                              : "border-white/10 bg-white/[0.025]",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={() => loadSavedProject(project.id)}
                            className="w-full text-left"
                          >
                            <span className="block text-sm font-semibold text-white">
                              {project.name}
                            </span>
                            <span className="mt-1 block text-xs text-neutral-500">
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const nextName = window.prompt(
                                  "Rename project",
                                  project.name
                                );
                                if (nextName) {
                                  renameSavedProject(project.id, nextName);
                                }
                              }}
                              className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateSavedProject(project.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                            >
                              <Copy size={12} />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteSavedProject(project.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-red-400/10 px-2.5 py-1.5 text-xs text-red-200/75 transition hover:bg-red-400/[0.08]"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-3 text-xs leading-5 text-neutral-500">
                      No named projects yet. Save this project or start from a
                      template.
                    </p>
                  )}

                  {projectFeedback ? (
                    <p className="text-xs text-violet-100">{projectFeedback}</p>
                  ) : null}
                </div>
              </details>

              <details className="mt-4 rounded-[22px] border border-white/10 bg-black/25 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">
                  <span className="inline-flex items-center gap-2">
                    <Files size={15} className="text-violet-100" />
                    Snapshots
                  </span>
                  <Pill soft>{activeProjectSnapshots.length || 0}</Pill>
                </summary>

                <div className="mt-4 space-y-3">
                  <p className="rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-3 text-xs leading-5 text-neutral-500">
                    Experiment safely. A snapshot captures your brief,
                    continuity, scenes, visual references, and outputs.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      saveProjectSnapshot("Manual snapshot", "Manual snapshot")
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-50 transition hover:bg-violet-400/15"
                  >
                    <Save size={15} />
                    Save Snapshot
                  </button>

                  {activeProjectSnapshots.length > 0 ? (
                    <div className="space-y-2">
                      {activeProjectSnapshots.map((snapshot) => {
                        const state = snapshot.state || {};
                        const hasOutputs = Boolean(
                          state.generatedOutputs?.storyboard?.length ||
                            state.generatedOutputs?.shotList?.length ||
                            state.generatedOutputs?.promptPack?.length
                        );

                        return (
                          <div
                            key={snapshot.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {snapshot.label}
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                  {new Date(snapshot.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <Pill soft>{snapshot.reason}</Pill>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Pill soft>
                                {(state.scenes || []).length || 0} scenes
                              </Pill>
                              <Pill soft>{state.platform || "No platform"}</Pill>
                              <Pill soft>
                                {hasOutputs ? "Outputs saved" : "No outputs"}
                              </Pill>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => restoreProjectSnapshot(snapshot.id)}
                                className="rounded-xl border border-violet-300/20 px-2.5 py-1.5 text-xs text-violet-100 transition hover:bg-violet-400/[0.08]"
                              >
                                Restore
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  duplicateProjectFromSnapshot(snapshot.id)
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                              >
                                <Copy size={12} />
                                Duplicate
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProjectSnapshot(snapshot.id)}
                                className="inline-flex items-center gap-1 rounded-xl border border-red-400/10 px-2.5 py-1.5 text-xs text-red-200/75 transition hover:bg-red-400/[0.08]"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-3 text-xs leading-5 text-neutral-500">
                      No snapshots yet. Save one before a big experiment, or
                      let Director AI create them before generation.
                    </p>
                  )}
                </div>
              </details>

              <details className="mt-4 rounded-[22px] border border-white/10 bg-black/25 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">
                  <span className="inline-flex items-center gap-2">
                    <Download size={15} className="text-violet-100" />
                    Export
                  </span>
                  <Pill soft>{exportFeedback || "Copy / file"}</Pill>
                </summary>
                <div className="mt-4 space-y-2">
                  {exportOptions.map(([exportType, label]) => (
                    <div
                      key={exportType}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                    >
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyProjectExport(exportType, "md")}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                        >
                          <Clipboard size={12} />
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadProjectExport(exportType, "txt")}
                          className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                        >
                          .txt
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadProjectExport(exportType, "md")}
                          className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06]"
                        >
                          .md
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Current Project
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {activeProject?.name || projectTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  {projectSummary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill soft>{scenes.length} scenes</Pill>
                  <Pill soft>{estimatedRuntime}</Pill>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => createNewProject("blank")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition hover:bg-white/[0.05]"
                >
                  <Plus size={15} />
                  New Blank Project
                </button>
                <button
                  type="button"
                  onClick={resetProject}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition hover:bg-white/[0.05]"
                >
                  <RotateCcw size={15} />
                  Reset Draft
                </button>
                <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white">
                  <Save size={15} />
                  {isSaved ? "Local Draft Saved" : "Saving Draft"}
                </div>
              </div>
            </NavCard>

            {renderMainContent()}

            <ContextCard className="h-fit p-5 opacity-80 transition-opacity duration-200 hover:opacity-100">
              <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Context
              </p>

              {activeStep === "brief" && (
                <div className="mt-5 space-y-4">
                  <ShellCard className="director-focus-card p-4">
                    <p className="text-sm font-semibold text-white">
                      Current Focus
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      {briefReady
                        ? "Move to continuity. Generate suggestions, then adjust only what matters."
                        : "Finish the brief first. Keep it short and clear."}
                    </p>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-sm font-semibold text-white">
                      Progress
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <CompletionBadge complete={briefReady} label="Brief" />
                      <CompletionBadge
                        complete={continuityReady}
                        label="Continuity"
                      />
                    </div>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-sm font-semibold text-white">
                      Locked Now
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {continuityBible.lockCharacter && <Pill>Character</Pill>}
                      {continuityBible.lockWardrobe && <Pill>Wardrobe</Pill>}
                      {continuityBible.lockProduct && <Pill>Product</Pill>}
                      {continuityBible.lockLocation && <Pill>Location</Pill>}
                      {continuityBible.lockStyle && <Pill>Style</Pill>}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-neutral-400">
                      {continuityBible.mainCharacter}
                    </p>
                  </ShellCard>
                </div>
              )}

              {activeStep === "scenes" && selectedScene && (
                <div className="mt-5 space-y-4">
                  <ShellCard className="director-focus-card p-4">
                    <p className="text-sm font-semibold text-white">
                      Current Focus
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      Review the selected scene. Change only what feels off.
                    </p>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-sm font-semibold text-white">
                      Selected Scene
                    </p>
                    <div className="mt-3">
                      <h3 className="text-lg font-semibold text-white">
                        {selectedScene.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Pill active>{selectedScene.label}</Pill>
                        <Pill>{selectedScene.shotType}</Pill>
                        <Pill>{selectedScene.duration}</Pill>
                      </div>
                    </div>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Objective
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-200">
                      {selectedScene.objective}
                    </p>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Camera
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-200">
                      {selectedScene.camera}
                    </p>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Lighting
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-200">
                      {selectedScene.lighting}
                    </p>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Continuity
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-200">
                      {selectedScene.continuity}
                    </p>
                  </ShellCard>

                  <ShellCard className="director-quiet-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Transitions
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-200">
                      {selectedScene.transitionIn}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      {selectedScene.transitionOut}
                    </p>
                  </ShellCard>
                </div>
              )}

              {activeStep === "outputs" && (
                <div className="mt-5 space-y-4">
                  <ShellCard className="p-4">
                    <p className="text-sm font-semibold text-white">
                      Output Types
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill active={activeOutputTab === "Storyboard"}>Storyboard</Pill>
                      <Pill active={activeOutputTab === "Shot List"}>Shot List</Pill>
                      <Pill active={activeOutputTab === "Prompt Pack"}>Prompt Pack</Pill>
                    </div>
                  </ShellCard>

                  <ShellCard className="p-4">
                    <p className="text-sm font-semibold text-white">
                      Output Summary
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      {projectTitle} currently includes {scenes.length} planned scenes
                      with an estimated runtime of {estimatedRuntime}.
                    </p>
                  </ShellCard>

                  <ShellCard className="p-4">
                    <p className="text-sm font-semibold text-white">
                      What comes next
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      Create structured outputs from the approved scene sequence,
                      then copy the storyboard, shot list, or prompt pack into
                      your production workflow.
                    </p>
                  </ShellCard>
                </div>
              )}
            </ContextCard>
          </div>
        </div>

        <StickyNextDock
          visible={Boolean(nextDock)}
          status={nextDock?.status}
          nextLabel={nextDock?.nextLabel}
          helper={nextDock?.helper}
          cta={nextDock?.cta}
          onContinue={nextDock?.onContinue}
        />

        <style jsx global>{`
          @keyframes activeCardGlow {
            0%,
            100% {
              box-shadow: 0 10px 30px rgba(76, 29, 149, 0.16);
            }
            50% {
              box-shadow: 0 14px 34px rgba(76, 29, 149, 0.24);
            }
          }

          .active-step-glow {
            animation: activeCardGlow 3.2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </main>
  );
}
