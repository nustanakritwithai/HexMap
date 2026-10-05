# SUPERHEX-37 Golden Test Gates

Every Golden Test must ultimately define a fixed seed, initial world state, fixed command sequence, expected path/cost/event order/final state, and expected deterministic state hash.

| Test | Purpose | Current status |
| --- | --- | --- |
| G00 Blank-37 | Canonical geometry 37/90/42/96, IDs, deterministic hash | PASS — Verify run 37374039591 |
| G01 Road | Route movement and cost ownership | UNKNOWN |
| G02 Wall-Gate | Barrier/access interaction | UNKNOWN |
| G03 River-Bridge | Water barrier/crossing | UNKNOWN |
| G04 Junction | Explicit connectivity / no corner cutting | UNKNOWN |
| G05 Composite Edge | Base + Components resolver | UNKNOWN |
| G06 Overpass | Visual crossing != navigation crossing | UNKNOWN |
| G07 Destruction | Transformation/event order/invalidation | UNKNOWN |
| G08 Vertical | zLayer + physical height | UNKNOWN |
| G09 Fog | Faction knowledge separation | UNKNOWN |
| G10 Large Unit | Footprint/clearance/turning | UNKNOWN |
| G11 Adaptive Resolution | Semantic position across resolution changes | UNKNOWN |
| G12 Save Migration | Stable identity across map revisions | UNKNOWN |

## G00 evidence

Verified on PR #1 exact head `2a5573fe882253a3e6f2621107f9b929f4bd7134`.

GitHub Actions Verify run: `37374039591`.

Assertions executed successfully:

- Core Hexes = 37
- Internal Edges = 90
- Outer Boundary Edges = 42
- Logical Junction Anchors = 96
- Center = `C:0,0`
- Every Core obeys the radius-3 axial constraint
- No duplicate semantic IDs
- Every internal edge ID is canonical and connects neighbors
- Junction authority coordinates are integer-based
- Repeated builds produce the same snapshot/hash
- Expected deterministic state hash = `817c3a7a`

A Golden Test is PASS only after its asserted result was executed and verified. Missing execution evidence remains UNKNOWN.
