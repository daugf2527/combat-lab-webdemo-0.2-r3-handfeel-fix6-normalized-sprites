# Status Effects / Abnormal Status (异常状态) — DFO World Wiki Reference

> Source: https://wiki.dfo.world/view/Status
> Scraped: 2026-05-02

---

DNF status effects are divided into two major categories: **Damage-type** (Bleed, Poison, Burn, Shock) and **Neutralize-type** (Stun, Freeze, Petrify, Sleep, Blind, Confusion, Bind, Slow, Curse, Rupture). A major system update removed "status levels" from damage-type effects; their activation rates are no longer affected by level difference between attacker and target.

---

## Damage-Type Status Effects (DoT)

These deal damage over time. Tolerances against them now increase/decrease the **damage amount** (not application chance, post-update).

### Bleed (出血)

| Property | Value |
|----------|-------|
| Duration | 3 seconds |
| Tick interval | 0.5 seconds |
| Total ticks | 6 |
| Stack bonus | +1% per stack (max +10%) |
| Special | All damage dealt is evenly distributed across 3 seconds |

### Poison (中毒)

| Property | Value |
|----------|-------|
| Duration | 5 seconds |
| Tick interval | 0.5 seconds |
| Total ticks | 10 |
| Stack bonus | +2% per stack (max +10%) |

### Burn (灼烧)

| Property | Value |
|----------|-------|
| Duration | 5 seconds |
| Tick interval | 0.5 seconds |
| Total ticks | 10 |
| Stack bonus | Not specified (stacks for additional damage) |
| Splash | Burned targets spread 10% of their burn damage to monsters within **150 pixel** range |
| Freeze interaction | Applying Burn during Freeze immediately cancels Freeze and applies **105%** of attack damage. Fire elemental attacks alone can no longer cancel Freeze — only Burn status can |

### Shock (感电)

| Property | Value |
|----------|-------|
| Duration | 10 seconds |
| Tick interval | Damage is distributed as a set number of hits across 10 seconds |
| Stack bonus | +0.5% per stack (max +5%) |
| Special | After all damage distributed, target retains a lingering (residual) effect. Continuous damage applied for its duration separately from damage added to attacks |

### Rupture (破裂)

Rupture is classified as a **Neutralize-type** status despite amplifying damage.

| Property | Value |
|----------|-------|
| Max stacks | 3 |
| Monster effect | Stack 1: +5% incoming damage / Stack 2: +7% / Stack 3: +8% |
| Player effect | Stack 1: +25% incoming damage / Stack 2: +50% / Stack 3: +75% |
| Refresh | Additional Rupture application after 3 stacks renews the 3-stack duration |
| Removal | All stacks removed at end of duration or when cleansed |

---

## Neutralize-Type (Control) Status Effects

These hold targets back and assist in suppressing the Neutralize Gauge. Tolerances against them affect the status effect's **success chance**.

### Stun (眩晕)

| Property | Value |
|----------|-------|
| Prevents | All actions |
| Escape | Keystrokes can end early. Effect is also shown after standing up if stunned while midair or downed |
| Interaction | Effect removed early if stunned target is thrown |

### Freeze (冰冻)

| Property | Value |
|----------|-------|
| Prevents | All actions, being downed, being launched, being thrown |
| Escape | Keystrokes can end early |
| Movement | Applying Freeze to a moving monster temporarily pauses its movement until released |
| Burn interaction | Applying Burn during Freeze cancels Freeze + deals 105% damage |

### Petrify (石化)

| Property | Value |
|----------|-------|
| Prevents | All actions, being downed, being launched, being thrown |
| Escape | Keystrokes can end early |
| Damage reduction | Decreases incoming damage by 10% for player characters. 1% of damage reduction is removed each second |
| Movement | Applying Petrification to a moving monster temporarily pauses its movement |

### Sleep (睡眠)

| Property | Value |
|----------|-------|
| Prevents | All actions. Counts as a downed status |
| Escape | Keystrokes will NOT end this status early |
| HP recovery | Player characters recover 1% HP per second |
| Wake-up bonus | Incoming attack immediately cancels Sleep, applying **150%** of attack as awakening bonus |
| Note | Monster attacks have separate mastery limits against Sleeping targets |

### Blind (失明)

| Property | Value |
|----------|-------|
| Effect | Limits visual range. Reduces Hit Rate |
| Monster effect | Decreases monster Hit Rate |

### Confusion (混乱)

| Property | Value |
|----------|-------|
| Effect | "!?" sign appears. Up/down/left/right directional keys are reversed |
| Player danger | Player characters can hurt their allies |
| Monster effect | Monster movement is paused |

### Bind (束缚)

| Property | Value |
|----------|-------|
| Prevents | Movement and jumping |
| Allows | Attacking (target can still attack while bound) |

### Slow (减速)

| Property | Value |
|----------|-------|
| Effect | Decreases movement and attack speed |
| Scaling | Speed decrease varies with the level of the slow effect |

### Curse (诅咒)

| Property | Value |
|----------|-------|
| Effect | Randomly applies 1 Abnormal status (excluding Damage-type) |
| Note | No longer decreases stats (removed in update) |

---

## Status Resistance System

### Individual Tolerances

Each status type has its own tolerance stat:

`Bleed Tolerance`, `Frozen Tolerance`, `Poison Tolerance`, `Blind Tolerance`, `Curse Tolerance`, `Confusion Tolerance`, `Slow Down Tolerance`, `Stun Tolerance`, `Sleep Tolerance`, `Stone Curse Tolerance`, `Burn Tolerance`

### All Abnormal Status Tolerance

A separate stat providing universal resistance across all types. Equipment can grant this as a bonus. Works alongside individual tolerances.

### Historical Change

- **Old system**: Status levels compared against target level. 200 Abnormal Status resistance = essentially immunity.
- **Current system**: Status levels removed from damage-type effects. Tolerance for damage-types now modifies damage amount; tolerance for neutralize-types modifies success chance.

---

## Stacking and Removal

- Stacking does NOT increase duration — it increases damage or effect intensity
- Negative effects can be removed by skills or consumables
- Positive effects (buffs) can only be removed by skills

---

## Neutralize / Ignite / Groggy (Modern Boss System)

### Neutralize Gauge

- Added to Named and Boss monsters in certain areas/modes
- Each monster has different weakness and gauge amount
- Attack its weakness to drain the gauge
- When gauge is fully drained (destroyed): monster becomes vulnerable to Abnormal Statuses, Neutralize, Immobility, and other debuffs
- Gauge restores over time, increasing its maximum amount along the way
- Neutralize Gauge decrease scales in proportion to character's damage

### Ignite System

- Increases over time from your first hit on a monster
- Directly increases Neutralize Gauge Decrease Rate in real-time
- When you're hit by a monster, Ignite Gauge decreases and temporarily stops building
- Resumes building after a short period
- All Ignite Gauge specs are applied per individual player

### Groggy State

- State when Neutralize Gauge is fully destroyed/depleted
- Monster becomes vulnerable to Abnormal Statuses, Neutralize, Immobility, and debuffs
- Duration lasts until gauge restores

---

## Status Interactions Summary

| Interaction | Effect |
|-------------|--------|
| Burn during Freeze | Cancels Freeze, applies 105% attack damage |
| Freeze on moving monster | Pauses monster movement until released |
| Petrify on moving monster | Pauses monster movement until released |
| Sleep + incoming attack | Wake-up with 150% attack bonus |
| Confusion on monster | Pauses monster movement |
| Burn splash | 10% of burn damage to monsters within 150px |
