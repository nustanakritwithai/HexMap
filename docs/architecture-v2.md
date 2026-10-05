# SUPERHEX-37 Architecture V2 — Repository Baseline

Status: Phase 1 implementation baseline. Engineering validation is evidence-driven.

## Core model

```text
Core + Thick Edge + Junction + Linear Network + Adaptive Resolution
```

The battlefield keeps exactly 37 primary Core Hexes. Tactical detail is added through meaningful edges, junctions, networks, and adaptive runtime resolution rather than by increasing the Core count.

## Canonical geometry

```text
Radius               = 3
Rows                 = 4-5-6-7-6-5-4
Core Hexes           = 37
Internal Edges       = 90
Outer Boundary Edges = 42
Logical Junctions    = 96
Center               = (0,0)
```

A Core exists only when:

```text
max(abs(q), abs(r), abs(q+r)) <= 3
```

## Identity contract

Persistent semantic identity uses `C:`, `E:`, `V:`, `NET:`, `ROUTE:`, and `SEG:` namespaces. Runtime navigation uses `RN:` and is disposable. Saves must never depend on runtime-node identity.

Phase 1 represents junctions on an integer pointy-top lattice:

```text
center X = 2q + r
center Y = 3r
vertex offsets = (1,1) (0,2) (-1,1) (-1,-1) (0,-2) (1,-1)
```

This prevents geometry authority from relying on float equality while still allowing rendering to convert canonical integers into pixels.

## Validation policy

`UNKNOWN != PASS`.

A design that looks correct is not Engineering PASS. Deterministic CI/Golden Test evidence is required.

## Implementation order

1. Geometry Foundation
2. Core Terrain
3. Simple Edge MVP
4. Movement MVP
5. Editor MVP
6. Composite Edge
7. Combat Geometry
8. Destruction
9. Networks
10. Walkable Thick Edge
11. Advanced Resolution
12. World Systems

Do not jump ahead of the current phase gate.
