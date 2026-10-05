# HexMap — SUPERHEX-37

Reference implementation and playable prototype for the SUPERHEX-37 Tactical RPG Architecture V2.

Live target: https://nustanakritwithai.github.io/HexMap/

## Proven baseline

**M01 — Geometry Foundation / G00 Blank-37: PASS**

Locked geometry:
- 37 Core Hexes
- 90 Internal Edges
- 42 Boundary Edges
- 96 Logical Junction Anchors
- Radius 3
- Center `C:0,0`
- deterministic G00 state hash `817c3a7a`

## Current development phase

**Phase 2 — Core Terrain**

The next scope is Grass, Forest, Swamp, Mountain, Ruins, and terrain-owned movement data. Higher phases remain gated by the canonical architecture.

## Verify

```bash
npm test
```

GitHub Actions also runs:
- deterministic G00 geometry tests
- static entrypoint verification
- headless-Chrome browser smoke against the site

## Canonical references

- `AGENTS.md`
- `docs/architecture-v2.md`
- `docs/golden-tests.md`
- `docs/STATUS.md`

## Engineering policy

**UNKNOWN != PASS.** Source presence or visual plausibility is not execution evidence.
