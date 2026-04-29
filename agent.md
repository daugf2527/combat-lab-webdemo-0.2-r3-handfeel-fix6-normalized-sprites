# DNF 战斗系统文档覆盖矩阵

日期：2026-04-29

## 28 个系统覆盖总表

| # | 系统 | 覆盖程度 | 核心文件 |
|---|------|---------|---------|
| 1 | 怪物仇恨与战斗 AI | ★ 全面 | `combat-system-reconstruction`、`combat-replica-implementation`、`extraction-runtime-pipeline`、`frame-ai-implementation` |
| 2 | 逆硬直 (Recoil) 系统 | ★ 全面 | `combat-lab-0.2-r3-spec` §19.2、`combat-replica-implementation` |
| 3 | 空中战斗完整规则 | ★ 充分 | `frame-ai-implementation`、`combat-replica-implementation` |
| 4 | 完整异常状态体系 | ★ 全面 | `combat-lab-0.2-r3-spec` §22、`combat-system-reconstruction`、`client-data-extraction` |
| 5 | 抓取技能核心规则 | ★ 充分 | `combat-technical-pipeline`、`combat-system-reconstruction`、`client-data-extraction` |
| 6 | 2.5D 判定精确数据集 | ★ 全面 | `combat-replica-implementation`、`combat-system-reconstruction`、`combat-kernel-development` |
| 7 | 核心动作精确帧表 | ★ 全面 | `frame-ai-implementation`、`client-data-extraction`、`combat-technical-pipeline` |
| 8 | DNF 取消窗口提前量官方规则 | ★ 全面 | `combat-replica-implementation`、`client-data-extraction` |
| 9 | DNF 输入缓存消费完整规则 | ★ 全面 | `combat-replica-implementation`、`combat-kernel-development`、`combat-system-reconstruction` |
| 10 | DNF 固定逻辑帧与渲染帧分离 | ★ 全面 | `combat-replica-implementation`、`combat-system-reconstruction` |
| 11 | 输入兼容性与适配规则 | ★ 充分 | `combat-replica-implementation`、`combat-system-reconstruction` |
| 12 | 战斗回放系统 | ★ 充分 | `combat-system-reconstruction`、`combat-lab-0.2-r3-spec` |
| 13 | 地图与地形交互规则 | ⚠ 仅提及 | `combat-system-reconstruction`、`extraction-runtime-pipeline`（各一段） |
| 14 | 多目标命中处理规则 | ★ 全面 | `extraction-runtime-pipeline`、`combat-replica-implementation`、`combat-lab-0.2-r3-spec` |
| 15 | 连击数与战斗评分系统 | ★ 全面 | `combat-system-reconstruction`、`extraction-runtime-pipeline`、`combat-replication-implementation` |
| 16 | 受击反应细分规则 | ★ 全面 | `combat-attack-hit-reaction-chain`、`combat-lab-0.2-r3-spec`、`handfeel-pass-notes` |
| 17 | 镜头震动与屏幕反馈完整规则 | ★ 全面 | `combat-replica-implementation`、`extraction-runtime-pipeline`、`training-ground-r3-r4` |
| 18 | 动画根位移与技能强制位移 | ★ 充分 | `combat-system-reconstruction`、`combat-replication-implementation`、`combat-lab-0.2-r3-spec` |
| 19 | 破招/背击/暴击的完整判定规则 | ★ 充分 | `combat-replica-implementation`、`combat-lab-0.2-r3-spec`、`combat-system-reconstruction` |
| 20 | Buff/Debuff 完整生命周期管理 | ★ 全面 | `combat-lab-0.2-r3-spec`、`combat-kernel-development` |
| 21 | 完整的异常状态体系 | (同 #4) | — |
| 22 | 死亡与复活战斗闭环规则 | ★ 全面 | `combat-lab-0.2-r3-spec`、`combat-system-reconstruction` |
| 23 | 角色碰撞与推挤系统 | ★ 全面 | `combat-lab-0.2-r3-spec`、`combat-system-reconstruction`、`extraction-runtime-pipeline` |
| 24 | 完整的技能 CD 与资源管理内核 | ★ 充分 | `combat-lab-0.2-r3-spec`、`combat-kernel-development`、`combat-replication-implementation` |
| 25 | 战斗事件总线完整流转规则 | ★ 全面 | `combat-replica-implementation`、`combat-system-reconstruction`、`combat-lab-0.2-r3-spec` |

## 覆盖统计

| 覆盖程度 | 数量 | 系统编号 |
|---------|------|---------|
| ★ 全面 (Comprehensive) | 17 | 1, 2, 4, 6, 7, 8, 9, 10, 14, 15, 16, 17, 20, 22, 23, 25 (+ 21 同 #4) |
| ★ 充分 (Substantial) | 6 | 3, 5, 11, 12, 18, 19, 24 |
| ⚠ 仅提及 (Passing) | 1 | 13 |

## 核心文件速查

| 文件 | 覆盖系统数 |
|------|-----------|
| `docs/engineering/combat-lab-0.2-r3-final-integrated-development-spec.md` | 16 |
| `docs/engineering/combat-attack-hit-reaction-chain.md` | 5 |
| `docs/research/combat-replica-implementation-technical-report.md` | 14 |
| `docs/research/combat-system-reconstruction-engineering-report.md` | 16 |
| `docs/research/extraction-runtime-pipeline.md` | 9 |
| `docs/research/client-data-extraction-report.md` | 7 |
| `docs/research/frame-ai-implementation-report.md` | 7 |
| `docs/planning/training-ground-r3-r4-restoration-plan.md` | 8 |

## 唯一缺口

**#13 地图与地形交互规则** — 只两个文件中有方向性提及，无详细规则。需后续补充。
