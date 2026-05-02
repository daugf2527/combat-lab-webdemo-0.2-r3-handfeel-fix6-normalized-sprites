# Skill Data — Neople Open API Reference

> Source: `/df/servers/:serverId/characters/:characterId/skill/style`
> Sample: Lv 115 검신 (眞 웨펀마스터 / True Weapon Master), Cain server
> Date: 2026-05-01

---

## Skill Style Response Structure

```json
{
  "skill": {
    "hash": "Base64 encoded skill build hash"
  },
  "style": {
    "active": [
      {
        "skillId": "MD5 hash",
        "name": "Korean skill name",
        "level": 1-51,
        "requiredLevel": 1-85
      }
    ]
  }
}
```

- `skillId`: Unique MD5 hash for the skill
- `level`: Current invested skill level (1=base learned, higher=upgraded)
- `requiredLevel`: Character level required to learn the skill

## Complete Skill List (40 Active Skills)

### Core Slayer Skills (Lv 1-15)
| SkillId | Name (Korean) | English | Level | Req Lv |
|---------|--------------|---------|-------|--------|
| `fc7a3f4c...` | 어퍼 슬래쉬 | Upper Slash | 1 | 1 |
| `eb71e1d8...` | 귀참 | Ghost Slash | 1 | 1 |
| `10b31c7e...` | 스킬 체인 | Skill Chain | 1 | 1 |
| `7822d6d5...` | 백스텝 | Backstep | 1 | 1 |
| `ce26c6b6...` | 퀵 스탠딩 | Quick Standing | 1 | 1 |
| `78bd107a...` | 공중 연속 베기 | Aerial Chain Slash | 1 | 5 |
| `4224f9b0...` | 에쉔 포크 | Ashen Fork | 1 | 5 |
| `3c5604bd...` | 가드 | Guard | 1 | 5 |
| `a5fa08f5...` | 카잔 | Kazan | 1 | 5 |
| `1fea5a62...` | 도약 | Leap | 1 | 10 |
| `6e33d47e...` | 붕산격 | Mountain Press | 1 | 10 |
| `51a08fd0...` | 리 귀검술 | Ri Ghost Sword Art | 1 | 15 |
| `f2fb2716...` | 단공참 | Dan-gong Slash | 1 | 15 |
| `c27418ae...` | 백스텝 커터 | Backstep Cutter | 1 | 15 |

### Weapon Master Core (Lv 20-35)
| SkillId | Name (Korean) | English | Level | Req Lv |
|---------|--------------|---------|-------|--------|
| `c5a2956d...` | 류심 | Flowing Mind | 1 | 20 |
| `2a0a3918...` | 류심 충 | Flowing Mind - Rush | **51** | 20 |
| `3829c15b...` | 블러드러스트 | Bloodlust | 1 | 25 |
| `762c4e6d...` | 오버드라이브 | Overdrive | **10** | 25 |
| `9dc8438e...` | 류심 쾌 | Flowing Mind - Swift | **48** | 25 |
| `0969cd40...` | 오토 가드 | Auto Guard | 1 | 25 |
| `28b583c7...` | 차지 크래시 | Charge Crash | **46** | 30 |
| `3fb8395a...` | 류심 승 | Flowing Mind - Rise | **46** | 30 |
| `5806440d...` | 류심 강 | Flowing Mind - Strong | **10** | 30 |
| `cfacda06...` | 발도 | Draw Sword | 1 | 35 |

### Advanced Skills (Lv 40+)
| SkillId | Name (Korean) | English | Level | Req Lv |
|---------|--------------|---------|-------|--------|
| `2c9d9a36...` | 차지 버스트 | Charge Burst | 1 | 40 |
| `669f1428...` | 맹룡단공참 | Fierce Dragon Dan-gong Slash | 1 | 40 |
| `85102942...` | 환영검무 | Illusion Sword Dance | **38** | 45 |
| `4f2e001e...` | 극 귀검술 : 폭풍식 | Ultimate Ghost Sword: Storm | **14** | 50 |
| `0c262dac...` | 극 귀검술 : 유성락 | Ultimate Ghost Sword: Meteor | **31** | 60 |
| `2ba29985...` | 극초발도 | Extreme Draw Sword | **26** | 70 |
| `b501ae53...` | 극 귀검술 : 심검 | Ultimate Ghost Sword: Heart Sword | **23** | 75 |
| `d8ff976e...` | 극 발검술 : 섬단 | Extreme Draw Art: Flash Cut | **21** | 80 |
| `0f638da9...` | 이기어검술 | Yi-gi Sword Art | **7** | 85 |

## Key Insights for Combat Design

1. **Skill level caps**: Core skills max at Lv 1 (learned once), while primary damage skills scale to Lv 31-51. This matches the SP allocation system — you invest heavily in your main rotation.

2. **Level gating**: Skills unlock at level milestones: Lv 1 (basic), Lv 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 85.

3. **Skill hierarchy**:
   - Basic attacks: Lv 1, max level 1
   - Core skill tree (류심 / Flowing Mind): 4 variants at Lv 20-30, heavily invested (Lv 10-51)
   - Awakening skills: Lv 45 (1차), 50 (2차), 60/70/75/80/85 (3차/眞)

4. **The skillId hashes are stable** — they could be used as reference keys for a skill database.

5. **Skills endpoint failed** — `/df/skills/:jobId` returned NOT_FOUND for both base class jobId and jobGrowId. The character skill/style endpoint was the only working source for skill data. This endpoint shows the player's current build, not the full skill tree.
