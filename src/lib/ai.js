import {
  getProviderInstructions,
  getProviderProfile,
} from "./provider-shaping";
import { buildGenerationContext } from "./generation-context";

function textOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function boolOrFallback(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeRequestedSceneCount(value, fallback = 5) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(Math.max(number, 1), 12);
}

const outputToneProfiles = {
  standard: {
    label: "Standard",
    instruction:
      "Use balanced, production-ready phrasing with clear continuity and practical scene detail.",
    promptPrefix: "Balanced production output",
  },
  cinematic: {
    label: "More cinematic",
    instruction:
      "Use richer cinematic language, stronger atmosphere, more evocative camera direction, and premium film phrasing while preserving practical clarity.",
    promptPrefix: "Cinematic output",
  },
  concise: {
    label: "More concise",
    instruction:
      "Use compact, direct, edit-friendly phrasing. Preserve continuity and structure while avoiding unnecessary verbosity.",
    promptPrefix: "Concise output",
  },
  detailed: {
    label: "More detailed",
    instruction:
      "Use more specific scene detail, continuity anchors, camera behavior, lighting notes, and transition guidance while staying readable.",
    promptPrefix: "Detailed output",
  },
};

function getOutputToneProfile(tone) {
  return outputToneProfiles[tone] || outputToneProfiles.standard;
}

function visualReferenceText(input) {
  const influenceLabels = {
    continuity: "Continuity Bible",
    scenePlan: "Scene Plan",
    outputs: "Outputs",
  };

  return textOrFallback(
    input.visualReferenceSummary,
    Array.isArray(input.visualReferences)
      ? input.visualReferences
          .map((reference, index) => {
            const note = reference.note ? ` Note: ${reference.note}` : "";
            const influence = reference.influence
              ? Object.entries(reference.influence)
                  .filter(([, enabled]) => enabled)
                  .map(([key]) => influenceLabels[key])
                  .filter(Boolean)
                  .join(", ")
              : "All";
            const primary = reference.primary ? " Primary reference." : "";
            return `${index + 1}. ${reference.name || "Reference"} (${
              reference.category || "Mood"
            }; influences: ${influence || "All"}).${primary}${note}`;
          })
          .join("\n")
      : ""
  );
}

export function normalizeContinuityBible(value = {}) {
  const bible = value && typeof value === "object" ? value : {};

  return {
    mainCharacter: textOrFallback(bible.mainCharacter, ""),
    wardrobe: textOrFallback(bible.wardrobe, ""),
    productDescription: textOrFallback(bible.productDescription, ""),
    productDetails: textOrFallback(bible.productDetails, ""),
    environment: textOrFallback(bible.environment, ""),
    timeOfDay: textOrFallback(bible.timeOfDay, ""),
    lightingRule: textOrFallback(bible.lightingRule, ""),
    cameraRule: textOrFallback(bible.cameraRule, ""),
    colorPalette: textOrFallback(bible.colorPalette, ""),
    lockCharacter: boolOrFallback(bible.lockCharacter, false),
    lockWardrobe: boolOrFallback(bible.lockWardrobe, false),
    lockProduct: boolOrFallback(bible.lockProduct, false),
    lockLocation: boolOrFallback(bible.lockLocation, false),
    lockStyle: boolOrFallback(bible.lockStyle, false),
    forbiddenChanges: textOrFallback(bible.forbiddenChanges, ""),
  };
}

function getAiConfig() {
  return {
    provider: (process.env.DIRECTOR_AI_PROVIDER || "mock").toLowerCase(),
    apiKey: process.env.DIRECTOR_AI_API_KEY || process.env.AI_API_KEY || "",
    // Change this env var when you want to use a different Gemini model.
    model: process.env.DIRECTOR_AI_GEMINI_MODEL || "gemini-2.5-flash",
  };
}

function isAiDebugEnabled() {
  return process.env.DIRECTOR_AI_DEBUG === "true";
}

function logAiDebug(message, details) {
  if (isAiDebugEnabled()) {
    console.log(message, details);
  }
}

function normalizeScenes(scenes) {
  if (!Array.isArray(scenes)) return [];

  return scenes
    .filter((scene) => scene && typeof scene === "object")
    .map((scene, index) => ({
      id: scene.id ?? index + 1,
      label: textOrFallback(scene.label, `Scene ${index + 1}`),
      title: textOrFallback(scene.title, "Untitled Scene"),
      shotType: textOrFallback(scene.shotType, "Planned Shot"),
      duration: textOrFallback(scene.duration, "TBD"),
      objective: textOrFallback(scene.objective, "Define the scene objective."),
      camera: textOrFallback(scene.camera, "Define camera language."),
      lighting: textOrFallback(scene.lighting, "Define lighting approach."),
      continuity: textOrFallback(scene.continuity, "Maintain continuity."),
      transitionIn: textOrFallback(
        scene.transitionIn,
        "Define transition into this scene."
      ),
      transitionOut: textOrFallback(
        scene.transitionOut,
        "Define transition out of this scene."
      ),
      continuityAnchors: textOrFallback(
        scene.continuityAnchors,
        "List visual anchors that must remain consistent."
      ),
      lockedElements: textOrFallback(
        scene.lockedElements,
        "List elements that must not change."
      ),
      variableElements: textOrFallback(
        scene.variableElements,
        "List elements that may evolve in this scene."
      ),
    }));
}

