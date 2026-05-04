"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  defaultContinuityBible,
  defaultState,
  formatOptionsByCategory,
  outputCompareTones,
  starterTemplates,
} from "@/data/project-planner";
import { useOutputActions } from "@/hooks/planner/use-output-actions";
import { usePlannerGenerationActions } from "@/hooks/planner/use-planner-generation-actions";
import { usePlannerPersistence } from "@/hooks/planner/use-planner-persistence";
import { useSceneActions } from "@/hooks/planner/use-scene-actions";
import { useVisualReferences } from "@/hooks/planner/use-visual-references";
import {
  buildDefaultCollapsedState,
  buildVisualReferenceSummary,
  cnIncludes,
  normalizeCollapsedState,
  normalizeVisualReferences,
  parseDurationToAverage,
  relabelScenes,
} from "@/lib/project-planner";

function normalizeContinuityBible(value) {
  const bible = value && typeof value === "object" ? value : {};

  return {
    ...defaultContinuityBible,
    ...bible,
    lockCharacter:
      typeof bible.lockCharacter === "boolean"
        ? bible.lockCharacter
        : defaultContinuityBible.lockCharacter,
    lockWardrobe:
      typeof bible.lockWardrobe === "boolean"
        ? bible.lockWardrobe
        : defaultContinuityBible.lockWardrobe,
    lockProduct:
      typeof bible.lockProduct === "boolean"
        ? bible.lockProduct
        : defaultContinuityBible.lockProduct,
    lockLocation:
      typeof bible.lockLocation === "boolean"
        ? bible.lockLocation
        : defaultContinuityBible.lockLocation,
    lockStyle:
      typeof bible.lockStyle === "boolean"
        ? bible.lockStyle
        : defaultContinuityBible.lockStyle,
  };
}

function normalizeApiScenes(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((scene) => scene && typeof scene === "object")
    .map((scene, index) => ({
      id: scene.id ?? index + 1,
      label: scene.label || `Scene ${index + 1}`,
      title: scene.title || "Untitled Scene",
      shotType: scene.shotType || "Planned Shot",
      duration: scene.duration || "TBD",
      objective: scene.objective || "Define the scene objective.",
      camera: scene.camera || "Define camera language.",
      lighting: scene.lighting || "Define lighting approach.",
      continuity: scene.continuity || "Maintain continuity.",
      transitionIn: scene.transitionIn || "Define transition into this scene.",
      transitionOut: scene.transitionOut || "Define transition out of this scene.",
      continuityAnchors:
        scene.continuityAnchors ||
        "List visual anchors that must remain consistent.",
      lockedElements:
        scene.lockedElements || "List elements that must not change.",
      variableElements:
        scene.variableElements || "List elements that may evolve in this scene.",
    }));
}

function normalizeGeneratedOutputs(value) {
  if (!value || typeof value !== "object") return null;

  return {
    storyboard: Array.isArray(value.storyboard) ? value.storyboard : [],
    shotList: Array.isArray(value.shotList) ? value.shotList : [],
    promptPack: Array.isArray(value.promptPack) ? value.promptPack : [],
    globalContinuityPrompt:
      typeof value.globalContinuityPrompt === "string"
        ? value.globalContinuityPrompt
        : "",
  };
}

function normalizeOutputVariants(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((variant, index) => {
      const tone =
        outputCompareTones.find((item) => item.id === variant?.tone)?.id ||
        outputCompareTones[index]?.id ||
        "standard";
      const toneMeta =
        outputCompareTones.find((item) => item.id === tone) ||
        outputCompareTones[0];
      const outputs = normalizeGeneratedOutputs(variant?.outputs);

      if (!outputs) return null;

      return {
        id: variant.id || `output-variant-${tone}-${index + 1}`,
        tone,
        label: variant.label || toneMeta.label,
        description: variant.description || toneMeta.description,
        createdAt: variant.createdAt || nowIso(),
        outputs,
      };
    })
    .filter(Boolean);
}

