import { NextResponse } from "next/server";

import { generateContinuityBible, normalizeContinuityBible } from "@/lib/ai";

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

    const continuityBible = normalizeContinuityBible(
      await generateContinuityBible(body)
    );

    if (
      !continuityBible.mainCharacter &&
      !continuityBible.productDescription &&
      !continuityBible.environment
    ) {
      return NextResponse.json(
        { error: "Continuity response did not include usable content." },
        { status: 502 }
      );
    }

    return NextResponse.json({ continuityBible });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate a continuity bible." },
      { status: 500 }
    );
  }
}