export function buildMockScenePlan(input) {
  const projectTitle = textOrFallback(input.projectTitle, "Director AI");
  const format = textOrFallback(input.format, "Commercial");
  const duration = textOrFallback(input.duration, "30 sec");
  const platform = textOrFallback(input.platform, "Veo");
  const aspectRatio = textOrFallback(input.aspectRatio, "16:9");
  const mode = textOrFallback(input.mode, "Storyboard");
  const creativeBrief = textOrFallback(
    input.creativeBrief,
    "A cinematic branded video with a clear beginning, middle, and payoff."
  );
  const visualStyle = textOrFallback(
    input.visualStyle,
    "cinematic, premium, atmospheric"
  );
  const subjects = textOrFallback(input.subjects, "the main subject");
  const references = textOrFallback(
    input.references,
    "premium campaign pacing and polished production design"
  );
  const visualReferences = visualReferenceText(input);
  const creativeCategory = textOrFallback(input.creativeCategory, "Commercial");
  const requestedSceneCount = normalizeRequestedSceneCount(input.sceneCount);
  const continuityBible = normalizeContinuityBible(input.continuityBible);

  const visualReferenceInstruction = visualReferences
    ? ` Use these visual references as style and continuity inspiration: ${visualReferences}`
    : "";
  const baseContinuity = `Keep ${subjects} consistent across the ${aspectRatio} ${platform} sequence with ${visualStyle} visual language.${visualReferenceInstruction} Follow the continuity bible: character "${continuityBible.mainCharacter}", wardrobe "${continuityBible.wardrobe}", product "${continuityBible.productDescription}", environment "${continuityBible.environment}", palette "${continuityBible.colorPalette}".`;

  const scenes = [
    {
      id: 1,
      label: "Scene 1",
      title: "Opening Hook",
      shotType: "Wide Establishing",
      duration: "0-5 sec",
      objective: `Open ${projectTitle} with an immediate visual hook that frames the ${creativeCategory.toLowerCase()} ${format.toLowerCase()} idea: ${creativeBrief}`,
      camera: "Slow controlled push-in with confident negative space.",
      lighting: `Premium high-contrast lighting shaped around ${visualStyle}.`,
      continuity: `${baseContinuity} Introduce the palette and environment clearly.`,
      transitionIn: "Fade or hard cut from black into the opening hook.",
      transitionOut: "Match motion into the subject introduction.",
      continuityAnchors: `${continuityBible.mainCharacter}; ${continuityBible.wardrobe}; ${continuityBible.environment}; ${continuityBible.colorPalette}`,
      lockedElements: "Character identity, wardrobe, product language, location, style.",
      variableElements: "Opening composition, pose, screen content.",
    },
    {
      id: 2,
      label: "Scene 2",
      title: "Subject Introduction",
      shotType: "Medium Hero",
      duration: "5-12 sec",
      objective: `Bring ${subjects} forward and clarify the central promise for a ${duration} ${mode.toLowerCase()} workflow.`,
      camera: "Measured tracking move with steady subject focus.",
      lighting: "Soft key with clean edge separation and controlled highlights.",
      continuity: `${baseContinuity} Preserve wardrobe, props, and screen direction.`,
      transitionIn: "Continue the opening camera direction into a medium hero view.",
      transitionOut: "Cut on gesture or gaze toward detail proof.",
      continuityAnchors: `${continuityBible.mainCharacter}; ${continuityBible.wardrobe}; screen direction; lighting key side`,
      lockedElements: "Character, wardrobe, lighting rule, camera rule.",
      variableElements: "Gesture, focal length, background rhythm.",
    },
    {
      id: 3,
      label: "Scene 3",
      title: "Detail and Proof",
      shotType: "Close-Up Detail",
      duration: "12-20 sec",
      objective: `Show tactile details, proof points, or visual cues inspired by ${references}.`,
      camera: "Macro-style close-ups with restrained motion and precise focus pulls.",
      lighting: "Specular accents with gentle falloff to emphasize premium texture.",
      continuity: `${baseContinuity} Match materials, hands, props, and lens feel.`,
      transitionIn: "Cut from subject action into a tactile product or UI detail.",
      transitionOut: "Pull focus or match shape into the emotional turn.",
      continuityAnchors: `${continuityBible.productDescription}; ${continuityBible.productDetails}; ${continuityBible.colorPalette}`,
      lockedElements: "Product description, product details, palette, style.",
      variableElements: "Detail angle, reflected highlights, UI state.",
    },
    {
      id: 4,
      label: "Scene 4",
      title: "Emotional Turn",
      shotType: "Dynamic Transition",
      duration: "20-25 sec",
      objective:
        "Shift from setup into payoff with a clear escalation in energy and intent.",
      camera: "Subtle orbit or lateral move that reveals a stronger final composition.",
      lighting: "Atmosphere deepens while maintaining the same motivated key direction.",
      continuity: `${baseContinuity} Keep motion direction and color temperature coherent.`,
      transitionIn: "Resolve from detail into a wider reveal with matched color temperature.",
      transitionOut: "Ease into final hero payoff.",
      continuityAnchors: `${continuityBible.environment}; ${continuityBible.timeOfDay}; ${continuityBible.lightingRule}`,
      lockedElements: "Location, time of day, lighting rule, camera rule.",
      variableElements: "Energy level, camera distance, performance beat.",
    },
    {
      id: 5,
      label: "Scene 5",
      title: "Continuity Proof",
      shotType: "Connected Detail",
      duration: "25-34 sec",
      objective:
        "Reinforce that the product, subject, and world remain coherent as the sequence expands.",
      camera: "Controlled move that echoes the earlier detail shot with a wider context.",
      lighting: "Same motivated key direction with a slightly brighter hero accent.",
      continuity: `${baseContinuity} Reuse the same anchors while varying only pose, angle, and UI state.`,
      transitionIn: "Match camera rhythm from the emotional turn.",
      transitionOut: "Cut on aligned screen geometry into the final escalation.",
      continuityAnchors: `${continuityBible.productDescription}; ${continuityBible.productDetails}; ${continuityBible.environment}`,
      lockedElements: "Product, location, palette, visual style.",
      variableElements: "Screen state, focal distance, hand/action detail.",
    },
    {
      id: 6,
      label: "Scene 6",
      title: "Final Escalation",
      shotType: "Hero Reveal",
      duration: "34-50 sec",
      objective:
        "Build toward the final frame with a larger, more confident reveal of the central idea.",
      camera: "Slow reveal or orbit that preserves screen direction and lens feel.",
      lighting: "Premium contrast with controlled highlights and no palette drift.",
      continuity: `${baseContinuity} Keep all locked elements stable while increasing composition scale.`,
      transitionIn: "Carry screen geometry and motion direction forward.",
      transitionOut: "Ease into a composed closing payoff.",
      continuityAnchors: `${continuityBible.mainCharacter}; ${continuityBible.wardrobe}; ${continuityBible.cameraRule}`,
      lockedElements: "Character, wardrobe, camera rule, style.",
      variableElements: "Blocking, camera distance, performance intensity.",
    },
    {
      id: 7,
      label: "Scene 7",
      title: "Closing Payoff",
      shotType: "Final Hero",
      duration: "50-60 sec",
      objective: `End with a memorable final frame that makes ${projectTitle} feel complete and ready for ${platform}.`,
      camera: "Locked-off or slow drift into a composed final frame.",
      lighting: "Clean hero lighting with crisp subject separation and polished contrast.",
      continuity: `${baseContinuity} Resolve the sequence with the same world, palette, and lens logic.`,
      transitionIn: "Carry the reveal into a final composed hero frame.",
      transitionOut: "Hold for end card, prompt endpoint, or clean loop.",
      continuityAnchors: `${continuityBible.mainCharacter}; ${continuityBible.productDescription}; ${continuityBible.environment}; ${continuityBible.colorPalette}`,
      lockedElements: "Character, wardrobe, product, location, style.",
      variableElements: "Final pose, logo/screen emphasis, hold length.",
    },
  ];

  while (scenes.length < requestedSceneCount) {
    const sceneNumber = scenes.length + 1;
    scenes.splice(scenes.length - 1, 0, {
      id: sceneNumber,
      label: `Scene ${sceneNumber}`,
      title: `Development Beat ${sceneNumber - 2}`,
      shotType: sceneNumber % 2 === 0 ? "Performance Beat" : "Atmospheric Detail",
      duration: "4-7 sec",
      objective: `Expand the ${creativeCategory.toLowerCase()} arc with a distinct ${format.toLowerCase()} beat while staying grounded in: ${creativeBrief}`,
      camera:
        sceneNumber % 2 === 0
          ? "Measured movement that advances the subject performance without breaking screen direction."
          : "Composed detail coverage with a restrained focus shift.",
      lighting:
        "Maintain the established lighting rule while varying emphasis and contrast.",
      continuity: `${baseContinuity} Add variety through blocking, scale, or timing rather than changing locked identity or style.`,
      transitionIn: "Carry forward motion, eyeline, rhythm, or color from the previous scene.",
      transitionOut: "Set up the next beat with a clean visual or emotional handoff.",
      continuityAnchors: `${continuityBible.mainCharacter}; ${continuityBible.environment}; ${continuityBible.colorPalette}`,
      lockedElements: "Identity, environment logic, lighting direction, camera language, palette.",
      variableElements: "Blocking, shot scale, performance intensity, detail emphasis.",
    });
  }

  return scenes.slice(0, requestedSceneCount).map((scene, index) => ({
    ...scene,
    id: index + 1,
    label: `Scene ${index + 1}`,
  }));
}

