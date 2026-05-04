"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useRef, useState } from "react";

import {
  PROJECT_LIBRARY_KEY,
  STORAGE_KEY,
} from "@/data/project-planner";

const MAX_PROJECT_SNAPSHOTS = 12;

function isQuotaError(error) {
  return (
    error?.name === "QuotaExceededError" ||
    error?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error?.code === 22 ||
    error?.code === 1014
  );
}

function storageErrorMessage(error) {
  if (isQuotaError(error)) {
    return "Local storage is full. Delete older projects, snapshots, or large references to save again.";
  }

  return "Local storage could not be updated.";
}

function normalizeSnapshotRecord(snapshot, projectId, createId, nowIso) {
  if (!snapshot || typeof snapshot !== "object") return null;

  return {
    id: snapshot.id || createId(),
    projectId: snapshot.projectId || projectId || null,
    label: snapshot.label || snapshot.name || "Snapshot",
    reason: snapshot.reason || snapshot.type || "Manual snapshot",
    createdAt: snapshot.createdAt || nowIso(),
    state:
      snapshot.state && typeof snapshot.state === "object"
        ? snapshot.state
        : snapshot.snapshot && typeof snapshot.snapshot === "object"
          ? snapshot.snapshot
          : null,
  };
}

function normalizeProjectRecord(record, createId, nowIso) {
  if (!record || typeof record !== "object") return null;
  const projectId = record.id || createId();

  return {
    id: projectId,
    name: record.name || record.snapshot?.projectTitle || "Untitled Project",
    createdAt: record.createdAt || nowIso(),
    updatedAt: record.updatedAt || nowIso(),
    snapshot:
      record.snapshot && typeof record.snapshot === "object"
        ? record.snapshot
        : null,
    snapshots: Array.isArray(record.snapshots)
      ? record.snapshots
          .map((snapshot) =>
            normalizeSnapshotRecord(snapshot, projectId, createId, nowIso)
          )
          .filter(Boolean)
          .slice(0, MAX_PROJECT_SNAPSHOTS)
      : [],
  };
}

function createSnapshotRecord({ projectId, label, reason, state, createId, nowIso }) {
  const createdAt = nowIso();

  return {
    id: createId(),
    projectId,
    label: label || reason || "Snapshot",
    reason: reason || "Manual snapshot",
    createdAt,
    state: {
      ...state,
      lastSavedAt: createdAt,
    },
  };
}

function capSnapshots(snapshots) {
  return [...snapshots]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_PROJECT_SNAPSHOTS);
}

