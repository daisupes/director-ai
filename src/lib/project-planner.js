export function relabelScenes(scenes) {
  return scenes.map((scene, index) => ({
    ...scene,
    label: `Scene ${index + 1}`,
  }));
}

export function getSceneCountRange(duration) {
  const seconds = parseDurationToAverage(duration);

  if (seconds <= 15) return { min: 3, max: 5, target: 4 };
  if (seconds <= 30) return { min: 4, max: 6, target: 5 };
  if (seconds <= 45) return { min: 5, max: 7, target: 6 };
  return { min: 6, max: 8, target: 7 };
}

export function clampSceneCount(count, duration) {
  const range = getSceneCountRange(duration);
  return Math.min(Math.max(count, range.min), range.max);
}

export function normalizeRequestedSceneCount(value, fallback = 5) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(Math.max(number, 1), 12);
}

const visualReferenceCategoryLabels = [
  "Character",
  "Wardrobe",
  "Product",
  "Location",
  "Lighting",
  "Composition",
  "Mood",
];

const visualReferenceInfluenceLabels = {
  continuity: "Continuity Bible",
  scenePlan: "Scene Plan",
  outputs: "Outputs",
};

const defaultReferenceInfluence = {
  continuity: true,
  scenePlan: true,
  outputs: true,
};

function normalizeReferenceCategory(category) {
  if (typeof category !== "string" || !category.trim()) return "Mood";
  const normalized = category.trim().toLowerCase();
  return (
    visualReferenceCategoryLabels.find(
      (label) => label.toLowerCase() === normalized
    ) || "Mood"
  );
}

export function normalizeReferenceInfluence(value) {
  if (value === "all") return { ...defaultReferenceInfluence };

  if (Array.isArray(value)) {
    const next = {
      continuity: value.includes("continuity"),
      scenePlan: value.includes("scenePlan"),
      outputs: value.includes("outputs"),
    };

    return Object.values(next).some(Boolean)
      ? next
      : { ...defaultReferenceInfluence };
  }

  if (value && typeof value === "object") {
    const next = {
      continuity:
        value.continuity === true ||
        value.continuityBible === true ||
        value.all === true,
      scenePlan:
        value.scenePlan === true ||
        value.scenes === true ||
        value.all === true,
      outputs:
        value.outputs === true ||
        value.output === true ||
        value.all === true,
    };

    return Object.values(next).some(Boolean)
      ? next
      : { ...defaultReferenceInfluence };
  }

  return { ...defaultReferenceInfluence };
}

export function formatReferenceInfluence(influence) {
  const normalized = normalizeReferenceInfluence(influence);
  const active = Object.entries(normalized)
    .filter(([, enabled]) => enabled)
    .map(([key]) => visualReferenceInfluenceLabels[key]);

  return active.length === Object.keys(visualReferenceInfluenceLabels).length
    ? "All"
    : active.join(", ");
}

