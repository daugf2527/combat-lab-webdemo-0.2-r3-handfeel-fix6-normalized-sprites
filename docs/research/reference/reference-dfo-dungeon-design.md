# Dungeon Design Framework (地下城设计框架) — DFO World Wiki Reference

> Source: https://wiki.dfo.world (Dungeon, Scenario, Raid, Legion, Rank pages)
> Scraped: 2026-05-02

---

## Difficulty Tiers

Dungeons use a 5-tier system scaling monster stats and entry requirements.

| Tier | Unlock Method | Fame Example (Vericollis) |
|------|--------------|---------------------------|
| **Normal** | Default | 4,176 |
| **Expert** | Clear Normal | 13,195 |
| **Master** | Clear Expert. Master S+ rank unlocks both Master and King for party members | 23,259 |
| **King** | Clear Master SSS rank without Life Tokens | 29,369 |
| **Slayer** | Highest tier, endgame only | 33,989 |

**Stat scaling**: Monster HP, ATK, DEF increase significantly per tier. Higher tiers grant increased Legendary/Epic drop rates as compensation. Exact multipliers not publicly documented — referred to as "grow significantly stronger" in official sources.

---

## Dungeon Types

### Scenario Dungeons
- Story-driven, tied to Epic Quest progression
- Unique map layout and boss per quest
- Fixed Normal difficulty on first entry, scales with progression
- No level restriction once quest accepted
- Cannot re-enter Special Dungeons normally after quest completion (only via Area Adventure Mode)
- Unlocks Area Adventure Mode on regional completion

### Normal Dungeons
- Standard repeatable dungeons (post-scenario)
- All 5 difficulty tiers available
- 1 FP per room entry
- Party mode: 2-4 players
- Fame requirements scale with difficulty
- Example structures: Canyon Hills (12 rooms, grid layout), Nasau Forest (9 rooms, linear with branches)

### Special Dungeons (Pre-Origin)
- Highest level dungeon per area with unique gimmicks
- **8 FP flat entry** — no additional FP per room regardless of room count
- Higher Unique drop rates than normal dungeons
- Drop Mysterious Meteors (exchangeable for equipment), Dimensional Seal stones
- Replaced by Loop of Circulation Dungeons in Origin Update

### Ancient Dungeons (Time Gate - Requiem, Lv. 85-88)
- Accessed through Saint Horn
- Scalable difficulty (first 3 unlocked, higher requires clearing previous)
- **Exorcism stat requirement**: minimum 3,538
- Daily missions grant special items for Legendary Equipment purchases

### Advanced Dungeons (Lv. 110-115)
- Readjusted Normal Dungeon versions for endgame
- Solo or party (2-4), time limits: 30 min (old) → 20 min → 10 min (Unshackled Nightmare)
- Weekly entry limits (1-2 per week, reset Tuesday)
- Minimum 30 FP to enter
- Lv. 115 Sunken Depths: no difficulty selection but Fame required

### Legion Dungeons
- Boss rush format, post-raid content
- **Ispins** (Nov 2022): 4 Dragonoid Commanders, each 3 phases, Operation Cards system
- **Hall of Dimensions** (May 2023): Second Legion Dungeon

---

## Room Structure

### Typical Room Count
- Normal dungeons: 9-12 rooms (Canyon Hills: 12, Nasau Forest: 9)
- Special dungeons: 8+ rooms (flat 8 FP cost)
- Scenario dungeons: varies by quest

### Room Types
| Type | Description |
|------|-------------|
| Starting Zone | Initial spawn point |
| Battle Room | Regular monsters + Named enemies |
| Boss Room | Final room with end boss |
| Unstable Rift | Special room (e.g., Nasau Forest D4) |
| Named Monster Room | Stronger named enemies, may drop barriers (e.g., Volt MX3) |
| Trap Room | Environmental hazards (Southern Dale: trapped treasure room) |

### Layout Patterns
- **Grid-based**: Canyon Hills — central path + upper/lower flanking paths, 12 rooms
- **Linear with branches**: Nasau Forest — main progression with side options, 9 rooms
- **Multi-path**: players choose routes converging at certain points

### Monster Waves & Spawns
- Goblins spawn in waves attacking objectives (3 Goblin Engineers among waves)
- Deaths can trigger endless enemy waves (Endless Nightmare)
- Some spawns trigger on defeating Named monsters or barriers

---

## Clear Rank System (F → SSS)

**Formula**: `Style (max 70) + Technique (max 70) − Hits Taken`

| Rank | Points | EXP Bonus |
|------|--------|-----------|
| F | 0-34 | 0% |
| E | 35-44 | 0% |
| D | 45-54 | 0% |
| C | 55-64 | 0% |
| B | 65-74 | 5% |
| A | 75-84 | 10% |
| S | 85-94 | 15% |
| SS | 95-104 | 20% |
| SSS | 105-140 | 30% |

### Style (max 70)
| Component | Max Points | Description |
|-----------|-----------|-------------|
| Hit Combo | 30 | Consecutive hits (5+ combo required to count) |
| Aerial | 30 | Consecutive hits on launched targets |
| Multi-Hit | 10 | Double/Triple/Quad simultaneous hits by multiple players |

### Technique (max 70)
| Component | Max Points | Description |
|-----------|-----------|-------------|
| Counter | 20 | Land hit on targets in attack motion |
| Back Attack | 20 | Attack target from behind |
| Overkill | 30 | Finishing blow ≥ 30% of target's max HP |

### Hits Taken
Each hit taken diminishes the Style + Technique sum. More maps explored = less penalty per hit.

---

## Raid Structure

### Party Organization

