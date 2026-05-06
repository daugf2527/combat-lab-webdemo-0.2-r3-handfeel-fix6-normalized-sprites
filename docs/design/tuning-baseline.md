# Tuning Baseline

All numbers are baseline tuning values:

- Simulation: 60 combat ticks per second.
- NormalBasic1 active frames: 5-8, total 20.
- NormalBasic2 active frames: 6-9, total 22.
- NormalBasic3 active frames: 8-13, total 31.
- UpwardSlash active frames: 7-11, total 27.
- UpwardSlash official API cooldown: 120 ticks (2s at 60 Hz).
- MountainousWheel official API cooldown: 240 ticks (4s at 60 Hz); level 1 MP cost: 17; downward attack hit count: 3.
- RagingFury: shockwave 10-13, blood pillar hits at 15,17,19,21,23,25,27,29,31,33.
- RagingFury official API cooldown: 780 ticks (13s at 60 Hz); level 1 MP cost: 142; blood eruption hit count: 10.
- Bloodlust: grab/discharge active 7-10; official API cooldown: 360 ticks (6s at 60 Hz); level 1 MP cost: 37.
- QuickRebound official API level 1 values: max hold 180 ticks (3s), release get-up armor 18 ticks (0.3s), cooldown 300 ticks (5s), MP cost 1.
- Backstep official API level 1 MP cost: 1; base skill has no cooldown.
- Bleed: DFO wiki baseline 180 tick duration, 30 tick interval, status DOT feedback only. Vim and Vigor level 1 API bleed uses 420 tick duration and 14 damage per stack when applied by eligible Berserker post-class skills.
- Poison: DFO wiki baseline 300 tick duration, 30 tick interval.
- Burn: DFO wiki baseline 300 tick duration, 30 tick interval, local splash radius 150.
- Shock: DFO wiki baseline 600 tick duration, 60 tick interval; triggered/split damage remains a future calibration item.
- Frenzy official API level 1 values now wired where represented: MP cost 10, cooldown 600 ticks (10s), supported cooldown reduction 10%; HP drain and bleeding-target kill restore remain local calibrated baseline until the full level table is modeled.
- Derange official API level 1 values now wired as buff modifiers: cooldown 300 ticks (5s), skill attack 34%, attack/move speed 21%, abnormal resistance 100%, hit recovery 105, hitstun +5%, recoil reduction 5%, INT -1000, physical/magic defense -50%.
- Diehard official API level 1 values now wired as a low-HP action: MP cost 40, cooldown 600 ticks (10s), usable at 50% HP or below, recovers 20% max HP, applies 31s defense/hit-recovery modifiers.
- BloodyCross official API level 1 values now wired as a passive buff: skill attack 28.7%, base attack/move speed 5.5%, low-HP stages at 70/60/50% with official speed/evasion values.
- GoreCross baseline: total 38 frames, 3-hit cross slash active at 8-11/14-17/20-23, level 1 MP cost 25, cooldown 360 ticks (6s), final hit launches.
- OutrageBreak baseline: total 52 frames, max hold 60 frames charge phase, slam active 32-38, level 1 MP cost 55, cooldown 480 ticks (8s), heavy knockdown.
- ExtremeOverkill baseline: total 48 frames, leap active 12-17 + shatter shockwave 18-26, level 1 MP cost 68, cooldown 600 ticks (10s), launch + AoE.
- RagingFury2 (2nd awakening) baseline: total 60 frames, shockwave 10-14 + 12 blood pillars at 15-37 (odd frames), level 1 MP cost 200, cube cost 2, cooldown 900 ticks (15s).
- BloodRuin baseline: total 40 frames cast, persistent field active 12-40, level 1 MP cost 45, cooldown 480 ticks (8s), multi-hit AoE dot field.
- BloodSword baseline: total 55 frames, sword sweep active 25-35, level 1 MP cost 90, cube cost 1, cooldown 720 ticks (12s), launch.
- BurstFury baseline: total 42 frames, stab active 10-13 + detonate 28-35, level 1 MP cost 40, cooldown 420 ticks (7s), heavy knockdown.
- EarthShatter baseline: total 35 frames, smash active 8-12 + traveling shockwave 18-25, level 1 MP cost 20, cooldown 180 ticks (3s).
- Thirst baseline: instant self-buff (1 frame), skill attack +20%, crit chance +10%, HP drain 0.3%/s, duration 30s, HP activation cost 10%, cooldown 600 ticks (10s).
- BloodMemory baseline: instant self-buff (1 frame), STR +15%, all speed +10%, incoming damage -15%, duration 20s, level 1 MP cost 50, cooldown 900 ticks (15s).
- VimAndVigor (passive): auto-applied on spawn, bleed DOT damage 14/tick, bleed duration 420 ticks, max HP +5%, move speed +3%.
- Damage formula: ratios 1/2/5/6 now wired through buff modifiers (frenzy/derange/bloody_cross/thirst skill attack, blood_memory strength); ratios 7/9 remain stubs pending equipment/jade systems.
