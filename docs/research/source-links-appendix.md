应仅用于**验证字段分层思路**，不应直接把其中的资源、脚本、封包或服务器逻辑搬进生产代码。更高风险的“泄露包/非公开源码/灰产改包资料”，本文没有直接采用，也不建议纳入团队实现基线。([github.com](https://github.com/flwmxd/DNF-Porting))

**优先来源链接。** 以下项目是本报告中最值得开发团队反复核对的“优先链路”；点击 citation 即可打开原文。

官方英文基线：
- Oculus / Exile Mountains：撤退、恢复、同队重试、楼层重开规则。 citeturn20view0
- Sirocco Raid System：共享 HP、分队贡献显示、阶段伤害提交与失败回滚。 citeturn19view0
- Ozma Raid System：共享 HP、无人遭遇回血、队伍伤害可视化。 citeturn24view0
- Nabel Raid Content：个人贡献、最小领奖贡献、Recovery、返回/超时分歧处理。 citeturn21view0
- Nabel Raid System：Matching 模式分队、按人数的额外伤害补正、队伍人数遭遇快照。 citeturn28view0
- World Boss Content：5 分钟限时、Life Token 扣时、贡献/排行榜。 citeturn22view0
- Inae Dusk War Content：30 分钟总时限、HP/Neutralize 保留、无人占位与撤退罚时。 citeturn41view0
- Asrahan: Mu/God of Mist System：失败后重组攻坚队、Berserk、时间扣减、HP lock 与子地城解锁。 citeturn39view0
- Forest of Awakening System：1 人/4 人推荐模板、阶段与限时、放弃后需重新建队。 citeturn26view3
- Beast Dungeon：难度档位对怪物 HP/Def/Atk 的直接放大。 citeturn27search18

官方韩文基线：
- Diriege Raid Guide：怪物 HP 附加倍率 0%–500%，50% 步进；难度入口、共享复活资源。 citeturn29view0
- 韩服 World Boss 更新：按对世界领主造成的伤害量获取贡献。 citeturn22view1
- 115 级阶段 HP 测量社区帖：固定 4 人体力、队伍补正、版本变动记录。 citeturn36search2

官方中文差异链路：
- 神界与神界地下城：减少单刷时怪物血量；放弃任务初始化进度。 citeturn30search0turn44search0
- 美神维纳斯：放弃进行时进度全部初始化、重新挑战需退队重建。 citeturn44search1
- 狄瑞吉攻坚战困难模式：创建时附加怪物 HP 倍率 0%–500%，50% 步进。 citeturn43search0
- 世界领主：感染地：个人贡献与整体贡献双账本。 citeturn42search0
- 奥兹玛/希洛克/雾神/Nabel 中文专题与停机公告：共享 HP、队伍伤害显示、生命值锁定可视化、个人清理次数记录等。 citeturn45search4turn30search6turn45search10turn45search5turn30search11

公开逆向/社区辅助链路：
- PvfPlayer：公开说明历史台服 PVF 可被拆包/打包。 citeturn32view0
- PVFTools / DNF-Porting：公开说明可解包 DNF 的 PVF/NPK。 citeturn32view1
- DNF-PVF-decode-program：公开列出 PVF 解码程序与历史社区出处。 citeturn32view2
- PVFEditor：公开展示技能、装备、物品、怪物、任务、地图、副本等资源检索/编辑维度。 citeturn32view3
- 台服 DNF 吧精品贴：可见 `wdm/dgn/map/monster`、任务 `int data`、怪物代码/副本代码等历史字段形态。 citeturn34view0
- 台湾服停运历史报道：说明台服只能作为历史结构参考，不能和 115 级现役资料同权。 citeturn37search1

归纳成一句工程化建议：如果团队只做一件事，那就先把**RunState / EncounterState / TemporalBudget / ContributionLedger** 四套状态对象搭起来，并把所有内容差异配置化；这样你们就已经站在最接近 DNF/DFO 公开规则的实现路径上。([dfoneople.com](https://www.dfoneople.com/news/updates/1636/DUNGEON-AND-REWARDS))
