# Auction & Economy — Neople Open API Reference

> Source: `/df/auction` + `/df/auction-sold`
> Date: 2026-05-01 (live data)

---

## Auction Item Structure

```json
{
  "auctionNo": 1492936272,
  "regDate": "2026-05-01 01:24:58",
  "expireDate": "2026-05-02 01:24:58",    // 25 hours listing
  "itemId": "MD5 hash",
  "itemName": "Korean name",
  "itemAvailableLevel": 1,
  "itemRarity": "커먼|언커먼|레어|유니크|레전더리|에픽|신화|태초",
  "itemTypeId": "MD5 hash",
  "itemType": "스태커블|무기|방어구|액세서리|아바타",
  "itemTypeDetailId": "MD5 hash",
  "itemTypeDetail": "재료|광검|상의|칭호|etc",
  "refine": 0,
  "reinforce": 0,
  "amplificationName": null,
  "fame": 0,          // Adventurer Fame contribution
  "count": 15000,      // Total stack size being sold
  "regCount": 15000,  // Original registered count
  "price": -1,        // -1 means no fixed price set
  "currentPrice": 735000,  // Current bid/total price
  "unitPrice": 49,         // Price per unit
  "averagePrice": 40       // Server average unit price
}
```

## Live Price Samples (2026-05-01, Cain server)

### 무색 큐브 조각 (Clear Cube Fragment) — Uncommon material
- **Average unit price**: 40 Gold
- **Trading range**: 38–60 Gold/unit
- **Typical lot sizes**: 50,000–8,000,000 units
- **Typical total prices**: 2M–360M Gold
- **Auction volume**: High (10+ active listings at any time)

### 모순의 결정체 (Crystallized Chaos) — Rare material
- **Average unit price**: 40,320 Gold
- **Trading range**: 40,498–58,900 Gold/unit
- **Typical lot sizes**: 17–7,407 units
- **Typical total prices**: 688K–436M Gold

## Auction Sold History Structure

```json
{
  "soldDate": "2026-05-02 00:12:42",
  "itemId": "MD5 hash",
  "itemName": "Korean name",
  "itemRarity": "레어|etc",
  "count": 100000,
  "price": 3800000,      // Total sale price
  "unitPrice": 38        // Per-unit sold price
}
```

### Recent Sold: 무색 큐브 조각
| Time | Quantity | Total Price | Unit Price |
|------|----------|-------------|------------|
| 00:12:42 | 100,000 | 3,800,000 | 38 |
| 00:12:02 | 300,000 | 11,400,000 | 38 |
| 00:11:58 | 100,000 | 3,800,000 | 38 |
| 00:11:56 | 100,000 | 3,800,000 | 38 |
| 00:11:16 | 30,000 | 1,170,000 | 39 |

### Avatar Auction (Rare Avatar Hat sample)
```json
{
  "itemName": "강인한 소울 라이트닝 캡",
  "itemRarity": "레어",
  "itemType": "아바타",
  "itemTypeDetail": "모자",
  "fame": 148,
  "jobs": [
    {"jobId": "41f1cdc2ff58bb5fdc287be0db2a8df3", "jobName": "귀검사(남)"},
    {"jobId": "17e417b31686389eebff6d754c3401ea", "jobName": "다크나이트"}
  ],
  "setItemName": "레어 아바타 세트",
  "count": 1,
  "currentPrice": 3,050,000,
  "avatar": {
    "emblems": [
      {"slotNo": 1, "slotColor": "붉은빛", "itemName": "화려한 붉은빛 엠블렘[지능]", "itemRarity": "레어"},
      {"slotNo": 2, "slotColor": "붉은빛", "itemName": "화려한 붉은빛 엠블렘[지능]", "itemRarity": "레어"}
    ],
    "ability": "지능 55 증가"
  }
}
```

## Economy Model Insights

| Material | Rarity | Unit Price | Key Use |
|----------|--------|-----------|---------|
| Clear Cube Fragment | Uncommon | 40 Gold | Skill casting, cube contract, quests |
| Crystallized Chaos | Rare | 40,320 Gold | Amplification attempts |
| Rare Avatar (Hat) | Rare | 3,050,000 Gold | Cosmetic + stat bonuses |

**Cost Reference for Reinforcement (Clear Cube):**
- At 40 Gold/cube, 1 reinforcement attempt at high levels could consume thousands of cubes
- The economy is cube-based: Clear Cube Fragments are the fundamental economic unit
