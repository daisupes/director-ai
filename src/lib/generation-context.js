import {
  buildVisualReferenceSummary,
  normalizeReferenceInfluence,
  normalizeRequestedSceneCount,
  normalizeVisualReferences,
} from "./project-planner";

const sceneFields = [
  "id",
  "label",
  "title",
  "shotType",
  "duration",
  "objective",
  "camera",
  "lighting",
  "continuity",
  "transitionIn",
  "transitionOut",
  "continuityAnchors",
  "lockedElements",
  "variableElements",
];

const continuityFields = [
  "mainCharacter",
  "wardrobe",
  "productDescription",
  "productDetails",
  "environment",
  "timeOfDay",
  "lightingRule",
  "cameraRule",
  "colorPalette",
  "lockCharacter",
  "lockWardrobe",
  "lockProduct",
  "lockLocation",
  "lockStyle",
  "forbiddenChanges",
];

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  );
}

function pickString(value) {
  return typeof value === "string" ? value : "";
}

function sanitizeSceneForGeneration(scene) {
  if (!scene || typeof scene !== "object") return null;

  return compactObject(
    sceneFields.reduce((acc, field) => {
      if (scene[field] !== undefined && scene[field] !== null) {
        acc[field] = scene[field];
      }
      return acc;
    }, {})
  );
}

export function sanitizeScenesForGeneration(scenes) {
  if (!Array.isArray(scenes)) return [];
  return scenes.map(sanitizeSceneForGeneration).filter(Boolean);
}

export function sanitizeContinuityForGeneration(continuityBible) {
  const source =
    continuityBible && typeof continuityBible === "object"
      ? continuityBible
      : {};

  return compactObject(
    continuityFields.reduce((acc, field) => {
      if (source[field] !== undefined && source[field] !== null) {
        acc[field] = source[field];
      }
      return acc;
    }, {})
  );
}

export function sanitizeVisualReferencesForGeneration(
  visualReferences,
  influenceTarget
) {
  return normalizeVisualReferences(visualReferences)
    .filter(
      (reference) =>
        !influenceTarget || reference.influence?.[influenceTarget] !== false
    )
    .map((reference, index) => ({
      id: reference.id,
      label: `Reference ${index + 1}`,
      name: reference.name,
      category: reference.category,
      purpose: reference.category,
      note: reference.note,
      influence: normalizeReferenceInfluence(reference.influence),
      primary: reference.primary,
      sortOrder: index,
    }));
}

function sanitizeSurroundingScenes(surroundingScenes) {
  if (!surroundingScenes || typeof surroundingScenes !== "object") {
    return undefined;
  }

  return {
    previous: sanitizeSceneForGeneration(surroundingScenes.previous),
    next: sanitizeSceneForGeneration(surroundingScenes.next),
  };
}

// This is the only shape that should cross the client/API/AI boundary.
// UI-only fields and image preview data stay in app state, not in prompts.
export function buildGenerationContext(state = {}, options = {}) {
  const influenceTarget = options.influenceTarget;
  const visualReferences = sanitizeVisualReferencesForGeneration(
    state.visualReferences,
    influenceTarget
  );
  const visualReferenceSummary =
    typeof state.visualReferenceSummary === "string" &&
    state.visualReferenceSummary.trim()
      ? state.visualReferenceSummary
      : buildVisualReferenceSummary(visualReferences, influenceTarget);
  const scenes = sanitizeScenesForGeneration(state.scenes);
  const selectedScene = sanitizeSceneForGeneration(state.selectedScene);

  return compactObject({
    generationMode: state.generationMode,
    sequenceRefinementMode: state.sequenceRefinementMode,
    sceneRefinementMode: state.sceneRefinementMode,
    outputTone: state.outputTone,
    projectTitle: pickString(state.projectTitle),
    creativeCategory: pickString(state.creativeCategory),
    format: pickString(state.format),
    sceneCount:
      state.sceneCount === undefined
        ? undefined
        : normalizeRequestedSceneCount(state.sceneCount),
    duration: pickString(state.duration),
    platform: pickString(state.platform),
    aspectRatio: pickString(state.aspectRatio),
    mode: pickString(state.mode),
    creativeBrief: pickString(state.creativeBrief),
    visualStyle: pickString(state.visualStyle),
    subjects: pickString(state.subjects),
    references: pickString(state.references),
    visualReferences,
    visualReferenceSummary,
    continuityBible: sanitizeContinuityForGeneration(state.continuityBible),
    scenes: scenes.length > 0 ? scenes : undefined,
    selectedScene: selectedScene || undefined,
    fieldLocks:
      state.fieldLocks && typeof state.fieldLocks === "object"
        ? { ...state.fieldLocks }
        : undefined,
    lockedFields: Array.isArray(state.lockedFields)
      ? [...state.lockedFields]
      : undefined,
    selectedSceneId: state.selectedSceneId,
    selectedSceneIndex: state.selectedSceneIndex,
    previousSceneId: state.previousSceneId,
    nextSceneId: state.nextSceneId,
    insertAfterIndex: state.insertAfterIndex,
    surroundingScenes: sanitizeSurroundingScenes(state.surroundingScenes),
  });
}
