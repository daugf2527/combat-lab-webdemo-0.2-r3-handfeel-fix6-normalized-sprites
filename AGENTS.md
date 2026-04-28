# Repository Guidelines

## Project Structure & Module Organization

This is a Phaser 3 + TypeScript combat sandbox served by Vite. Core source lives in `src/`: `src/main.ts` boots the browser app, `src/game/` owns Phaser scenes and rendering adapters, `src/combat/` contains the combat kernel and systems, and `src/data/` stores action, actor, AI, and tuning data. Browser/runtime shims are in `src/vendor/` and `src/runtime/`.

Static behavior tests are under `tests/static/`; runtime JavaScript checks are under `tests/static-js/`. Public art and JSON metadata live in `public/assets/`, with normalized sprite outputs in `public/assets/sprites/normalized/`. Build and verification artifacts are written to `dist/`, `.tmp/`, and `verification/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies. Node `>=20` is required.
- `npm run dev`: start Vite on `0.0.0.0:5173`.
- `npm run typecheck`: run TypeScript checks through `scripts/typecheck.mjs`.
- `npm run build`: compile TypeScript and emit `dist/index.html` plus browser ESM assets.
- `npm run static:test`: compile and run `tests/static/*.test.ts`.
- `docker compose up --build`: run the app container on port `5173`.

## Coding Style & Naming Conventions

Use TypeScript ES modules with explicit `.js` import specifiers for local compiled imports. Keep two-space indentation in JSON; follow the existing compact TypeScript style when editing nearby code. Class and scene files use PascalCase, for example `CombatKernel.ts` and `BootScene.ts`. Data modules use domain-qualified lowercase names such as `berserker.normal.ts`. Keep runtime assets and metadata names stable because tests and loaders reference them by path.

## Testing Guidelines

Place behavior assertions in `tests/static/` with the `*.test.ts` suffix and use `tests/static/test-utils.ts` for `node:assert/strict`. Prefer deterministic kernel-level checks over visual-only assertions. For rendering or handfeel changes, run `npm run typecheck`, `npm run static:test`, and `npm run build`; browser screenshot verification is not a required npm path in this repository.

## Performance Triage

This is currently a demo-grade project, so some startup and first-entry spikes are acceptable while gameplay and handfeel are still being shaped. Do not treat every DevTools hotspot as a release blocker.

Must fix immediately:

- Runtime FPS keeps dropping during active combat.
- Heap or replay/event memory grows continuously over time.
- Input latency worsens after the game has been running for a while.
- A profiling stack shows repeated per-frame cloning, allocation, texture creation, or unbounded archive growth.

Can be logged as backlog for now:

- First load `Image decode`, WebGL `texImage2D`, shader/program initialization, or texture upload spikes.
- Initial scene construction spikes from creating Phaser `Text`, `Graphics`, or actor views.
- Large normalized spritesheet decode/upload cost, unless it blocks basic demo usability.

Known context:

- `c4d3b22` fixed a runtime replay history blowup where each replay frame deep-cloned the full event archive. Future replay changes must preserve the rule that a replay frame stores only that frame's newly flushed events.
- The normalized sprite sheets are fixed-cell demo assets and contain large transparent regions. Trimmed atlas/multiatlas plus anchor metadata is the higher-quality future asset pipeline, but it is not required before normal demo iteration.
- For runtime optimization, prefer small dirty-check changes first: avoid repeated `setTexture`, `setText`, `setSize`, and `setColor` when values have not changed; lower debug/HUD text update frequency; keep debug-only text work behind visibility checks.

## Commit & Pull Request Guidelines

This repository now has local Git history. Use concise imperative commit subjects, for example `Fix normalized sprite frame clamp`. PRs should include the change scope, commands run, verification artifacts touched, and screenshots or replay/report JSON when visual behavior changes.

## Agent-Specific Instructions

Before claiming completion, run the relevant verification command and summarize the observed result. Do not edit generated outputs in `dist/`, `.tmp/`, or `verification/` unless the task explicitly concerns verification artifacts.
