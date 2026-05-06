# DNF PVF/.skl Skill Frame Data Extraction Plan

> Status: Plan approved, pending execution. Requires PVF file and tool setup.
> Target: Extract real frame timing, hitbox geometry, and physics parameters from DNF server PVF for all Berserker skills.

## Context

The Carbon Shade Combat Lab currently has 28 Berserker skills implemented, but the berserker-data-gap-report shows that **~35-40% of combat behavior data is completely unknown** — specifically: exact per-frame timing, hitbox mount frames, launch/gravity parameters, Y/Z-axis hitbox geometry, and attack coefficients. These values are only stored in DNF's server-side PVF files and cannot be obtained from official API, wiki, or community sources.

The project already has a designed-but-not-executed extraction pipeline documented in `docs/research/combat/pvf-skl-extraction-workflow.md`. This plan operationalizes that pipeline into concrete, executable steps.

## Prerequisites

### Required Tools

| Tool | Purpose | GitHub | Runtime |
|------|---------|--------|---------|
| **DNF-Porting** | PVF unpacking + parsing library (C#) | https://github.com/flwmxd/DNF-Porting | .NET SDK 6.0+ |
| **PvfPlayer** | PVF unpack/packer (alternative) | https://github.com/ariakeumi/PvfPlayer | Windows |
| **DNF-PVF-decode-program** | PVF decryption | https://github.com/SoraKasvgano/DNF-PVF-decode-program | — |
| **Python 3.10+** | Post-processing .skl → TypeScript | — | Any |

### Required Data Sources

1. **Decrypted DNF PVF file** — matching a known DNF version (e.g., KDNF Season 8 or equivalent CDNF version). Must be obtained separately; this project does NOT distribute PVF files per `docs/design/source-policy.md`.

2. **Berserker skill ID mapping** — Korean internal names → English wiki names. Already partially mapped in `docs/research/combat/pvf-skl-extraction-workflow.md` lines 72-86.

### Legal Boundary

**Extract numerical data only**: frame counts, hitbox dimensions, physics values, attack coefficients. Do NOT redistribute PVF files, .skl source text, or any DNF server-side intellectual property.

## Step-by-Step Pipeline

### Step 1: Acquire Decrypted PVF

PVF files in official DNF distributions are encrypted. Community tools (DNF-PVF-decode-program) can decrypt them. The decrypted PVF is a standard archive containing plain-text structured data directories.

**Action**: Use DNF-PVF-decode-program to obtain a decrypted PVF matching the target DNF version.

**Output**: `decrypted.pvf` file

### Step 2: Unpack PVF Archive

Use DNF-Porting (recommended — 29 stars, more mature) or PvfPlayer to extract the decrypted PVF.

```bash
# Option A: DNF-Porting
DNFPorting.exe extract-pvf --input "path/to/decrypted.pvf" --output "./pvf_extracted/"

# Option B: PvfPlayer
PvfPlayer.exe unpack --input "path/to/decrypted.pvf" --output "./pvf_extracted/"
```

**Expected directory structure**:
```
pvf_extracted/
├── skill/           ← .skl files — skill definitions
├── character/       ← character stat tables
├── monster/         ← monster/NPC data
├── item/            ← equipment/item data
└── etc/             ← damage formula constants, etc.
```

### Step 3: Locate Berserker .skl Files

1. Find the master skill list: `skill/list.skl` — contains name → ID mapping
2. Identify Berserker skill IDs using Korean names mapped in the workflow doc
3. Target files: `skill/[id].skl` for each Berserker skill

**Priority skills** (from the existing `FrameDataAction.ts`):
- NormalBasic1-3, DashAttack, Jump, JumpAttack, FrenzyBasic1-3
- UpwardSlash, MountainousWheel, RagingFury, Bloodlust
- GoreCross, OutrageBreak, ExtremeOverkill, RagingFury2
- BloodRuin, BloodSword, BurstFury, EarthShatter
- Thirst, BloodMemory, FrenzyToggle, Derange, Diehard, BloodyCross

### Step 4: Parse .skl File Structure

Decrypted .skl files are structured key-value text. Each .skl contains:

```
[skill]
id = <int>
name = "<Korean name>"
...

[cast]
cast_time = <int>          # startup frames (in ticks at native tickrate)
cast_animation = <string>   # animation reference

[active]
duration = <int>            # active phase frames
hitbox_ids = <list>         # hitbox references
hit_interval = <int>        # multi-hit interval (ticks)

[recovery]
duration = <int>            # recovery phase frames

[hitbox.<id>]
type = <string>             # "slash", "grab", "projectile", "shockwave"
size_x = <float>
size_y = <float>
size_z = <float>
offset_x = <float>
offset_y = <float>
offset_z = <float>
attack_power = <float>      # base damage coefficient
hitstun = <int>             # hit stun frames
knockback_x = <float>
knockback_z = <float>
launch_y = <float>          # vertical launch velocity
gravity = <float>           # gravity modifier
down_frames = <int>
...
```

### Step 5: Map .skl Fields to Combat Lab FrameDataAction

Create a Python script (`scripts/extract-skl-to-ts.py`) that:

1. Reads each `.skl` file and parses the key-value structure
2. Maps fields to the `FrameDataAction` TypeScript interface:

| .skl Field | FrameDataAction Field |
|---|---|
| `[cast].cast_time` | `startup[0].start-end` |
| `[active].duration` | `active[i].start-end` |
| `[hitbox.X].size_x/y/z` | `hitbox.w/d/h` |
| `[hitbox.X].offset_x/y/z` | `hitbox.offsetX/offsetY/offsetZ` |
| `[hitbox.X].attack_power` | `hitbox.baseDamage` (scaled) |
| `[hitbox.X].hitstun` | `reactionProfile.hitStunFrames` |
| `[hitbox.X].knockback_x/z` | `reactionProfile.knockbackX/knockbackZ` |
| `[hitbox.X].launch_y` | `reactionProfile.launchVelocityY` |
| `[hitbox.X].down_frames` | `reactionProfile.downFrames` |
| `[recovery].duration` | `recovery[0].start-end` |
| Total = cast + active + recovery | `totalFrames` |

3. Output TypeScript code compatible with `src/combat/actions/FrameDataAction.ts` format

### Step 6: Validate and Integrate

1. Run extracted data through `npm run static:test` to ensure `config-validate.test.ts` accepts the new values
2. Compare extracted values against current baseline values — flag discrepancies
3. Update `sourcePolicy` from `"baseline_tuning"` to `"pvf_extracted"` with high confidence
4. Update `docs/design/tuning-baseline.md` with extracted values
5. Update `docs/research/combat/berserker-data-gap-report.md` to mark previously 🔴 items as 🟢

---

## What This Pipeline CAN Extract

- ✅ Total frames and frame phase durations (startup/active/recovery)
- ✅ Hitbox geometry: width, depth, height, offsets
- ✅ Base damage coefficients per hitbox
- ✅ Hit reactions: hitstun, knockback, launch velocity, gravity
- ✅ Multi-hit intervals and hit count
- ✅ Attack level and control power
- ✅ Animation references (string identifiers)

## What This Pipeline CANNOT Extract

- ❌ Exact per-frame animation timing (requires NPK/IMG extraction — see `docs/research/combat/npk-img-extraction-workflow.md`)
- ❌ Sprite anchor points (requires OjoDnfExtractor + sprite analysis)
- ❌ Visual effects and hit sparks
- ❌ Network sync parameters
- ❌ Boss AI behavior trees

## Tools NOT Needed for This Task

- **DNF Extractor** — this extracts images from .npk files (asset tool), NOT skill data from .skl files (logic tool). It's for the parallel NPK/IMG pipeline, not this PVF/.skl pipeline.

## Order of Execution

1. **Set up tools**: Install .NET SDK 6.0+, clone DNF-Porting, verify it runs
2. **Acquire PVF**: Obtain decrypted PVF (path TBD by user)
3. **Unpack**: Extract `skill/` directory from PVF
4. **Develop parser**: Write `scripts/extract-skl-to-ts.py` to parse .skl → TypeScript
5. **Extract and integrate**: Run parser, integrate output into FrameDataAction.ts
6. **Validate**: Run typecheck → static:test → build
7. **Document**: Update tuning-baseline.md and data-gap-report.md

## Verification

```bash
npm run typecheck          # Must pass with extracted values
npm run static:test        # All 29 tests must pass
npm run build              # Must produce clean dist/
```

Also verify manually:
- Compare totalFrames from PVF vs current baseline (expect differences)
- Verify hitbox dimensions match expected in-game feel
- Check that cooldown/MP values (from API) remain unchanged (PVF may not contain these)
