# CLAUDE.md

## Project identity

**Carbon Shade / 碳影** — Phaser 3 + TypeScript 2.5D combat prototype (Vite). Engineering name: **Combat Lab**. Validates DNF-style combat feel: skill execution, monster feedback, boss behavior, normalized sprites, deterministic tests.

## Current state (2026-05-15)

**Phase**: Combat Lab 0.3 — handfeel tuning + evidence freeze.
**Target version**: `70-85-classic-pre-metastasis` (Level 70 cap, 2012 pre-Metastasis). Modern DNF systems excluded.

**Target version**: `70-85-classic-pre-metastasis` — Level 70 cap (2012, pre-Metastasis/大转移) is preferred; 80-85 data used as fallback. Modern DNF systems (Neutralize/Ignite/restructured AI) are explicitly excluded.

**Combat kernel — Input → Hit → Reaction → Replay chain**

| Module | File | Status |
|--------|------|--------|
| Frame data | `FrameDataAction.ts` + `actions/default.json` | 38 actions, manifest priority loading, hash parity gate |
| Hit detection | `HitResolver2D5.ts` | 4 shapes (rect/circle/sweep/grab_attach), multi-hurtbox, 6-int snapshot → replay |
| Damage formula | `DamageFormula.ts` + `classic-profile.json` | 10-multiplier chain: 4 damage paths, elem ÷220, def reduction, crit 1.5×, counter 1.25× |
| Status system | `StatusEffectSystem.ts` + `status/default.json` | 14 status types, hard control mutex, tolerance accumulation/decay, splash |
| Monster AI | `EnemyAI.ts` + `ai/enemy-default.json` | FSM 9-state (idle/approach/windup/attacking/recover + flinched/launched/knocked_down/getting_up) + behavior tree + boss phase transitions, deterministic hash for replay |
| Replay | `ReplayRecorder.ts` | action/status/AI manifest hash in metadata |
| Actor stats | `types.ts` | STR/INT/physAtk/magAtk/independentAtk/elem/elemResist/defense/level |

**Data layer — versioned manifests**

```
src/data/manifest/
├── actions/default.json      ← 38 actions (sourceProvenance metadata attached)
├── damage/classic-profile.json ← formula constants (8/8 community-audit verified)
├── status/default.json       ← 14 status profiles (Rupture fixed: 3-stack 5/7/8% per Batch B)
├── status/pve-profile.json   ← PvE-specific status tuning
├── ai/enemy-default.json     ← 5 enemy types + DNF AI params + CRT-004 hit-reaction timers
├── ai/boss-patterns.json     ← boss phase/pattern config
├── schema.ts / hash.ts / loader.ts ← validation + sourceProvenance, FNV-1a hashing (strips metadata), async loading
```

**Evidence source layers**

| Layer | Coverage | Status |
|-------|----------|--------|
| Neople Open API | 11 skills level-1 facts (CD/MP/hit count) | `berserkerSkillFacts.ts`, `official-api-alignment.test.ts` |
| Wiki (DFO World Wiki + NamuWiki) | Damage formula multipliers, status effect durations, boss move lists | Documented in research but not wired to runtime |
| PVF/ANI/NPK | Frame windows, hitbox geometry, monster AI data, monster stats | Not yet researched (Batch C pending) |

**CRT tickets**: CRT-001 (version freeze) resolved; CRT-002–006 remain open for frame/hitbox/AI/armor/replay evidence.

**Verification gates (all passing)**

```
npm run typecheck   → passed
npm run static:test → 41/41 passed
npm run build       → passed
```

**Phase A-D completed (2026-05-12)**: See `docs/planning/pvf-extraction-a-e-summary.md` for full status. Key outcomes:

- **EUC-KR / stringtable** (Phase A): `PvfScriptParser.parseStringTable` rewritten with dual-offset mode, iconv-lite decoding. 230K+ entries decoded from stringtable.bin, 26K+ with Korean text.
- **.ani format** (Phase B): `AniAnalyzer` now version-aware (v1-v15), frame indices and hitbox coordinates extracted. 209K .ani files indexed.
- **Cancel window data** (Gap #5 resolved): `cancel*.skl` section IDs (371543=cancelWindowStart, 241483=cancelWindowDuration, 371546=cancelGroup, 371547=cancelWeaponMask, 371549=cancelTargetSlots) decoded in `SklAnalyzer.ts`.
- **Physics constants** (Gap #4 partially): `src/data/official/dnfPhysicsConstants.ts` created with DEFAULT_GRAVITY_ACCEL=-1500, FORCE_TO_VELOCITY_CONST=4000, etc. from `dnf_enum_header.nut`.
- **Enums extracted** (Phase C): `dnf_enum_header.nut` collision/physics enums (ATTACKTYPE, CUSTOM_ATTACKINFO, ELEMENT) identified.
- **ActionName mapping** (Gap #6): 7 stale skillIds fixed in `berserkerSkillFacts.ts`. Full mapping table ready from Neople API _skill_list.json (55 Neo Berserker skills, 21+ matched).
- **Verification**: typecheck, static:test, build all passing. All extraction tests green.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server on `0.0.0.0:5173` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run static:test` | Compile + run `tests/static/*.test.ts` (Node, no framework) |
| `npm run build` | Production build → `dist/` |
| `npm run browser:smoke` | Playwright smoke test (needs dev server + display) |
| `docker compose up --build` | Container on port 5173 |

## Tools

### dnf-extract (C++ CLI)

Source: `tools/dnf-porting-src/` — builds via CMake + MinGW/GCC.
Binary: `tools/dnf-extract.exe` (Windows pre-built).
CI: `.github/workflows/build-dnf-extract.yml` builds Windows/Linux-x64/Linux-arm64.

**PVF modes** (Script.pvf extraction):
```bash
dnf-extract --pvf Script.pvf --file <internal-path>       # single file → JSON
dnf-extract --pvf Script.pvf --pipe                       # stdin paths, stdout JSON (fast)
dnf-extract --pvf Script.pvf --batch <p1> <p2> ...        # batch extraction
dnf-extract --pvf Script.pvf --workflow                   # stdin JSON commands
dnf-extract --pvf Script.pvf --list [--filter <pattern>]  # list PVF contents
```

**NPK modes** (sprite archive):
```bash
dnf-extract --npk <file.NPK> --list                      # list IMG files
dnf-extract --npk <file.NPK> --img <name> --frame <idx>  # extract single frame
dnf-extract --npk <file.NPK> --img <name> --frames       # all frames metadata (no pixels)
```

**Sprite resolve** (PVF → NPK cross-reference):
```bash
dnf-extract --pvf Script.pvf --npk-dir ImagePacks2/ --resolve <sprite-path> --frame <idx>
```
Resolve auto-tries known PVF↔NPK directory renames (e.g. `equipment/` → `atequipment/`).
On lookup failure: prints `{"type":"error","sprite":"…","error":"sprite not found in any NPK: …"}` and exits 1.

Options: `--with-data` (include base64 pixel data; default off — frame modes return metadata only), `--help`.

I/O contract:
- stdout — one JSON line per result. Top-level `type` field is one of: `animation` (.ani), `document` (.skl / .mob / .atk / .act), `text` (.str), `pvf_list` (--list), `npk` (--npk --list), `img` (--img --frames), `frame` (--frame), `resolved_frame` (--resolve), `error`.
- stderr — `[LOG]` / `[READY]` / `[DONE]` / `[ERROR]` progress lines. Never mixed into stdout.
- `--pipe` / `--workflow` / `--batch` emit `---` between results.

### generate-actions (Node CLI)

`node scripts/generate-actions.mjs --pvf <path> [--skl-filter <pattern>] [--list]`
Parses .skl + .ani from PVF → FrameDataAction JSON. Requires `npm run static:test` first (uses `.tmp/test-js/` compiled modules).

### extract-assets (Node CLI)

`node tools/extract-assets.mjs --pvf <path> [--npk-dir <dir>] [--output <dir>]`
High-level asset extraction pipeline using TypeScript extraction module.

## Architecture

```
src/combat/    — Pure TS combat kernel (no Phaser). Runs in Node for deterministic tests.
src/game/      — Phaser rendering layer (scenes, render adapter, camera, audio, touch).
src/data/      — Versioned JSON manifests (actions, damage, status, AI) + official data.
src/extraction/— DNF client data extraction (PVF/NPK/IMG/ANI/SKL parsers). Node-only.
src/runtime/   — Deterministic combat runtime for scenario verification.
src/vendor/    — Type shims for browser APIs in Node test env.
src/main.ts    — Phaser bootstrap (1920×1080, Scale.FIT).
```

## Coding conventions

- ES modules, `.js` extension in import specifiers (NodeNext resolution).
- PascalCase classes; lowercase domain-qualified data files.
- Two-space indent in JSON. Compact TypeScript style.
- Runtime assets in `public/assets/` referenced by string path.

## LSP tools — prefer over Grep/Read for code understanding

Two LSP plugins are active: `typescript-lsp` (TypeScript/TSX) and `pyright-lsp` (Python). Use LSP as the **first choice** for code exploration — it is faster and more precise than Grep/Read for these tasks:

| Scenario | Use | Instead of |
|----------|-----|------------|
| "Where is X defined?" | `goToDefinition` | Grep + Read |
| "What calls this function?" | `findReferences` | Grep |
| "What's this type/interface?" | `hover` | Read whole file |
| "What's in this file?" | `documentSymbol` | Read full file |
| "Who implements this interface?" | `findImplementations` | Grep |
| "Call chain of this method?" | `incomingCalls` / `outgoingCalls` | Manual trace |

**Key rule**: before editing a function, run `findReferences` to see all call sites. Before reading a new file, run `documentSymbol` for the symbol map — then only Read the parts you need.

## Analysis tools — automated codebase diagnostics

The project has a full static + dynamic analysis toolchain. Reports auto-generate in CI (every push/PR) and can be run locally via `npm run analyze`.

### Tool inventory

| Tool | Type | What it does | Run |
|------|------|-------------|-----|
| **dependency-cruiser** | Open-source | Module dependency graph, circular dep detection, change impact ("who depends on X?") | `depcruise --no-config --output-type json src` |
| **knip** | Open-source | Finds unused exports, types, files | `knip` |
| **event-trace.mjs** | Project | Pairs event emitters ↔ listeners by scanning `bus.emit/on` strings | `node tools/event-trace.mjs` |
| **pipeline-dump.mjs** | Project | Extracts pipeline stages, phases, and execution order from buildPipeline() | `node tools/pipeline-dump.mjs` |
| **manifest-consumers.mjs** | Project | Traces which TS files import/consume which JSON manifests | `node tools/manifest-consumers.mjs` |
| **tick-benchmark** | Built-in test | 600-tick throughput test (target: < 500µs/tick) | `npm run static:test` includes it |
| **fuzz-combat** | Built-in test | 50 random-sequence no-crash, 40 determinism check, 30 replay validity | `npm run static:test` includes it |
| **typecheck** | Built-in | `tsc --noEmit` | `npm run typecheck` |
| **static:test** | Built-in | 45 test files, compiled + run as Node processes | `npm run static:test` |
| **build** | Built-in | Vite production build | `npm run build` |
| **browser:smoke** | Built-in | Playwright browser test (CI only, not on Termux/Android) | `npm run browser:smoke` |

### When tools run

```
Local pre-push  →  npm run analyze  →  全工具报告 → verification/pre-push-{ts}.json
CI (push/PR)    →  GitHub Actions  →  全工具报告 → uploaded as artifact
Claude session  →  读已有报告，不重复跑。若 stale (>1 day) 或不存在 → npm run analyze
Debugging       →  LSP (goToDef/findRefs/documentSymbol) 优先, 再按需跑单项工具
```

### Quick reference: which tool answers which question

| Question | Tool |
|----------|------|
| "改 X.ts 会影响谁？" | `depcruise` → look for dependents of X |
| "有没有循环依赖？" | `depcruise` — violations section |
| "哪些导出没被用过？" | `knip` |
| "事件 X 谁 emit 谁监听？" | `node tools/event-trace.mjs --output json` |
| "管线各阶段执行顺序？" | `node tools/pipeline-dump.mjs --output json` |
| "JSON 配置谁在用？" | `node tools/manifest-consumers.mjs --output json` |
| "Ticking 够不够快？" | tick-benchmark (465µs/tick = 2151 ticks/s) |
| "改了代码会破坏确定性吗？" | fuzz-combat determinism check (40/40) |
| "内存/CPU 有问题？" | `node --prof` + `node --prof-process` |

## Performance boundaries

Prioritize fixes for: runtime FPS drops during active combat, heap/replay/event memory growth, input latency degradation, per-frame allocation/cloning/texture creation/unbounded archive growth.

Acceptable as backlog: first-load texture decode/upload spikes (image decode, texImage2D, shader init), initial scene-construction spikes from Phaser Text/Graphics, normalized spritesheet decode cost (unless it blocks basic usability).

## DNF/DFO reference truth rule

Priority: Neople Official API > DFO-specific wikis > local tuning baseline.
Never commit `NEOPLE_API_KEY`. Frames/hitboxes/gravity/AI are NOT covered by API — use PVF extraction data.

Open API and ordinary wiki pages do NOT cover: startup/active/recovery frames, hitbox/hurtbox geometry, launch/gravity curves, combo-protection thresholds, server authority, network sync. Wikipedia/general encyclopedias are background-only — never use them for combat numbers, frame data, hitboxes, damage formulas, skill scaling, AI behavior, or live balance values.

## Test infrastructure

Tests run via `scripts/static-test.mjs`: TS compiled with `tsconfig.test.json` → `.tmp/test-js/`, each `.test.js` executed as standalone Node child process. Assertions: `node:assert/strict` via `tests/static/test-utils.ts` (exports `ok`, `equal`, `deepEqual` only). No test framework.

## Documentation

`docs/` organized into: `design/`, `engineering/`, `changelog/`, `planning/`, `research/`. See `docs/README.md` for index.

## Git workflow

- Concise imperative commit subjects.
- Run verification before claiming completion.
- Don't edit generated outputs in `dist/`, `.tmp/`, `verification/`.

## Status reporting (statusline)

`.claude/status.json` 驱动 statusline 的 `task` / `conf` 字段。每个新 prompt 由 hook 重置为 `{"progress":"0/?","confidence":"评估中"}`。我应在任务过程中主动写入以反映真实状态：

- **开工后立即** — 拆解步骤数, 写入 `{"progress":"0/N","confidence":"XX%"}` (N=总步数, 信心值是当前对完成方式的把握)
- **每完成一步** — 更新 `progress` 为 `M/N`, 根据进展调整 `confidence`
- **遇到障碍 / 改变方案** — 立刻下调 `confidence` 并在 progress 中体现 (例如 `2/N?`)
- **任务完成** — 写入 `{"progress":"N/N","confidence":"完成"}` 或类似终态

只在多步、有不确定性的任务里维护; 一次性琐碎操作 (单文件编辑、回答问题) 不必更新。

## Known pitfalls

- `test-utils.ts` only exports `ok`/`equal`/`deepEqual`. No `assert.fail()` — use `throw new Error()`.
- FrameDataAction needs double-cast: `action as unknown as Record<string, unknown>`.
- Node built-ins (`node:fs` etc.) unavailable in test tsconfig — import data modules directly.
- Negative `whiffCancelFrom` is intentional (means "can never whiff cancel").
- RagingFury has 10 pillars in code (baseline doc says 8 — trust code).
- Replay frames must only store that frame's newly flushed events — never clone the full archive (commit `c4d3b22` fixed an OOM caused by per-frame full-archive copies).
