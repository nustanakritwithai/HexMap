# HexMap Agent Contract

This repository implements SUPERHEX-37 Tactical RPG Architecture V2.

## Locked rules

- Exactly 37 Core Hexes: radius 3, rows 4-5-6-7-6-5-4.
- Exactly 90 internal shared edges, 42 outer boundary edges, and 96 logical junction anchors.
- Persistent world identity uses semantic anchors. Runtime navigation nodes are derived/disposable.
- Gameplay authority must not depend on pixels or float equality. Use canonical integer/fixed-point data.
- Visual contact does not imply navigation connectivity.
- Do not silently increase the Core Hex count to gain tactical detail.
- Every durable rule change requires deterministic tests.
- UNKNOWN != PASS. Never claim PASS without executed evidence.

## Current phase boundary

Phase 1 only: Geometry Foundation. Do not add advanced lanes, tactical AI, fog, destruction, or network traversal until the geometry gate is proven.

## Required evidence before Phase 2

G00 must prove 37/90/42/96, center C:0,0, radius-3 validity, unique canonical IDs, deterministic snapshot/hash, and validator PASS in CI.
