# DNF PVF 文件下载来源

> 日期: 2026-05-05
> 用途: 为 PVF/.skl 技能帧数据提取管线提供 PVF 文件获取渠道

## GitHub 仓库（包含 PVF 的 DNF 私服项目）

| 仓库 | 说明 | PVF 版本 |
|------|------|----------|
| [scjtqs2/dnf-centos5](https://github.com/scjtqs2/dnf-centos5) | DNF 私服服务端，集成统一登录、GM 工具 | 默认集成**黑岩 1.6** 版本 `Script.pvf`，另有 95 级等级补丁 `df_game_r` |
| [1995chen/dnf](https://github.com/1995chen/dnf) | DNF Docker 一键部署镜像，CentOS-5/6/7 多版本支持 | 需查看项目内 PVF 文件版本 |
| [onlyGuo/dnf-server-public](https://github.com/onlyGuo/dnf-server-public) | DOF 后端管理系统 | 支持上传和解析 `Script.pvf` 文件，有角色管理功能 |

## PVF 解包/解析工具

| 工具 | 用途 | GitHub | 备注 |
|------|------|--------|------|
| **DNF-Porting** | PVF 解包 + NPK 提取库 (C#) | https://github.com/flwmxd/DNF-Porting | 29⭐，推荐使用，需 .NET SDK 6.0+ |
| **PvfPlayer** | PVF 解包/封包工具 | https://github.com/ariakeumi/PvfPlayer | 3⭐，备选方案 |
| **DNF-PVF-decode-program** | PVF 解密工具 | https://github.com/SoraKasvgano/DNF-PVF-decode-program | 4⭐，用于解密加密 PVF |

## 社区渠道

- **黑岩 PVF 系列** — 国内 DNF 私服社区最知名的 PVF 版本，2.1/4.0 等版本号对应不同 DNF 官方版本
- **DNF 台服吧 / DOF 论坛** — 搜索"黑岩 PVF"或"Script.pvf 下载"可找到更新版本（黑岩 4.0+ 对应更高 DNF 版本，技能数据更完整）
- 更高版本的 PVF 通常包含更完整的技能数据（更多技能、更准确的数值）

## 注意事项

- 部分 GitHub 仓库可能已被 DMCA 下架（Nexon 曾对 DNF 私服项目发起 DMCA 清理），建议及时存档
- PVF 文件内只含数值数据（帧数、hitbox 尺寸、系数），不含图片/动画资源
- 遵循 `docs/design/source-policy.md`：**只提取数值，不分发 PVF 文件本身**
- 提取的技能数据将在项目内作为 `baseline_tuning` 的校准参考

## 相关文档

- 提取管线方案：`docs/planning/pvf-skl-extraction-plan.md`
- 原有管线设计：`docs/research/combat/pvf-skl-extraction-workflow.md`
- 数据差距报告：`docs/research/combat/berserker-data-gap-report.md`
- 资源政策：`docs/design/source-policy.md`
