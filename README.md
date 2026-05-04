# Director AI

Director AI is a portfolio prototype for guided AI video pre-production. It helps a creator move from a rough idea to a structured brief, consistency rules, an editable scene sequence, and generation-ready outputs such as storyboards, shot lists, and prompt packs.

The project is designed as a premium workflow prototype rather than a production SaaS product. It prioritizes product thinking, guided UX, local-first project state, and safe AI prompt/payload handling.

## What It Does

Director AI turns a video idea into a guided planning workflow:

1. **Define Brief** - set the creative goal, format, platform, duration, visual style, subject, scene count, and visual references.
2. **Lock Continuity** - choose the details that should stay consistent across scenes.
3. **Review Scene Sequence** - generate and refine a first-pass scene plan, including selected-scene edits and AI-assisted refinements.
4. **Create Outputs** - generate storyboard beats, shot lists, and provider-shaped prompt packs.

The app keeps advanced controls available without making the first-time flow feel like a dense dashboard.

## Key Features

- Guided focus mode with progressive reveal between brief, continuity, and scene review.
- Local-first named projects, autosave, snapshots, restore, duplicate, and delete flows.
- Visual references / moodboard uploads with notes, purpose tags, influence targets, and primary reference support.
- Scene-count control and creative category / format presets.
- AI-assisted continuity generation, scene-plan generation, sequence refinement, selected-scene refinement, bridge-scene generation, and output generation.
- Provider-aware prompt shaping for Veo, Runway, Kling, Seedance, and Mixed Workflow.
- Output compare mode with preferred variant selection.
- Export support for copy, `.txt`, and `.md`.
- Sanitized AI generation context so image `dataUrl` / base64 preview data is not sent to generation routes.
- Stale-request protection so older async AI responses cannot overwrite newer state.

## Tech Stack

- **Framework:** Next.js App Router
- **UI:** React, Tailwind CSS, lucide-react
- **State:** React hooks with focused planner modules
- **Persistence:** LocalStorage for projects, drafts, snapshots, and visual-reference metadata
- **AI provider:** Mock mode by default, optional Gemini-compatible server-side generation

## Local Development

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

The app works without an API key in mock mode, which is the safest mode for portfolio demos.

```bash
DIRECTOR_AI_PROVIDER=mock
DIRECTOR_AI_API_KEY=
DIRECTOR_AI_GEMINI_MODEL=gemini-2.5-flash
DIRECTOR_AI_DEBUG=false
```

Optional live AI mode:

```bash
DIRECTOR_AI_PROVIDER=gemini
DIRECTOR_AI_API_KEY=your_server_side_key
DIRECTOR_AI_GEMINI_MODEL=gemini-2.5-flash
```

Important notes:

- Keep `DIRECTOR_AI_API_KEY` server-side only.
- Do not rename it to `NEXT_PUBLIC_*`.
- `.env.local` is ignored by git.
- `DIRECTOR_AI_DEBUG=true` enables server-side provider/debug logs.

## Build And Quality Checks

```bash
npm run lint
npm run build
```

Both commands should pass before sharing or deploying the project.

## Deployment Notes

This project is ready for a typical Next.js deployment such as Vercel.

Recommended portfolio deployment settings:

- Use `DIRECTOR_AI_PROVIDER=mock` for a predictable, no-cost public demo.
- Use `DIRECTOR_AI_PROVIDER=gemini` only for controlled demos where you are comfortable with API usage.
- Set all environment variables in the deployment platform dashboard.
- Do not commit `.env.local`.

## Prototype Limitations

This is intentionally scoped as a portfolio prototype:

- Projects, snapshots, and uploaded reference previews are stored locally in the browser.
- Large image uploads can hit browser LocalStorage quota. Use a small number of compressed references for demos.
- Visual references are used as metadata and notes in prompts; the MVP does not perform full multimodal image analysis.
- There is no authentication, team collaboration, billing, scheduling, or production-management system.
- Mock mode produces deterministic demo-friendly output, not live model creativity.

## Repository Notes

The main page stays thin at `app/page.js`. Most product code lives under:

- `src/components/project-planner` for UI components
- `src/hooks` and `src/hooks/planner` for planner state, persistence, scene actions, output helpers, and generation actions
- `src/lib` for AI prompt helpers, generation context sanitization, provider shaping, and export utilities
- `app/api` for server-side generation routes

## Portfolio Framing

Director AI demonstrates:

- product UX for complex AI workflows
- progressive disclosure and guided workflow design
- local-first project state and snapshot safety
- API route design for AI generation
- prompt/payload sanitization
- provider-aware output shaping
- practical React/Next.js architecture refactoring
