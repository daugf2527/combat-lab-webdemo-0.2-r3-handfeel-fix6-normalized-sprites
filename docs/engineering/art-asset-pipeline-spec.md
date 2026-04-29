# 碳影 (Carbon Shade) — 主角美术资源制作规范 v0.1

## 状态与版本

- **文档状态**: v0.1 Draft — 框架约束已锁定，AI 提示词待实测迭代
- **关联代码**: `src/game/SpriteFrameLibrary.ts`, `public/assets/sprites/normalized/sprite-normalization.json`
- **关联 spec**: `docs/engineering/combat-lab-0.2-r3-final-integrated-development-spec.md` (fix6 — normalized sprite pipeline)
- **最后更新**: 2026-04-29

---

## 1. 渲染管线约束 (不可变)

SpriteFrameLibrary 的规范化精灵管线对美术素材有严格的格式要求，任何生成的素材必须满足以下条件：

### 1.1 物理格式

- **一张 PNG 精灵表**，带透明通道（RGBA）
- **固定格子**: 所有帧统一尺寸，当前玩家规格 `448×432 px`
- **均匀网格**: 8 列 × N 行，格子之间无缝，无边框
- **帧索引**: 从 0 开始，左上角为第 0 帧，按行从左到右排列
- 最终精灵表尺寸 = `(8 × cellW) × (ceil(totalFrames/8) × cellH)`

### 1.2 运行时行为

- 使用 Phaser `setTexture(key, frame)` 按索引取帧
- **Clamp (不循环)**: 动作动画到达最后一帧后停留在该帧，不回卷到第 0 帧
- **循环动画**: idle/walk/run 按 tick 循环取帧
- 角色 Sprite 使用 `origin(0.5, 1)` — **脚必须踩在格子的底部中心**
- **禁止容器旋转**: 受击/倒地/浮空姿势来自动画帧本身，不通过旋转容器模拟
- 受击闪烁使用浅色调 tint，不是全白 fill

### 1.3 帧索引映射

帧索引决定代码中 `frames.xxx` 数组的值。素材导入后必须在 `SpriteFrameLibrary.ts` 的 `SHEETS` 对象中注册。

帧顺序规则:
- 索引从 0 开始
- 同一动画的帧必须**连续排列**
- 动画顺序按代码中的 `frames` 键顺序排列

---

## 2. 角色分层架构 (验证后的方案)

基于联网查证的 DFO 实际做法，采用**三层纸娃娃叠加系统**：

### 2.1 图层定义 (从底到顶)

```
层 0 (底): 全身角色基础精灵 (body_sheet.png)
           — 完整的角色身体动画，不含武器、不含时装
           — 一张精灵表，覆盖所有动画状态

层 1 (中): 时装/盔甲覆盖层 (costume_sheet.png)
           — 覆盖在身体之上的装备外观
           — 与身体层共用完全相同的帧索引
           — 可替换，换时装只换这一层

层 2 (顶): 武器覆盖层 (weapon_sheet.png)
           — 武器独立精灵
           — 与身体层共用完全相同的帧索引
           — 可替换，换武器只换这一层
```

### 2.2 关键约束

- **所有层的帧索引必须一一对应**: body 的第 N 帧 = costume 的第 N 帧 = weapon 的第 N 帧
- 渲染时一帧内取所有层的同一个 frameIndex: `setTexture("body", N)` + `setTexture("costume", N)` + `setTexture("weapon", N)`
- **身体是全身，不拆头/躯干/四肢** — DFO 实际做法如此，不是分部位渲染

### 2.3 与分部位方案的差异说明

联网查证结论:
- DFO **没有**把头/躯干/手臂/腿拆成独立精灵表分别渲染
- DFO 的角色基底是**完整身体精灵**，装备/武器是叠加层
- 分部位方案（head/torso/arms/legs 独立精灵表）比 DFO 实际方案更细，且增加不必要的复杂度
- 如果未来需要换部位装备（如单独换头盔、单独换护腕），可以在 costume 层中再细分，但对于当前 Demo 阶段不需要

