export const STORAGE_KEY = "director-ai-page-state-v3";
export const PROJECT_LIBRARY_KEY = "director-ai-project-library-v1";

export const creativeCategoryOptions = [
  "Commercial",
  "Narrative",
  "Editorial / Fashion",
  "Music / Performance",
  "Experimental",
];

export const formatOptionsByCategory = {
  Commercial: ["Spec Ad", "Product Film", "Social Ad", "Brand Film", "Trailer / Teaser"],
  Narrative: ["Short Film", "Narrative Scene", "Trailer / Teaser", "Proof of Concept"],
  "Editorial / Fashion": ["Fashion Film", "Editorial Film", "Lookbook", "Brand Film"],
  "Music / Performance": ["Music Video", "Performance Film", "Live Session", "Trailer / Teaser"],
  Experimental: ["Experimental Film", "Visual Poem", "Concept Film", "Installation Loop"],
};

export const formatOptions = formatOptionsByCategory.Commercial;
export const durationOptions = ["15 sec", "30 sec", "45 sec", "60 sec"];
export const platformOptions = ["Veo", "Runway", "Kling", "Seedance", "Mixed Workflow"];
export const aspectRatioOptions = ["16:9", "9:16", "1:1", "4:5"];
export const modeOptions = ["Storyboard", "Shot List", "Prompt Build", "Hybrid"];
export const outputTabs = ["Storyboard", "Shot List", "Prompt Pack"];
export const outputCompareTones = [
  {
    id: "standard",
    label: "Standard",
    description: "Balanced and production-ready.",
  },
  {
    id: "cinematic",
    label: "More cinematic",
    description: "Richer film language and atmosphere.",
  },
  {
    id: "concise",
    label: "More concise",
    description: "Tighter, more direct output phrasing.",
  },
];
export const visualReferenceCategories = [
  "Character",
  "Wardrobe",
  "Product",
  "Location",
  "Lighting",
  "Composition",
  "Mood",
];
export const visualReferenceInfluenceTargets = [
  { id: "continuity", label: "Consistency Rules" },
  { id: "scenePlan", label: "Scene Sequence" },
  { id: "outputs", label: "Outputs" },
];

export const sceneCountPresets = [
  { value: "3", label: "3 scenes", helper: "concise" },
  { value: "5", label: "5 scenes", helper: "balanced" },
  { value: "8", label: "8 scenes", helper: "richer narrative" },
  { value: "12", label: "12 scenes", helper: "short film / complex" },
  { value: "custom", label: "Custom", helper: "set your own" },
];

export const defaultContinuityBible = {
  mainCharacter: "Creative director with calm, precise presence",
  wardrobe: "Black tailored jacket, minimal styling, consistent silhouette",
  productDescription: "Director AI planning workspace shown as a premium creative tool",
  productDetails: "Glassmorphic interface, organized scene cards, AI planning controls",
  environment: "Moody cinematic studio with practical screens and subtle atmosphere",
  timeOfDay: "Night interior",
  lightingRule: "Soft key, clean edge light, controlled contrast, no harsh color shifts",
  cameraRule: "Measured cinematic moves with stable screen direction and premium lens language",
  colorPalette: "Black, white, violet accents, cyan highlights, neutral skin tones",
  lockCharacter: true,
  lockWardrobe: true,
  lockProduct: true,
  lockLocation: true,
  lockStyle: true,
  forbiddenChanges:
    "Do not change the main character identity, wardrobe silhouette, product UI style, location, or palette between scenes.",
};

export const flowSteps = [
  {
    id: "brief",
    step: "01",
    label: "Define Brief",
    description:
      "Set the creative direction, format, platform, and references.",
  },
  {
    id: "scenes",
    step: "02",
    label: "Review Scene Sequence",
    description:
      "AI proposes a first-pass scene structure from your brief. Review, edit, add, or refine it.",
  },
  {
    id: "outputs",
    step: "03",
    label: "Create Outputs",
    description:
      "Turn the approved scene sequence into storyboard, shot list, and prompt-ready outputs.",
  },
];