export function normalizeVisualReferences(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((reference) => reference && typeof reference === "object")
    .map((reference, index) => ({
      id: reference.id || `reference-${index + 1}`,
      name: reference.name || `Reference ${index + 1}`,
      dataUrl: reference.dataUrl || reference.previewUrl || "",
      note: reference.note || "",
      category: normalizeReferenceCategory(reference.category),
      influence: normalizeReferenceInfluence(reference.influence),
      primary: reference.primary === true,
      sortOrder:
        typeof reference.sortOrder === "number" ? reference.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((reference, index, references) => {
      const firstPrimaryIndex = references.findIndex(
        (item) => item.primary === true
      );

      return {
        ...reference,
        primary: firstPrimaryIndex === index,
        sortOrder: index,
      };
    });
}

export function buildVisualReferenceSummary(visualReferences, influenceTarget) {
  const references = normalizeVisualReferences(visualReferences).filter(
    (reference) =>
      !influenceTarget || reference.influence?.[influenceTarget] !== false
  );
  if (references.length === 0) return "";

  return references
    .map((reference, index) => {
      const note = reference.note?.trim()
        ? ` Note: ${reference.note.trim()}`
        : "";
      const primary = reference.primary ? " Primary reference." : "";
      const influence = formatReferenceInfluence(reference.influence);
      return `${index + 1}. ${reference.name} (${reference.category}; influences: ${influence}).${primary}${note}`;
    })
    .join("\n");
}

export function reorderArray(list, startId, targetId) {
  const startIndex = list.findIndex((item) => item.id === startId);
  const targetIndex = list.findIndex((item) => item.id === targetId);

  if (startIndex === -1 || targetIndex === -1 || startIndex === targetIndex) {
    return list;
  }

  const updated = [...list];
  const [moved] = updated.splice(startIndex, 1);
  updated.splice(targetIndex, 0, moved);

  return relabelScenes(updated);
}

export function buildDefaultCollapsedState(scenes, selectedSceneId) {
  return scenes.reduce((acc, scene) => {
    acc[scene.id] = scene.id !== selectedSceneId;
    return acc;
  }, {});
}

export function normalizeCollapsedState(scenes, collapsedMap, selectedSceneId) {
  const next = {};
  for (const scene of scenes) {
    if (scene.id === selectedSceneId) {
      next[scene.id] = false;
    } else if (typeof collapsedMap?.[scene.id] === "boolean") {
      next[scene.id] = collapsedMap[scene.id];
    } else {
      next[scene.id] = true;
    }
  }
  return next;
}

export function parseDurationToAverage(duration) {
  if (!duration) return 0;
  const numbers = duration.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 1) return numbers[0];
  if (numbers.length >= 2) return (numbers[0] + numbers[1]) / 2;
  return 0;
}

export function formatTime(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function cnIncludes(value, search) {
  return value.toLowerCase().includes(search.toLowerCase());
}

export function buildExportText({
  projectTitle,
  creativeCategory,
  format,
  duration,
  platform,
  aspectRatio,
  scenes,
  activeTab,
}) {
  const projectMeta = [
    creativeCategory,
    format,
    duration,
    aspectRatio,
    platform,
  ]
    .filter(Boolean)
    .join(" · ");

  if (activeTab === "Storyboard") {
    return [
      `${projectTitle} — Storyboard`,
      projectMeta,
      "",
      ...scenes.flatMap((scene) => [
        `${scene.label}: ${scene.title}`,
        `Duration: ${scene.duration}`,
        `Objective: ${scene.objective}`,
        `Transition In: ${scene.transitionIn}`,
        `Transition Out: ${scene.transitionOut}`,
        "",
      ]),
    ].join("\n");
  }

  if (activeTab === "Shot List") {
    return [
      `${projectTitle} — Shot List`,
      projectMeta,
      "",
      ...scenes.map(
        (scene) =>
          `${scene.label} | ${scene.shotType} | ${scene.duration} | ${scene.transitionIn} -> ${scene.transitionOut}`
      ),
    ].join("\n");
  }

  return [
    `${projectTitle} — Prompt Pack`,
    projectMeta,
    "",
    ...scenes.flatMap((scene) => [
      `${scene.label}: ${scene.title}`,
      `${scene.title} · ${scene.shotType} · ${scene.duration}. ${scene.objective} Camera: ${scene.camera} Lighting: ${scene.lighting} Continuity: ${scene.continuity} Anchors: ${scene.continuityAnchors} Locked: ${scene.lockedElements} Variables: ${scene.variableElements} Transitions: ${scene.transitionIn} / ${scene.transitionOut}`,
      "",
    ]),
  ].join("\n");
}

function stringifyValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "Not set";
  return String(value);
}

function formatObjectSection(title, object, markdown) {
  const lines = Object.entries(object || {}).map(([key, value]) => {
    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());
    return markdown
      ? `- **${label}:** ${stringifyValue(value)}`
      : `${label}: ${stringifyValue(value)}`;
  });

  return markdown
    ? [`## ${title}`, "", ...lines].join("\n")
    : [title.toUpperCase(), ...lines].join("\n");
}

function stringifyGeneratedItems(items, markdown) {
  if (!Array.isArray(items) || items.length === 0) {
    return markdown ? "_No generated output yet._" : "No generated output yet.";
  }

  return items
    .map((item, index) => {
      if (typeof item === "string") return item;
      const lines = Object.entries(item || {}).map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (letter) => letter.toUpperCase());
        return markdown
          ? `- **${label}:** ${stringifyValue(value)}`
          : `${label}: ${stringifyValue(value)}`;
      });
      return markdown
        ? [`### Item ${index + 1}`, ...lines].join("\n")
        : [`Item ${index + 1}`, ...lines].join("\n");
    })
    .join("\n\n");
}

function buildScenePlanExport(state, markdown) {
  const scenes = Array.isArray(state.scenes) ? state.scenes : [];
  if (scenes.length === 0) {
    return markdown ? "_No scenes planned yet._" : "No scenes planned yet.";
  }

  return scenes
    .map((scene) => {
      const lines = [
        ["Title", scene.title],
        ["Duration", scene.duration],
        ["Shot Type", scene.shotType],
        ["Objective", scene.objective],
        ["Camera", scene.camera],
        ["Lighting", scene.lighting],
        ["Continuity", scene.continuity],
        ["Transition In", scene.transitionIn],
        ["Transition Out", scene.transitionOut],
        ["Continuity Anchors", scene.continuityAnchors],
        ["Locked Elements", scene.lockedElements],
        ["Variable Elements", scene.variableElements],
      ].map(([label, value]) =>
        markdown
          ? `- **${label}:** ${stringifyValue(value)}`
          : `${label}: ${stringifyValue(value)}`
      );

      return markdown
        ? [`## ${scene.label || "Scene"}`, "", ...lines].join("\n")
        : [scene.label || "Scene", ...lines].join("\n");
    })
    .join("\n\n");
}

