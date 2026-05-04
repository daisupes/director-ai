"use client";

import {
  normalizeCollapsedState,
  relabelScenes,
  reorderArray,
} from "@/lib/project-planner";

function createManualScene(nextId, labelNumber) {
  return {
    id: nextId,
    label: `Scene ${labelNumber}`,
    title: "New Scene",
    shotType: "Custom Shot",
    duration: "4-6 sec",
    objective: "Define the purpose of this new scene.",
    camera: "Describe camera movement and framing.",
    lighting: "Describe the scene lighting approach.",
    continuity: "Note continuity and consistency rules.",
    transitionIn: "Describe how this scene enters from the previous beat.",
    transitionOut: "Describe how this scene hands off to the next beat.",
    continuityAnchors: "List anchors to preserve from the continuity bible.",
    lockedElements: "List locked character, product, location, or style elements.",
    variableElements: "List scene-specific elements that may change.",
  };
}

export function useSceneActions({
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
}) {
  // Manual scene edits live here; AI-backed scene generation/refinement remains
  // owned by usePlannerGenerationActions.
  function selectScene(sceneId) {
    setSelectedSceneId(sceneId);
    setCollapsedScenes((prev) => ({ ...prev, [sceneId]: false }));
  }

  function addManualScene() {
    const nextId = Math.max(...scenes.map((scene) => scene.id), 0) + 1;
    const insertIndex =
      selectedSceneIndex === -1 ? scenes.length : selectedSceneIndex + 1;
    const newScene = createManualScene(nextId, insertIndex + 1);

    const updated = relabelScenes([
      ...scenes.slice(0, insertIndex),
      newScene,
      ...scenes.slice(insertIndex),
    ]);
    clearOutputState();
    setScenes(updated);
    setSelectedSceneId(nextId);
    setCollapsedScenes((prev) => ({
      ...normalizeCollapsedState(updated, prev, nextId),
      [nextId]: false,
    }));
  }

  function duplicateScene(sceneId) {
    const sceneToDuplicate = scenes.find((scene) => scene.id === sceneId);
    if (!sceneToDuplicate) return;

    const nextId = Math.max(...scenes.map((scene) => scene.id), 0) + 1;
    const duplicatedScene = {
      ...sceneToDuplicate,
      id: nextId,
      title: `${sceneToDuplicate.title} Copy`,
    };

    const updated = relabelScenes([...scenes, duplicatedScene]);
    clearOutputState();
    setScenes(updated);
    setSelectedSceneId(nextId);
    setCollapsedScenes((prev) => ({
      ...normalizeCollapsedState(updated, prev, nextId),
      [nextId]: false,
    }));
  }

  function deleteScene(sceneId) {
    if (scenes.length <= 1) return;

    const confirmed = window.confirm("Delete this scene?");
    if (!confirmed) return;

    const updatedScenes = relabelScenes(
      scenes.filter((scene) => scene.id !== sceneId)
    );

    const nextSelectedId =
      selectedSceneId === sceneId
        ? updatedScenes[Math.max(0, selectedSceneIndex - 1)]?.id ??
          updatedScenes[0]?.id
        : selectedSceneId;

    setScenes(updatedScenes);
    clearOutputState();
    setSelectedSceneId(nextSelectedId);
    setCollapsedScenes((prev) =>
      normalizeCollapsedState(
        updatedScenes,
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => Number(key) !== sceneId)
        ),
        nextSelectedId
      )
    );
  }

  function updateSelectedScene(field, value) {
    clearOutputState();
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === selectedSceneId ? { ...scene, [field]: value } : scene
      )
    );
  }

  function setSelectedSceneFieldLock(field, locked) {
    if (!sceneLockFields.includes(field)) return;
    setSelectedSceneFieldLocks((prev) => ({
      ...prev,
      [field]: locked,
    }));
  }

  function clearSelectedSceneFieldLocks() {
    setSelectedSceneFieldLocks(buildDefaultSceneFieldLocks());
  }

  function moveSceneUp(sceneId) {
    const index = scenes.findIndex((scene) => scene.id === sceneId);
    if (index <= 0) return;

    const updated = [...scenes];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    clearOutputState();
    setScenes(relabelScenes(updated));
  }

  function moveSceneDown(sceneId) {
    const index = scenes.findIndex((scene) => scene.id === sceneId);
    if (index === -1 || index >= scenes.length - 1) return;

    const updated = [...scenes];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    clearOutputState();
    setScenes(relabelScenes(updated));
  }

  function reorderScenes(dragId, targetId) {
    if (dragId === targetId) return;
    const updated = reorderArray(scenes, dragId, targetId);
    clearOutputState();
    setScenes(updated);
    setCollapsedScenes((prev) =>
      normalizeCollapsedState(updated, prev, selectedSceneId)
    );
  }

  function toggleSceneCollapse(sceneId) {
    setCollapsedScenes((prev) => ({
      ...prev,
      [sceneId]: !prev[sceneId],
    }));
  }

  function expandAllScenes() {
    setCollapsedScenes(
      scenes.reduce((acc, scene) => {
        acc[scene.id] = false;
        return acc;
      }, {})
    );
  }

  function collapseAllScenes() {
    setCollapsedScenes(
      scenes.reduce((acc, scene) => {
        acc[scene.id] = true;
        return acc;
      }, {})
    );
  }

  return {
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
  };
}
