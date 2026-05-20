import type { Actor, Buff, BuffType } from "../types.js";
import { CombatEventBus, CombatEventPriority } from "../events/CombatEventBus.js";
import { nextId } from "../util/ids.js";
import { BUFF_PROFILES } from "../../data/manifest/buffs.js";

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
      if (tick % 60 === 0 && actor.resources.hp > 1) { const drain = Math.max(1, Math.floor(actor.resources.maxHp * BUFF_PROFILES.thirst.hpDrainPercentPerTick / 100)); actor.resources.hp = Math.max(1, actor.resources.hp - drain); bus.emit("BuffTicked", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"thirst", hp:actor.resources.hp}, {targetActorId:actor.id}); }
    }
    if (actor.faction === "player") this.syncBloodyCross(actor, tick, bus);
    for (const b of [...actor.buffs]) if (b.expiresAtTick !== undefined && b.expiresAtTick <= tick) { actor.buffs = actor.buffs.filter(x=>x.id!==b.id); bus.emit("BuffExpired", CombatEventPriority.Buff, tick, {actorId:actor.id, type:b.type}, {targetActorId:actor.id}); }
  }
  deathCleanup(actor:Actor, tick:number, bus:CombatEventBus): void { const removed = actor.buffs.filter(b=>b.dispelPolicy!=="death_keep"); actor.buffs = actor.buffs.filter(b=>b.dispelPolicy==="death_keep"); if (removed.length) bus.emit("BuffDeathCleanup", CombatEventPriority.Buff, tick, {actorId:actor.id, removed:removed.map(b=>b.type)}, {targetActorId:actor.id}); }

  applyDerange(actor: Actor, tick: number, bus: CombatEventBus): Buff {
    return this.apply(actor, "derange", tick, bus);
  }

  canApplyDiehard(actor: Actor): boolean {
    return actor.resources.hp <= actor.resources.maxHp * BUFF_PROFILES.diehard.hpThresholdPercent;
  }

  applyDiehard(actor: Actor, tick: number, bus: CombatEventBus): Buff {
    const hpBefore = actor.resources.hp;
    const recovered = Math.max(1, Math.floor(actor.resources.maxHp * BUFF_PROFILES.diehard.hpRecoveryPercent));
    actor.resources.hp = Math.min(actor.resources.maxHp, actor.resources.hp + recovered);
    bus.emit("BuffTicked", CombatEventPriority.Buff, tick, {actorId:actor.id, type:"diehard", reason:"hp_recovery", recovered:actor.resources.hp-hpBefore, hp:actor.resources.hp}, {targetActorId:actor.id});
    return this.apply(actor, "diehard", tick, bus, BUFF_PROFILES.diehard.durationFrames);
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
    if (hpRatio <= BUFF_PROFILES.bloody_cross.stages[2].hpPercentAtOrBelow) return 3;
    if (hpRatio <= BUFF_PROFILES.bloody_cross.stages[1].hpPercentAtOrBelow) return 2;
    if (hpRatio <= BUFF_PROFILES.bloody_cross.stages[0].hpPercentAtOrBelow) return 1;
    return 0;
  }

  private modifiersFor(type: BuffType, bloodyCrossStage: number): Array<{key:string; value:number}> {
    if (type === "frenzy") return BUFF_PROFILES.frenzy.modifiers.map(modifier => ({ ...modifier }));
    if (type === "bloody_cross") {
      const bc = BUFF_PROFILES.bloody_cross;
      const modifiers = [
        { key: "bloody_cross_skill_attack", value: bc.skillAttackMultiplier },
        { key: "bloody_cross_base_attack_speed_percent", value: bc.baseAttackSpeedPercent },
        { key: "bloody_cross_base_move_speed_percent", value: bc.baseMoveSpeedPercent },
        { key: "bloody_cross_stage", value: bloodyCrossStage },
      ];
      if (bloodyCrossStage > 0) {
        const stage = bc.stages[bloodyCrossStage - 1]!;
        modifiers.push(
          { key: "bloody_cross_hp_threshold_percent", value: stage.hpPercentAtOrBelow * 100 },
          { key: "bloody_cross_attack_speed_percent", value: stage.attackSpeedPercent },
          { key: "bloody_cross_move_speed_percent", value: stage.moveSpeedPercent },
          { key: "bloody_cross_evasion_percent", value: stage.evasionPercent },
        );
      }
      return modifiers;
    }
    if (type === "derange") {
      const d = BUFF_PROFILES.derange;
      return [
        { key: "derange_skill_attack", value: d.skillAttackMultiplier },
        { key: "derange_move_speed_percent", value: d.moveSpeedPercent },
        { key: "derange_attack_speed_percent", value: d.attackSpeedPercent },
        { key: "derange_abnormal_resistance_percent", value: d.abnormalResistancePercent },
        { key: "derange_hit_recovery_percent", value: d.hitRecoveryPercent },
        { key: "derange_hitstun_increase_percent", value: d.hitstunIncreasePercent },
        { key: "derange_recoil_reduction_percent", value: d.recoilReductionPercent },
        { key: "derange_intelligence_decrease", value: d.intelligenceDecrease },
        { key: "derange_physical_defense_decrease_percent", value: d.physicalDefenseDecreasePercent },
        { key: "derange_magical_defense_decrease_percent", value: d.magicalDefenseDecreasePercent },
      ];
    }
    if (type === "diehard") {
      const dh = BUFF_PROFILES.diehard;
      return [
        { key: "diehard_hp_threshold_percent", value: dh.hpThresholdPercent * 100 },
        { key: "diehard_hp_recovery_percent", value: dh.hpRecoveryPercent * 100 },
        { key: "diehard_physical_defense", value: dh.physicalDefense },
        { key: "diehard_magical_defense", value: dh.magicalDefense },
        { key: "diehard_hit_recovery", value: dh.hitRecovery },
        { key: "diehard_duration_frames", value: dh.durationFrames },
      ];
    }
    if (type === "thirst") {
      const t = BUFF_PROFILES.thirst;
      return [
        { key: "thirst_skill_attack_percent", value: t.skillAttackPercent },
        { key: "thirst_crit_chance_percent", value: t.critChancePercent },
        { key: "thirst_hp_drain_percent_per_tick", value: t.hpDrainPercentPerTick },
        { key: "thirst_duration_frames", value: t.durationFrames },
      ];
    }
    if (type === "blood_memory") {
      const bm = BUFF_PROFILES.blood_memory;
      return [
        { key: "blood_memory_strength_percent", value: bm.strengthPercent },
        { key: "blood_memory_attack_speed_percent", value: bm.attackSpeedPercent },
        { key: "blood_memory_move_speed_percent", value: bm.moveSpeedPercent },
        { key: "blood_memory_cast_speed_percent", value: bm.castSpeedPercent },
        { key: "blood_memory_incoming_damage_reduction_percent", value: bm.incomingDamageReductionPercent },
        { key: "blood_memory_duration_frames", value: bm.durationFrames },
      ];
    }
    if (type === "vim_and_vigor") {
      const vv = BUFF_PROFILES.vim_and_vigor;
      return [
        { key: "vim_and_vigor_bleed_dot_damage", value: vv.bleedDotDamage },
        { key: "vim_and_vigor_bleed_tick_interval", value: vv.bleedTickInterval },
        { key: "vim_and_vigor_bleed_duration", value: vv.bleedDuration },
        { key: "vim_and_vigor_max_hp_percent", value: vv.maxHpPercent },
        { key: "vim_and_vigor_move_speed_percent", value: vv.moveSpeedPercent },
      ];
    }
    return [];
  }
}
