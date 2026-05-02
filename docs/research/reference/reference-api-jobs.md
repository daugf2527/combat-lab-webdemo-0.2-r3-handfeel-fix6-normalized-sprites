# DNF Job Tree — Neople Open API Reference

> Source: `https://api.neople.co.kr/df/jobs`
> Date: 2026-05-01
> Format: jobId (base class) → jobGrowId → jobGrowName (Korean)

---

**Key finding**: jobGrowIds are NOT globally unique. The same jobGrowId recurs across different base classes. Always pair with the base class jobId for unique identification.

## Berserker (our target class)

| Stage | jobGrowId | Korean Name | English |
|-------|-----------|-------------|---------|
| Base (Male Slayer) | `41f1cdc2ff58bb5fdc287be0db2a8df3` | 귀검사(남) | Male Slayer |
| 1차 | `a9a4ef4552d46e39cf6c874a51126410` | 버서커 | Berserker |
| 2차 (1st Awakening) | `460822c3780a9bc3fbe9485cc89c44a4` | 헬벤터 | Hellventer |
| 3차 (2nd Awakening) | `15ce2751ab9c8302f39636cdb7c3dcfa` | 블러드 이블 | Blood Evil |
| 眞 (Neo Awakening) | `6d459bc74ba73ee4fe5cdc4655400193` | 眞 버서커 | True Berserker |

## Complete Base Class Tree

| Job ID | Base Class (Korean) | Base Class (English) | Subclasses |
|--------|---------------------|---------------------|------------|
| `41f1cdc2ff58bb5fdc287be0db2a8df3` | 귀검사(남) | Male Slayer | 웨펀마스터, 소울브링어, **버서커**, 아수라, 검귀 |
| `1645c45aabb008c98406b3a16447040d` | 귀검사(여) | Female Slayer | 소드마스터, 다크템플러, 데몬슬레이어, 베가본드, 블레이드 |
| `ca0f0e0e9e1d55b5f9955b03d9dd213c` | 격투가(남) | Male Fighter | 넨마스터, 스트라이커, 스트리트파이터, 그래플러 |
| `a7a059ebe9e6054c0644b40ef316d6e9` | 격투가(여) | Female Fighter | 넨마스터, 스트라이커, 스트리트파이터, 그래플러 |
| `afdf3b989339de478e85b614d274d1ef` | 거너(남) | Male Gunner | 레인저, 런처, 메카닉, 스핏파이어, 어썰트 |
| `944b9aab492c15a8474f96947ceeb9e4` | 거너(여) | Female Gunner | 레인저, 런처, 메카닉, 스핏파이어, 패러메딕 |
| `3909d0b188e9c95311399f776e331da5` | 마법사(여) | Female Mage | 엘레멘탈마스터, 소환사, 배틀메이지, 마도학자, 인챈트리스 |
| `a5ccbaf5538981c6ef99b236c0a60b73` | 마법사(남) | Male Mage | 엘레멘탈 바머, 빙결사, 블러드 메이지, 스위프트 마스터, 디멘션워커 |
| `f6a4ad30555b99b499c07835f87ce522` | 프리스트(남) | Male Priest | 크루세이더, 인파이터, 퇴마사, 어벤저 |
| `0c1b401bb09241570d364420b3ba3fd7` | 프리스트(여) | Female Priest | 크루세이더, 이단심판관, 무녀, 미스트리스 |
| `ddc49e9ad1ff72a00b53c6cff5b1e920` | 도적 | Thief | 로그, 사령술사, 쿠노이치, 섀도우댄서 |
| `0ee8fa5dc525c1a1f23fc6911e921e4a` | 나이트 | Knight | 엘븐나이트, 카오스, 팔라딘, 드래곤나이트 |
| `3deb7be5f01953ac8b1ecaa1e25e0420` | 마창사 | Demonic Lancer | 뱅가드, 듀얼리스트, 드래고니안 랜서, 다크 랜서 |
| `986c2b3d72ee0e4a0b7fcfbe786d4e02` | 총검사 | Agent | 히트맨, 요원, 트러블 슈터, 스페셜리스트 |
| `b9cb48777665de22c006fabaf9a560b3` | 아처 | Archer | 뮤즈, 트래블러, 헌터, 비질란테, 키메라 |
| `17e417b31686389eebff6d754c3401ea` | 다크나이트 | Dark Knight | 자각1 → 자각2 → 眞 다크나이트 |
| `b522a95d819a5559b775deb9a490e49a` | 크리에이터 | Creator | 자각1 → 자각2 → 眞 크리에이터 |

## Advancement Pattern

All standard classes follow the 4-stage advancement chain:
1. **1차** (Base subclass) — jobGrowId: shared IDs across classes
2. **2차** (1st Awakening, ~Lv 50)
3. **3차** (2nd Awakening, ~Lv 75)
4. **眞** (Neo Awakening, ~Lv 100)

Dark Knight and Creator have a simplified 2-stage advancement (자각1 → 자각2 → 眞).

## Real Character Sample (Cain server)

| Field | Value |
|-------|-------|
| characterId | `a4a888512a111a6771e18d355c3f3f3a` |
| characterName | 검신 |
| level | 115 |
| jobId | `41f1cdc2ff58bb5fdc287be0db2a8df3` (귀검사(남)) |
| jobGrowId | `37495b941da3b1661bc900e68ef3b2c6` (眞 웨펀마스터) |
| fame | 110,113 |
| guildName | 야간자율학습 |
