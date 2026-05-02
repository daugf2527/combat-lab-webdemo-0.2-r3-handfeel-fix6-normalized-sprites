# Cash Shop, Economy, and Adventure System — DFO World Wiki Reference

> Source: https://wiki.dfo.world (CERA, Mileage, Reinforcement, Amplification, Arad Explorer Club pages)
> Scraped: 2026-05-02

---

# Part 1: Cash Shop / Monetization (商城)

## CERA Shop Structure

| Category | Examples |
|----------|----------|
| Avatars | Individual pieces, full sets, Clone Avatars |
| Packages | Limited-time bundles (avatars + titles + auras + creatures + contracts) |
| Consumables | FP potions, repair tickets, inventory expansions |
| Pets/Creatures | Direct purchase and eggs |
| Contracts | Neo Premium Plus, Tactician's, Conqueror's |
| Safe Upgrades | Safe Reinforcement, Safe Amplification materials |
| Avatar Dyes | Regular (300K Gold) and Rare (1.5M Gold) |

**Exchange rate**: 100 CERA = $1 USD

### Avatar Pricing

| Slot Type | CERA Price |
|-----------|-----------|
| Top, Bottom | 150 |
| Hair, Hat | 130 |
| Face, Torso, Waist, Shoes | 120 |
| Skin | 180 |
| Clone Top, Bottom | 240 |
| Clone Hair, Hat | 180 |
| Clone Face, Torso, Waist, Shoes | 150 |

### Package Sales Model
- Limited-time events, typically 790-2,670 CERA
- Basic packages: 8 avatars (790-1,000 CERA)
- Premium packages: full set with title, aura, creature, clones (2,490-2,670 CERA)
- Major packages: ~$40+ equivalent
- Package content boxes may have different trading limits than the package itself

## Mileage System

**Earning**:
- 20% of CERA spent returned as Mileage Points (1,000 CERA = 200 Mileage)
- Earned from completing dungeons within level range (available at Lv. 20+)

**Spending examples**:
- Echo Megaphone: 2 Mileage
- Radiant Harmonious Crystal Pouches: 10-1,000 Mileage
- FP Recovery Potions, Repair Tickets
- Various consumables

## Lost Treasure System

**Status: REMOVED** as of Season 7 Act 01 (The Next Journey). Skeleton Keys and Lost Treasures no longer available in Global client.

Historical mechanics: 3 Skeleton Keys → 1 Lost Treasure, 2 random items from 5 categories (Consumables, Equipment, Premium Contracts, Creatures, Secret items). Monthly "Items of the Month" were tradeable.

## NeoPremium Plus Contract

| Duration | CERA |
|----------|------|
| 3 days | 300 |
| 7 days | 580 |
| 15 days | 1,100 |
| 30 days | 1,560 (~$15.60) |

### Benefits

| Benefit | Detail |
|---------|--------|
| **FP Increase** | 156 → 273 FP |
| **EXP Bonus** | +10% dungeon clear and hunting |
| **Town Movement Speed** | +40% (not applied if base ≥ 40%) |
| **Skill Level** | +1 to all Lv. 1-100 Skills (not in Arena) |
| **Free Raid Entry** | Fiend War, Prey-Isys, Sirocco, Ozma, Bakal, God of Mist |
| **Exclusive Equipment Rental** | Epic Equipment (Lv. 110+) |
| **Free Contracts** | Conqueror's, Tactician's, Growth, Cube, Gabriel, Bannibou's |
| **Daily Bonus** | Neo Premium Token Box (3) daily |
| **Dungeon Retirement** | No HP reduction, stamina maintained on mid-dungeon leave |
| **Weekend FP Discount** | Entry Fatigue Cost discount Fri/Sat/Sun |
| **Bonus Card Rewards** | +2-28 extra materials depending on dungeon/raid |

---

# Part 2: Economy (经济)

## Gold Economy

**Sources**: Dungeon clears, quest rewards, Auction Hall sales, equipment disassembly, events

**Sinks**: Reinforcement (Gold + Cube Fragments), Amplification (Gold + Crystallized Chaos), repair costs, Auction Hall fees, NPC purchases, skill learning

**Recent context**: Community notes gold nerfs/rebalancing — removal of certain gold generation mechanics (Option Level Growth) and introduction of more gold sinks to combat inflation.

## Clear Cube Fragment Economy

**Production**: Equipment disassembly (primary source). Uncommon/Rare equipment disassembles into Clear + colored cube fragments.

**Consumption**:
- Reinforcement costs
- Skill usage (some skills cost Clear Cube Fragments)
- Converting to colored cubes (5 Clear = 1 colored at NPC Seria)
- Various crafting recipes
- Purchasing Crystallized Chaos from Klonter (1,000 Clear Cube Fragments)

**Value**: Stable economy anchor; dozens from a single blue (Rare) equipment disassembly.

## Key Material Prices

Prices vary by server and market conditions. Core materials:
- **Clear Cube Fragments**: Anchor material from disassembly
- **Ryan Cores / Leiern Cores**: Safe Reinforcement
- **Harmonious Crystals**: Safe Amplification
- **Crystallized Chaos**: 1,000 Clear Cube Fragments from Klonter
- **Energy Cores**: Insignia upgrades (purchasable with Merchant Guild Silver Coins)

## Auction House

| Rule | Value |
|------|-------|
| Max listings | 10 items at once |
| Buy Now price cap | 400 million Gold |
| Max bid amount | 400 million Gold |
| Listing fee/deposit | Not publicly specified |
| Transaction tax | 3% (KR standard, varies by region) |
| Listing duration | 25 hours (24h + 1h grace) |
| Unsold items | Returned via mailbox after listing expires |

## Player Trading

