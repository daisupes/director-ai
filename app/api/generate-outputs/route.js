import { NextResponse } from "next/server";

import { generateOutputs, normalizeAiOutputs } from "@/lib/ai";

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

    if (!Array.isArray(body.scenes) || body.scenes.length === 0) {
      return NextResponse.json(
        { error: "At least one scene is required." },
        { status: 400 }
      );
    }

    const outputs = normalizeAiOutputs(await generateOutputs(body));

    if (
      !outputs ||
      (outputs.storyboard.length === 0 &&
        outputs.shotList.length === 0 &&
        outputs.promptPack.length === 0)
    ) {
      return NextResponse.json(
        { error: "Output response did not include usable content." },
        { status: 502 }
      );
    }

    return NextResponse.json(outputs);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate outputs." },
      { status: 500 }
    );
  }
}