export function buildMockInsertedScene(input) {
  const scenes = normalizeScenes(input.scenes);
  const previousScene =
    scenes.find((scene) => scene.id === input.previousSceneId) ||
    scenes[input.insertAfterIndex] ||
    scenes[scenes.length - 1];
  const previousSceneIndex = scenes.findIndex(
    (scene) => scene.id === previousScene?.id
  );
  const nextScene = scenes[previousSceneIndex + 1];
  const continuityBible = normalizeContinuityBible(input.continuityBible);

  return [
    {
      id: 1,
      label: "Scene 1",
      title: nextScene ? "Continuity Bridge" : "Extended Payoff Beat",
      shotType: nextScene ? "Bridge Insert" : "Additional Hero Moment",
      duration: nextScene ? "3-5 sec" : "4-6 sec",
      objective: nextScene
        ? `Bridge "${previousScene?.title}" into "${nextScene.title}" while preserving the project continuity bible.`
        : `Extend the sequence after "${previousScene?.title}" with a practical additional beat.`,
      camera: `Follow the camera rule: ${continuityBible.cameraRule || "maintain established lens language"}.`,
      lighting: `Follow the lighting rule: ${continuityBible.lightingRule || "match established lighting"}.`,
      continuity: `Maintain ${continuityBible.mainCharacter}, ${continuityBible.wardrobe}, ${continuityBible.productDescription}, and ${continuityBible.environment}.`,
      transitionIn: previousScene
        ? `Continue from ${previousScene.label}: ${previousScene.transitionOut}`
        : "Enter from the preceding scene cleanly.",
      transitionOut: nextScene
        ? `Set up ${nextScene.label}: ${nextScene.transitionIn}`
        : "Resolve into a clean hold or end card.",
      continuityAnchors: `${continuityBible.mainCharacter}; ${continuityBible.wardrobe}; ${continuityBible.productDescription}; ${continuityBible.environment}; ${continuityBible.colorPalette}`,
      lockedElements: "Character, wardrobe, product, location, style.",
      variableElements: "Pose, angle, micro-action, framing scale.",
    },
  ];
}

