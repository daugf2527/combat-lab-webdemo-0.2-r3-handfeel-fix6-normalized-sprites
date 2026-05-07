import type { BaseArmorType, Provenance } from "../../combat/types.js";

export type EnemyManifestId = "grunt" | "dummy" | "imp" | "boss" | "building";
export type EnemyManifestField =
  | "detectRange"
  | "attackRange"
  | "preAttackFrames"
  | "postCooldown"
  | "moveSpeedPerTick"
  | "loseAggroRange"
  | "hp"
  | "damage"
  | "armor";

export interface EnemyRuntimeProfile {
  id: EnemyManifestId;
  detectRange: number;
  attackRange: number;
  preAttackFrames: number;
  postCooldown: number;
  moveSpeedPerTick: number;
  loseAggroRange: number;
  hp: number;
  damage: number;
  armor: BaseArmorType;
  fieldProvenance: Partial<Record<EnemyManifestField, Provenance>>;
}

export interface EnemyManifest {
  manifestVersion: "enemy-manifest-v1";
  sourcePolicyVersion: string;
  profiles: Record<EnemyManifestId, EnemyRuntimeProfile>;
}