function createProjectId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}`;
}

function nowIso() {
  return new Date().toISOString();
}

const sceneLockFields = [
  "title",
  "shotType",
  "duration",
  "objective",
  "camera",
  "lighting",
  "continuity",
];

function buildDefaultSceneFieldLocks() {
  return sceneLockFields.reduce((acc, field) => {
    acc[field] = false;
    return acc;
  }, {});
}

function normalizeSceneFieldLocks(value) {
  const locks = value && typeof value === "object" ? value : {};
  return sceneLockFields.reduce((acc, field) => {
    acc[field] = Boolean(locks[field]);
    return acc;
  }, {});
}

function buildTemplateSnapshot(templateId) {
  const template =
    starterTemplates.find((item) => item.id === templateId) ||
    starterTemplates[0];
  const templateState = template.state || {};
  const scenes = relabelScenes(
    normalizeApiScenes(templateState.scenes || defaultState.scenes)
  );
  const selectedSceneId = scenes[0]?.id || defaultState.selectedSceneId;

  return {
    ...defaultState,
    ...templateState,
    continuityBible: normalizeContinuityBible({
      ...defaultState.continuityBible,
      ...templateState.continuityBible,
    }),
    scenes,
    selectedSceneId,
    collapsedScenes: buildDefaultCollapsedState(scenes, selectedSceneId),
    activeStep: "brief",
    activeOutputTab: defaultState.activeOutputTab,
    sceneSearch: "",
    generatedOutputs: null,
    lastSavedAt: nowIso(),
  };
}

export function useProjectPlannerState() {
  const [activeStep, setActiveStep] = useState(defaultState.activeStep);
  const [projectTitle, setProjectTitle] = useState(defaultState.projectTitle);
  const [creativeCategory, setCreativeCategoryState] = useState(
    defaultState.creativeCategory
  );
  const [format, setFormat] = useState(defaultState.format);
  const [sceneCountPreset, setSceneCountPresetState] = useState(
    defaultState.sceneCountPreset
  );
  const [customSceneCount, setCustomSceneCountState] = useState(
    defaultState.customSceneCount
  );
  const [duration, setDuration] = useState(defaultState.duration);
  const [platform, setPlatform] = useState(defaultState.platform);
  const [aspectRatio, setAspectRatio] = useState(defaultState.aspectRatio);
  const [mode, setMode] = useState(defaultState.mode);
  const [creativeBrief, setCreativeBrief] = useState(defaultState.creativeBrief);
  const [visualStyle, setVisualStyle] = useState(defaultState.visualStyle);
  const [subjects, setSubjects] = useState(defaultState.subjects);
  const [references, setReferences] = useState(defaultState.references);
  const [visualReferences, setVisualReferences] = useState(
    normalizeVisualReferences(defaultState.visualReferences)
  );
  const [continuityBible, setContinuityBible] = useState(
    normalizeContinuityBible(defaultState.continuityBible)
  );
  const [scenes, setScenes] = useState(relabelScenes(defaultState.scenes));
  const [selectedSceneId, setSelectedSceneId] = useState(
    defaultState.selectedSceneId
  );
  const [selectedSceneFieldLocks, setSelectedSceneFieldLocks] = useState(
    buildDefaultSceneFieldLocks
  );
  const [draggingSceneId, setDraggingSceneId] = useState(null);
  const [collapsedScenes, setCollapsedScenes] = useState(
    buildDefaultCollapsedState(
      relabelScenes(defaultState.scenes),
      defaultState.selectedSceneId
    )
  );
  const [activeOutputTab, setActiveOutputTab] = useState(
    defaultState.activeOutputTab
  );
  const [sceneSearch, setSceneSearch] = useState(defaultState.sceneSearch);
  const [generatedOutputs, setGeneratedOutputs] = useState(null);
  const [outputVariants, setOutputVariants] = useState([]);
  const [activeOutputVariantId, setActiveOutputVariantId] = useState(null);
  const [preferredOutputVariantId, setPreferredOutputVariantId] =
    useState(null);
  const [sceneAssistFeedback, setSceneAssistFeedback] = useState("");
  const generationActionsRef = useRef(null);

  function buildCurrentSnapshot() {
    return {
      activeStep,
      projectTitle,
      creativeCategory,
      format,
      sceneCountPreset,
      customSceneCount,
      duration,
      platform,
      aspectRatio,
      mode,
      creativeBrief,
      visualStyle,
      subjects,
      references,
      visualReferences,
      visualReferenceSummary: buildVisualReferenceSummary(visualReferences),
      continuityBible,
      scenes,
      selectedSceneId,
      selectedSceneFieldLocks,
      collapsedScenes,
      activeOutputTab,
      sceneSearch,
      generatedOutputs,
      outputVariants,
      activeOutputVariantId,
      preferredOutputVariantId,
      lastSavedAt: nowIso(),
    };
  }

  function applySnapshot(snapshot = defaultState) {
    generationActionsRef.current?.invalidateGenerationRequests();
    const restoredScenes = Array.isArray(snapshot.scenes)
      ? relabelScenes(normalizeApiScenes(snapshot.scenes))
      : relabelScenes(normalizeApiScenes(defaultState.scenes));
    const restoredSelectedId =
      restoredScenes.find((scene) => scene.id === snapshot.selectedSceneId)
        ?.id ??
      restoredScenes[0]?.id ??
      1;
    const restoredCategory =
      snapshot.creativeCategory &&
      formatOptionsByCategory[snapshot.creativeCategory]
        ? snapshot.creativeCategory
        : defaultState.creativeCategory;
    const restoredFormats =
      formatOptionsByCategory[restoredCategory] ||
      formatOptionsByCategory[defaultState.creativeCategory];
    const restoredFormat = restoredFormats.includes(snapshot.format)
      ? snapshot.format
      : restoredFormats[0];

    setActiveStep(snapshot.activeStep ?? defaultState.activeStep);
    setProjectTitle(snapshot.projectTitle ?? defaultState.projectTitle);
    setCreativeCategoryState(restoredCategory);
    setFormat(restoredFormat);
    setSceneCountPresetState(
      ["3", "5", "8", "12", "custom"].includes(snapshot.sceneCountPreset)
        ? snapshot.sceneCountPreset
        : defaultState.sceneCountPreset
    );
    setCustomSceneCountState(
      snapshot.customSceneCount ?? defaultState.customSceneCount
    );
    setDuration(snapshot.duration ?? defaultState.duration);
    setPlatform(snapshot.platform ?? defaultState.platform);
    setAspectRatio(snapshot.aspectRatio ?? defaultState.aspectRatio);
    setMode(snapshot.mode ?? defaultState.mode);
    setCreativeBrief(snapshot.creativeBrief ?? defaultState.creativeBrief);
    setVisualStyle(snapshot.visualStyle ?? defaultState.visualStyle);
    setSubjects(snapshot.subjects ?? defaultState.subjects);
    setReferences(snapshot.references ?? defaultState.references);
    setVisualReferences(normalizeVisualReferences(snapshot.visualReferences));
    setContinuityBible(normalizeContinuityBible(snapshot.continuityBible));
    setScenes(restoredScenes);
    setSelectedSceneId(restoredSelectedId);
    setSelectedSceneFieldLocks(
      normalizeSceneFieldLocks(snapshot.selectedSceneFieldLocks)
    );
    setActiveOutputTab(snapshot.activeOutputTab ?? defaultState.activeOutputTab);
    setSceneSearch(snapshot.sceneSearch ?? defaultState.sceneSearch);
    const restoredGeneratedOutputs = normalizeGeneratedOutputs(
      snapshot.generatedOutputs
    );
    const restoredOutputVariants = normalizeOutputVariants(
      snapshot.outputVariants
    );
    const restoredActiveVariantId = restoredOutputVariants.some(
      (variant) => variant.id === snapshot.activeOutputVariantId
    )
      ? snapshot.activeOutputVariantId
      : restoredOutputVariants[0]?.id || null;
    const restoredPreferredVariantId = restoredOutputVariants.some(
      (variant) => variant.id === snapshot.preferredOutputVariantId
    )
      ? snapshot.preferredOutputVariantId
      : restoredActiveVariantId;

    setGeneratedOutputs(restoredGeneratedOutputs);
    setOutputVariants(restoredOutputVariants);
    setActiveOutputVariantId(restoredActiveVariantId);
    setPreferredOutputVariantId(restoredPreferredVariantId);
    setCollapsedScenes(
      normalizeCollapsedState(
        restoredScenes,
        snapshot.collapsedScenes,
        restoredSelectedId
      )
    );
  }

  useEffect(() => {
    if (!sceneAssistFeedback) return;
    const timeout = setTimeout(() => setSceneAssistFeedback(""), 1800);
    return () => clearTimeout(timeout);
  }, [sceneAssistFeedback]);

  const selectedScene =
    scenes.find((scene) => scene.id === selectedSceneId) || scenes[0];

  const selectedSceneIndex = scenes.findIndex(
    (scene) => scene.id === selectedSceneId
  );

  const filteredScenes = useMemo(() => {
    if (!sceneSearch.trim()) return scenes;
    return scenes.filter(
      (scene) =>
        cnIncludes(scene.label, sceneSearch) ||
        cnIncludes(scene.title, sceneSearch) ||
        cnIncludes(scene.shotType, sceneSearch) ||
        cnIncludes(scene.objective, sceneSearch)
    );
  }, [scenes, sceneSearch]);

  const estimatedRuntime = useMemo(() => {
    const total = scenes.reduce(
      (sum, scene) => sum + parseDurationToAverage(scene.duration),
      0
    );
    return `${Math.round(total)} sec`;
  }, [scenes]);

  const projectSummary = useMemo(() => {
    return `${creativeCategory} · ${format} · ${duration} · ${aspectRatio} · ${platform}`;
  }, [creativeCategory, format, duration, aspectRatio, platform]);

  const sceneCount = useMemo(() => {
    const value =
      sceneCountPreset === "custom" ? customSceneCount : sceneCountPreset;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 5;
    return Math.min(Math.max(parsed, 1), 12);
  }, [customSceneCount, sceneCountPreset]);

  function clearOutputState() {
    setGeneratedOutputs(null);
    setOutputVariants([]);
    setActiveOutputVariantId(null);
    setPreferredOutputVariantId(null);
  }

  const {
    copyFeedback,
    exportFeedback,
    effectiveGeneratedOutputs,
    copyCurrentOutput,
    selectOutputVariant,
    markOutputVariantPreferred,
    copyProjectExport,
    downloadProjectExport,
  } = useOutputActions({
    projectTitle,
    creativeCategory,
    format,
    duration,
    platform,
    aspectRatio,
    scenes,
    activeOutputTab,
    sceneCount,
    generatedOutputs,
    outputVariants,
    activeOutputVariantId,
    preferredOutputVariantId,
    setGeneratedOutputs,
    setActiveOutputVariantId,
    setPreferredOutputVariantId,
    buildCurrentSnapshot,
  });

  const completedSteps = {
    brief: !!projectTitle.trim() && !!creativeBrief.trim(),
    scenes: scenes.length > 0,
    outputs:
      !!effectiveGeneratedOutputs &&
      (effectiveGeneratedOutputs.storyboard.length > 0 ||
        effectiveGeneratedOutputs.shotList.length > 0 ||
        effectiveGeneratedOutputs.promptPack.length > 0),
  };

  const persistenceSnapshot = useMemo(
    () => ({
      activeStep,
      projectTitle,
      creativeCategory,
      format,
      sceneCountPreset,
      customSceneCount,
      duration,
      platform,
      aspectRatio,
      mode,
      creativeBrief,
      visualStyle,
      subjects,
      references,
      visualReferences,
      visualReferenceSummary: buildVisualReferenceSummary(visualReferences),
      continuityBible,
      scenes,
      selectedSceneId,
      selectedSceneFieldLocks,
      collapsedScenes,
      activeOutputTab,
      sceneSearch,
      generatedOutputs,
      outputVariants,
      activeOutputVariantId,
      preferredOutputVariantId,
    }),
    [
      activeStep,
      projectTitle,
      creativeCategory,
      format,
      sceneCountPreset,
      customSceneCount,
      duration,
      platform,
      aspectRatio,
      mode,
      creativeBrief,
      visualStyle,
      subjects,
      references,
      visualReferences,
      continuityBible,
      scenes,
      selectedSceneId,
      selectedSceneFieldLocks,
      collapsedScenes,
      activeOutputTab,
      sceneSearch,
      generatedOutputs,
      outputVariants,
      activeOutputVariantId,
      preferredOutputVariantId,
    ]
  );

  const persistenceActions = usePlannerPersistence({
    persistenceSnapshot,
    projectTitle,
    buildCurrentSnapshot,
    applySnapshot,
    buildTemplateSnapshot,
    createId: createProjectId,
    nowIso,
    clearGenerationErrors: () =>
      generationActionsRef.current?.clearGenerationErrors(),
  });
  const {
    hasHydrated,
    isSaved,
    lastSavedAt,
    projectFeedback,
    savedProjects,
    activeProject,
    activeProjectId,
    activeProjectSnapshots,
    clearLocalDraft,
    saveCurrentProject,
    createNewProject,
    loadSavedProject,
    renameSavedProject: renamePersistedProject,
    duplicateSavedProject,
    deleteSavedProject,
    saveProjectSnapshot,
    restoreProjectSnapshot,
    duplicateProjectFromSnapshot,
    deleteProjectSnapshot,
  } = persistenceActions;

  const visualReferenceActions = useVisualReferences({
    setVisualReferences,
    clearOutputState,
    createId: createProjectId,
  });

  const generationActions = usePlannerGenerationActions({
    hasHydrated,
    activeProjectId,
    projectState: {
      projectTitle,
      creativeCategory,
      format,
      sceneCount,
      duration,
      platform,
      aspectRatio,
      mode,
      creativeBrief,
      visualStyle,
      subjects,
      references,
      visualReferences,
    },
    sceneState: {
      scenes,
      selectedScene,
      selectedSceneId,
      selectedSceneIndex,
      selectedSceneFieldLocks,
      continuityBible,
    },
    outputState: {
      setGeneratedOutputs,
      setOutputVariants,
      setActiveOutputVariantId,
      setPreferredOutputVariantId,
    },
    sceneLockFields,
    saveProjectSnapshot,
    clearOutputState,
    setContinuityBible,
    normalizeContinuityBible,
    setScenes,
    setSelectedSceneId,
    setCollapsedScenes,
    setSceneSearch,
    setActiveStep,
    setSceneAssistFeedback,
    createId: createProjectId,
    nowIso,
  });
  useEffect(() => {
    generationActionsRef.current = generationActions;
  }, [generationActions]);
  const {
    isGeneratingScenePlan,
    isGeneratingContinuity,
    isGeneratingOutputs,
    isGeneratingOutputVariants,
    apiError,
    continuityError,
    clearGenerationErrors,
    generateContinuityBibleWithAi,
    enhanceContinuityBibleWithAi,
    keepSequenceAsIs,
    refineSequenceWithAi,
    refineSelectedSceneWithAi,
    generateSceneWithAi,
    regenerateSelectedSceneWithAi,
    generateScenePlan,
    generateOutputs,
    generateOutputVariants,
  } = generationActions;
  const {
    addVisualReferenceFiles,
    updateVisualReference,
    removeVisualReference,
    moveVisualReference,
  } = visualReferenceActions;

  const {
    selectScene,
    addManualScene,
    duplicateScene,
    deleteScene,
    updateSelectedScene,
    setSelectedSceneFieldLock,
    clearSelectedSceneFieldLocks,
    moveSceneUp,
    moveSceneDown,
    reorderScenes,
    toggleSceneCollapse,
    expandAllScenes,
    collapseAllScenes,
  } = useSceneActions({
    scenes,
    selectedSceneId,
    selectedSceneIndex,
    sceneLockFields,
    setScenes,
    setSelectedSceneId,
    setSelectedSceneFieldLocks,
    setCollapsedScenes,
    clearOutputState,
    buildDefaultSceneFieldLocks,
  });

  function goToNextStep() {
    if (activeStep === "brief") setActiveStep("scenes");
    if (activeStep === "scenes") setActiveStep("outputs");
  }

  function resetProject() {
    const confirmed = window.confirm(
      "Reset the whole project and clear the saved local draft?"
    );
    if (!confirmed) return;

    generationActionsRef.current?.invalidateGenerationRequests();
    const resetScenes = relabelScenes(normalizeApiScenes(defaultState.scenes));
    setActiveStep(defaultState.activeStep);
    setProjectTitle(defaultState.projectTitle);
    setCreativeCategoryState(defaultState.creativeCategory);
    setFormat(defaultState.format);
    setSceneCountPresetState(defaultState.sceneCountPreset);
    setCustomSceneCountState(defaultState.customSceneCount);
    setDuration(defaultState.duration);
    setPlatform(defaultState.platform);
    setAspectRatio(defaultState.aspectRatio);
    setMode(defaultState.mode);
    setCreativeBrief(defaultState.creativeBrief);
    setVisualStyle(defaultState.visualStyle);
    setSubjects(defaultState.subjects);
    setReferences(defaultState.references);
    setVisualReferences(normalizeVisualReferences(defaultState.visualReferences));
    setContinuityBible(normalizeContinuityBible(defaultState.continuityBible));
    setScenes(resetScenes);
    setSelectedSceneId(defaultState.selectedSceneId);
    setSelectedSceneFieldLocks(buildDefaultSceneFieldLocks());
    setActiveOutputTab(defaultState.activeOutputTab);
    setSceneSearch(defaultState.sceneSearch);
    clearGenerationErrors();
    clearOutputState();
    setCollapsedScenes(
      buildDefaultCollapsedState(resetScenes, defaultState.selectedSceneId)
    );
    clearLocalDraft();
  }

  function renameSavedProject(projectId, nextName) {
    const renamed = renamePersistedProject(projectId, nextName);
    if (projectId === activeProjectId && renamed) setProjectTitle(renamed);
  }

  function setCreativeCategory(nextCategory) {
    const formats =
      formatOptionsByCategory[nextCategory] ||
      formatOptionsByCategory[defaultState.creativeCategory];

    clearOutputState();
    setCreativeCategoryState(nextCategory);
    setFormat((currentFormat) =>
      formats.includes(currentFormat) ? currentFormat : formats[0]
    );
  }

  function setSceneCountPreset(nextPreset) {
    clearOutputState();
    setSceneCountPresetState(nextPreset);
  }

  function setCustomSceneCount(nextCount) {
    clearOutputState();
    setCustomSceneCountState(nextCount);
  }

  function setContinuityField(field, value) {
    clearOutputState();
    clearGenerationErrors();
    setContinuityBible((prev) => ({ ...prev, [field]: value }));
  }

  return {
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
    generatedOutputs,
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
  };
}
