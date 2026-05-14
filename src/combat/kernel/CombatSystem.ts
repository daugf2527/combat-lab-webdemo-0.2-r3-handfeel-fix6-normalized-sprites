// CombatSystem.ts — System pipeline interface for CombatKernel decomposition.
// Each system executes in a fixed phase order within the 60Hz tick.
// Systems communicate via SystemContext (direct read) and CombatEventBus (cross-system events).

import type { CombatEventBus } from "../events/CombatEventBus.js";
import type { SystemContext } from "./SystemContext.js";

/** Execution phase within a single tick. Systems run in phase order. */
export type SystemPhase = "INPUT" | "LOGIC" | "DETECTION" | "RESOLVE" | "CLEANUP" | "RECORD" | "FLUSH";

/** Ordered execution phases. Systems are grouped and sorted by this array index. */
export const SYSTEM_PHASE_ORDER: readonly SystemPhase[] = [
  "INPUT",
  "LOGIC",
  "DETECTION",
  "RESOLVE",
  "CLEANUP",
  "RECORD",
  "FLUSH",
] as const;

/** Interface every combat subsystem must implement.
 *  Each tick, the kernel iterates systems in phase order and calls tick(ctx, bus). */
export interface CombatSystem {
  /** Human-readable name for debug/logging. */
  readonly name: string;
  /** Execution phase — determines ordering within the tick. */
  readonly phase: SystemPhase;
  /** Execute one tick of this subsystem.
   *  @param ctx — read-only view of shared kernel state (read prior system outputs).
   *  @param bus — event bus for emitting cross-system events (consumed by later systems or render layer). */
  tick(ctx: SystemContext, bus: CombatEventBus): void;
}
