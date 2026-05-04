const providerProfiles = {
  Veo: {
    label: "Veo",
    promptStyle:
      "cinematic, staged, polished, premium film phrasing with clear scene blocking",
    motionStyle:
      "fluid camera motion, intentional transitions, controlled lens language",
    continuityStyle:
      "repeat continuity anchors directly: character, product, location, style, lighting, and transition logic",
    detailLevel:
      "moderately detailed and cinematic; avoid vague adjectives without staging",
    referenceStyle:
      "use moodboard notes as visual art direction, but keep the prompt scene-led",
  },
  Runway: {
    label: "Runway",
    promptStyle:
      "concise, visually direct, edit-friendly phrasing with obvious subject and action",
    motionStyle:
      "simple camera movement and clear action structure; avoid overly long compound motion",
    continuityStyle:
      "state only the most important consistency anchors needed for the shot",
    detailLevel:
      "compact and practical; remove ornamental language that does not change the image",
    referenceStyle:
      "translate moodboard notes into clear composition, subject, and style cues",
  },
  Kling: {
    label: "Kling",
    promptStyle:
      "visually grounded, atmospheric, stylized, and scene-led",
    motionStyle:
      "clear subject motion, environmental movement, spatial logic, and atmosphere",
    continuityStyle:
      "strongly reinforce subject consistency, wardrobe/product stability, and visual world continuity",
    detailLevel:
      "descriptive enough to ground texture, atmosphere, and motion clarity",
    referenceStyle:
      "use moodboard notes to strengthen atmosphere, color, subject styling, and composition",
  },
  Seedance: {
    label: "Seedance",
    promptStyle:
      "reference-driven, multimodal-friendly, atmospheric, and visually specific",
    motionStyle:
      "camera motion, subject action, and audiovisual rhythm should feel coherent together",
    continuityStyle:
      "connect each scene back to reference-led styling, continuity anchors, and sequence atmosphere",
    detailLevel:
      "detailed where references, camera motion, and mood affect generation quality",
    referenceStyle:
      "when visual references exist, explicitly use their names, categories, and notes as style and continuity grounding",
  },
  "Mixed Workflow": {
    label: "Mixed Workflow",
    promptStyle:
      "balanced, broadly useful, adaptable across video platforms",
    motionStyle:
      "combine cinematic camera detail with concise action and transition clarity",
    continuityStyle:
      "make cross-scene anchors easy to preserve manually across tools",
    detailLevel:
      "medium detail; clear enough to adapt, not locked to one provider habit",
    referenceStyle:
      "use moodboard notes as reusable style tokens for manual adaptation",
  },
};

export function getProviderProfile(platform) {
  return providerProfiles[platform] || providerProfiles["Mixed Workflow"];
}

export function getProviderInstructions(platform) {
  const profile = getProviderProfile(platform);

  return `
Provider output profile: ${profile.label}
- Prompt style: ${profile.promptStyle}.
- Motion style: ${profile.motionStyle}.
- Continuity style: ${profile.continuityStyle}.
- Detail level: ${profile.detailLevel}.
- Visual reference handling: ${profile.referenceStyle}.
- Keep the same output schema for every provider.
- Prompt Pack entries must use these fields: scene, prompt, continuity, cameraMotion, visualFocus, optionalNotes.
- If useful, include a top-level globalContinuityPrompt that summarizes sequence-wide identity, product, location, style, lighting, transition, and reference guidance.
`;
}