export function usePlannerPersistence({
  persistenceSnapshot,
  projectTitle,
  buildCurrentSnapshot,
  applySnapshot,
  buildTemplateSnapshot,
  createId,
  nowIso,
  clearGenerationErrors,
}) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectFeedback, setProjectFeedback] = useState("");
  const savedProjectsRef = useRef([]);

  useEffect(() => {
    savedProjectsRef.current = savedProjects;
  }, [savedProjects]);

  function reportStorageError(error) {
    console.error("Director AI persistence error:", error);
    setProjectFeedback(storageErrorMessage(error));
    setIsSaved(false);
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      reportStorageError(error);
      return false;
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      reportStorageError(error);
      return false;
    }
  }

  function loadProjectLibrary() {
    try {
      const raw = window.localStorage.getItem(PROJECT_LIBRARY_KEY);
      if (!raw) return { activeProjectId: null, projects: [] };
      const parsed = JSON.parse(raw);
      const projects = Array.isArray(parsed.projects)
        ? parsed.projects
            .map((record) => normalizeProjectRecord(record, createId, nowIso))
            .filter(Boolean)
        : [];
      const restoredActiveId = projects.some(
        (project) => project.id === parsed.activeProjectId
      )
        ? parsed.activeProjectId
        : projects[0]?.id ?? null;

      return { activeProjectId: restoredActiveId, projects };
    } catch (error) {
      reportStorageError(error);
      return { activeProjectId: null, projects: [] };
    }
  }

  function loadLocalDraft() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      reportStorageError(error);
      return null;
    }
  }

  function persistProjects(nextProjects, nextActiveProjectId = activeProjectId) {
    setSavedProjects(nextProjects);
    savedProjectsRef.current = nextProjects;
    setActiveProjectId(nextActiveProjectId);

    return writeStorage(PROJECT_LIBRARY_KEY, {
      activeProjectId: nextActiveProjectId,
      projects: nextProjects,
    });
  }

  useEffect(() => {
    try {
      const library = loadProjectLibrary();
      setSavedProjects(library.projects);
      savedProjectsRef.current = library.projects;
      setActiveProjectId(library.activeProjectId);

      const activeProject = library.projects.find(
        (project) => project.id === library.activeProjectId
      );

      if (activeProject?.snapshot) {
        applySnapshot(activeProject.snapshot);
        setHasHydrated(true);
        return;
      }

      const localDraft = loadLocalDraft();
      if (localDraft) applySnapshot(localDraft);
    } finally {
      setHasHydrated(true);
    }
    // Hydration is intentionally mount-only; later loads use explicit actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    setIsSaved(false);

    const payload = {
      ...persistenceSnapshot,
      lastSavedAt: nowIso(),
    };

    const timeout = setTimeout(() => {
      if (!writeStorage(STORAGE_KEY, payload)) return;

      if (activeProjectId) {
        const updatedProjects = savedProjectsRef.current.map((project) =>
          project.id === activeProjectId
            ? {
                ...project,
                name: projectTitle.trim() || project.name,
                updatedAt: payload.lastSavedAt,
                snapshot: payload,
              }
            : project
        );

        if (!persistProjects(updatedProjects, activeProjectId)) return;
      }

      const savedAt = nowIso();
      setLastSavedAt(savedAt);
      setIsSaved(true);
    }, 250);

    return () => clearTimeout(timeout);
    // Storage writers read latest project library from a ref to avoid writing
    // localStorage inside state updater callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, hasHydrated, nowIso, persistenceSnapshot, projectTitle]);

  useEffect(() => {
    if (!projectFeedback) return;
    const timeout = setTimeout(() => setProjectFeedback(""), 1800);
    return () => clearTimeout(timeout);
  }, [projectFeedback]);

  const activeProject = useMemo(
    () => savedProjects.find((project) => project.id === activeProjectId),
    [activeProjectId, savedProjects]
  );
  const activeProjectSnapshots = useMemo(
    () => activeProject?.snapshots || [],
    [activeProject]
  );

  function clearLocalDraft() {
    removeStorage(STORAGE_KEY);
    setLastSavedAt(null);
    setIsSaved(false);
  }

  function saveCurrentProject() {
    const snapshot = buildCurrentSnapshot();
    const timestamp = nowIso();

    if (activeProjectId) {
      const updatedProjects = savedProjectsRef.current.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              name: projectTitle.trim() || project.name,
              updatedAt: timestamp,
              snapshot,
            }
          : project
      );
      const persisted = persistProjects(updatedProjects, activeProjectId);
      if (persisted) setProjectFeedback("Project saved");
      return;
    }

    const id = createId();
    const newProject = {
      id,
      name: projectTitle.trim() || "Untitled Project",
      createdAt: timestamp,
      updatedAt: timestamp,
      snapshot,
      snapshots: [],
    };
    const persisted = persistProjects([newProject, ...savedProjectsRef.current], id);
    if (persisted) setProjectFeedback("Project saved");
  }

  function createNewProject(templateId = "blank") {
    const snapshot = buildTemplateSnapshot(templateId);
    const id = createId();
    const timestamp = nowIso();
    const project = {
      id,
      name: snapshot.projectTitle || "Untitled Project",
      createdAt: timestamp,
      updatedAt: timestamp,
      snapshot,
      snapshots: [],
    };
    const nextProjects = [project, ...savedProjectsRef.current];
    applySnapshot(snapshot);
    const persisted = persistProjects(nextProjects, id);
    clearGenerationErrors();
    if (persisted) {
      setProjectFeedback(
        templateId === "blank" ? "Blank project created" : "Template loaded"
      );
    }
  }

  function loadSavedProject(projectId) {
    const project = savedProjectsRef.current.find((item) => item.id === projectId);
    if (!project?.snapshot) return;

    applySnapshot(project.snapshot);
    const persisted = persistProjects(savedProjectsRef.current, projectId);
    clearGenerationErrors();
    if (persisted) setProjectFeedback("Project loaded");
  }

  function renameSavedProject(projectId, nextName) {
    const trimmed = nextName.trim();
    if (!trimmed) return;

    const updatedProjects = savedProjectsRef.current.map((project) =>
      project.id === projectId
        ? {
            ...project,
            name: trimmed,
            snapshot: {
              ...project.snapshot,
              projectTitle: trimmed,
            },
            updatedAt: nowIso(),
          }
        : project
    );

    const persisted = persistProjects(updatedProjects, activeProjectId);
    if (persisted) setProjectFeedback("Project renamed");
    return trimmed;
  }

  function duplicateSavedProject(projectId) {
    const project = savedProjectsRef.current.find((item) => item.id === projectId);
    if (!project?.snapshot) return;

    const timestamp = nowIso();
    const name = `${project.name} Copy`;
    const duplicate = {
      id: createId(),
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      snapshot: {
        ...project.snapshot,
        projectTitle: name,
        lastSavedAt: timestamp,
      },
      snapshots: (project.snapshots || []).map((snapshot) => ({
        ...snapshot,
        id: createId(),
        projectId: null,
        state: {
          ...snapshot.state,
          projectTitle: name,
          lastSavedAt: timestamp,
        },
      })),
    };
    duplicate.snapshots = duplicate.snapshots.map((snapshot) => ({
      ...snapshot,
      projectId: duplicate.id,
    }));

    const persisted = persistProjects(
      [duplicate, ...savedProjectsRef.current],
      duplicate.id
    );
    applySnapshot(duplicate.snapshot);
    if (persisted) setProjectFeedback("Project duplicated");
  }

  function deleteSavedProject(projectId) {
    const project = savedProjectsRef.current.find((item) => item.id === projectId);
    if (!project) return;

    const confirmed = window.confirm(`Delete "${project.name}"?`);
    if (!confirmed) return;

    const nextProjects = savedProjectsRef.current.filter(
      (item) => item.id !== projectId
    );
    const nextActiveId =
      projectId === activeProjectId
        ? nextProjects[0]?.id ?? null
        : activeProjectId;

    if (nextActiveId && nextActiveId !== activeProjectId) {
      const nextProject = nextProjects.find((item) => item.id === nextActiveId);
      if (nextProject?.snapshot) applySnapshot(nextProject.snapshot);
    } else if (!nextActiveId) {
      applySnapshot(buildTemplateSnapshot("blank"));
    }

    const persisted = persistProjects(nextProjects, nextActiveId);
    if (persisted) setProjectFeedback("Project deleted");
  }

  function saveProjectSnapshot(
    label = "Manual snapshot",
    reason = "Manual snapshot",
    options = {}
  ) {
    const state = buildCurrentSnapshot();
    const timestamp = nowIso();
    const projectId = activeProjectId || createId();
    const snapshot = createSnapshotRecord({
      projectId,
      label,
      reason,
      state,
      createId,
      nowIso,
    });

    let persisted = false;
    if (activeProjectId) {
      const updatedProjects = savedProjectsRef.current.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              name: projectTitle.trim() || project.name,
              updatedAt: timestamp,
              snapshot: state,
              snapshots: capSnapshots([snapshot, ...(project.snapshots || [])]),
            }
          : project
      );
      persisted = persistProjects(updatedProjects, activeProjectId);
    } else {
      const newProject = {
        id: projectId,
        name: projectTitle.trim() || "Untitled Project",
        createdAt: timestamp,
        updatedAt: timestamp,
        snapshot: state,
        snapshots: [snapshot],
      };
      persisted = persistProjects([newProject, ...savedProjectsRef.current], projectId);
    }

    if (persisted && !options.silent) setProjectFeedback("Snapshot saved");
    return snapshot;
  }

  function restoreProjectSnapshot(snapshotId) {
    const project = savedProjectsRef.current.find(
      (item) => item.id === activeProjectId
    );
    const snapshot = project?.snapshots?.find((item) => item.id === snapshotId);
    if (!project || !snapshot?.state) return;

    const confirmed = window.confirm(
      `Restore "${snapshot.label}"? Your current version will be saved as a safety snapshot first.`
    );
    if (!confirmed) return;

    const safetySnapshot = createSnapshotRecord({
      projectId: project.id,
      label: "Before restore",
      reason: "Before restore",
      state: buildCurrentSnapshot(),
      createId,
      nowIso,
    });
    const restoredState = {
      ...snapshot.state,
      lastSavedAt: nowIso(),
    };
    const updatedProjects = savedProjectsRef.current.map((item) =>
      item.id === project.id
        ? {
            ...item,
            name: restoredState.projectTitle || item.name,
            updatedAt: restoredState.lastSavedAt,
            snapshot: restoredState,
            snapshots: capSnapshots([safetySnapshot, ...(item.snapshots || [])]),
          }
        : item
    );

    applySnapshot(restoredState);
    const persisted = persistProjects(updatedProjects, project.id);
    clearGenerationErrors();
    if (persisted) setProjectFeedback("Snapshot restored");
  }

  function duplicateProjectFromSnapshot(snapshotId) {
    const project = savedProjectsRef.current.find(
      (item) => item.id === activeProjectId
    );
    const snapshot = project?.snapshots?.find((item) => item.id === snapshotId);
    if (!snapshot?.state) return;

    const timestamp = nowIso();
    const projectId = createId();
    const name = `${
      snapshot.state.projectTitle || project?.name || "Project"
    } Snapshot Copy`;
    const restoredState = {
      ...snapshot.state,
      projectTitle: name,
      lastSavedAt: timestamp,
    };
    const originSnapshot = {
      ...snapshot,
      id: createId(),
      projectId,
      label: snapshot.label,
      state: restoredState,
    };
    const newProject = {
      id: projectId,
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      snapshot: restoredState,
      snapshots: [originSnapshot],
    };

    applySnapshot(restoredState);
    const persisted = persistProjects(
      [newProject, ...savedProjectsRef.current],
      projectId
    );
    if (persisted) setProjectFeedback("Snapshot duplicated");
  }

  function deleteProjectSnapshot(snapshotId) {
    const project = savedProjectsRef.current.find(
      (item) => item.id === activeProjectId
    );
    const snapshot = project?.snapshots?.find((item) => item.id === snapshotId);
    if (!project || !snapshot) return;

    const confirmed = window.confirm(`Delete snapshot "${snapshot.label}"?`);
    if (!confirmed) return;

    const updatedProjects = savedProjectsRef.current.map((item) =>
      item.id === project.id
        ? {
            ...item,
            snapshots: (item.snapshots || []).filter(
              (existing) => existing.id !== snapshotId
            ),
          }
        : item
    );

    const persisted = persistProjects(updatedProjects, activeProjectId);
    if (persisted) setProjectFeedback("Snapshot deleted");
  }

  return {
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
    renameSavedProject,
    duplicateSavedProject,
    deleteSavedProject,
    saveProjectSnapshot,
    restoreProjectSnapshot,
    duplicateProjectFromSnapshot,
    deleteProjectSnapshot,
  };
}
