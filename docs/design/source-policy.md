# Source Policy

This demo uses original code and placeholder rendering only. It does not include DNF/DFO client assets, leaked code, private-server code, reverse-engineered client code, official fonts, official sounds, official maps, or original sprites.

Mechanic names and combat semantics are implemented as abstract DNF-style equivalents for a web combat-kernel verification lab. Numeric values are baseline tuning values, not official exact frame data.

## DNF/DFO Truth Hierarchy

For any DNF/DFO-aligned mechanic or number, **Neople official API verification is the first golden standard when the field is exposed by the API**. DFO-specific wiki references such as DFO World are the second golden standard for fields that official API/pages do not expose, but only after checking freshness and conflicts.

Use this source order:

1. Neople official Open API and official Nexon/Neople update or guide pages.
2. Local official-API snapshots with provenance, endpoint, capture date, and source version.
3. DFO-specific wiki/reference pages such as DFO World, used as the second golden standard for skill semantics, public level tables, command notes, and general mechanic descriptions that official API/pages do not expose.
4. General encyclopedias such as Wikipedia, used only for background context, release/server history, terminology, publisher/developer identity, and broad chronology. Do not use Wikipedia as a source for combat numbers, frame data, hitboxes, damage formulas, skill scaling, AI behavior, or live balance values.
5. Clean-room local baseline tuning in `docs/design/tuning-baseline.md`.

Official API-backed data may be used to verify skill IDs, job trees, descriptions, level tables, cooldowns, MP costs, option values, hit-count fields, and official skill text. Do not treat API data as a complete combat-engine dump: startup/active/recovery frames, hitbox/hurtbox geometry, launch and gravity curves, combo-protection thresholds, server authority rules, and network sync protocol remain calibrated baseline unless backed by another official source.

DFO-specific wiki data must be marked with page URL, accessed date, and conflict status. If it conflicts with official API or official pages, official sources win and the wiki item becomes a lower-confidence note. If a wiki page is stale or version-ambiguous, use it only as a candidate for later PVF/ANI/NPK or gameplay-video validation.

Never commit API keys. `NEOPLE_API_KEY` must come from a local environment variable or backend proxy, not frontend code or repository files.
