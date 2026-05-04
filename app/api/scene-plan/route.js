import { NextResponse } from "next/server";

import { generateScenePlan, normalizeAiScenes } from "@/lib/ai";
import { normalizeRequestedSceneCount } from "@/lib/project-planner";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Valid JSON request body is required." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body is required." },
        { status: 400 }
      );
    }

    const result = await generateScenePlan(body);
    const normalizedScenes = normalizeAiScenes(result.scenes);
    const isInsert = body.generationMode === "insert-scene";
    const isSingleScene = isInsert || body.generationMode === "refine-selected-scene";
    const requestedSceneCount = normalizeRequestedSceneCount(body.sceneCount);
    const scenes = isSingleScene
      ? normalizedScenes.slice(0, 1)
      : normalizedScenes.slice(0, requestedSceneCount);

    if (scenes.length < (isSingleScene ? 1 : requestedSceneCount)) {
      return NextResponse.json(
        { error: "Scene plan response did not include enough scenes." },
        { status: 502 }
      );
    }

    return NextResponse.json({ scenes });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate a scene plan." },
      { status: 500 }
    );
  }
}
