// SystemContext.ts — Shared mutable state passed to every CombatSystem.tick().
// Systems read prior systems' output from ctx; they never call each other directly.
// The kernel owns and mutates ctx; systems receive it as a parameter.

import type { CombatEventBus } from "../events/CombatEventBus.js";
import type { Actor } from "../types.js";
import type { BrowserInputState, InputBuffer, CommandInputParser } from "../input/BrowserInputState.js";
import type { SOCDCleaner } from "../input/SOCDCleaner.js";
import type { RunCommandDetector } from "../input/RunCommandDetector.js";
import type { HitStopController } from "../reaction/HitStopController.js";
import type { RecoilController } from "../reaction/RecoilController.js";
import type { HitResolver2D5 } from "../hit/HitResolver2D5.js";
import type { HitDecisionResolver } from "../hit/HitDecisionResolver.js";
import type { DamageResolver } from "../damage/DamageResolver.js";
import type { ReactionResolver } from "../reaction/ReactionResolver.js";
import type { CooldownResourceKernel } from "../resources/CooldownResourceKernel.js";
import type { BuffLifecycleSystem } from "../buffs/BuffLifecycleSystem.js";
import type { StatusEffectSystem } from "../status/StatusEffectSystem.js";
import type { PushBoxResolver } from "../motion/PushBoxResolver.js";
import type { RootMotionController } from "../motion/RootMotionController.js";
import type { MovementInputProvider } from "../motion/MovementInputProvider.js";
import type { LocomotionController } from "../motion/LocomotionController.js";
import type { DeathLoop } from "../death/DeathLoop.js";
import type { LastHitTrace } from "../debug/LastHitTrace.js";
import type { DebugOverlay } from "../debug/DebugOverlay.js";
import type { ReplayRecorder } from "../replay/ReplayRecorder.js";
import type { EnemyAIController } from "../ai/EnemyAI.js";
import type { ScenarioBooleans } from "../types.js";

/** Shared kernel state available to all CombatSystem instances.
 *  Systems read from ctx; the kernel owns and mutates it. */
export interface SystemContext {
  // ── Core state ──
  readonly tickCount: number;
  readonly actors: Actor[];
  readonly player: Actor;
  readonly worldBounds: { xMin: number; xMax: number; zMin: number; zMax: number };
  readonly scenario: ScenarioBooleans;
  readonly notes: string[];
  readonly replayArchiveStart: number;

  // ── Input subsystem ──
  readonly inputState: BrowserInputState;
  readonly inputBuffer: InputBuffer;
  readonly commandParser: CommandInputParser;
  readonly socdCleaner: SOCDCleaner;
  readonly runDetector: RunCommandDetector;

  // ── Reaction subsystem ──
  readonly hitStop: HitStopController;
  readonly recoil: RecoilController;

  // ── AI ──
  readonly enemyAI: EnemyAIController;

  // ── Hit detection ──
  readonly hitResolver: HitResolver2D5;
  readonly hitDecisionResolver: HitDecisionResolver;

  // ── Damage & reaction ──
  readonly damageResolver: DamageResolver;
  readonly reactionResolver: ReactionResolver;

  // ── Resources ──
  readonly cooldowns: CooldownResourceKernel;
  readonly buffs: BuffLifecycleSystem;
  readonly status: StatusEffectSystem;

  // ── Motion ──
  readonly push: PushBoxResolver;
  readonly rootMotion: RootMotionController;
  readonly movementInput: MovementInputProvider;
  readonly locomotion: LocomotionController;

  // ── Cleanup ──
  readonly death: DeathLoop;
  readonly lastHit: LastHitTrace;
  readonly debug: DebugOverlay;

  // ── Replay ──
  readonly replay: ReplayRecorder;
  readonly enableReplay: boolean;
}
