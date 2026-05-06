import type { ComboCorrectionConfig, ComboCorrectionState, HitDecision, ReactionKind } from "../types.js";

export const COMBO_CORRECTION_RULE_VERSION = "pve-lite-2026-05-03";

export const DEFAULT_COMBO_CORRECTION_CONFIG: ComboCorrectionConfig = {
  barMax: 10000,
  standHitAdd: 420,
  standHeavyBonus: 180,
  airHitAdd: 380,
  airLaunchBonus: 90,
  downHitAdd: 650,
  hitRecoveryAddPerFrame: 18,
  gravityScaleMax: 2.4,
  launchResistanceMax: 1.8,
  damageScaleMin: 0.15,
  maxStunReliefFrames: 10,
  forcedWakeInvulFrames: 8,
  comboResetFrames: 180,
};

export function createComboCorrectionState(): ComboCorrectionState {
  return {
    standGauge: 0,
    airGauge: 0,
    downGauge: 0,
    hitRecoveryGauge: 0,
    comboElapsedFrames: 0,
    framesSinceLastHit: 0,
    comboHitCount: 0,
    lastState: "none",
    forcedWakeQueued: false,
    gravityScale: 1,
    launchResistance: 1,
    damageScale: 1,
    stunReliefFrames: 0,
    recoveryRuleVersion: COMBO_CORRECTION_RULE_VERSION,
    evasionGauge: 0,
  };
}

function clampGauge(value: number, config: ComboCorrectionConfig): number {
  return Math.max(0, Math.min(config.barMax, value));
}

function ratio(value: number, config: ComboCorrectionConfig): number {
  return clampGauge(value, config) / config.barMax;
}

export function classifyComboCorrectionState(reaction: ReactionKind): ComboCorrectionState["lastState"] {
  if (reaction === "launch" || reaction === "air_hitstun" || reaction === "falling") return "aerial";
  if (reaction === "downed" || reaction === "getting_up" || reaction === "quick_rebound") return "down";
  if (reaction === "none" || reaction === "micro_stagger" || reaction === "light_stagger" || reaction === "heavy_stagger") return "stand";
  return "stand";
}

export interface ComboCorrectionUpdate {
  bucket: ComboCorrectionState["lastState"];
  standAdded: number;
  airAdded: number;
  downAdded: number;
  hitRecoveryAdded: number;
  forcedWakeQueued: boolean;
}

export function applyComboCorrectionFromHit(
  state: ComboCorrectionState,
  targetReaction: ReactionKind,
  decision: HitDecision,
  config: ComboCorrectionConfig = DEFAULT_COMBO_CORRECTION_CONFIG,
): ComboCorrectionUpdate {
  const bucket = classifyComboCorrectionState(targetReaction);
  let standAdded = 0;
  let airAdded = 0;
  let downAdded = 0;
  if (bucket === "stand") {
    standAdded = config.standHitAdd + (decision.hitbox.attackLevel >= 2 ? config.standHeavyBonus : 0);
    state.standGauge = clampGauge(state.standGauge + standAdded, config);
  } else if (bucket === "aerial") {
    airAdded = config.airHitAdd + (decision.hitbox.canLaunch ? config.airLaunchBonus : 0);
    state.airGauge = clampGauge(state.airGauge + airAdded, config);
  } else if (bucket === "down") {
    downAdded = config.downHitAdd;
    state.downGauge = clampGauge(state.downGauge + downAdded, config);
  }

  const hitStunFrames = Math.max(0, decision.hitbox.reactionProfile?.hitStunFrames ?? 0);
  const hitRecoveryAdded = hitStunFrames * config.hitRecoveryAddPerFrame;
  state.hitRecoveryGauge = clampGauge(state.hitRecoveryGauge + hitRecoveryAdded, config);
  if (state.comboHitCount === 0) state.comboElapsedFrames = 0;
  state.framesSinceLastHit = 0;
  state.comboHitCount += 1;
  state.lastState = bucket;
  refreshComboCorrectionDerivedState(state, config);
  if (bucket === "down" && state.downGauge >= config.barMax) state.forcedWakeQueued = true;
  return { bucket, standAdded, airAdded, downAdded, hitRecoveryAdded, forcedWakeQueued: state.forcedWakeQueued };
}

export function hasComboCorrectionPressure(state: ComboCorrectionState): boolean {
  return state.standGauge > 0 || state.airGauge > 0 || state.downGauge > 0 || state.hitRecoveryGauge > 0 || state.comboHitCount > 0 || state.forcedWakeQueued;
}

export function resetComboCorrectionState(
  state: ComboCorrectionState,
  config: ComboCorrectionConfig = DEFAULT_COMBO_CORRECTION_CONFIG,
): void {
  state.standGauge = 0;
  state.airGauge = 0;
  state.downGauge = 0;
  state.hitRecoveryGauge = 0;
  state.comboElapsedFrames = 0;
  state.framesSinceLastHit = 0;
  state.comboHitCount = 0;
  state.lastState = "none";
  state.forcedWakeQueued = false;
  state.evasionGauge = 0;
  refreshComboCorrectionDerivedState(state, config);
}

export function refreshComboCorrectionDerivedState(
  state: ComboCorrectionState,
  config: ComboCorrectionConfig = DEFAULT_COMBO_CORRECTION_CONFIG,
): void {
  const airRatio = ratio(state.airGauge, config);
  const pressureRatio = Math.max(ratio(state.standGauge, config), ratio(state.airGauge, config), ratio(state.downGauge, config));
  state.gravityScale = 1 + (config.gravityScaleMax - 1) * airRatio;
  state.launchResistance = 1 + (config.launchResistanceMax - 1) * airRatio;
  state.damageScale = Math.max(config.damageScaleMin, 1 - (1 - config.damageScaleMin) * pressureRatio);
  state.stunReliefFrames = Math.round(ratio(state.hitRecoveryGauge, config) * config.maxStunReliefFrames);
  state.recoveryRuleVersion = COMBO_CORRECTION_RULE_VERSION;
}