export const initialScenes = [
  {
    id: 1,
    label: "Scene 1",
    title: "Opening Hook",
    shotType: "Wide Establishing",
    duration: "0–5 sec",
    objective: "Set the tone with the strongest first visual.",
    camera: "Controlled cinematic framing with deliberate motion.",
    lighting: "High-contrast premium lighting with subtle atmosphere.",
    continuity: "Keep subject styling, lens language, and palette consistent.",
    transitionIn: "Start from black into the first hero frame.",
    transitionOut: "Match cut into the subject introduction.",
    continuityAnchors: "Wardrobe, studio atmosphere, violet/cyan UI glow.",
    lockedElements: "Main subject, wardrobe, product interface, palette.",
    variableElements: "Framing scale, screen content, subject pose.",
  },
  {
    id: 2,
    label: "Scene 2",
    title: "Hero Product / Subject",
    shotType: "Medium Hero",
    duration: "5–10 sec",
    objective: "Introduce the central subject with clear framing.",
    camera: "Measured push-in with strong subject focus.",
    lighting: "Soft edge light with crisp subject separation.",
    continuity: "Maintain costume, environment, and lens logic.",
    transitionIn: "Continue motion direction from the opening hook.",
    transitionOut: "Cut on subject gesture into product detail.",
    continuityAnchors: "Same subject, same jacket, same studio lighting logic.",
    lockedElements: "Character identity, wardrobe, location, style.",
    variableElements: "Gesture, focal length, background screen emphasis.",
  },
  {
    id: 3,
    label: "Scene 3",
    title: "Detail / Texture Moment",
    shotType: "Close-Up",
    duration: "10–15 sec",
    objective: "Show tactile detail, material, or premium cues.",
    camera: "Macro-style close-up with restrained movement.",
    lighting: "Specular highlights and controlled contrast.",
    continuity: "Preserve material tone, hand continuity, and props.",
    transitionIn: "Cut from subject gesture to tactile interface detail.",
    transitionOut: "Pull focus toward the closing composition.",
    continuityAnchors: "UI materials, color palette, practical screen glow.",
    lockedElements: "Product visual language, lighting temperature, palette.",
    variableElements: "Detail angle, interface module, reflection shape.",
  },
  {
    id: 4,
    label: "Scene 4",
    title: "Closing Payoff",
    shotType: "Final Hero",
    duration: "15–20 sec",
    objective: "End on the strongest branded closing image.",
    camera: "Locked or slow drift for a confident final frame.",
    lighting: "Polished hero lighting with clean focal emphasis.",
    continuity: "Ensure final frame matches earlier world-building.",
    transitionIn: "Resolve from detail into a composed final hero view.",
    transitionOut: "Hold for end card or final prompt output.",
    continuityAnchors: "Character, product UI, studio location, premium contrast.",
    lockedElements: "Character, wardrobe, product, location, style.",
    variableElements: "Final pose, framing, end-card emphasis.",
  },
];

export const defaultState = {
  activeStep: "brief",
  projectTitle: "Director AI",
  creativeCategory: "Commercial",
  format: "Spec Ad",
  sceneCountPreset: "5",
  customSceneCount: "6",
  duration: "30 sec",
  platform: "Veo",
  aspectRatio: "16:9",
  mode: "Storyboard",
  creativeBrief:
    "A sleek AI video pre-production planner for creatives developing cinematic branded content.",
  visualStyle: "cinematic, premium, atmospheric, futuristic",
  subjects: "Creative director, model, camera operator",
  references:
    "Luxury ad pacing, moody studio atmosphere, premium product cinematography",
  visualReferences: [],
  continuityBible: defaultContinuityBible,
  scenes: initialScenes,
  selectedSceneId: 1,
  activeOutputTab: "Storyboard",
  sceneSearch: "",
};

