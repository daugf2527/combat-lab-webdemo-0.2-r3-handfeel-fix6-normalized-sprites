# Character Data Model — Neople Open API Reference

> Source: `/df/servers/:serverId/characters/:characterId` + equipment/status/skill/style endpoints
> Date: 2026-05-01
> Sample: Lv 115 검신 (眞 웨펀마스터), Cain server, Fame 110,113

---

## Equipment Structure

Each equipment item has this schema:

```json
{
  "slotId": "WEAPON|TITLE|JACKET|SHOULDER|PANTS|BELT|SHOES|NECKLACE|BRACELET|RING|SUBEQUIP|MAGICSTONE|EARRING",
  "slotName": "무기|칭호|상의|머리어깨|하의|벨트|신발|목걸이|팔찌|반지|보조장비|마법석|귀걸이",
  "itemId": "MD5 hash",
  "itemName": "Korean item name",
  "itemTypeId": "MD5 hash — groups by type",
  "itemType": "무기|방어구|액세서리|스태커블|아바타",
  "itemTypeDetailId": "MD5 hash — subtype",
  "itemTypeDetail": "광검|상의|칭호|목걸이|재료|etc",
  "itemAvailableLevel": 115,
  "itemRarity": "커먼|언커먼|레어|유니크|레전더리|에픽|신화|태초",
  "setItemId": "MD5 hash or null",
  "setItemName": "Set name or null",
  "reinforce": 0-13,
  "itemGradeName": "최상급|상급|중급|하급",
  "amplificationName": "차원의 힘|증폭|or null",
  "refine": 0-8,
  "enchant": {
    "status": [
      {"name": "모든 속성 강화|힘|지능|물리 공격력|etc", "value": number_or_string}
    ]
  },
  "tune": [
    {"level": 0-3, "status": [...], "setPoint": 235}
  ],
  "engrave": {"itemId": "...", "itemName": "각인권"}
}
```

## Status Attributes (40+ fields)

### Base Stats
| API Field | Type | Meaning |
|-----------|------|---------|
| HP | float | Health Points (176,127 sample) |
| MP | float | Mana Points (130,550 sample) |
| 힘 (STR) | float | Strength (6,587 sample) |
| 지능 (INT) | float | Intelligence (4,543 sample) |
| 체력 (VIT) | float | Vitality (4,499 sample) |
| 정신력 (SPI) | float | Spirit (4,465 sample) |

### Combat Stats
| API Field | English | Sample |
|-----------|---------|--------|
| 물리 공격 | Physical Attack | 5,406 |
| 마법 공격 | Magical Attack | 4,528 |
| 독립 공격 | Independent Attack | 3,362 |
| 물리 크리티컬 | Physical Crit Rate | 88.5% |
| 마법 크리티컬 | Magical Crit Rate | 72.5% |
| 적중률 | Hit Rate | 20.9% |
| 회피율 | Evasion Rate | 5% |
| 공격 속도 | Attack Speed | 116.5% |
| 캐스팅 속도 | Cast Speed | 83.5% |
| 이동 속도 | Move Speed | 100% |

### Elemental
| API Field | Sample |
|-----------|--------|
| 화속성 강화 (Fire) | 311 |
| 수속성 강화 (Water) | 321 |
| 명속성 강화 (Light) | 311 |
| 암속성 강화 (Dark) | 311 |
| 화/수/명/암속성 저항 | 21/56/1/41 |

### Modern Damage Bucket (DNF 100+ era)
| API Field | Sample | Notes |
|-----------|--------|-------|
| 공격력 증가 | 71,104.5 | "Attack Increase" — additive within bucket |
| 공격력 증폭 | 73 | "Attack Amplification" — multiplicative |
| 최종 데미지 증가 | 32,124,876 | "Final Damage" — displayed as large number |
| 쿨타임 감소 | 30.7% | Cooldown Reduction |
| 쿨타임 회복속도 | 0 | Cooldown Recovery Speed |
| 최종 쿨타임 감소율 | 30.7% | Final CDR after all modifiers |

### Legacy Damage Bucket (0-value on modern gear)
| Field | Sample |
|-------|--------|
| 데미지 증가 | 0 |
| 크리티컬 데미지 증가 | 0 |
| 추가 데미지 증가 | 0 |
| 모든 공격력 증가 | 0 |
| 물리/마법/독립 공격력 증가 | 0 |
| 힘/지능 증가 | 0 |
| 지속피해 (DoT) | 0 |

### Defense
| Field | Sample |
|-------|--------|
| 물리 방어율 | 41.6% |
| 마법 방어율 | 43.3% |
| 물리 방어 | 53,993 |
| 마법 방어 | 58,817 |
| 물리 피해 감소 | 10% |
| 마법 피해 감소 | 10% |
| HP/MP 회복량 | 1,709 / 8,598 |
| 경직도 | 0 |
| 히트리커버리 | 1,011 |

## Real Equipment Sample (Lv 115 검신)

| Slot | Item | Rarity | Reinforce | Key Enchants/Tunes |
|------|------|--------|-----------|-------------------|
| Weapon | 멸룡검 발뭉 (광검) | 태초 (Primeval) | +13 | All Ele +15, Tune: Final Dmg +444% |
| Title | 프로스트의 전설 플래티넘[75Lv] | 레어 | +0 | Wat Ele +6, STR/INT/VIT/SPI +25 |
| Jacket | 잠식 : 고위 여우의 상의 | 에픽 | +10 | Final Dmg +2%, P.Atk/M.Atk/Ind.Atk +110 |
| Shoulder | 잠식 : 고위 여우의 보호 어깨 | 에픽 | +10 | STR/INT/VIT/SPI +40, Crit +5% |
| Pants | 잠식 : 고위 여우의 그림자 하의 | 에픽 | +10 | Final Dmg +2% |
| Set | 에테리얼 오브 아츠 세트 | — | — | Set point: 235 per piece (tune level 0) |

- **Amplification**: 차원의 힘 (Interdimensional Power) on jacket/shoulder/pants
- **Engrave**: 디레지에 레이드 : 이명 각인권 on weapon

## Buff Sources

| Buff | Stats |
|------|-------|
| 모험단 버프 (Adventure Club) Lv 42 | STR/INT/VIT/SPI +290 |
| 무제한 길드능력치 (Permanent Guild) | STR/INT/VIT/SPI +60 |
| 기간제 길드능력치 (Timed Guild) | STR/INT/VIT/SPI +40 |