export function buildMockRefinedSequence(input) {
  const scenes = normalizeScenes(input.scenes);
  const continuityBible = normalizeContinuityBible(input.continuityBible);
  const mode = textOrFallback(input.sequenceRefinementMode, "improve");
  const shouldReorder = mode === "reorder";
  const orderedScenes =
    shouldReorder && scenes.length > 3
      ? [scenes[0], scenes[1], ...scenes.slice(3), scenes[2]]
      : scenes;

  return orderedScenes.map((scene, index) => ({
    ...scene,
    id: index + 1,
    label: `Scene ${index + 1}`,
    title:
      mode === "reorder" || scene.title.includes("Refined")
        ? scene.title
        : `${scene.title} Refined`,
    objective: `${scene.objective} Refined for a clearer sequence arc, stronger pacing, and a more intentional handoff into the next beat.`,
    camera: `${scene.camera} Keep movement purposeful and easy to follow across the full sequence.`,
    lighting: `${scene.lighting} Maintain a coherent lighting progression without abrupt drift.`,
    continuity: `${scene.continuity} Preserve ${continuityBible.mainCharacter || "the main subject"}, ${continuityBible.productDescription || "the hero subject"}, and ${continuityBible.environment || "the visual world"} across the revised flow.`,
    transitionIn:
      index === 0
        ? scene.transitionIn
        : `Enter from ${orderedScenes[index - 1]?.label}: ${
            orderedScenes[index - 1]?.transitionOut || scene.transitionIn
          }`,
    transitionOut:
      index === orderedScenes.length - 1
        ? scene.transitionOut
        : `Hand off cleanly to ${orderedScenes[index + 1]?.label}: ${
            orderedScenes[index + 1]?.title
          }`,
  }));
}

export function buildMockRefinedSelectedScene(input) {
  const scene = normalizeScenes([input.selectedScene])[0];
  const continuityBible = normalizeContinuityBible(input.continuityBible);
  const platform = textOrFallback(input.platform, "Veo");
  const mode = textOrFallback(input.sceneRefinementMode, "rewrite");

  if (!scene) return [];

  const modeNotes = {
    rewrite: "clarified for a stronger objective and cleaner visual beat",
    continuity: "strengthened around continuity anchors and locked elements",
    cinematic: "made more cinematic with richer staging and camera intent",
    platform: `tightened for ${platform} prompt and output usefulness`,
    transition: "strengthened to bridge more naturally from the previous scene",
    "regenerate-full":
      "regenerated with surrounding scene context while preserving locked fields",
    "regenerate-continuity":
      "regenerated only for stronger continuity while preserving locked fields",
    "regenerate-cameraLighting":
      "regenerated only for camera and lighting while preserving locked fields",
    "regenerate-transition":
      "regenerated for transition quality while preserving locked fields",
  };

  return [
    {
      ...scene,
      title:
        mode === "rewrite" && !scene.title.includes("Refined")
          ? `${scene.title} Refined`
          : scene.title,
      objective: `${scene.objective} This revision is ${
        modeNotes[mode] || modeNotes.rewrite
      }.`,
      camera: `${scene.camera} Add a clear motivated movement that supports the scene objective.`,
      lighting: `${scene.lighting} Keep lighting consistent with the sequence while sharpening focal emphasis.`,
      continuity: `${scene.continuity} Preserve ${
        continuityBible.mainCharacter || "subject identity"
      }, ${continuityBible.wardrobe || "wardrobe"}, ${
        continuityBible.productDescription || "product"
      }, and ${continuityBible.environment || "location"}.`,
      transitionIn: `${scene.transitionIn} Make the entry feel intentional and connected to the previous beat.`,
      transitionOut: `${scene.transitionOut} Leave a clean visual or emotional cue for the next scene.`,
      continuityAnchors: `${scene.continuityAnchors}; ${
        continuityBible.colorPalette || "palette"
      }; ${continuityBible.cameraRule || "camera rule"}`,
      lockedElements: `${scene.lockedElements}; core continuity bible locks`,
    },
  ];
}

