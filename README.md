# HexMap — SUPERHEX-37

Reference implementation and playable geometry prototype for the SUPERHEX-37 Tactical RPG Architecture V2.

Live target: https://nustanakritwithai.github.io/HexMap/

## Current milestone

**M01 — Geometry Foundation / G00 Blank-37**

Locked geometry:

| Metric | Required |
| --- | ---: |
| Core Hexes | 37 |
| Internal Edges | 90 |
| Boundary Edges | 42 |
| Logical Junction Anchors | 96 |
| Radius | 3 |
| Center | `C:0,0` |

The browser prototype renders the canonical map, debug overlays, stable IDs, counts, a runtime validator, and a deterministic state hash.

## Verify

```bash
npm test
```

GitHub Actions runs the same deterministic G00 checks on `main` and pull requests.

## Engineering policy

**UNKNOWN != PASS.** A feature is not considered proven until the relevant deterministic test actually runs and verifies the expected result.

See `AGENTS.md`, `docs/architecture-v2.md`, `docs/golden-tests.md`, and `docs/STATUS.md`.