| Raid | Players | Parties | Party Names | Difficulty Modes |
|------|---------|---------|-------------|------------------|
| **Sirocco** | 16 | 4 (Red/Orange/Yellow/Green) | Red=strongest | Normal, Guide/Squad, Challenge |
| **Ozma** | — | Multi-party | — | Normal, Guide/Squad |
| **Bakal** | 12 | 3 (Red/Yellow/Green) | Red=strongest | Normal (18,774 Fame), Hard (21,817 Fame) |

**Recommended per party**: 1 Buffer (Saint/Seraph/Hekate/Muse) + at least 3 Dealers. No party locked out of any dungeon — assignments at raid leader's discretion.

### Phase Systems

**Sirocco (2 Phases)**:
- Phase 1 "Chase Operation": 4 Areas/Gateways. Area 1 requires 4 parties clearing Nameless Gatekeeper in BGM instrument order (1-2-3-4); wrong order resets progress and restores HP
- Phase 2 "Subjugation": Hall of Immateriality, 3 planes → 1st Plane (final boss)

**Bakal (Single Phase)**:
- 16 dungeon areas on Sky's Wish Gate battlefield
- Main route: Cruel King of Dragons' Road → Bakal's Palace
- Flughafen teleport system for party leaders
- Great Dragon Trio, Sphere Effects, Gatekeepers, Marchers, Conflagration Gauge
- 0 FP cost (as of Nabel update)

### Shared Mechanics
- Players cannot leave raid area once begun
- Cannot return to Seria's Room until phase completion
- Loot Auction systems (Ozma, Bakal) for rare drops
- Equipment Fusion systems for raid gear progression

---

## Boss Mechanics Patterns

### HP Threshold Phase Transitions
- Ispins Dragonoids: 3 distinct phases each
- Death Dragon Spirazzi: Phases 1-2 with Vengeful Poison ability gauge
- Berserk Dragon Hismar: Phases 1-2 with Berserk Gauge per player
- GB-1 Herz: Charging Gaebolg timer while stationary

### Groggy States
Boss becomes vulnerable after fulfilling conditions:
- Universe Pulverizer Crusher: Destroy all 4 eyeballs → groggy
- Celestial Archer Alexandra: Hit by golden arrow 5 times → 20s groggy
- Stormy Ballista: Destroy ballista → 20s groggy (Isys party kicked out after)

### Enrage/Berserk
- Spirit Liberator Kephadona: Berserk phase, vulnerable despite invincibility frames
- Advanced Dungeons: 30 min (old) / 20 min / 10 min time limits

### Area Denial
- Prey-Isys: Crescent wave → feather drop → explosion
- Pandemos Floo: Ground-level shockwave across entire room (must jump)
- Gangling Lotus: Vase rows as traps, priority is breaking rows on entry

### Puzzle Mechanics
- Sirocco Gatekeeper: Absorbs instrument souls, parties must defeat in order (1-2-3-4)
- Goblin Kingdom: Protect Goblin Trap, defeat 3 Goblin Engineers in waves

---

## Entry Requirements Summary

| Content | Level | Fame Example | FP Cost | Entry Limit |
|---------|-------|-------------|---------|-------------|
| Normal Dungeon | 110 | 4,176-33,989 | 1/room | Unlimited |
| Special Dungeon | — | — | 8 flat | Quest-gated |
| Advanced Dungeon | 110-115 | varies | 30 min | 1-2/week |
| Bakal Raid Normal | 110 | 18,774 | 0 | Weekly |
| Bakal Raid Hard | 110 | 21,817 | 0 | Weekly |
| Ancient Dungeon | 85-88 | Exo 3,538 | standard | Quest-gated |

**Dynamic fame**: Some dungeons use "top 30% fame" threshold, recalculated every Tuesday.

---

## Reward Structure

### Card Flip System
- Post-dungeon: select from face-down reward cards
- NPC Delilah (standard), Gabriel (rare alternative, sells 3 types of items)
- Difficulty scaling: higher difficulty = more/better card rewards

### Drop Allocation
- **Personal loot**: Each player receives own drops, no competition (modern standard)
- **Party roll**: Traditional system for shared drops (less common now)
- **Raid auctions**: Players bid with currency earned during raid

### Raid Equipment Fusion
- Sirocco: Equipment Fusion System materials, Trajectory of Nothingness
- Bakal: Last Fiery Breath fusion weapons, 2 random fusion options
- Ispins: 5 fusion sets based on Dragonoid commanders

### Key Currencies
| Currency | Source | Use |
|----------|--------|-----|
| Mysterious Meteors | Special Dungeons | Equipment exchange (Seria) |
| Impostor Reports | Ancient Dungeons | Legendary weapons (Captain Luther) |
| Ancient Kingdom Gold Coins | Time Gate limited quests | Legendary Equipment |
| Abyss Batteries | Endgame content | Progression |
| Golden Beryl / Leiern Cores | Vericollis | Materials |
| Harmonious Crystals | Vericollis | Safe Amplification |

### Unlock Sharing
- Party leader can take party into unlocked content even if members don't meet requirements
- Clearing Master with S+ unlocks both Master and King for all party members
- Does NOT auto-unlock Expert if member doesn't have it

---

## System Evolution

### Classic (Pre-Origin, ~Lv. 85-95)
- Special Dungeons per area with unique gimmicks
- Ancient Dungeons through Saint Horn
- Exorcism stat gating
- Road-based difficulty unlock progression

### Modern (Lv. 110-115)
- Adventurer Fame as primary gating stat
- 5 difficulty tiers with Fame thresholds
- Advanced Dungeons with ticket enhancements and weekly limits
- Legion Dungeons as post-raid boss rush content
- Raids with 0 FP cost (Bakal onward)
- Dynamic fame requirements (percentile-based, updates weekly)
- Equipment Fusion as primary raid progression
- Loot Auction systems for rare drop distribution