export function buildMockContinuityBible(input) {
  const projectTitle = textOrFallback(input.projectTitle, "Director AI");
  const format = textOrFallback(input.format, "Commercial");
  const creativeCategory = textOrFallback(input.creativeCategory, "Commercial");
  const platform = textOrFallback(input.platform, "Veo");
  const aspectRatio = textOrFallback(input.aspectRatio, "16:9");
  const creativeBrief = textOrFallback(
    input.creativeBrief,
    "A cinematic branded video with a clear beginning, middle, and payoff."
  );
  const visualStyle = textOrFallback(
    input.visualStyle,
    "cinematic, premium, atmospheric"
  );
  const subjects = textOrFallback(input.subjects, "the main subject");
  const references = textOrFallback(
    input.references,
    "premium campaign pacing and polished production design"
  );
  const visualReferences = visualReferenceText(input);
  const existing = normalizeContinuityBible(input.continuityBible);
  const isEnhance = input.generationMode === "enhance";

  const generated = {
    mainCharacter: `${subjects} with a consistent silhouette, facial identity, and performance energy throughout ${projectTitle}.`,
    wardrobe: `Wardrobe should match the ${visualStyle} direction: refined, intentional, and unchanged across scenes unless a scene explicitly calls for a close-up variation.`,
    productDescription: `${projectTitle} presented as the hero subject of a ${creativeCategory.toLowerCase()} ${format.toLowerCase()} built for ${platform} in ${aspectRatio}.`,
    productDetails: `Keep product proportions, interface details, materials, labels, and premium finish aligned with: ${creativeBrief}`,
    environment: `A coherent visual world inspired by ${references}${visualReferences ? ` and visual references: ${visualReferences}` : ""}, with the same location logic and production design from scene to scene.`,
    timeOfDay: "Controlled interior timing with no visible time jump unless specified.",
    lightingRule: `Maintain ${visualStyle} lighting with stable color temperature, motivated key direction, and consistent contrast.`,
    cameraRule: `Use practical ${platform} camera language for ${aspectRatio}: stable screen direction, intentional movement, and consistent lens feel.`,
    colorPalette: `Palette should stay consistent with ${visualStyle}: premium neutrals, controlled accent color, and no abrupt hue shifts.`,
    forbiddenChanges:
      "Do not change character identity, wardrobe silhouette, product design, environment, time of day, lighting direction, camera language, or color palette between scenes.",
    lockCharacter: true,
    lockWardrobe: true,
    lockProduct: true,
    lockLocation: true,
    lockStyle: true,
  };

  if (!isEnhance) return normalizeContinuityBible(generated);

  return normalizeContinuityBible({
    ...generated,
    ...Object.fromEntries(
      Object.entries(existing).filter(([, value]) =>
        typeof value === "boolean" ? true : Boolean(value.trim())
      )
    ),
  });
}

