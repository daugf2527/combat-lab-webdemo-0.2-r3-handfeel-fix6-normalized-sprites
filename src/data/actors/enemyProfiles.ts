import { ENEMY_PROFILES } from "../manifest/ai.js";

export const enemyProfiles = {
  grunt: { armor: ENEMY_PROFILES.grunt.armor, hp: ENEMY_PROFILES.grunt.hp },
  boss: { armor: ENEMY_PROFILES.boss.armor, hp: ENEMY_PROFILES.boss.hp },
  building: { armor: ENEMY_PROFILES.building.armor, hp: ENEMY_PROFILES.building.hp },
} as const;
