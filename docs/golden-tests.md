# SUPERHEX-37 Golden Test Specification

These tests are mandatory evidence gates for the SUPERHEX-37 Tactical RPG Architecture.

## General test contract

Every Golden Test must define:

```text
testId
fixedSeed
initialWorldState
fixedCommandSequence
expectedPath
expectedMovementTicks
expectedEventOrder
expectedFinalState
expectedStateHash
```

A changed expected result requires an explicit design review when it changes a normative gameplay rule.

---

## G00 — Blank-37

Purpose:

```text
Prove canonical geometry.
```

Must verify:

```text
Core Hexes = 37
Internal Edges = 90
Outer Boundary Edges = 42
Logical Junction Anchors = 96
Center = C:0,0
All Core axial coordinates satisfy radius-3 constraint
No duplicate canonical Edge IDs
```

---

## G01 — Road

Purpose:

```text
Prove route movement and cost ownership.
```

Must verify:

```text
Road changes movement speed/cost.
Road cost is not double-counted with underlying terrain over the same segment.
Physical segment length contributes to movement.
All travel links have positive integer tick cost.
Route continuity is preserved.
Dijkstra selects the minimum-tick route.
```

---

## G02 — Wall-Gate

Purpose:

```text
Prove structural barrier + access component interaction.
```

Must verify:

```text
Wall blocks crossing.
Closed Gate does not provide wall passage.
Open Gate provides a valid passage.
Road component does not bypass Wall by itself.
Wall-walk continuity may remain while ground gate state changes.
Directional cover behaves from the protected side only.
```

---

## G03 — River-Bridge

Purpose:

```text
Prove water barrier, crossing provider, and component independence.
```

Must verify:

```text
Non-swimmer cannot cross raw river.
Non-swimmer can use intact bridge.
Swimmer has a valid water crossing option.
Bridge destruction removes bridge surface.
River remains after Bridge destruction.
Unit on bridge resolves correctly if bridge collapses.
```

---

## G04 — Junction

Purpose:

```text
Prove explicit connectivity and no corner cutting.
```

Must verify:

```text
Geometry touching does not auto-connect channels.
Road does not auto-connect to wall_walk.
Explicit Stairs/Ladder/Gate connector can connect compatible channels.
No Core-to-Core corner cut through a non-playable Junction.
```

---

## G05 — Composite Edge

Purpose:

```text
Prove Base + Components resolver.
```

Use at least:

```text
Ground + Wall + Gate + Road
```

Must verify:

```text
Component order does not change result.
Each component retains independent state.
Destroying Gate does not destroy Wall/Road.
Road cannot override Wall barrier without passage provider.
```

---

## G06 — Overpass

Purpose:

```text
Prove visual crossing != navigation crossing.
```

Must verify:

```text
Two routes may overlap XY.
Different zLayers remain topologically separate.
No turn between routes without explicit connector.
Ramp/Stairs connector enables intended layer transition.
```

---

## G07 — Destruction

Purpose:

```text
Prove transformation + event order + graph invalidation.
```

Must verify:

```text
Wall/Gate/Bridge damage states advance deterministically.
Transformation Recipe creates expected debris/breach state.
Only affected graph region is invalidated when possible.
navigationRevision increments.
A stale cached path cannot traverse newly destroyed/blocked topology.
Expected event order is stable.
```

---

## G08 — Vertical

Purpose:

```text
Prove multi-layer topology and physical height.
```

Must verify:

```text
Tunnel, Ground and Bridge can overlap XY.
zLayer separates topology.
heightHU controls LOS/clearance behavior.
Only explicit vertical connectors change zLayer.
```

---

## G09 — Fog

Purpose:

```text
Prove faction knowledge separation.
```

Must verify:

```text
Hidden obstacle exists in World State.
Faction does not plan around unknown feature until discovered.
Perceived Graph differs from World Graph as expected.
Discovery updates faction knowledge.
Current path is revalidated after discovery.
AI does not access hidden feature without knowledge.
```

---

## G10 — Large Unit

Purpose:

```text
Prove footprint, clearance and turning.
```

Must verify:

```text
Size-1 unit passes narrow route.
Oversized Cart/Boss is rejected when clearance insufficient.
Footprint occupancy validates every covered position.
Rotation checks swept footprint.
Unit may fit linearly but fail to turn in insufficient space.
```

---

## G11 — Adaptive Resolution

Purpose:

```text
Prove semantic location survives runtime resolution changes.
```

Must verify:

```text
Level 2 -> Level 3 preserves Edge Anchor.
Semantic u maps deterministically to L/C/R.
Level 3 -> Level 2 is rejected when capacity would be violated.
Forced collapse uses Evacuation Resolver.
Save does not depend on RN:* IDs.
```

---

## G12 — Save Migration

Purpose:

```text
Prove stable identity across map revisions.
```

Must verify:

```text
Old save loads against newer mapRevision.
Tombstoned IDs are never silently reused.
Split Segment mapping resolves semantic u to correct replacement segment.
Unit/component state survives migration.
Fallback relocation is deterministic when no direct mapping exists.
```

---

## PASS policy

A Golden Test is PASS only when the asserted expected result was actually executed and verified.

Use:

```text
UNKNOWN
```

when a test did not run, evidence is missing, environment is unavailable, or only design reasoning exists.

Never convert UNKNOWN into PASS because the implementation "looks correct."