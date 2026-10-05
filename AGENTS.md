# HexMap Agent Contract

This repository implements **SUPERHEX-37 Tactical RPG Architecture V2**.

Canonical references:
- `docs/architecture-v2.md`
- `docs/golden-tests.md`

If this file conflicts with the canonical architecture, surface the conflict and follow `docs/architecture-v2.md`.

## Locked rules

- Exactly 37 Core Hexes: radius 3, rows 4-5-6-7-6-5-4.
- Exactly 90 internal shared Edges, 42 outer boundary Edges, and 96 logical Junction Anchors.
- Persistent world identity uses semantic anchors. Runtime navigation nodes are derived/disposable.
- Gameplay authority must not depend on pixels or float equality.
- Visual contact does not imply navigation connectivity.
- Do not increase the Core Hex count to gain tactical detail.
- Every durable rule change requires deterministic tests.
- `UNKNOWN != PASS`. Never claim PASS without executed evidence.

## Proven baseline

M01 / G00 Geometry Foundation is proven and locked:
- 37 Core
- 90 Internal Edges
- 42 Boundary Edges
- 96 Junction Anchors
- stable semantic IDs
- integer/fixed-point geometry authority
- deterministic state hash
- validator and CI evidence

Any geometry-affecting change must rerun G00 and preserve the locked counts and semantic-ID contract.

## Current phase boundary

**Phase 2 — Core Terrain** is the next implementation phase.

Allowed next scope:
- Grass
- Forest
- Swamp
- Mountain
- Ruins
- terrain-owned movement data

Do not jump to advanced lanes, tactical AI, Fog of War, destruction, or advanced network traversal before their preceding phase gates are proven.