---

## 3. 主角动画清单

共 **25 组动画**，按帧索引顺序排列：

### 3.1 移动类 (循环动画)

| 动画键 | 帧数 | 说明 |
|---|---|---|
| `idle` | 6 | 站立呼吸循环，持武待机 |
| `walk` | 8 | 前向行走，步伐沉稳 |
| `walk_back` | 8 | 后向行走 (面向不变，身体后移) |
| `run` | 8 | 冲刺奔跑，上身压低 |
| `jump_rise` | 4 | 蹬地起跳，身体上升 |
| `jump_fall` | 4 | 从最高点落回地面 |
| `backstep` | 4 | 快速向后闪避小跳 |

### 3.2 普攻连段 (一次性播放，clamp)

| 动画键 | 帧数 | 说明 |
|---|---|---|
| `attack1` | 4 | 横斩起手 |
| `attack2` | 5 | 反手回旋斩 |
| `attack3` | 7 | 终结重击/下劈 |
| `jump_attack` | 4 | 空中向下挥砍 |
| `dash_attack` | 5 | 奔跑中突进斩击 |

### 3.3 职业技能 (一次性播放，clamp)

| 动画键 | 帧数 | 说明 |
|---|---|---|
| `upward_slash` | 6 | 上挑/浮空技 — DNF 标志性技能 |
| `heavy_slam` | 8 | 下砸/冲击波 |
| `aoe_burst` | 10 | 范围爆发，蓄力→冲击 |
| `grab` | 8 | 抓取技 (如噬魂之手) |

### 3.4 受击反应 (一次性播放，clamp)

| 动画键 | 帧数 | 说明 |
|---|---|---|
| `hurt_light` | 4 | 轻微后仰 |
| `hurt_heavy` | 5 | 大幅后弹 |
| `knockback` | 5 | 击退滑行 |
| `launch` | 4 | 被打浮空上升 |
| `air_hit` | 3 | 空中追打 |
| `fall` | 4 | 坠落着地 |
| `knockdown` | 5 | 失去平衡→倒地 |
| `wakeup` | 5 | 起身 (带短暂霸体帧) |

### 3.5 死亡

| 动画键 | 帧数 | 说明 |
|---|---|---|
| `death` | 8 | 致命一击→跪地→倒地→消散 |

### 3.6 汇总

| 类别 | 动画数 | 总帧数 |
|---|---|---|
| 移动 | 7 | ~42 |
| 普攻 | 5 | ~25 |
| 技能 | 4 | ~32 |
| 受击 | 8 | ~35 |
| 死亡 | 1 | ~8 |
| **合计** | **25** | **~142 帧** |

---

## 4. GPT Image-2 生成工作流

### 4.1 前提