- Accept via `/tr` command or character menu
- Dedicated trading window for items + gold exchange
- Cannot trade during loot auctions
- Many items account-bound or untradeable
- Some items "Tradable Once" → account-bound after first trade
- Package content boxes may have different limits than packages

## Raid Loot Auctions

- Bidding restricted to character's gold carrying limit
- If highest bidder changes, previous bidder's gold returned (via mail if exceeds carrying limit)
- Leaving group, changing channels, or closing game = cannot rejoin active auction

---

# Part 3: Reinforcement & Amplification (强化 & 增幅)

## Normal Reinforcement

| Property | Detail |
|----------|--------|
| **Materials** | Gold + Clear Cube Fragments |
| **NPC** | Kiri (Hendon Myre), Guild Machine, or Red Tail Jonathan (Central Park) |
| **Bonuses** | Weapons: Phys/Mag Attack. Armor: Phys Dmg Reduction. Accessories: Mag Dmg Reduction. Sub/Magic Stone: STR/INT/VIT/SPR. Earrings: Phys/Mag/Independent Attack |
| **Growth** | Additive before +10, exponential after +10 |

### Failure Penalties
| Level Range | Weapon | Armor/Accessory/Special |
|-------------|--------|------------------------|
| +0 to +10 | No penalty | No penalty |
| +10 to +12 | Loses 3 levels | Destroys (or +0 with Protection Ticket) |
| +12+ | Destroys | Destroys |

## Safe Reinforcement

| Level | Success Rate | Cores | Gold | Failure Bonus |
|-------|-------------|-------|------|---------------|
| +0→+4 | 100% | 29-32 | 180,360 | — |
| +4→+5 | 80% | 59 | 359,265 | +5% |
| +5→+6 | 70% | 66 | 400,300 | +5% |
| +6→+7 | 60% | 72 | 432,948 | +5% |
| +7→+8 | 50% | 80 | 481,989 | +5% |
| +8→+9 | 40% | 90 | 546,593 | +5% |
| +9→+10 | 30% | 105 | 633,275 | +5% |
| +10→+11 | 8% | 356 | 2,153,040 | +2% |
| +11→+12 | 3% | 1,108 | 6,704,400 | +1% |

Requirements: Lv. 100+ weapons, Unique+ rarity, up to +12. Uses Leiern Cores. Failure bonuses accumulate; success resets them.

## Normal Amplification

- Materials: Gold + Crystallized Chaos
- Requires equipment with Dimensional Stats (Otherverse Energy Purification Scroll)
- NPC: Klonter or Kiri
- Penalties: +0~+7 no penalty, +7→+10 loses levels, +10+ destroys equipment

## Safe Amplification (Weapon)

| Level | Success Rate | Crystals | Gold | Failure Bonus |
|-------|-------------|----------|------|---------------|
| +0→+4 | 100% | 36-51 | 430K-611K | — |
| +4→+5 | 70% | 55 | 876,652 | +10% |
| +5→+6 | 60% | 67 | 1,072,098 | +10% |
| +6→+7 | 50% | 109 | 1,730,400 | +10% |
| +7→+8 | 50% | 122 | 1,932,679 | +5% |
| +8→+9 | 40% | 230 | 3,656,400 | +5% |
| +9→+10 | 30% | 320 | 5,084,870 | +5% |

Non-weapon costs approximately 40-60% of weapon costs. Requirements: Lv. 100+, Unique+, up to +10. Uses Harmonious Crystals. Not affected by success-rate-improving consumables/costumes/titles.

---

# Part 4: Adventure / Explorer Club (冒险团)

## Adventure Level

Max level: **50**. Earn EXP from character progression; at Lv. 90+, EXP contribution reduced to 1/3.

### Sample Level Rewards

| Level | EXP Required | Bonus Stats | Special |
|-------|-------------|-------------|---------|
| 1 | — | STR/VIT/INT/SPR +100 | — |
| 2 | 500M | +110 | Dungeon EXP +10% |
| 3 | 530M (1.03B total) | +125 | — |
| 4 | — | +140 | — |
| 5 | — | +150 | — |
| 10 | — | +200 | — |
| 15 | — | — | +1 Merchant Guild Silver Coin; unlocks certain Advanced Dungeons |
| 16 | — | +230 | — |
| 18 | — | +240 | — |
| ... | ... | ... | (continues increasing to Level 50) |

Stats increase approximately +5 to +10 per level after the initial tiers.

## Insignia System

- Merged Insignia/Gem system affects **all characters** with: Adventurer Fame, Attack Increase, Buff Power, stat boosts
- Upgrade materials: Energy Cores, Superconductor Energy Cores (purchasable with Merchant Guild Silver Coins)
- Malefic Residue also used as of Season 9 Act 3

## Character Collection Bonuses

- More characters + higher Adventurer Fame = better bonuses
- Basic Info tab displays total character count
- Contributes to Explorer Club level progression

## Elite Members (Squad Mode)

Automated Player Character system for AI-controlled squads:
- Available for solo players in Sirocco, Black Purgatory, Ozma Raids
- Requirements: Lv. 100-115 characters with 2nd or Neo Awakening, same-server only
- Cannot use same class as current character simultaneously
- Side Story characters (Dark Knight, Creator) cannot be Elite Members
- Source: characters from own roster or default characters (Slayer, Fighter, Priest)

## UI Tabs

| Tab | Function |
|-----|----------|
| Basic Info | Club stats, character count, login/dungeon/arena totals |
| Trait | Explorer Club level and bonuses |
| Shop | Purchase items with Explorer Club currency |
| Content Status | Track dungeon/content progress |
| Elite Members | Manage squad mode characters |
| Insignia | Upgrade account-wide Insignia and Gems |
| Mist Assimilation | Endgame system |
