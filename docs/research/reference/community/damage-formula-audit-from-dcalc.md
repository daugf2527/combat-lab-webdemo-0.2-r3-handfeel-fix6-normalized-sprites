# DNF 伤害公式审计报告

> 来源: dnfcalc/dcalc 后端代码审计 (https://github.com/dnfcalc/dcalc)
> 审计文件: `backend/core/basic/character/calc_carry.py`, `backend/core/basic/character/base.py`, `backend/core/abstract/character.py`
> 日期: 2026-05-04

---

## 一、完整伤害公式结构

摘自 `calc_carry.py` 的 `calc_damage_ration()` 方法 (第11-47行):

```python
def calc_damage_ration(self, DSB: bool, BUFF: bool):
    """计算属性系数"""
    # 力智系数 (ratio_0)
    value0_1 = getattr(self, attrs[0])  # STR or INT
    value0_2 = 基础属性(self.角色, self.职业)[0]  # 基础STR或INT
    # 系统奶及奶系增幅
    value = value0_1 + ((value0_1 - value0_2) * 3.08 + 2886) * (1 if DSB else 0) + (170000 + 300000) * (1 if BUFF else 0)
    ratio_0 = value / 250 + 1

    # 物理/魔法/独立攻击力 (ratio_1)
    ratio_1 = getattr(self, attrs[1]) + 30000 * (1 if BUFF else 0)

    # 技能 物理/魔法/独立攻击力% (ratio_2)
    ratio_2 = getattr(self, attrs[2])

    # 属强系数 (ratio_3)
    ratio_3 = max(self.ElementDB.values()) * 0.0045 + 1.05

    # 暴击系数 (ratio_4)
    ratio_4 = 1.5

    # BUFF系数 (ratio_5)
    ratio_5 = self.buff

    # 技攻系数 (ratio_6)
    ratio_6 = self.SkillAttack * (self.jade_effect.SkillAttack + 1)

    # 攻击强化 (ratio_7)
    ratio_7 = 1 + self.Attack / 100 * (self.AttackP + self.jade_effect.AttackP)

    # 防御系数 (ratio_8) - 暂定145沙袋防御
    monster_defense = 81417275817
    ratio_8 = 1 - monster_defense / (monster_defense + 200 * 100)

    # 杂项 (ratio_9)
    ratio_9 = 1.0 * self.ElementIncrease

    return (ratio_0, ratio_1, ratio_2, ratio_3, ratio_4, ratio_5, ratio_6, ratio_7, ratio_8, ratio_9)
```

## 二、最终伤害计算公式

```
最终伤害 = 技能系数 * ratio_0 * ratio_1 * ratio_2 * ratio_3 * ratio_4 * ratio_5 * ratio_6 * ratio_7 * ratio_8 * ratio_9 / 1000
```

各系数展开:

```
1. 力智系数 = (力量或智力 + 系统奶增幅(+2886) + BUFF奶量(170000+300000)) / 250 + 1
2. 攻击力系数 = 物理/魔法/独立攻击力 + 30000(BUFF时)
3. 攻击力%系数 = 技能物理/魔法/独立攻击力%
4. 属强系数 = max(火/冰/光/暗属强) × 0.0045 + 1.05
5. 暴击系数 = 1.5
6. BUFF系数 = 角色buff值
7. 技攻系数 = 技能攻击力 × (1 + 玉技能攻击力)
8. 攻击强化 = 1 + 攻击强化值/100 × (攻击强化% + 玉攻击强化%)
9. 防御减伤 = 1 - 怪物防御 / (怪物防御 + 200 × 100)
10. 杂项 = 元素增伤(属性白字等)
```

### 关键常数

| 常数 | 值 | 说明 |
|---|---|---|
| 力智除数 | 250 | 每250力智翻倍基础攻击 |
| 属强系数 | 0.0045 | 每点属强增加0.45%伤害 |
| 属强基础 | 1.05 | 基础5%增伤 |
| 暴击倍率 | 1.5 | 暴击时1.5倍伤害 |
| 防御除数 | 200 | 伤害减伤公式常量 |
| 难度系数 | 100 | 当前版本难度(145级) |
| 怪物防御(145沙袋) | 81,417,275,817 | 用于计算防御减伤 |
| 系统奶增幅系数 | 3.08 | (当前力智 - 基础力智) × 3.08 |
| 系统奶固定值 | 2886 | 固定追加值 |
| BUFF奶量 | 170000 + 300000 | BUFF力智+BUFF三攻 |

### 伤害类型路由

```
职业输出类型分四种:
- 物理百分比: ratio链 = STR × AtkP × PAtkP
- 魔法百分比: ratio链 = INT × AtkM × PAtkM
- 物理固伤:   ratio链 = STR × AtkI × PAtkI
- 魔法固伤:   ratio链 = INT × AtkI × PAtkI

其中 固伤技能系数 = 独立攻击力 × 技能固伤系数
     百分比技能系数 = 技能百分比系数
```

## 三、防御减伤公式详解

摘自 `base.py` 注释(第33行):

```
防御减伤率 = 防御 / (200 × 难度 + 防御)
防御 = 200 × 难度 × 减伤率 / (1 - 减伤率)
```

- 难度系数随等级/副本变化,当前版本145级 = 难度100
- 减伤率不是线性,高防御收益递减
- 属性抗性(火/冰/光/暗抗)从属强系数中减去

## 四、属性增加值来源

摘自 `abstract/character.py` 和 `info.py`:

| 属性类别 | 英文字段 | 来源 |
|---|---|---|
| 力量/智力 | STR/INT | 装备基础 + 增幅 + 附魔 + 徽章 + 宠物 + 称号 + 公会 |
| 物理/魔法/独立攻击 | AtkP/AtkM/AtkI | 武器基础 + 强化 + 附魔 + 徽章 |
| 属强 | ElementDB(火/冰/光/暗) | 首饰附魔 + 右槽 + 宠物装备 + 称号 |
| 技能攻击力 | SkillAttack | 装备词条(乘算) |
| 攻击强化 | Attack + AttackP | 装备词条(加算后乘算) |
| 暴击率 | CriticalP/CriticalM | 装备 + 徽章 + 技能被动 |
| BUFF量 | Buffer/BufferP | 奶职业BUFF |
| 三攻% | PAtkP/PAtkM/PAtkI | 装备词条 |
| 力智% | 无独立字段 | 装备词条(部分) |

## 五、对 Combat Lab 的适用性

### 可直接采用
- **公式结构**完整且正确,与DFO Wiki文档一致
- **属强系数 0.0045**可直接用于Combat Lab的元素伤害计算
- **暴击倍率 1.5**是DNF标准值,可直接使用
- **防御减伤公式**结构正确,可简化后用于Combat Lab

### 需要适配的部分
- Combat Lab是60fps的2.5D原型,不需要"145沙袋"这种精确的MMO数值
- 防御值需要调整为适合原型的小数值(例如防御50-200,而非800亿)
- BUFF系统(系统奶/奶职业)不适用于单机原型,可移除
- 装备词条系统(技能攻击力/攻击强化)暂不需要,可在后续加入

### 建议的简化伤害公式(适用于Combat Lab)

```typescript
// 适用于Carbon Shade的简化伤害公式
function calculateDamage(
  baseDamage: number,        // 技能基础伤害(来自FrameDataAction)
  strength: number,          // 力量
  enemyDefense: number,      // 敌人防御
  elementalDamage: number,   // 属强
  isCritical: boolean,       // 是否暴击
): number {
  // 力智系数
  const strRatio = strength / 250 + 1;

  // 属强系数
  const eleRatio = elementalDamage * 0.0045 + 1.05;

  // 防御减伤
  const defenseRatio = 1 - enemyDefense / (enemyDefense + 200 * 100);

  // 暴击
  const critRatio = isCritical ? 1.5 : 1.0;

  return baseDamage * strRatio * eleRatio * defenseRatio * critRatio;
}
```

## 六、TODO清单

- [ ] 将伤害公式结构写入 `src/combat/damage/DamageFormula.ts`
- [ ] 在 `CombatKernel.ts` 中集成简化的伤害计算
- [ ] 为防御减伤编写单元测试(验证极端值)
- [ ] 为元素伤害、暴击编写单元测试

---

> **声明**: 本公式结构提取自社区开源项目 dnfcalc/dcalc,其准确性由该项目社区验证。对于Combat Lab原型的实际使用,数值需要根据原型的缩放比例进行调整。