export function buildMockOutputs(input) {
  const scenes = normalizeScenes(input.scenes);
  const projectTitle = textOrFallback(input.projectTitle, "Director AI");
  const format = textOrFallback(input.format, "Commercial");
  const creativeCategory = textOrFallback(input.creativeCategory, "Commercial");
  const platform = textOrFallback(input.platform, "Veo");
  const aspectRatio = textOrFallback(input.aspectRatio, "16:9");
  const visualReferences = visualReferenceText(input);
  const continuityBible = normalizeContinuityBible(input.continuityBible);
  const providerProfile = getProviderProfile(platform);
  const outputToneProfile = getOutputToneProfile(input.outputTone);
  const referencePhrase = visualReferences
    ? ` Reference-led styling: ${visualReferences}`
    : "";

  const globalContinuityPrompt = [
    `Global continuity for ${projectTitle}, optimized for ${providerProfile.label}.`,
    `Output variation: ${outputToneProfile.label}. ${outputToneProfile.instruction}`,
    `Preserve ${continuityBible.mainCharacter || "the main subject"}, ${continuityBible.productDescription || "the hero product or object"}, ${continuityBible.environment || "the environment"}, and ${continuityBible.colorPalette || "the color palette"} across every scene.`,
    `Provider emphasis: ${providerProfile.continuityStyle}.`,
    visualReferences
      ? `Use visual references as ordered moodboard grounding: ${visualReferences}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    globalContinuityPrompt,
    storyboard: scenes.map((scene) => ({
      scene: scene.label,
      title: scene.title,
      duration: scene.duration,
      variation: outputToneProfile.label,
      visualBeat: `${outputToneProfile.promptPrefix}: ${scene.objective}`,
      framing: `${scene.shotType} composed for ${aspectRatio}.`,
      transitionIn: scene.transitionIn,
      transitionOut: scene.transitionOut,
      continuityAnchors: scene.continuityAnchors,
    })),
    shotList: scenes.map((scene) => ({
      scene: scene.label,
      shotType: scene.shotType,
      duration: scene.duration,
      camera: `${scene.camera} ${outputToneProfile.instruction}`,
      lighting: scene.lighting,
      transitionIn: scene.transitionIn,
      transitionOut: scene.transitionOut,
      lockedElements: scene.lockedElements,
    })),
    promptPack: scenes.map((scene) => ({
      scene: scene.label,
      prompt: `${outputToneProfile.promptPrefix}: ${projectTitle} ${creativeCategory} ${format}, ${scene.title}. ${providerProfile.promptStyle}. ${scene.objective} ${providerProfile.detailLevel}.${referencePhrase}`,
      continuity: `${scene.continuity} Anchors: ${scene.continuityAnchors}. Locked: ${scene.lockedElements}. Provider continuity emphasis: ${providerProfile.continuityStyle}.`,
      cameraMotion: `${scene.camera} ${providerProfile.motionStyle}. ${outputToneProfile.instruction} Transition: ${scene.transitionIn} into ${scene.transitionOut}.`,
      visualFocus: `${scene.shotType} composed for ${aspectRatio}. Lighting: ${scene.lighting}. Visual direction: ${providerProfile.referenceStyle}.`,
      optionalNotes: `${outputToneProfile.label} variation. ${providerProfile.label} shaping: ${providerProfile.detailLevel}. Variables allowed: ${scene.variableElements}.`,
    })),
  };
}

function stripJsonCodeFence(text) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) return trimmed;

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseJsonOnlyResponse(text, context) {
  const cleaned = stripJsonCodeFence(text);

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `${context} returned invalid JSON. Check the model response format.`
    );
  }
}

export function extractGeminiText(responseJson) {
  const parts = responseJson?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function sceneSchema() {
  return {
    type: "OBJECT",
    properties: {
      id: { type: "INTEGER" },
      label: { type: "STRING" },
      title: { type: "STRING" },
      shotType: { type: "STRING" },
      duration: { type: "STRING" },
      objective: { type: "STRING" },
      camera: { type: "STRING" },
      lighting: { type: "STRING" },
      continuity: { type: "STRING" },
      transitionIn: { type: "STRING" },
      transitionOut: { type: "STRING" },
      continuityAnchors: { type: "STRING" },
      lockedElements: { type: "STRING" },
      variableElements: { type: "STRING" },
    },
    required: [
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
    ],
  };
}

export function buildScenePlanSchema(minItems = 4) {
  return {
    type: "OBJECT",
    properties: {
      scenes: {
        type: "ARRAY",
        minItems,
        items: sceneSchema(),
      },
    },
    required: ["scenes"],
  };
}

function freeformObjectArraySchema() {
  return {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        scene: { type: "STRING" },
        title: { type: "STRING" },
        duration: { type: "STRING" },
        visualBeat: { type: "STRING" },
        framing: { type: "STRING" },
        shotType: { type: "STRING" },
        camera: { type: "STRING" },
        lighting: { type: "STRING" },
        prompt: { type: "STRING" },
        continuity: { type: "STRING" },
        cameraMotion: { type: "STRING" },
        visualFocus: { type: "STRING" },
        optionalNotes: { type: "STRING" },
        transitionIn: { type: "STRING" },
        transitionOut: { type: "STRING" },
        continuityAnchors: { type: "STRING" },
        lockedElements: { type: "STRING" },
        variableElements: { type: "STRING" },
      },
    },
  };
}

export function buildOutputsSchema() {
  return {
    type: "OBJECT",
    properties: {
      storyboard: freeformObjectArraySchema(),
      shotList: freeformObjectArraySchema(),
      promptPack: freeformObjectArraySchema(),
      globalContinuityPrompt: { type: "STRING" },
    },
    required: ["storyboard", "shotList", "promptPack"],
  };
}

export function buildContinuityBibleSchema() {
  return {
    type: "OBJECT",
    properties: {
      mainCharacter: { type: "STRING" },
      wardrobe: { type: "STRING" },
      productDescription: { type: "STRING" },
      productDetails: { type: "STRING" },
      environment: { type: "STRING" },
      timeOfDay: { type: "STRING" },
      lightingRule: { type: "STRING" },
      cameraRule: { type: "STRING" },
      colorPalette: { type: "STRING" },
      forbiddenChanges: { type: "STRING" },
      lockCharacter: { type: "BOOLEAN" },
      lockWardrobe: { type: "BOOLEAN" },
      lockProduct: { type: "BOOLEAN" },
      lockLocation: { type: "BOOLEAN" },
      lockStyle: { type: "BOOLEAN" },
    },
    required: [
      "mainCharacter",
      "wardrobe",
      "productDescription",
      "productDetails",
      "environment",
      "timeOfDay",
      "lightingRule",
      "cameraRule",
      "colorPalette",
      "forbiddenChanges",
      "lockCharacter",
      "lockWardrobe",
      "lockProduct",
      "lockLocation",
      "lockStyle",
    ],
  };
}

async function callGeminiJson({ apiKey, model, prompt, schema, context }) {
  const modelName = model.startsWith("models/") ? model.slice(7) : model;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelName
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const endpointHost = new URL(endpoint).host;

  logAiDebug("[Director AI] Gemini request", {
    context,
    model: modelName,
    endpointHost,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  const responseJson = await response.json().catch(() => null);

  logAiDebug("[Director AI] Gemini response", {
    context,
    ok: response.ok,
  });

  if (!response.ok) {
    const message =
      responseJson?.error?.message ||
      `${context} request failed with status ${response.status}.`;
    console.error("[Director AI] Gemini error", {
      context,
      message,
    });
    throw new Error(message);
  }

  const text = extractGeminiText(responseJson);

  if (!text) {
    throw new Error(`${context} response did not include Gemini text content.`);
  }

  return parseJsonOnlyResponse(text, context);
}

export async function generateGeminiScenePlan(input, apiKey, model) {
  logAiDebug("[Director AI] Gemini scene plan generation started");
  const context = buildGenerationContext(input, {
    influenceTarget: "scenePlan",
  });
  const isInsert = context.generationMode === "insert-scene";
  const isSelectedSceneRefinement =
    context.generationMode === "refine-selected-scene";
  const isSequenceRefinement =
    context.generationMode === "refine-sequence" ||
    context.generationMode === "reorder-sequence";
  const requestedSceneCount = normalizeRequestedSceneCount(context.sceneCount);
  const minItems = isInsert || isSelectedSceneRefinement ? 1 : requestedSceneCount;
  const countInstruction = isInsert
    ? "Return exactly 1 new insert scene."
    : isSelectedSceneRefinement
      ? "Return exactly 1 refined version of selectedScene."
      : isSequenceRefinement
        ? `Return exactly ${requestedSceneCount} scenes as a revised full sequence.`
    : `Return exactly ${requestedSceneCount} scenes.`;
  const modeInstruction = isInsert
      ? "- Insert-scene mode: use previousSceneId, nextSceneId, insertAfterIndex, and surroundingScenes to create one practical bridge scene."
    : isSelectedSceneRefinement
      ? "- Selected-scene refinement mode: revise only selectedScene using sceneRefinementMode, fieldLocks, lockedFields, surrounding scenes, continuity bible, platform, project brief, and visual references. Preserve the same schema. Locked fields must be returned unchanged."
      : isSequenceRefinement
        ? "- Sequence refinement mode: improve or reorder the full current scenes array while preserving project intent, continuity, scene count, and stable scene schema."
        : "- New scene-plan mode: create a fresh full scene plan.";

  const prompt = `
You are Director AI, an AI video pre-production planner.
Return JSON only. Do not include markdown, prose, or code fences.

Create ${isInsert ? "one new scene to insert into" : "a scene plan from"} this project context:
${JSON.stringify(context, null, 2)}

Return exactly this JSON shape:
{
  "scenes": [
    {
      "id": 1,
      "label": "Scene 1",
      "title": "Short scene title",
      "shotType": "Shot type",
      "duration": "0-5 sec",
      "objective": "Scene objective",
      "camera": "Camera direction",
      "lighting": "Lighting direction",
      "continuity": "Continuity notes",
      "transitionIn": "How this scene enters from the previous scene",
      "transitionOut": "How this scene exits into the next scene",
      "continuityAnchors": "Specific cross-scene anchors to preserve",
      "lockedElements": "Elements that must not change",
      "variableElements": "Elements allowed to change"
    }
  ]
}

Requirements:
- ${countInstruction}
- ${modeInstruction}
- Match the creativeCategory and format. Do not assume this is a commercial unless the category says Commercial.
- Use visualReferenceSummary and visualReferences as ordered moodboard guidance for visual tone, materials, styling, lighting, composition, and atmosphere. Respect each reference purpose, influence targets, and primary marker. Do not invent image content beyond the provided names, categories, influence metadata, and notes.
- Use the continuityBible as binding project-level continuity guidance.
- For locked continuity fields, preserve identity, wardrobe, product, location, and style unless the project context explicitly says otherwise.
- For insert-scene mode, use surrounding scenes to create a practical bridge that fits before/after the neighboring scenes.
- Every scene must include id, label, title, shotType, duration, objective, camera, lighting, continuity, transitionIn, transitionOut, continuityAnchors, lockedElements, variableElements.
- Keep the response practical for AI video generation.
`;

  const parsed = await callGeminiJson({
    apiKey,
    model,
    prompt,
    schema: buildScenePlanSchema(minItems),
    context: "Gemini scene plan generation",
  });

  const scenes = normalizeScenes(parsed?.scenes);

  if (scenes.length < minItems) {
    throw new Error("Gemini scene plan response did not include enough scenes.");
  }

  logAiDebug("[Director AI] Gemini scene plan generation succeeded");

  return { scenes };
}

export async function generateGeminiOutputs(input, apiKey, model) {
  logAiDebug("[Director AI] Gemini output generation started");

  const context = buildGenerationContext(input, {
    influenceTarget: "outputs",
  });
  const providerInstructions = getProviderInstructions(context.platform);
  const outputToneProfile = getOutputToneProfile(context.outputTone);

  const prompt = `
You are Director AI, an AI video pre-production planner.
Return JSON only. Do not include markdown, prose, or code fences.

Generate structured production outputs from this project and scene plan:
${JSON.stringify(context, null, 2)}

Return exactly this JSON shape:
{
  "storyboard": [],
  "shotList": [],
  "promptPack": [
    {
      "scene": "Scene 1",
      "prompt": "Provider-shaped video prompt",
      "continuity": "Scene continuity guidance",
      "cameraMotion": "Camera and motion guidance",
      "visualFocus": "Subject, composition, lighting, and atmosphere guidance",
      "optionalNotes": "Useful provider-specific notes"
    }
  ],
  "globalContinuityPrompt": "Sequence-wide continuity prompt"
}

Requirements:
- storyboard must be an array of objects describing visual beats.
- shotList must be an array of objects describing production shots.
- promptPack must be an array of objects. Every promptPack object must include scene, prompt, continuity, cameraMotion, visualFocus, and optionalNotes.
- globalContinuityPrompt should summarize sequence-wide identity, product, location, style, lighting, transition, and visual-reference continuity.
- Output variation: ${outputToneProfile.label}. ${outputToneProfile.instruction}
- Only the output tone should vary. Preserve the same project, scenes, continuity bible, platform, and visual-reference grounding.
- Include continuityBible guidance, scene transition fields, continuity anchors, locked elements, and variable elements in the outputs where useful.
- Carry through useful visual reference names, purposes, influence targets, primary marker, and notes when they clarify prompt style or continuity.
- Use the provided scenes. Do not invent unrelated scenes.
${providerInstructions}
`;

  const parsed = await callGeminiJson({
    apiKey,
    model,
    prompt,
    schema: buildOutputsSchema(),
    context: "Gemini output generation",
  });

  const outputs = normalizeAiOutputs(parsed);

  if (
    !outputs ||
    (outputs.storyboard.length === 0 &&
      outputs.shotList.length === 0 &&
      outputs.promptPack.length === 0)
  ) {
    throw new Error("Gemini output response did not include usable arrays.");
  }

  logAiDebug("[Director AI] Gemini output generation succeeded");

  return outputs;
}

export async function generateGeminiContinuityBible(input, apiKey, model) {
  logAiDebug("[Director AI] Gemini continuity bible generation started");

  const context = buildGenerationContext(input, {
    influenceTarget: "continuity",
  });
  const isEnhance = context.generationMode === "enhance";
  const prompt = `
You are Director AI, an AI video pre-production planner.
Return JSON only. Do not include markdown, prose, or code fences.

Generate a project-level continuity bible from this project context:
${JSON.stringify(context, null, 2)}

Return exactly this JSON shape:
{
  "mainCharacter": "Specific character or subject identity rules",
  "wardrobe": "Wardrobe and styling consistency rules",
  "productDescription": "Hero product or object description",
  "productDetails": "Product details that must remain stable",
  "environment": "Location and set continuity rules",
  "timeOfDay": "Time of day or temporal continuity rule",
  "lightingRule": "Lighting continuity rule",
  "cameraRule": "Camera and lens language continuity rule",
  "colorPalette": "Color palette continuity rule",
  "forbiddenChanges": "Specific changes to avoid",
  "lockCharacter": true,
  "lockWardrobe": true,
  "lockProduct": true,
  "lockLocation": true,
  "lockStyle": true
}

Requirements:
- Use strict structured JSON that matches the schema.
- Make each text field concrete, production-ready, and useful for consistent AI video scenes.
- Base the rules on projectTitle, format, duration, platform, aspectRatio, mode, creativeBrief, visualStyle, subjects, references, visualReferenceSummary, and visualReferences.
- Use visual references only as moodboard metadata: filename/name, purpose, influence targets, primary marker, order, and note. Do not claim to see image details beyond that metadata.
${isEnhance ? "- Enhance mode: preserve already-filled continuityBible fields when they are clear and useful. Improve weak fields and fill missing fields." : "- Generate mode: create a full continuity bible from the current brief fields."}
- Lock booleans should be true when that category should remain consistent across scenes.
- Do not include freeform prose outside the JSON object.
`;

  const parsed = await callGeminiJson({
    apiKey,
    model,
    prompt,
    schema: buildContinuityBibleSchema(),
    context: "Gemini continuity bible generation",
  });

  const continuityBible = normalizeContinuityBible(parsed);

  if (
    !continuityBible.mainCharacter &&
    !continuityBible.productDescription &&
    !continuityBible.environment
  ) {
    throw new Error(
      "Gemini continuity bible response did not include usable content."
    );
  }

  logAiDebug("[Director AI] Gemini continuity bible generation succeeded");

  return continuityBible;
}

export async function generateScenePlan(input) {
  const generationContext = buildGenerationContext(input, {
    influenceTarget: "scenePlan",
  });
  const config = getAiConfig();
  const hasApiKey = Boolean(config.apiKey);

  logAiDebug("[Director AI] generateScenePlan config", {
    provider: config.provider,
    hasApiKey,
  });

  if (!config.apiKey || config.provider === "mock") {
    logAiDebug("[Director AI] generateScenePlan branch", {
      branch: "mock",
    });
    if (generationContext.generationMode === "insert-scene") {
      return { scenes: buildMockInsertedScene(generationContext) };
    }
    if (generationContext.generationMode === "refine-selected-scene") {
      return { scenes: buildMockRefinedSelectedScene(generationContext) };
    }
    if (
      generationContext.generationMode === "refine-sequence" ||
      generationContext.generationMode === "reorder-sequence"
    ) {
      return { scenes: buildMockRefinedSequence(generationContext) };
    }
    return {
      scenes: buildMockScenePlan(generationContext),
    };
  }

  if (config.provider === "gemini") {
    logAiDebug("[Director AI] generateScenePlan branch", {
      branch: "gemini",
    });
    return generateGeminiScenePlan(generationContext, config.apiKey, config.model);
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

export async function generateOutputs(input) {
  const generationContext = buildGenerationContext(input, {
    influenceTarget: "outputs",
  });
  const config = getAiConfig();
  const hasApiKey = Boolean(config.apiKey);

  logAiDebug("[Director AI] generateOutputs config", {
    provider: config.provider,
    hasApiKey,
  });

  if (!config.apiKey || config.provider === "mock") {
    logAiDebug("[Director AI] generateOutputs branch", {
      branch: "mock",
    });
    return buildMockOutputs(generationContext);
  }

  if (config.provider === "gemini") {
    logAiDebug("[Director AI] generateOutputs branch", {
      branch: "gemini",
    });
    return generateGeminiOutputs(generationContext, config.apiKey, config.model);
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

export async function generateContinuityBible(input) {
  const generationContext = buildGenerationContext(input, {
    influenceTarget: "continuity",
  });
  const config = getAiConfig();
  const hasApiKey = Boolean(config.apiKey);

  logAiDebug("[Director AI] generateContinuityBible config", {
    provider: config.provider,
    hasApiKey,
  });

  if (!config.apiKey || config.provider === "mock") {
    logAiDebug("[Director AI] generateContinuityBible branch", {
      branch: "mock",
    });
    return buildMockContinuityBible(generationContext);
  }

  if (config.provider === "gemini") {
    logAiDebug("[Director AI] generateContinuityBible branch", {
      branch: "gemini",
    });
    return generateGeminiContinuityBible(
      generationContext,
      config.apiKey,
      config.model
    );
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

export function normalizeAiScenes(scenes) {
  return normalizeScenes(scenes);
}

export function normalizeAiOutputs(outputs) {
  if (!outputs || typeof outputs !== "object") return null;

  return {
    storyboard: Array.isArray(outputs.storyboard) ? outputs.storyboard : [],
    shotList: Array.isArray(outputs.shotList) ? outputs.shotList : [],
    promptPack: Array.isArray(outputs.promptPack) ? outputs.promptPack : [],
    globalContinuityPrompt: textOrFallback(outputs.globalContinuityPrompt, ""),
  };
}