function buildVisualReferencesExport(visualReferences, markdown) {
  const references = normalizeVisualReferences(visualReferences);
  if (references.length === 0) {
    return markdown ? "_No visual references added._" : "No visual references added.";
  }

  return references
    .map((reference, index) => {
      const lines = [
        ["Name", reference.name],
        ["Purpose", reference.category],
        ["Influences", formatReferenceInfluence(reference.influence)],
        ["Primary", reference.primary ? "Yes" : "No"],
        ["Note", reference.note || "Not set"],
      ].map(([label, value]) =>
        markdown ? `- **${label}:** ${value}` : `${label}: ${value}`
      );

      return markdown
        ? [`### Reference ${index + 1}`, ...lines].join("\n")
        : [`Reference ${index + 1}`, ...lines].join("\n");
    })
    .join("\n\n");
}

export function buildProjectExport(state, exportType, fileType = "md") {
  const markdown = fileType === "md";
  const title = state.projectTitle || "Director AI Project";
  const heading = markdown ? `# ${title}` : title.toUpperCase();
  const divider = markdown ? "" : "\n---\n";
  const brief = {
    "Creative Category": state.creativeCategory,
    Format: state.format,
    "Scene Count": state.sceneCount,
    Duration: state.duration,
    Platform: state.platform,
    "Aspect Ratio": state.aspectRatio,
    "Workflow Mode": state.mode,
    "Creative Brief": state.creativeBrief,
    "Visual Style": state.visualStyle,
    "Characters / Subjects": state.subjects,
    References: state.references,
  };
  const visualReferencesText = buildVisualReferencesExport(
    state.visualReferences,
    markdown
  );

  const generatedOutputs = state.generatedOutputs || {};
  const storyboardText = generatedOutputs.storyboard?.length
    ? stringifyGeneratedItems(generatedOutputs.storyboard, markdown)
    : buildExportText({ ...state, activeTab: "Storyboard" });
  const shotListText = generatedOutputs.shotList?.length
    ? stringifyGeneratedItems(generatedOutputs.shotList, markdown)
    : buildExportText({ ...state, activeTab: "Shot List" });
  const promptPackText = generatedOutputs.promptPack?.length
    ? stringifyGeneratedItems(generatedOutputs.promptPack, markdown)
    : buildExportText({ ...state, activeTab: "Prompt Pack" });
  const globalContinuityText = generatedOutputs.globalContinuityPrompt
    ? markdown
      ? `## Global Continuity Prompt\n\n${generatedOutputs.globalContinuityPrompt}`
      : `GLOBAL CONTINUITY PROMPT\n${generatedOutputs.globalContinuityPrompt}`
    : "";
  const sections = {
    brief: [
      heading,
      "",
      formatObjectSection("Project Brief", brief, markdown),
      "",
      markdown ? "## Visual References" : "VISUAL REFERENCES",
      "",
      visualReferencesText,
    ],
    continuity: [
      markdown ? `# ${title} Continuity Bible` : `${title} CONTINUITY BIBLE`,
      "",
      formatObjectSection(
        "Continuity Bible",
        state.continuityBible,
        markdown
      ),
    ],
    storyboard: [
      markdown ? `# ${title} Storyboard` : `${title} STORYBOARD`,
      "",
      storyboardText,
    ],
    shotList: [
      markdown ? `# ${title} Shot List` : `${title} SHOT LIST`,
      "",
      shotListText,
    ],
    promptPack: [
      markdown ? `# ${title} Prompt Pack` : `${title} PROMPT PACK`,
      "",
      globalContinuityText,
      globalContinuityText ? "" : null,
      promptPackText,
    ].filter(Boolean),
    scenes: [
      markdown ? `# ${title} Scene Plan` : `${title} SCENE PLAN`,
      "",
      buildScenePlanExport(state, markdown),
    ],
  };

  if (exportType !== "full") return sections[exportType]?.join("\n") || "";

  return [
    heading,
    "",
    formatObjectSection("Project Brief", brief, markdown),
    "",
    markdown ? "## Visual References" : "VISUAL REFERENCES",
    "",
    visualReferencesText,
    divider,
    formatObjectSection("Continuity Bible", state.continuityBible, markdown),
    divider,
    markdown ? "## Scene Plan" : "SCENE PLAN",
    "",
    buildScenePlanExport(state, markdown),
    divider,
    markdown ? "## Storyboard" : "STORYBOARD",
    "",
    storyboardText,
    divider,
    markdown ? "## Shot List" : "SHOT LIST",
    "",
    shotListText,
    divider,
    markdown ? "## Prompt Pack" : "PROMPT PACK",
    "",
    globalContinuityText,
    globalContinuityText ? "" : null,
    promptPackText,
  ]
    .filter((item) => item !== null)
    .join("\n");
}

export function slugifyFilename(value) {
  return String(value || "director-ai-project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
