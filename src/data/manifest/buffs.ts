import buffData from "./buffs/default.json" with { type: "json" };

export interface BuffStage {
  hpPercentAtOrBelow: number;
  attackSpeedPercent: number;
  moveSpeedPercent: number;
  evasionPercent: number;
}

export interface BloodyCrossProfile {
  skillAttackMultiplier: number;
  baseAttackSpeedPercent: number;
  baseMoveSpeedPercent: number;
  stages: BuffStage[];
}

export interface DerangeProfile {
  skillAttackMultiplier: number;
  moveSpeedPercent: number;
  attackSpeedPercent: number;
  abnormalResistancePercent: number;
  hitRecoveryPercent: number;
  hitstunIncreasePercent: number;
  recoilReductionPercent: number;
  intelligenceDecrease: number;
  physicalDefenseDecreasePercent: number;
  magicalDefenseDecreasePercent: number;
}

export interface DiehardProfile {
  hpThresholdPercent: number;
  hpRecoveryPercent: number;
  physicalDefense: number;
  magicalDefense: number;
  hitRecovery: number;
  durationFrames: number;
}

export interface ThirstProfile {
  skillAttackPercent: number;
  critChancePercent: number;
  hpDrainPercentPerTick: number;
  durationFrames: number;
}

export interface BloodMemoryProfile {
  strengthPercent: number;
  attackSpeedPercent: number;
  moveSpeedPercent: number;
  castSpeedPercent: number;
  incomingDamageReductionPercent: number;
  durationFrames: number;
}

export interface VimAndVigorProfile {
  bleedDotDamage: number;
  bleedTickInterval: number;
  bleedDuration: number;
  maxHpPercent: number;
  moveSpeedPercent: number;
}

export interface FrenzyProfile {
  modifiers: Array<{ key: string; value: number }>;
}

export interface BuffProfiles {
  bloody_cross: BloodyCrossProfile;
  derange: DerangeProfile;
  diehard: DiehardProfile;
  thirst: ThirstProfile;
  blood_memory: BloodMemoryProfile;
  vim_and_vigor: VimAndVigorProfile;
  frenzy: FrenzyProfile;
}

export const BUFF_PROFILES: BuffProfiles = buffData.profiles as unknown as BuffProfiles;