export const starterTemplates = [
  {
    id: "blank",
    title: "Blank Project",
    description: "Start clean with the current guided workflow.",
    state: {},
  },
  {
    id: "luxury-commercial",
    title: "Luxury Commercial",
    description: "Premium brand mood, controlled pacing, polished product presence.",
    state: {
      projectTitle: "Luxury Commercial",
      creativeCategory: "Commercial",
      format: "Spec Ad",
      sceneCountPreset: "5",
      creativeBrief:
        "A refined luxury commercial built around atmosphere, restraint, tactile product detail, and a memorable final hero frame.",
      visualStyle: "cinematic, premium, elegant, controlled contrast",
      subjects: "Hero product, refined talent, minimal set details",
      references:
        "Luxury fragrance pacing, high-end watch macro detail, quiet studio atmosphere",
      continuityBible: {
        mainCharacter:
          "Refined talent with calm, composed movement and consistent presence.",
        wardrobe:
          "Tailored monochrome wardrobe with premium texture and no silhouette changes.",
        productDescription:
          "Hero luxury product with stable proportions, materials, labels, and finish.",
        productDetails:
          "Macro-friendly surfaces, polished edges, consistent reflections, no design drift.",
        environment:
          "Minimal cinematic studio with controlled practical highlights and premium negative space.",
        timeOfDay: "Night interior",
        lightingRule:
          "Soft sculpted key, elegant edge light, controlled specular highlights.",
        cameraRule:
          "Measured dolly, macro detail, stable screen direction, premium lens language.",
        colorPalette: "Black, ivory, soft metallics, subtle violet or cyan accent.",
      },
    },
  },
  {
    id: "product-launch-ad",
    title: "Product Launch Ad",
    description: "A clear reveal arc for a new app, device, or physical product.",
    state: {
      projectTitle: "Product Launch Ad",
      creativeCategory: "Commercial",
      format: "Product Film",
      sceneCountPreset: "5",
      creativeBrief:
        "A concise product launch film that introduces the problem, reveals the product, proves value through detail, and closes on a confident hero moment.",
      visualStyle: "clean, modern, kinetic, premium tech",
      subjects: "Hero product, user hands, product UI, launch environment",
      references:
        "Tech launch films, clean UI reveals, precise macro product detail",
      continuityBible: {
        productDescription:
          "Hero launch product with consistent form, interface, material, and scale.",
        productDetails:
          "Keep screen UI, buttons, ports, labels, and finish consistent across scenes.",
        environment:
          "Modern launch setting with clean surfaces, practical screens, and controlled reflections.",
        lightingRule: "Bright motivated highlights with crisp edge separation.",
        cameraRule: "Confident reveals, macro detail, and clean match cuts.",
      },
    },
  },
  {
    id: "fashion-film",
    title: "Fashion Film",
    description: "Editorial movement, wardrobe continuity, and atmospheric style.",
    state: {
      projectTitle: "Fashion Film",
      creativeCategory: "Editorial / Fashion",
      format: "Fashion Film",
      sceneCountPreset: "8",
      creativeBrief:
        "An editorial fashion film following a model through a stylized environment, emphasizing silhouette, fabric movement, mood, and visual rhythm.",
      visualStyle: "editorial, atmospheric, tactile, high-fashion",
      subjects: "Model, hero wardrobe, architectural location, fabric detail",
      references:
        "Runway campaign films, editorial magazine motion, moody architectural locations",
      continuityBible: {
        mainCharacter:
          "Model identity, hair, makeup, posture, and performance energy remain consistent.",
        wardrobe:
          "Hero look stays consistent, with fabric movement and detail emphasized.",
        environment:
          "Stylized editorial location with coherent architecture and no unexplained location jump.",
        lightingRule:
          "Soft directional fashion lighting with controlled shadows and skin tone continuity.",
        cameraRule:
          "Elegant tracking, portrait framing, and rhythmic close-ups.",
      },
    },
  },
  {
    id: "short-narrative",
    title: "Short Narrative Scene",
    description: "Character intent, emotional turn, and clean visual continuity.",
    state: {
      projectTitle: "Short Narrative Scene",
      creativeCategory: "Narrative",
      format: "Narrative Scene",
      sceneCountPreset: "8",
      creativeBrief:
        "A short narrative scene centered on a character making a quiet decision, moving from tension to emotional clarity through visual beats.",
      visualStyle: "cinematic, naturalistic, intimate, restrained",
      subjects: "Lead character, meaningful object, interior location",
      references:
        "Indie short film pacing, close character work, restrained visual storytelling",
      continuityBible: {
        mainCharacter:
          "Lead character identity, emotional state, eyeline, and blocking logic remain coherent.",
        wardrobe: "Simple wardrobe with no unexplained changes during the scene.",
        environment:
          "Single coherent interior location with stable geography and prop placement.",
        lightingRule:
          "Naturalistic motivated light with consistent direction and exposure.",
        cameraRule:
          "Character-first framing, eyeline continuity, and purposeful shot progression.",
      },
    },
  },
  {
    id: "music-video",
    title: "Music Video Concept",
    description: "Performance, rhythm, visual motifs, and repeatable anchors.",
    state: {
      projectTitle: "Music Video Concept",
      creativeCategory: "Music / Performance",
      format: "Music Video",
      sceneCountPreset: "12",
      creativeBrief:
        "A music video concept built around a central performance, repeated visual motif, atmospheric inserts, and escalating rhythm.",
      visualStyle: "stylized, rhythmic, cinematic, expressive",
      subjects: "Performer, performance space, visual motif, atmospheric inserts",
      references:
        "Performance music videos, surreal insert shots, rhythmic match cuts",
      continuityBible: {
        mainCharacter:
          "Performer identity, styling, and performance energy stay consistent.",
        wardrobe:
          "Hero performance outfit remains stable across performance scenes.",
        environment:
          "Performance space and insert world share a coherent palette and visual logic.",
        lightingRule:
          "Motivated performance lighting with repeatable color accents and no random hue drift.",
        cameraRule:
          "Rhythmic camera moves, repeatable motif framing, and performance coverage.",
      },
    },
  },
  {
    id: "documentary-sequence",
    title: "Documentary Sequence",
    description: "A grounded sequence with subject, place, texture, and context.",
    state: {
      projectTitle: "Documentary Sequence",
      creativeCategory: "Narrative",
      format: "Short Film",
      sceneCountPreset: "8",
      creativeBrief:
        "A documentary-style sequence introducing a real subject, their environment, process details, and a grounded emotional takeaway.",
      visualStyle: "observational, textured, grounded, cinematic documentary",
      subjects: "Documentary subject, real workspace, process details, environment",
      references:
        "Observational documentary scenes, process films, intimate interview texture",
      continuityBible: {
        mainCharacter:
          "Documentary subject identity, wardrobe, and working behavior remain authentic and stable.",
        wardrobe: "Realistic wardrobe with no continuity-breaking changes.",
        environment:
          "Real location geography, tools, and process materials remain consistent.",
        lightingRule:
          "Natural motivated light with documentary texture and stable exposure.",
        cameraRule:
          "Handheld or lightly supported observational coverage with coherent geography.",
      },
    },
  },
];
