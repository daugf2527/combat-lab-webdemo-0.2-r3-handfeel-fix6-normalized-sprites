import type { Actor, Buff, BuffType } from "../types.js";
import { CombatEventBus, CombatEventPriority } from "../events/CombatEventBus.js";
import { nextId } from "../util/ids.js";

const BLOODY_CROSS_LEVEL1 = {
  skillAttackMultiplier: 1.287,
  baseAttackSpeedPercent: 5.5,
  baseMoveSpeedPercent: 5.5,
  stages: [
    { hpPercentAtOrBelow: 0.70, attackSpeedPercent: 11.2, moveSpeedPercent: 11.2, evasionPercent: 0.5 },
    { hpPercentAtOrBelow: 0.60, attackSpeedPercent: 11.6, moveSpeedPercent: 11.6, evasionPercent: 2.7 },
    { hpPercentAtOrBelow: 0.50, attackSpeedPercent: 12.0, moveSpeedPercent: 12.0, evasionPercent: 4.5 },
  ],
} as const;

const DERANGE_LEVEL1 = {
  skillAttackMultiplier: 1.34,
  moveSpeedPercent: 21,
  attackSpeedPercent: 21,
  abnormalResistancePercent: 100,
  hitRecoveryPercent: 105,
  hitstunIncreasePercent: 5,
  recoilReductionPercent: 5,
  intelligenceDecrease: 1000,
  physicalDefenseDecreasePercent: 50,
  magicalDefenseDecreasePercent: 50,
} as const;

const DIEHARD_LEVEL1 = {
  hpThresholdPercent: 0.50,
  hpRecoveryPercent: 0.20,
  physicalDefense: 8382,
  magicalDefense: 8382,
  hitRecovery: 373,
  durationFrames: Math.round(31 * 60),
} as const;

const THIRST_LEVEL1 = {
  skillAttackPercent: 20,
  critChancePercent: 10,
  hpDrainPercentPerTick: 0.3,
  durationFrames: Math.round(30 * 60),
} as const;

const BLOOD_MEMORY_LEVEL1 = {
  strengthPercent: 15,
  attackSpeedPercent: 10,
  moveSpeedPercent: 10,
  castSpeedPercent: 10,
  incomingDamageReductionPercent: 15,
  durationFrames: Math.round(20 * 60),
} as const;

const VIM_AND_VIGOR_LEVEL1 = {
  bleedDotDamage: 14,
  bleedTickInterval: 30,
  bleedDuration: 420,
  maxHpPercent: 5,
  moveSpeedPercent: 3,
} as const;

const frenzyModifiers = [
  { key: "hp_activation_cost_percent", value: 0.02 },
  { key: "hp_upkeep_percent_per_second", value: 0.005 },
  { key: "berserker_skill_attack", value: 1.10 },
  { key: "berserker_cooldown_reduction", value: 0.10 },
  { key: "hit_recovery_received_stun_multiplier", value: 0.80 },
];

