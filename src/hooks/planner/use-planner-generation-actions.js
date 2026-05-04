"use client";

import { useEffect, useRef, useState } from "react";

import { outputCompareTones } from "@/data/project-planner";
import { buildGenerationContext } from "@/lib/generation-context";
import {
  buildDefaultCollapsedState,
  normalizeCollapsedState,
  relabelScenes,
} from "@/lib/project-planner";

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

function normalizeSceneFieldLocks(fields, value) {
  const locks = value && typeof value === "object" ? value : {};
  return fields.reduce((acc, field) => {
    acc[field] = Boolean(locks[field]);
    return acc;
  }, {});
}

function isAbortError(error) {
  return error?.name === "AbortError";
}

export function usePlannerGenerationActions({
  hasHydrated,
  activeProjectId,
  projectState,
  sceneState,
  outputState,
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
  createId,
  nowIso,
}) {
  const [isGeneratingScenePlan, setIsGeneratingScenePlan] = useState(false);
  const [isGeneratingContinuity, setIsGeneratingContinuity] = useState(false);
  const [isGeneratingOutputs, setIsGeneratingOutputs] = useState(false);
  const [isGeneratingOutputVariants, setIsGeneratingOutputVariants] =
    useState(false);
  const [apiError, setApiError] = useState("");
  const [continuityError, setContinuityError] = useState("");
  const requestSerialRef = useRef(0);
  const requestsRef = useRef({});
  const contextVersionRef = useRef(0);

  function invalidateGenerationRequests() {
    contextVersionRef.current += 1;
    Object.values(requestsRef.current).forEach((request) => {
      request.controller?.abort();
    });
  }

  useEffect(() => {
    if (!hasHydrated) return;
    contextVersionRef.current += 1;
  }, [
    hasHydrated,
    activeProjectId,
    projectState.projectTitle,
    projectState.creativeCategory,
    projectState.format,
    projectState.sceneCount,
    projectState.duration,
    projectState.platform,
    projectState.aspectRatio,
    projectState.mode,
    projectState.creativeBrief,
    projectState.visualStyle,
    projectState.subjects,
    projectState.references,
    projectState.visualReferences,
    sceneState.scenes,
    sceneState.selectedSceneId,
    sceneState.selectedSceneFieldLocks,
    sceneState.continuityBible,
  ]);

  // Each generation domain keeps one latest request token. Older responses may
  // finish, but cannot commit state or clear loading for newer requests.
  function startGenerationRequest(domain) {
    requestsRef.current[domain]?.controller?.abort();

    const request = {
      domain,
      id: `${domain}-${requestSerialRef.current + 1}`,
      contextVersion: contextVersionRef.current,
      controller: new AbortController(),
    };
    requestSerialRef.current += 1;
    requestsRef.current[domain] = request;
    return request;
  }

  function isLatestGenerationRequest(request) {
    return requestsRef.current[request.domain]?.id === request.id;
  }

  function canCommitGenerationRequest(request) {
    return (
      isLatestGenerationRequest(request) &&
      request.contextVersion === contextVersionRef.current
    );
  }

  function finishGenerationRequest(request) {
    if (!isLatestGenerationRequest(request)) return false;
    delete requestsRef.current[request.domain];
    return true;
  }

  function clearGenerationErrors() {
    setApiError("");
    setContinuityError("");
  }

  function buildPlannerGenerationContext(overrides = {}, options = {}) {
    return buildGenerationContext(
      {
        ...projectState,
        continuityBible: sceneState.continuityBible,
        scenes: options.includeScenes === false ? undefined : sceneState.scenes,
        ...overrides,
      },
      options
    );
  }

  async function requestContinuityBible(generationMode) {
    const request = startGenerationRequest("continuity");
    setIsGeneratingContinuity(true);
    setContinuityError("");

    try {
      saveProjectSnapshot(
        "Before continuity regeneration",
        "Before continuity regeneration",
        { silent: true }
      );

      const response = await fetch("/api/continuity-bible", {
        method: "POST",
        signal: request.controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPlannerGenerationContext(
            { generationMode },
            { influenceTarget: "continuity", includeScenes: false }
          )
        ),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.error || "Continuity bible generation request failed."
        );
      }

      const nextContinuityBible = normalizeContinuityBible(
        payload.continuityBible
      );

      if (
        !nextContinuityBible.mainCharacter &&
        !nextContinuityBible.productDescription &&
        !nextContinuityBible.environment
      ) {
        throw new Error(
          "Continuity bible response did not include usable content."
        );
      }

      if (!canCommitGenerationRequest(request)) return;
      clearOutputState();
      setContinuityBible(nextContinuityBible);
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setContinuityError(
        error instanceof Error
          ? error.message
          : "Failed to generate continuity bible."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingContinuity(false);
      }
    }
  }

  function generateContinuityBibleWithAi() {
    return requestContinuityBible("generate");
  }

  function enhanceContinuityBibleWithAi() {
    return requestContinuityBible("enhance");
  }

  async function generateSceneWithAi() {
    const request = startGenerationRequest("scenes");
    setIsGeneratingScenePlan(true);
    setApiError("");

    try {
      saveProjectSnapshot("Before insert scene generation", "Before scene generation", {
        silent: true,
      });

      const insertIndex =
        sceneState.selectedSceneIndex === -1
          ? sceneState.scenes.length - 1
          : sceneState.selectedSceneIndex;
      const previousScene =
        sceneState.scenes[insertIndex] ||
        sceneState.scenes[sceneState.scenes.length - 1];
      const nextScene = sceneState.scenes[insertIndex + 1] || null;

      const response = await fetch("/api/scene-plan", {
        method: "POST",
        signal: request.controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPlannerGenerationContext(
            {
              generationMode: "insert-scene",
              previousSceneId: previousScene?.id,
              nextSceneId: nextScene?.id,
              insertAfterIndex: insertIndex,
              surroundingScenes: {
                previous: previousScene,
                next: nextScene,
              },
            },
            { influenceTarget: "scenePlan" }
          )
        ),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Scene generation request failed.");
      }

      const [generatedScene] = normalizeApiScenes(payload.scenes);

      if (!generatedScene) {
        throw new Error("Scene generation response did not include a scene.");
      }

      const nextId = Math.max(...sceneState.scenes.map((scene) => scene.id), 0) + 1;
      const sceneToInsert = {
        ...generatedScene,
        id: nextId,
        label: `Scene ${insertIndex + 2}`,
      };
      const updated = relabelScenes([
        ...sceneState.scenes.slice(0, insertIndex + 1),
        sceneToInsert,
        ...sceneState.scenes.slice(insertIndex + 1),
      ]);

      if (!canCommitGenerationRequest(request)) return;
      clearOutputState();
      setScenes(updated);
      setSelectedSceneId(nextId);
      setCollapsedScenes((prev) => ({
        ...normalizeCollapsedState(updated, prev, nextId),
        [nextId]: false,
      }));
      setActiveStep("scenes");
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setApiError(
        error instanceof Error ? error.message : "Failed to generate scene."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingScenePlan(false);
      }
    }
  }

  function regenerateSelectedSceneWithAi(target = "full") {
    const targetLocks = { ...sceneState.selectedSceneFieldLocks };

    if (target === "continuity") {
      for (const field of sceneLockFields) {
        targetLocks[field] = field !== "continuity";
      }
    }

    if (target === "cameraLighting") {
      for (const field of sceneLockFields) {
        targetLocks[field] = field !== "camera" && field !== "lighting";
      }
    }

    if (target === "transition") {
      for (const field of sceneLockFields) {
        targetLocks[field] = true;
      }
    }

    return refineSelectedSceneWithAi(`regenerate-${target}`, {
      fieldLocks: targetLocks,
    });
  }

  function keepSequenceAsIs() {
    setSceneAssistFeedback("Sequence kept as is");
  }

  async function refineSequenceWithAi(sequenceRefinementMode = "improve") {
    const request = startGenerationRequest("scenes");
    setIsGeneratingScenePlan(true);
    setApiError("");

    try {
      saveProjectSnapshot("Before sequence AI assist", "Before scene generation", {
        silent: true,
      });

      const response = await fetch("/api/scene-plan", {
        method: "POST",
        signal: request.controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPlannerGenerationContext(
            {
              generationMode:
                sequenceRefinementMode === "reorder"
                  ? "reorder-sequence"
                  : "refine-sequence",
              sequenceRefinementMode,
              sceneCount: sceneState.scenes.length || projectState.sceneCount,
              selectedSceneId: sceneState.selectedSceneId,
            },
            { influenceTarget: "scenePlan" }
          )
        ),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Sequence refinement request failed.");
      }

      const nextScenes = relabelScenes(normalizeApiScenes(payload.scenes));

      if (nextScenes.length === 0) {
        throw new Error("Sequence refinement did not include usable scenes.");
      }

      const nextSelectedId =
        nextScenes[Math.max(0, sceneState.selectedSceneIndex)]?.id ??
        nextScenes[0].id;

      if (!canCommitGenerationRequest(request)) return;
      setScenes(nextScenes);
      setSelectedSceneId(nextSelectedId);
      clearOutputState();
      setCollapsedScenes(
        buildDefaultCollapsedState(nextScenes, nextSelectedId)
      );
      setSceneAssistFeedback(
        sequenceRefinementMode === "reorder"
          ? "Sequence reordered"
          : "Sequence improved"
      );
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to refine the sequence."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingScenePlan(false);
      }
    }
  }

  async function refineSelectedSceneWithAi(
    sceneRefinementMode = "rewrite",
    options = {}
  ) {
    if (!sceneState.selectedScene) return;

    const request = startGenerationRequest("scenes");
    setIsGeneratingScenePlan(true);
    setApiError("");

    try {
      saveProjectSnapshot("Before selected scene AI assist", "Before scene generation", {
        silent: true,
      });

      const lockMap = normalizeSceneFieldLocks(
        sceneLockFields,
        options.fieldLocks || sceneState.selectedSceneFieldLocks
      );
      const lockedFields = sceneLockFields.filter((field) => lockMap[field]);
      const previousScene =
        sceneState.selectedSceneIndex > 0
          ? sceneState.scenes[sceneState.selectedSceneIndex - 1]
          : null;
      const nextScene =
        sceneState.selectedSceneIndex >= 0
          ? sceneState.scenes[sceneState.selectedSceneIndex + 1] || null
          : null;

      const response = await fetch("/api/scene-plan", {
        method: "POST",
        signal: request.controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPlannerGenerationContext(
            {
              generationMode: "refine-selected-scene",
              sceneRefinementMode,
              selectedScene: sceneState.selectedScene,
              fieldLocks: lockMap,
              lockedFields,
              selectedSceneId: sceneState.selectedSceneId,
              selectedSceneIndex: sceneState.selectedSceneIndex,
              surroundingScenes: {
                previous: previousScene,
                next: nextScene,
              },
            },
            { influenceTarget: "scenePlan" }
          )
        ),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Scene refinement request failed.");
      }

      const [refinedScene] = normalizeApiScenes(payload.scenes);

      if (!refinedScene) {
        throw new Error("Scene refinement did not include a usable scene.");
      }

      const mergedScene = {
        ...refinedScene,
        ...Object.fromEntries(
          lockedFields.map((field) => [field, sceneState.selectedScene[field]])
        ),
        id: sceneState.selectedSceneId,
      };
      const updated = relabelScenes(
        sceneState.scenes.map((scene) =>
          scene.id === sceneState.selectedSceneId ? mergedScene : scene
        )
      );

      if (!canCommitGenerationRequest(request)) return;
      setScenes(updated);
      clearOutputState();
      setCollapsedScenes((prev) => ({
        ...normalizeCollapsedState(updated, prev, sceneState.selectedSceneId),
        [sceneState.selectedSceneId]: false,
      }));
      setSceneAssistFeedback(
        sceneRefinementMode === "regenerate"
          ? "Scene regenerated"
          : "Selected scene improved"
      );
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to refine the selected scene."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingScenePlan(false);
      }
    }
  }

  async function generateScenePlan() {
    const request = startGenerationRequest("scenes");
    setIsGeneratingScenePlan(true);
    setApiError("");

    try {
      saveProjectSnapshot("Before scene generation", "Before scene generation", {
        silent: true,
      });

      const response = await fetch("/api/scene-plan", {
        method: "POST",
        signal: request.controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPlannerGenerationContext(
            {},
            { influenceTarget: "scenePlan", includeScenes: false }
          )
        ),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Scene plan request failed.");
      }

      const nextScenes = relabelScenes(normalizeApiScenes(payload.scenes));

      if (nextScenes.length === 0) {
        throw new Error("Scene plan response did not include usable scenes.");
      }

      const nextSelectedId = nextScenes[0].id;

      if (!canCommitGenerationRequest(request)) return;
      setScenes(nextScenes);
      setSelectedSceneId(nextSelectedId);
      clearOutputState();
      setSceneSearch("");
      setCollapsedScenes(
        buildDefaultCollapsedState(nextScenes, nextSelectedId)
      );
      setActiveStep("scenes");
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to generate scene plan."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingScenePlan(false);
      }
    }
  }

  function buildOutputGenerationPayload(outputTone = "standard") {
    return buildPlannerGenerationContext(
      { outputTone },
      { influenceTarget: "outputs" }
    );
  }

  async function generateOutputs() {
    const request = startGenerationRequest("outputs");
    setIsGeneratingOutputs(true);
    setIsGeneratingOutputVariants(false);
    setApiError("");

    try {
      saveProjectSnapshot("Before output generation", "Before output generation", {
        silent: true,
      });

      const response = await fetch("/api/generate-outputs", {
        method: "POST",
        signal: request.controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildOutputGenerationPayload("standard")),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Output generation request failed.");
      }

      const nextOutputs = normalizeGeneratedOutputs(payload);

      if (
        !nextOutputs ||
        (nextOutputs.storyboard.length === 0 &&
          nextOutputs.shotList.length === 0 &&
          nextOutputs.promptPack.length === 0)
      ) {
        throw new Error("Output response did not include usable content.");
      }

      if (!canCommitGenerationRequest(request)) return;
      outputState.setGeneratedOutputs(nextOutputs);
      outputState.setOutputVariants([]);
      outputState.setActiveOutputVariantId(null);
      outputState.setPreferredOutputVariantId(null);
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setApiError(
        error instanceof Error ? error.message : "Failed to generate outputs."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingOutputs(false);
      }
    }
  }

  async function generateOutputVariants() {
    const request = startGenerationRequest("outputs");
    setIsGeneratingOutputs(false);
    setIsGeneratingOutputVariants(true);
    setApiError("");

    try {
      saveProjectSnapshot("Before output comparison", "Before output generation", {
        silent: true,
      });

      const variants = await Promise.all(
        outputCompareTones.map(async (tone) => {
          const response = await fetch("/api/generate-outputs", {
            method: "POST",
            signal: request.controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(buildOutputGenerationPayload(tone.id)),
          });

          const payload = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              payload.error || `${tone.label} output request failed.`
            );
          }

          const outputs = normalizeGeneratedOutputs(payload);

          if (
            !outputs ||
            (outputs.storyboard.length === 0 &&
              outputs.shotList.length === 0 &&
              outputs.promptPack.length === 0)
          ) {
            throw new Error(`${tone.label} output did not include usable content.`);
          }

          return {
            id: createId(),
            tone: tone.id,
            label: tone.label,
            description: tone.description,
            createdAt: nowIso(),
            outputs,
          };
        })
      );

      const preferredVariant = variants[0];

      if (!canCommitGenerationRequest(request)) return;
      outputState.setOutputVariants(variants);
      outputState.setActiveOutputVariantId(preferredVariant.id);
      outputState.setPreferredOutputVariantId(preferredVariant.id);
      outputState.setGeneratedOutputs(preferredVariant.outputs);
    } catch (error) {
      if (isAbortError(error) || !canCommitGenerationRequest(request)) return;
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to generate output variations."
      );
    } finally {
      if (finishGenerationRequest(request)) {
        setIsGeneratingOutputVariants(false);
      }
    }
  }

  return {
    isGeneratingScenePlan,
    isGeneratingContinuity,
    isGeneratingOutputs,
    isGeneratingOutputVariants,
    apiError,
    continuityError,
    clearGenerationErrors,
    invalidateGenerationRequests,
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
  };
}