- GPT Image-2 是 OpenAI 的 4o 图像生成模型 (2026年4月发布)，支持通过 ChatGPT 或 API 调用
- 最佳实践: **参考图驱动 + 逐动画生成 + 后处理拼合**
- 角色一致性通过 reference image + 同一 seed 维持
- 透明背景不可直接生成 → 使用绿幕背景 (#00FF00) 后期去除

### 4.2 生成步骤

#### 步骤 1: 生成 Anchor Frame (角色锚图)

```
A single game sprite frame of a muscular male berserker warrior in DNF
fighting game art style. 2.5D side-scrolling perspective, facing right.
Blood-red armor with black accents, spiky dark hair, armored gauntlets
and shoulder guards, wielding a massive greatsword.
Clean bold outlines, cel-shaded flat coloring, no gradients.
Heroic but aggressive expression, dynamic combat stance.
The character's feet must touch the BOTTOM EDGE of the canvas.
Character fills 75% of canvas height, centered horizontally.
Exact canvas: 448 pixels wide × 432 pixels tall.
Solid #00FF00 green background.
--ar 1:1
```

生成 4 张，选最满意的一张作为 **Anchor Frame**，记下 seed。

#### 步骤 2: 逐动画生成精灵条

每条提示词必须包含:
- `[Upload Anchor Frame as reference]` — 锚定角色外观
- 每格精确 `448×432` — 格子尺寸严格一致
- **脚踩底线** — 所有帧的脚在格子底部同一位置
- 绿幕背景 `#00FF00` — 方便后期一键去背
- Clamp 行为 — 动作动画最后一帧就是结束帧
- 总像素大小 = `(帧数 × 448) × 432` — 水平排列

**Idle 待机 (6帧)**:
```
[Upload Anchor Frame as reference]
Same character, same style. 6-frame horizontal sprite strip for idle
breathing animation. Each frame exactly 448×432 pixels. Character's feet
touching the bottom edge of every frame at identical position.
Frame sequence: neutral stance → slight inhale with weight shift forward →
peak inhale with chest expanded → beginning exhale → weight settles back →
return to neutral. Solid #00FF00 green background.
Total image: 2688×432 pixels (6 frames × 448px).
```

**Walk 行走 (8帧)**:
```
[Upload Anchor Frame as reference]
Same character. 8-frame horizontal walk cycle sprite strip. 448×432
per cell, feet anchored to bottom edge. Full stride: right foot forward →
weight transfer → left foot lifts → left foot forward → weight transfer →
right foot lifts → right foot forward → return. Greatsword on shoulder.
Solid #00FF00 background. Total: 3584×432 pixels (8 frames × 448px).
```

**Run 奔跑 (8帧)**:
```
[Upload Anchor Frame as reference]
Same character. 8-frame horizontal run cycle. 448×432 per cell, feet on
bottom. Body leaning forward aggressively, greatsword held horizontally
at waist behind back. Hair and cape streaming backward. Alternating foot
contacts with brief airborne moment. Solid #00FF00 background.
Total: 3584×432 pixels.
```

**Attack1 普攻一段 (4帧)**:
```
[Upload Anchor Frame as reference]
Same character. 4-frame horizontal attack strip. 448×432 per cell, feet
anchored. Horizontal greatsword slash right-to-left. Frame 1: wind-up,
blade pulled back. Frame 2: swing in wide arc. Frame 3: impact moment,
blade fully extended left. Frame 4: brief follow-through (CLAMP — this is
the final held frame, do not loop). Solid #00FF00 background.
Total: 1792×432 pixels.
```

**Attack2 普攻二段 (5帧)**:
```
[Upload Anchor Frame as reference]
Same character. 5-frame second combo attack strip. 448×432 per cell,
feet anchored. Reverse spin slash: twist torso → 360° spin with blade
extended → blade reaches opposite side → recovery → settling into stance.
CLAMP at final frame. Solid #00FF00 background. Total: 2240×432 pixels.
```

**Attack3 普攻三段 (7帧)**:
```
[Upload Anchor Frame as reference]
Same character. 7-frame overhead slam finisher. 448×432 per cell, feet
anchored. Greatsword raised high over head with both hands → sword at peak
with red energy aura → downward swing with explosive motion → ground
impact with shockwave → crouched recovery → pulling sword free → ready
stance. CLAMP at final frame. Solid #00FF00 background.
Total: 3136×432 pixels.
```

**UpwardSlash 上挑 (6帧)**:
```
[Upload Anchor Frame as reference]
Same character. 6-frame upward slash launching attack. 448×432 per cell,
feet anchored. Crouch wind-up → explosive upward swing low-to-high → blade
trails red energy → target-launching follow-through → brief hold at apex →
recovery. CLAMP at final frame. Solid #00FF00 background.
Total: 2688×432 pixels.
```

**Backstep 后跳 (4帧)**:
```
[Upload Anchor Frame as reference]
Same character. 4-frame backward dodge. 448×432 per cell. Quick backward
hop: crouch → push off → airborne backward → landing crouch. Character
moves backward but feet stay on bottom edge of each cell.
CLAMP. Solid #00FF00 background. Total: 1792×432 pixels.
```

**Hurt 受击 (4帧)**:
```
[Upload Anchor Frame as reference]
Same character. 4-frame hurt reaction. 448×432 per cell, feet anchored.
Heavy hit to torso: impact jolt → upper body recoiling backward → arms
flung outward → brief stagger recovery. CLAMP at final frame.
Solid #00FF00 background. Total: 1792×432 pixels.
```

**Knockdown 倒地 (5帧)**:
```
[Upload Anchor Frame as reference]
Same character. 5-frame knockdown sequence. 448×432 per cell. Character
falls to ground: losing balance → knees buckling → hitting ground → lying
on back → still on ground. Ground contact point stays at BOTTOM of cell.
CLAMP. Solid #00FF00 background. Total: 2240×432 pixels.
```

**Wakeup 起身 (5帧)**:
```
[Upload Anchor Frame as reference]
Same character. 5-frame get-up sequence. 448×432 per cell. Getting up
from ground: push up on hands → roll to kneeling → one foot planted →
standing up → back to idle-ready stance. Feet end on bottom edge.
CLAMP. Solid #00FF00 background. Total: 2240×432 pixels.
```

**Death 死亡 (8帧)**:
```
[Upload Anchor Frame as reference]
Same character. 8-frame death sequence. 448×432 per cell. Fatal blow →
knees buckling → collapsing forward → sword falling from grip → fully prone
on ground → brief stillness → body dissolving into particles → fully faded.
Ground contact stays on bottom edge. CLAMP.
Solid #00FF00 background. Total: 3584×432 pixels.
```

**其余动画 (walk_back, jump_rise, jump_fall, jump_attack, dash_attack, heavy_slam, aoe_burst, grab, hurt_heavy, knockback, launch, air_hit, fall)**:
将对应的动作描述替换到上述模板中，帧数和总像素对应调整即可。

#### 步骤 3: 后处理

1. **去背**: 在 PS/GIMP/Aseprite 中使用色彩选择工具选中 #00FF00 → 删除 → 保存为 PNG (RGBA)
2. **裁剪**: 确保每帧精确裁剪到 `448×432`
3. **拼合**: 按帧索引顺序拼入 8 列 × N 行的统一精灵表
4. **武器/时装层**: 重复步骤 1-3，单独生成各层的精灵表

#### 步骤 4: 项目集成

1. 将精灵表 PNG 放入 `public/assets/sprites/normalized/`
2. 更新 `sprite-normalization.json` 中的 size、sheet、cellW、cellH
3. 在 `SpriteFrameLibrary.ts` 中注册新的 sheet spec 和 frame 数组
4. 如果引入多层渲染，修改 `getCombatSpriteSpec()` 返回多个 `SpriteSpec`

---

## 5. 注意事项

### 5.1 AI 生成的局限性

- **角色一致性**: 同一 seed + reference image 可以维持风格统一，但逐帧之间可能仍有微小偏差，需手动微调
- **透明背景**: GPT Image-2 不支持直接生成透明 PNG，必须用绿幕 + 后处理
- **过于复杂的动作**: 超过 10 帧的动作可能导致后半段角色变形，建议拆分生成再拼合

### 5.2 精灵表性能

- 当前玩家精灵表 3584×3888 px ≈ 56 MB (RGBA)，Phaser 解码时会有短暂加载尖峰
- 如果升级到 142 帧 (8 cols × 18 rows = 3584×7776 ≈ 112 MB)，建议评估加载性能
- 可考虑按动画类别拆分为多张精灵表 (movement_sheet, attack_sheet, reaction_sheet)，用 Phaser 多纹理管理

### 5.3 脚底锚点验证

导入后必须在游戏中验证: 所有动画帧的角色脚部都在同一像素行上。偏差超过 2px 就会在游戏中表现为角色抖动。

### 5.4 源素材政策

遵循 `docs/design/source-policy.md`: 仅使用原始创作和 AI 生成素材，不使用 DNF/DFO 客户端素材、泄露代码或官方资产。

---

## 6. 参考链接

- OpenAI Community: [Developing sprite sheets with gpt-image-2](https://community.openai.com/t/developing-sprite-sheets-with-gpt-image-2/1379831)
- GitHub: [awesome-gpt-image-2](https://github.com/YouMind-OpenLab/awesome-gpt-image-2) — 2000+ 精选提示词库
- Fal.ai: [GPT Image 2 Prompting Guide](https://fal.ai/learn/tools/prompting-gpt-image-2)
- Scenario.com: [AI Sprite Generator for 2D Games](https://www.scenario.com/blog/ai-sprite-generator)
- DFO World Wiki: [Category:Class Sprites](https://wiki.dfo.world/view/Category:Class_Sprites)

---

## 附录 A: 动画清单速查表

| 索引 | 动画键 | 帧数 | 类型 | 总像素 (W×H) |
|---|---|---|---|---|
| 0 | idle | 6 | loop | 2688×432 |
| 1 | walk | 8 | loop | 3584×432 |
| 2 | walk_back | 8 | loop | 3584×432 |
| 3 | run | 8 | loop | 3584×432 |
| 4 | jump_rise | 4 | loop | 1792×432 |
| 5 | jump_fall | 4 | loop | 1792×432 |
| 6 | backstep | 4 | action | 1792×432 |
| 7 | attack1 | 4 | action | 1792×432 |
| 8 | attack2 | 5 | action | 2240×432 |
| 9 | attack3 | 7 | action | 3136×432 |
| 10 | jump_attack | 4 | action | 1792×432 |
| 11 | dash_attack | 5 | action | 2240×432 |
| 12 | upward_slash | 6 | action | 2688×432 |
| 13 | heavy_slam | 8 | action | 3584×432 |
| 14 | aoe_burst | 10 | action | 4480×432 |
| 15 | grab | 8 | action | 3584×432 |
| 16 | hurt_light | 4 | action | 1792×432 |
| 17 | hurt_heavy | 5 | action | 2240×432 |
| 18 | knockback | 5 | action | 2240×432 |
| 19 | launch | 4 | action | 1792×432 |
| 20 | air_hit | 3 | action | 1344×432 |
| 21 | fall | 4 | action | 1792×432 |
| 22 | knockdown | 5 | action | 2240×432 |
| 23 | wakeup | 5 | action | 2240×432 |
| 24 | death | 8 | action | 3584×432 |

## 附录 B: GPT Image-2 提示词模板

```
[Upload Anchor Frame as reference]
Same character, same style. {FRAME_COUNT}-frame horizontal sprite strip
for {ANIMATION_NAME} animation. Each frame exactly 448×432 pixels.
Character's feet touching the bottom edge of every frame at identical
position. {FRAME_BY_FRAME_DESCRIPTION}. {CLAMP_OR_LOOP}.
Solid #00FF00 green background. Total: {TOTAL_WIDTH}×432 pixels
({FRAME_COUNT} frames × 448px).
```

- `{ANIMATION_NAME}`: 动画名称
- `{FRAME_COUNT}`: 帧数
- `{FRAME_BY_FRAME_DESCRIPTION}`: 逐帧描述 (参见第 4 节各动画的具体提示词)
- `{CLAMP_OR_LOOP}`: action 动画用 "CLAMP at final frame — do not loop"，loop 动画用 "Seamless loop — frame N should connect smoothly back to frame 1"
- `{TOTAL_WIDTH}`: 帧数 × 448