export class BuffLifecycleSystem {
  apply(actor: Actor, type: BuffType, tick: number, bus: CombatEventBus, duration?: number): Buff {
    bus.emit("BuffApplyRequested", CombatEventPriority.Buff, tick, {actorId:actor.id, type}, {targetActorId:actor.id});
    const existing = actor.buffs.find(b=>b.type===type);
    const modifiers = this.modifiersFor(type, 0);
    if (existing) {
      existing.expiresAtTick = duration ? tick+duration : existing.expiresAtTick;
      existing.modifiers = modifiers;
      bus.emit("BuffRefreshed", CombatEventPriority.Buff, tick, {actorId:actor.id, type, modifiers:existing.modifiers}, {targetActorId:actor.id});
      return existing;
    }
    const buff: Buff = { id:nextId("buff"), type, ownerId:actor.id, appliedAtTick:tick, expiresAtTick:duration ? tick+duration : undefined, stacks:1, maxStacks:type==="bloody_cross"?3:1, refreshPolicy:"refresh_duration", dispelPolicy:type==="frenzy"?"death_clear":"dispellable", modifiers };
    actor.buffs.push(buff);
    if (type === "frenzy") this.payFrenzyActivationCost(actor, tick, bus, buff);
    bus.emit("BuffApplied", CombatEventPriority.Buff, tick, {actorId:actor.id, type, buffId:buff.id, modifiers:buff.modifiers}, {targetActorId:actor.id}); return buff;
  }
  remove(actor:Actor, type:BuffType, tick:number, bus:CombatEventBus): void { actor.buffs = actor.buffs.filter(b=>b.type!==type); bus.emit("BuffDispelled", CombatEventPriority.Buff, tick, {actorId:actor.id, type}, {targetActorId:actor.id}); }
  tick(actor: Actor, tick: number, bus: CombatEventBus, frozen: boolean): void {
    if (frozen) return;
    if (actor.buffs.some(b=>b.type==="frenzy")) {
      if (tick % 60 === 0 && actor.resources.hp > 1) { actor.resources.hp = Math.max(1, actor.resources.hp - Math.max(1, Math.floor(actor.resources.maxHp * 0.005))); bus.emit("BuffTicked", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"frenzy", hp:actor.resources.hp}, {targetActorId:actor.id}); }
    }
    if (actor.buffs.some(b=>b.type==="thirst")) {
      if (tick % 60 === 0 && actor.resources.hp > 1) { const drain = Math.max(1, Math.floor(actor.resources.maxHp * THIRST_LEVEL1.hpDrainPercentPerTick / 100)); actor.resources.hp = Math.max(1, actor.resources.hp - drain); bus.emit("BuffTicked", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"thirst", hp:actor.resources.hp}, {targetActorId:actor.id}); }
    }
    if (actor.faction === "player") this.syncBloodyCross(actor, tick, bus);
    for (const b of [...actor.buffs]) if (b.expiresAtTick !== undefined && b.expiresAtTick <= tick) { actor.buffs = actor.buffs.filter(x=>x.id!==b.id); bus.emit("BuffExpired", CombatEventPriority.Buff, tick, {actorId:actor.id, type:b.type}, {targetActorId:actor.id}); }
  }
  deathCleanup(actor:Actor, tick:number, bus:CombatEventBus): void { const removed = actor.buffs.filter(b=>b.dispelPolicy!=="death_keep"); actor.buffs = actor.buffs.filter(b=>b.dispelPolicy==="death_keep"); if (removed.length) bus.emit("BuffDeathCleanup", CombatEventPriority.Buff, tick, {actorId:actor.id, removed:removed.map(b=>b.type)}, {targetActorId:actor.id}); }

  applyDerange(actor: Actor, tick: number, bus: CombatEventBus): Buff {
    return this.apply(actor, "derange", tick, bus);
  }

  canApplyDiehard(actor: Actor): boolean {
    return actor.resources.hp <= actor.resources.maxHp * DIEHARD_LEVEL1.hpThresholdPercent;
  }

  applyDiehard(actor: Actor, tick: number, bus: CombatEventBus): Buff {
    const hpBefore = actor.resources.hp;
    const recovered = Math.max(1, Math.floor(actor.resources.maxHp * DIEHARD_LEVEL1.hpRecoveryPercent));
    actor.resources.hp = Math.min(actor.resources.maxHp, actor.resources.hp + recovered);
    bus.emit("BuffTicked", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"diehard", reason:"hp_recovery", recovered:actor.resources.hp-hpBefore, hp:actor.resources.hp}, {targetActorId:actor.id});
    return this.apply(actor, "diehard", tick, bus, DIEHARD_LEVEL1.durationFrames);
  }

  private payFrenzyActivationCost(actor: Actor, tick: number, bus: CombatEventBus, buff: Buff): void {
    const percent = buff.modifiers.find(modifier => modifier.key === "hp_activation_cost_percent")?.value ?? 0;
    if (percent <= 0 || actor.resources.hp <= 1) return;
    const hpBefore = actor.resources.hp;
    const cost = Math.max(1, Math.floor(actor.resources.maxHp * percent));
    actor.resources.hp = Math.max(1, actor.resources.hp - cost);
    bus.emit("BuffTicked", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"frenzy", reason:"activation_cost", cost:hpBefore-actor.resources.hp, hp:actor.resources.hp}, {targetActorId:actor.id});
  }

  private syncBloodyCross(actor: Actor, tick: number, bus: CombatEventBus): void {
    const hpRatio = actor.resources.maxHp > 0 ? actor.resources.hp / actor.resources.maxHp : 1;
    const stage = this.bloodyCrossStage(hpRatio);
    const existing = actor.buffs.find(b => b.type === "bloody_cross");
    if (!existing) {
      const buff = this.apply(actor, "bloody_cross", tick, bus);
      buff.stacks = stage;
      buff.modifiers = this.modifiersFor("bloody_cross", stage);
      return;
    }
    if (existing.stacks === stage) return;
    existing.stacks = stage;
    existing.modifiers = this.modifiersFor("bloody_cross", stage);
    bus.emit("BuffRefreshed", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"bloody_cross", stage, modifiers:existing.modifiers}, {targetActorId:actor.id});
  }

  private bloodyCrossStage(hpRatio: number): number {
    if (hpRatio <= BLOODY_CROSS_LEVEL1.stages[2].hpPercentAtOrBelow) return 3;
    if (hpRatio <= BLOODY_CROSS_LEVEL1.stages[1].hpPercentAtOrBelow) return 2;
    if (hpRatio <= BLOODY_CROSS_LEVEL1.stages[0].hpPercentAtOrBelow) return 1;
    return 0;
  }

  private modifiersFor(type: BuffType, bloodyCrossStage: number): Array<{key:string; value:number}> {
    if (type === "frenzy") return frenzyModifiers.map(modifier => ({ ...modifier }));
    if (type === "bloody_cross") {
      const modifiers = [
        { key: "bloody_cross_skill_attack", value: BLOODY_CROSS_LEVEL1.skillAttackMultiplier },
        { key: "bloody_cross_base_attack_speed_percent", value: BLOODY_CROSS_LEVEL1.baseAttackSpeedPercent },
        { key: "bloody_cross_base_move_speed_percent", value: BLOODY_CROSS_LEVEL1.baseMoveSpeedPercent },
        { key: "bloody_cross_stage", value: bloodyCrossStage },
      ];
      if (bloodyCrossStage > 0) {
        const stage = BLOODY_CROSS_LEVEL1.stages[bloodyCrossStage - 1]!;
        modifiers.push(
          { key: "bloody_cross_hp_threshold_percent", value: stage.hpPercentAtOrBelow * 100 },
          { key: "bloody_cross_attack_speed_percent", value: stage.attackSpeedPercent },
          { key: "bloody_cross_move_speed_percent", value: stage.moveSpeedPercent },
          { key: "bloody_cross_evasion_percent", value: stage.evasionPercent },
        );
      }
      return modifiers;
    }
    if (type === "derange") return [
      { key: "derange_skill_attack", value: DERANGE_LEVEL1.skillAttackMultiplier },
      { key: "derange_move_speed_percent", value: DERANGE_LEVEL1.moveSpeedPercent },
      { key: "derange_attack_speed_percent", value: DERANGE_LEVEL1.attackSpeedPercent },
      { key: "derange_abnormal_resistance_percent", value: DERANGE_LEVEL1.abnormalResistancePercent },
      { key: "derange_hit_recovery_percent", value: DERANGE_LEVEL1.hitRecoveryPercent },
      { key: "derange_hitstun_increase_percent", value: DERANGE_LEVEL1.hitstunIncreasePercent },
      { key: "derange_recoil_reduction_percent", value: DERANGE_LEVEL1.recoilReductionPercent },
      { key: "derange_intelligence_decrease", value: DERANGE_LEVEL1.intelligenceDecrease },
      { key: "derange_physical_defense_decrease_percent", value: DERANGE_LEVEL1.physicalDefenseDecreasePercent },
      { key: "derange_magical_defense_decrease_percent", value: DERANGE_LEVEL1.magicalDefenseDecreasePercent },
    ];
    if (type === "diehard") return [
      { key: "diehard_hp_threshold_percent", value: DIEHARD_LEVEL1.hpThresholdPercent * 100 },
      { key: "diehard_hp_recovery_percent", value: DIEHARD_LEVEL1.hpRecoveryPercent * 100 },
      { key: "diehard_physical_defense", value: DIEHARD_LEVEL1.physicalDefense },
      { key: "diehard_magical_defense", value: DIEHARD_LEVEL1.magicalDefense },
      { key: "diehard_hit_recovery", value: DIEHARD_LEVEL1.hitRecovery },
      { key: "diehard_duration_frames", value: DIEHARD_LEVEL1.durationFrames },
    ];
    if (type === "thirst") return [
      { key: "thirst_skill_attack_percent", value: THIRST_LEVEL1.skillAttackPercent },
      { key: "thirst_crit_chance_percent", value: THIRST_LEVEL1.critChancePercent },
      { key: "thirst_hp_drain_percent_per_tick", value: THIRST_LEVEL1.hpDrainPercentPerTick },
      { key: "thirst_duration_frames", value: THIRST_LEVEL1.durationFrames },
    ];
    if (type === "blood_memory") return [
      { key: "blood_memory_strength_percent", value: BLOOD_MEMORY_LEVEL1.strengthPercent },
      { key: "blood_memory_attack_speed_percent", value: BLOOD_MEMORY_LEVEL1.attackSpeedPercent },
      { key: "blood_memory_move_speed_percent", value: BLOOD_MEMORY_LEVEL1.moveSpeedPercent },
      { key: "blood_memory_cast_speed_percent", value: BLOOD_MEMORY_LEVEL1.castSpeedPercent },
      { key: "blood_memory_incoming_damage_reduction_percent", value: BLOOD_MEMORY_LEVEL1.incomingDamageReductionPercent },
      { key: "blood_memory_duration_frames", value: BLOOD_MEMORY_LEVEL1.durationFrames },
    ];
    if (type === "vim_and_vigor") return [
      { key: "vim_and_vigor_bleed_dot_damage", value: VIM_AND_VIGOR_LEVEL1.bleedDotDamage },
      { key: "vim_and_vigor_bleed_tick_interval", value: VIM_AND_VIGOR_LEVEL1.bleedTickInterval },
      { key: "vim_and_vigor_bleed_duration", value: VIM_AND_VIGOR_LEVEL1.bleedDuration },
      { key: "vim_and_vigor_max_hp_percent", value: VIM_AND_VIGOR_LEVEL1.maxHpPercent },
      { key: "vim_and_vigor_move_speed_percent", value: VIM_AND_VIGOR_LEVEL1.moveSpeedPercent },
    ];
    return [];
  }
}
