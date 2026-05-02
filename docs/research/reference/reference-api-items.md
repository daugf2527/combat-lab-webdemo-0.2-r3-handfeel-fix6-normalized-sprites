# Item Data Model — Neople Open API Reference

> Source: `/df/items` + `/df/items/:itemId` + `/df/multi/items`
> Date: 2026-05-01

---

## Item Search Response

```json
{
  "itemId": "MD5 hash",
  "itemName": "Korean item name",
  "itemRarity": "커먼|언커먼|레어|유니크|레전더리|에픽|신화|태초",
  "itemTypeId": "MD5 hash",
  "itemType": "스태커블|무기|방어구|액세서리|아바타",
  "itemTypeDetailId": "MD5 hash",
  "itemTypeDetail": "재료|광검|상의|칭호|etc",
  "itemAvailableLevel": 1-115,
  "fame": 0
}
```

## Item Detail (full response)

```json
{
  "itemId": "785e56a0ed4e3efd573da1f56a45217d",
  "itemName": "무색 큐브 조각",
  "itemRarity": "언커먼",
  "itemTypeId": "8bcda5578720a4dc56b1736ccbe06c0f",
  "itemType": "스태커블",
  "itemTypeDetailId": "8ed8b6c0d70f2661f86bab11630d69f9",
  "itemTypeDetail": "재료",
  "itemAvailableLevel": 1,
  "itemExplain": "<주요 사용처>\n- 퀘스트 수행\n- 상위 스킬 사용\n- 큐브의 계약\n\n<주요 획득처>\n- 장비 해체",
  "itemExplainDetail": "...",
  "itemFlavorText": "",
  "fame": 0,
  "setItemId": null,
  "setItemName": null,
  "obtainInfo": {
    "dungeon": null,
    "shop": [
      {"rows": [
        {"name": "NPC 칸나 레미니스", "details": ["칸나의 큐브 상자"]},
        {"name": "NPC 휴 피츠래리", "details": ["환불 항아리"]},
        {"name": "가브리엘의 비밀상점"}
      ]}
    ]
  }
}
```

## Item Type Hierarchy

The API uses a 3-level type system:

| Level | Field | Example Values |
|-------|-------|---------------|
| 1: Category | `itemType` | 무기, 방어구, 액세서리, 스태커블, 아바타 |
| 2: Subcategory | `itemTypeDetail` | 광검, 대검, 소검, 상의, 하의, 목걸이, 칭호, 재료, 선택 부스터 |
| 3: Unique | `itemId` (MD5) | Per-item unique hash |

## Rarity Tiers (Observed in API)

| Tier | Korean | English | Notes |
|------|--------|---------|-------|
| 1 | 커먼 | Common | White |
| 2 | 언커먼 | Uncommon | Blue (cubes, basic materials) |
| 3 | 레어 | Rare | Purple (avatars, crystals) |
| 4 | 유니크 | Unique | Pink |
| 5 | 레전더리 | Legendary | Orange |
| 6 | 에픽 | Epic | Yellow (endgame gear) |
| 7 | 신화 | Mythic | Rainbow/Iridescent |
| 8 | 태초 | Primeval | New top tier (Lv 115+) |

## Item Search Queries Tested

| Search Term | Result |
|-------------|--------|
| 대검 (Great Sword) | Empty — weapons may use different indexing |
| 소검 (Short Sword) | Empty |
| 무기 (Weapon) | 10 results — mostly selection boxes, weapon boxes |
| 에픽 (Epic, rarity filter) | Error — rarity might not be a valid query param |
| 목걸이 (Necklace) | Empty |
| Epic (English) | Empty |

**Note**: The items search is keyword-based on Korean item names. Common equipment types (대검, 소검, 목걸이) returned empty, suggesting the API indexes by full item name not by category. Try specific item names like "멸룡검 발뭉" for targeted searches.

## Item Detail Queries Tested

| Query | Result |
|-------|--------|
| `items/785e56a0ed4e3efd573da1f56a45217d` (Clear Cube Fragment) | Full detail with obtainInfo ✓ |
| `items/74bfcf0bd8b6998fc1e5a896d5a90fd7` (멸룡검 발뭉 weapon) | Error "NOT_FOUND_SEARCH_VALUE" |
| `multi/items?itemIds=785e56a0...` | Multi detail works — returns array of items ✓ |

**Note**: The single-item `/df/items/:itemId` endpoint failed for equipment items but worked for materials. The multi-item endpoint worked for all tested itemIds. For equipment lookups, use `/df/multi/items` instead.

## Key `itemExplain` Fields

These appear to be the standard sections in item tooltips:
- `<주요 사용처>` — Primary use
- `<주요 획득처>` — Primary acquisition source
- `<능력치>` — Stats/abilities (on equipment)
- `<세트 효과>` — Set effects (on set items)
- Flavor text shown via `itemFlavorText`
