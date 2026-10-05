# SUPERHEX-37 TACTICAL RPG ARCHITECTURE V2

**Version:** 2.0  
**Status:** Design-complete candidate; engineering validation still required  
**Purpose:** สเปกหลักสำหรับพัฒนา Tactical RPG บนสนาม Superhex-37 ที่รองรับ Terrain, Thick Edge, Junction, Road/River/Wall Networks, Movement, Combat, LOS, Cover, Elevation, Destruction, Fog of War, AI, Editor, Save Migration และ Golden Tests

---

# 0. สถานะและหลักการ

เอกสารฉบับนี้รวมการแก้ข้อจำกัดด้านสถาปัตยกรรมสองรอบเข้าด้วยกัน

สถานะปัจจุบัน:

```text
Design Review Round 1: 20/20 addressed
Design Review Round 2: 20/20 addressed
Engineering Proof: UNKNOWN ≠ PASS
```

ดังนั้น:

> ระบบถือว่า “ออกแบบครบ” แต่ยังไม่ถือว่า “พิสูจน์แล้ว”  
> จนกว่า Prototype, Validator และ Golden Tests จะผ่านจริง

หลักการสำคัญที่สุด:

> Superhex-37 ยังคงมี 37 Core Hex เท่านั้น

เราไม่แก้ปัญหาความละเอียดโดยเพิ่ม Hex หลักหลายร้อยช่อง แต่เพิ่มความหมายให้พื้นที่เดิมผ่าน:

```text
Core
+
Thick Edge
+
Junction
+
Linear Network
+
Adaptive Resolution
```

---

# 1. Core Design Philosophy

ความหมายขององค์ประกอบ:

```text
Core      = ตัวละครอยู่ที่ไหน
Edge      = ตัวละครผ่านไปอย่างไร
Junction  = เส้นทางต่าง ๆ เชื่อมกันอย่างไร
Network   = ถนน แม่น้ำ กำแพง และคลองต่อเนื่องอย่างไร
Anchor    = identity ถาวรของตำแหน่งในโลก
Runtime Node = representation ที่ Compile ตามสถานะปัจจุบัน
```

เป้าหมาย:

```text
37 Core Hex
แต่ Tactical Depth สูง
```

รองรับ:

- ป่า
- ถนน
- แม่น้ำ
- คลอง
- สะพาน
- กำแพง
- ประตู
- หอคอย
- หน้าผา
- สนามเพลาะ
- ท่าเรือ
- ทางลับ
- การปีน
- การเดินบนกำแพง
- การทำลายสะพาน
- การพังกำแพง
- Choke Point
- การควบคุมเส้นทาง
- Fog of War
- Tactical AI
- Multi-level terrain

---

# 2. Superhex-37 Geometry

ใช้:

```text
Radius = 3
Side Length = 4
```

รูปแบบแถว:

```text
4
5
6
7
6
5
4
```

ผลรวม:

```text
4 + 5 + 6 + 7 + 6 + 5 + 4 = 37
```

รูปทรง:

```text
          ⬡ ⬡ ⬡ ⬡
        ⬡ ⬡ ⬡ ⬡ ⬡
      ⬡ ⬡ ⬡ ⬡ ⬡ ⬡
    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡
      ⬡ ⬡ ⬡ ⬡ ⬡ ⬡
        ⬡ ⬡ ⬡ ⬡ ⬡
          ⬡ ⬡ ⬡ ⬡
```

---

# 3. Axial Coordinates

ใช้พิกัด:

```text
(q, r)
```

Center:

```text
(0,0)
```

Hex ที่ถูกต้อง:

```text
max(abs(q), abs(r), abs(q+r)) <= 3
```

ตัวอย่าง generator:

```js
const R = 3;
const cells = [];

for (let r = -R; r <= R; r++) {
  const qMin = Math.max(-R, -r - R);
  const qMax = Math.min(R, -r + R);

  for (let q = qMin; q <= qMax; q++) {
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= R) {
      cells.push({ q, r });
    }
  }
}

console.assert(cells.length === 37);
```

---

# 4. Geometry Counts

ค่าที่ต้องล็อก:

```text
37 Core Hex
90 Internal Edges
42 Outer Boundary Edge Segments
96 Logical Junction Anchors
```

Internal Edges:

```text
37 × 6 = 222 total cell sides

(222 - 42) / 2 = 90 internal shared edges
```

ค่าทั้งหมดนี้ต้องถูก Validator ตรวจทุก Map

---

# 5. Persistent World vs Runtime Model

Architecture V2 แยกสองระดับชัดเจน:

```text
PERSISTENT WORLD MODEL
        ↓
MAP COMPILER
        ↓
DERIVED RUNTIME MODEL
```

Persistent World Model เก็บ:

```text
Core Anchors
Edge Anchors
Boundary Anchors
Junction Anchors
Components
Networks
Control
Map Revision
Semantic Locations
```

Runtime Model เก็บ:

```text
Navigation Nodes
Navigation Links
LOS Geometry
Cover Queries
Occupancy
Visibility Graph
AI Abstract Graph
Spatial Query Acceleration
```

Runtime Model สามารถ rebuild ได้

Persistent World Model คือ authority

---

# 6. Stable Semantic Anchors

Persistent identity:

```text
C:     Core Anchor
E:     Edge Anchor
V:     Junction Anchor
NET:   Network
ROUTE: Route
SEG:   Segment
```

ตัวอย่าง:

```text
C:0,0
E:0,0|1,0
V:42
NET:road
ROUTE:royal_road
SEG:royal_road:17
```

Runtime Node ใช้ namespace:

```text
RN:
```

เช่น:

```text
RN:E:0,0|1,0:C
```

กฎสำคัญ:

> Runtime Node ไม่ใช่ world identity  
> ห้าม Save Runtime Node เป็นตำแหน่ง canonical

---

# 7. Unit Semantic Location

ตำแหน่ง Unit บน Core:

```js
{
  anchorType: "core",
  anchorId: "C:0,0"
}
```

บน Edge:

```js
{
  anchorType: "edge",
  anchorId: "E:0,0|1,0",
  surface: "wall_walk",
  u: 5200,
  preferredSlot: "C"
}
```

`u` ใช้ Fixed-point:

```text
0..10000
```

ตัวอย่าง:

```text
0     = ปลายซ้าย
5000  = กลาง
10000 = ปลายขวา
```

---

# 8. Adaptive Resolution Identity

Edge สามารถเปลี่ยน:

```text
Level 0
→ Level 1
→ Level 2
→ Level 3
```

โดย Edge Anchor ID ไม่เปลี่ยน

Level 2:

```text
RN:E:0,0|1,0:main
```

Level 3:

```text
RN:E:0,0|1,0:L
RN:E:0,0|1,0:C
RN:E:0,0|1,0:R
```

Map semantic `u` ไป Lane:

```text
L: 0    <= u < 3333
C: 3333 <= u < 6667
R: 6667 <= u <= 10000
```

Resolution collapse ห้ามเกิดถ้า Capacity ใหม่รองรับ Unit ปัจจุบันไม่ได้

ถ้า collapse เกิดเพราะ destruction ใช้ Evacuation Resolver

---

# 9. Evacuation Resolver

เมื่อ Surface หายจริง เช่น Bridge พัง:

ลำดับย้าย Unit:

```text
1. Valid node on same anchor
2. Adjacent Edge node
3. Adjacent Core
4. Adjacent Junction
5. Special consequence
```

Tie-break:

```text
Shortest distance
→ passable
→ capacity available
→ movement mode valid
→ stable deterministic ID
```

ถ้าไม่มีที่ปลอดภัย:

```text
Fall
Drown
Pinned
Crushed
Destroyed with structure
```

ตาม Feature

---

# 10. Logical Hex vs Gameplay Space

Logical Hex ไม่เปลี่ยน geometry หลัก

ใช้สำหรับ:

```text
Coordinate
Neighbor
Hex Distance
Index
Topology
Superhex Structure
```

Gameplay Space แบ่ง:

```text
Core Polygon
Edge Polygon
Junction Polygon
```

กฎ:

```text
Core / Edge / Junction ต้องไม่ overlap ใน authority geometry
```

---

# 11. Thick Edge Geometry

ขอบ Hex เดิมคือ:

```text
Edge Centerline
```

Edge Full Width:

```text
W
```

Internal Edge แบ่ง:

```text
W/2 เข้า Hex A
W/2 เข้า Hex B
```

Core หดเฉพาะด้านที่มี Thick Edge

---

# 12. Edge Width Ratio

ใช้ Fixed-point width ratio:

```text
0..3000
```

โดย:

```text
10000 = 100% ของ Hex Radius
```

มาตรฐาน:

```text
Level 0 Normal             = 0
Level 1 Functional         = 800–1200
Level 2 Walkable           = 1200–2000
Level 3 Major/Three-Lane   = 2000–3000
Maximum                    = 3000
```

เทียบ decimal:

```text
0.08–0.12
0.12–0.20
0.20–0.30
```

Core Area Constraint:

```text
Core Area >= 65% ของ Logical Hex
```

---

# 13. Edge Resolution Levels

## Level 0

```text
⬡ | ⬡
```

ไม่มี Gameplay Edge Space

## Level 1

```text
⬡ ═ ⬡
```

Functional Edge

```text
capacity = 0
```

## Level 2

```text
⬡ ███ ⬡
```

Walkable Thick Edge

```text
capacity >= 1
```

## Level 3

```text
⬡ [L][C][R] ⬡
```

Detailed Tactical Edge

ใช้เฉพาะจุดสำคัญ

---

# 14. Adaptive Complexity Rule

ไม่สร้าง Lane/Node ทุกจุด

แยก:

```text
Visual Band
Logical Band
Playable Node
```

Cross-section สามารถละเอียดมากกว่า Graph

หลัก:

> Geometry detail does not imply navigation node creation

---

# 15. Local Edge Coordinates

แต่ละ Edge มี:

```text
U = ตามแนว Edge
V = ข้าม Edge
```

Feature orientation:

```text
along
cross
area
```

ตัวอย่าง:

```text
Wall   = along
River  = along
Bridge = cross
Gate   = cross
Road   = along/cross
```

---

# 16. Cross Section Profiles

## River

```text
[Bank][Shallow][Deep][Shallow][Bank]
```

## Wall

```text
[Outside][Wall Face][Wall Walk][Wall Face][Inside]
```

## Road

```text
[Shoulder][Road][Road][Shoulder]
```

Schema:

```js
crossSection: [
  { id:"bank_a",  v0:-5000, v1:-3200, channel:"ground" },
  { id:"shallow", v0:-3200, v1:-1500, channel:"water" },
  { id:"deep",    v0:-1500, v1: 1500, channel:"water" },
  { id:"shallow", v0: 1500, v1: 3200, channel:"water" },
  { id:"bank_b",  v0: 3200, v1: 5000, channel:"ground" }
]
```

---

# 17. Composite Edge Model

ห้าม:

```js
edge.type = "wall";
```

ใช้:

```text
Edge
=
1 Base Medium
+
0..N Components
```

Base Medium:

```text
ground
water
chasm
lava
```

Feature categories:

```text
structure
route
crossing
access
obstacle
hazard
effect
```

---

# 18. Composite Edge Example

```js
edge = {
  id: "E:0,0|1,0",

  widthRatio: 2000,

  base: {
    kind: "ground"
  },

  features: [
    {
      id: "wall_12",
      category: "structure",
      kind: "wall",
      orientation: "along",
      state: "intact",
      hp: 300
    },

    {
      id: "gate_12",
      category: "crossing",
      kind: "gate",
      orientation: "cross",
      slot: "C",
      state: "open",
      hp: 180
    },

    {
      id: "road_07",
      category: "route",
      kind: "road",
      orientation: "cross",
      slot: "C"
    }
  ]
};
```

---

# 19. Component State Independence

State แยกต่อ Component

ตัวอย่าง:

```text
Wall = intact
Gate = destroyed
Road = normal
```

ห้ามใช้ State ก้อนเดียวทั้ง Edge

---

# 20. Requirements / Providers

Traversal ไม่ใช้ priority override แบบง่าย

ตัวอย่าง:

River:

```text
requires water_crossing
```

Bridge:

```text
provides ground_crossing_over_water
```

Wall:

```text
blocks wall_barrier
```

Gate Open:

```text
provides wall_passage
```

Road ไม่ลบ Wall Barrier

---

# 21. Surface Ownership for Movement

ห้ามคิด Cost ซ้ำ:

```text
Forest × Road × Edge
```

แต่ละ Movement Segment มี primary surface หนึ่งตัว:

```js
{
  lengthHU: 4200,
  surface: "road",
  movementMode: "walk"
}
```

เมื่ออยู่บน Road ใช้ Road speed

เมื่อออกจาก Road เข้าป่า ใช้ Forest speed

Feature อื่นเพิ่มเฉพาะ cost ที่มีเหตุผลคนละประเภท:

```text
Climb
Open Gate
Hazard
Reaction
```

---

# 22. Physical Distance Movement

Movement Cost คำนวณจาก segment length

สูตร:

```text
TravelTime =
Σ (SegmentLength / EffectiveSpeed)
+ ActionCost
```

Edge ที่กว้างกว่าจะใช้เวลา crossing มากกว่า

เช่น River width 0.30 ใช้เวลาเกิน River width 0.10

ไม่ hard-code River ทุกแห่งเป็น Cost เท่ากัน

---

# 23. Integer Movement Ticks

Runtime ใช้ integer ticks

ตัวอย่าง:

```text
100 ticks = 1 MOVE
```

กฎ:

```text
Travel Edge Cost >= 1 tick
Negative Cost = invalid
Zero-cost travel loop = forbidden
```

Representation-only transitions ให้ Compiler contract รวม ไม่สร้าง zero-cost cycle

---

# 24. Crossing vs Along

Edge มีสอง traversal dimensions

```text
Cross:
Core A → Edge → Core B
```

```text
Along:
เดินตาม Edge
```

ตัวอย่าง:

```text
Wall:
crossable = false
walkableAlong = true

River:
cross = swim/bridge/ford
along = boat

Road:
cross = true
along = fast
```

---

# 25. Junction Anchors

Superhex-37 มี:

```text
96 Logical Junction Anchors
```

แต่ไม่สร้าง Gameplay Node ทั้งหมด

Default:

```text
playable = false
capacity = 0
```

---

# 26. Junction Port/Channel Model

หนึ่ง Junction มีสูงสุด 3 geometric ports

```text
        Port A
          │
Port B ── J ── Port C
```

Channels:

```text
ground
road
wall_walk
water
```

Geometry touching ไม่เท่ากับ navigation connected

---

# 27. Explicit Junction Links

ตัวอย่าง Wall Corner:

```text
wall_walk A ↔ wall_walk B
```

Road ชน Wall:

```text
road ↔ wall_walk = false
```

จนกว่าจะมี:

```text
stairs
ladder
gate
```

ป้องกัน corner cutting

---

# 28. Playable Junction Features

เปิด Junction เป็น Node เฉพาะ:

```text
Tower
Crossroad
Stairs
Dock
Bastion
Watch Post
Gate Tower
```

ตัวอย่าง Tower:

```text
Elevation +1
Cover +50%
Vision +1
Capacity 1
```

---

# 29. Linear Networks

Road / River / Canal / Wall มี identity ต่อเนื่อง

Hierarchy:

```text
Network
 └── Route
      └── Segment
```

ตัวอย่าง:

```text
Road Network
 └── Royal Road
      ├── Segment 01
      ├── Segment 02
      └── Segment 03
```

---

# 30. Segment Hosts

Segment สามารถอยู่บน:

```text
Core
Edge
Junction
Boundary
```

จึงมี Route ต่อเนื่องข้ามทั้งสนาม

---

# 31. Route Intersections

Visual crossing ไม่เท่ากับ navigation connection

รองรับ:

```text
at_grade
overpass
underpass
blocked
```

At-grade ต้องมี Connector

Overpass ห้าม auto-connect

---

# 32. Road vs River Crossing

Bridge เชื่อม Ground Route ข้าม Water Barrier

แต่ Bridge ไม่เชื่อม Road Navigation ไป River Navigation โดยอัตโนมัติ

ถ้าต้องเปลี่ยน Walk → Boat ต้องมี:

```text
Dock
Ramp
Access Connector
```

---

# 33. Spatial Graph vs Network Graph

แยก:

```text
Spatial Graph:
Core / Edge / Junction
```

จาก:

```text
Network Graph:
Road / River / Wall / Canal
```

เชื่อมด้วย Connector Graph

Map Compiler รวมเป็น Runtime Weighted Graph

---

# 34. Navigation Revision

ทุก topology change:

```text
Gate Open
Gate Closed
Bridge Destroyed
Wall Breached
Road Blocked
Connector Changed
```

เพิ่ม:

```js
navigationRevision++;
```

Path Plan เก็บ revision

ถ้า stale ต้อง revalidate/repath

---

# 35. Incremental Movement Execution

Path เป็น Plan ไม่ใช่ guarantee

ทำทีละ transition:

```text
Validate
→ Commit
→ Reaction
→ Validate next
```

ตรวจทุก step:

```text
Occupancy
Gate state
Edge state
ZOC
Reaction
Capabilities
Navigation revision
```

ถ้า path ถูก block กลางทาง Unit หยุดที่ตำแหน่งล่าสุดที่ valid

---

# 36. Deterministic Event Pipeline

ลำดับ:

```text
Intent
→ Validate
→ Reserve Cost
→ Pre-Reaction
→ Commit
→ Damage/Effect Batch
→ Structural Resolution
→ Forced Movement/Fall
→ Post-Reaction
→ Visibility/Control Update
→ Navigation Invalidation
→ Cleanup
```

Tie-break:

```text
Initiative
→ Command Sequence
→ Stable Entity ID
```

---

# 37. Occupancy

Default capacities:

```text
Core Node           = 1
Functional Edge     = 0
Walkable Edge       = 1
Lane                = 1
Normal Junction     = 0
Playable Junction   = 1
```

Friendly occupied:

```text
block by default
```

Enemy occupied:

```text
block + attack target
```

---

# 38. Unit Facing

ทุก Unit มี:

```js
facingDir: 0..5
```

สัมพันธ์กับ 6 Hex Directions

ใช้คำนวณ:

```text
Front
Side
Rear
```

ใช้กับ:

```text
Shield
Backstab
Spear
Directional Defense
Reaction
```

---

# 39. Directional Cover

Cover ต้อง query จาก attacker direction

ตัวอย่าง:

```text
Wall ทางตะวันตก
ศัตรูยิงจากตะวันตก → ได้ cover
ศัตรูยิงจากตะวันออก → ไม่ได้ cover
```

Feature:

```js
{
  cover: 0.5,
  coverNormal: direction,
  coverArc: ...
}
```

Immediate cover ใช้ best relevant cover

Smoke/Concealment เป็นระบบแยก

---

# 40. Large Unit Footprint

Unit มี:

```text
sizeClass
anchor
orientation
footprint
```

ตัวอย่าง:

```js
{
  sizeClass: 3,
  footprint: [
    [0,0],
    [1,0],
    [0,1]
  ]
}
```

ก่อนวาง/เดินตรวจ:

```text
Terrain
Occupancy
Clearance
Elevation
Footprint
```

---

# 41. Rotation and Swept Footprint

Hex rotation เป็น 60°

ก่อนหมุนตรวจ:

```text
old footprint ∪ new footprint
```

เพื่อกัน Unit หมุนทะลุกำแพง/Unit อื่น

Turning Cost รองรับ:

```text
unit type
size
terrain
vehicle
```

---

# 42. Elevation V2

แยก:

```text
zLayer
```

กับ:

```text
heightHU
```

ตัวอย่าง:

```text
Tunnel  zLayer=-1
Ground  zLayer=0
Bridge  zLayer=1
Tower   zLayer=2
```

LOS ใช้ heightHU

Navigation เชื่อม zLayer ด้วย:

```text
Stairs
Ramp
Ladder
Slope
Elevator
```

---

# 43. Clearance

Edge/Structure รองรับ:

```text
clearance
underClearanceHU
width
```

ใช้กับ:

```text
Cart
Horse
Boss
Siege Engine
Large Creature
```

---

# 44. Line of Sight

LOS authority ใช้ Gameplay Geometry

ตรวจ:

```text
Core blockers
Edge blockers
Junction blockers
Feature height
Unit eye height
Smoke
Elevation
```

ไม่ใช้ pixel raycast เป็น authority

---

# 45. Area of Effect

AoE ใช้ Gameplay Shape:

```text
Circle
Cone
Line
Ring
Polygon
```

ตรวจ:

```text
Effect Shape ∩ Target Footprint
```

จึง affect:

```text
Unit
Gate
Bridge
Wall
Tower
Barricade
```

ได้เหมือนกัน

---

# 46. Propagation Effects

แยกจาก direct AoE

เช่น:

```text
Fire
Smoke
Flood
Poison
```

Propagation ตาม Graph และ Barrier

Wall อาจ block propagation บางชนิด

---

# 47. Destruction Transformations

Destruction ไม่จบที่ state=destroyed

ใช้ Transformation Recipe

Wall:

```text
Wall destroyed
→ remove wall blocker
→ add rubble
→ movement penalty
→ partial cover
```

Bridge:

```text
Bridge destroyed
→ remove bridge surface
→ expose river/chasm
→ add debris
```

Gate:

```text
Gate destroyed
→ breach
→ rubble
```

---

# 48. Dynamic Graph Invalidation

เมื่อ Component เปลี่ยน:

```text
1. update component
2. identify affected anchors
3. invalidate local runtime graph
4. rebuild affected links
5. increment navigationRevision
6. invalidate caches lazily
```

ไม่ rebuild ทั้งสนามโดยไม่จำเป็น

---

# 49. Fog of War

แยก:

```text
World State
```

กับ:

```text
Faction Knowledge State
```

Knowledge states:

```text
Unknown
Seen
Observed
Confirmed
Stale
```

ผู้เล่น/AI ใช้ Perceived Graph ของฝ่ายตัวเอง

ไม่ใช้ข้อมูลลับจาก World State

---

# 50. Hidden Features

ตัวอย่าง:

```text
World:
Road + Hidden Barricade

Player Knowledge:
Road only
```

เมื่อพบ:

```text
Knowledge update
→ perceived graph update
→ current path may interrupt
```

---

# 51. Ownership and Control

Feature/Node สำคัญมี:

```js
control: {
  controllerFactionId: "red",
  contested: false,
  accessPolicy: "allied",
  captureRule: "occupy"
}
```

Network Owner เป็น metadata

Local Controller เป็น gameplay authority

ตัวอย่าง Road Network อาจเป็นของเมือง แต่ Bridge บางจุดถูกศัตรูยึด

---

# 52. AI Architecture

AI แบ่ง:

```text
1. Reachability
2. Coarse Corridor
3. Local Tactical Expansion
4. Tactical Evaluation
```

ไม่ expand detailed L/C/R ทั้งสนาม

ใช้:

```text
Top-K candidates
Reachability cache
Unit profile cache
Navigation revision cache
```

---

# 53. Tactical AI Score

ตัวอย่าง:

```text
Score =
Objective
+ Cover
+ Height
+ Flank
+ Formation
- MoveCost
- Exposure
- Hazard
- EnemyThreat
```

AI ต้องใช้ Faction Knowledge ไม่ใช่ omniscient state

---

# 54. Procedural Generation

Pipeline:

```text
Generate
→ Compile
→ Validate
→ Repair
→ Score
→ Accept / Reject
```

ต้องใช้ deterministic seed

---

# 55. Procedural Playability Constraints

ขั้นต่ำ:

```text
Spawn ทุกจุดต้องออกได้
Mandatory Objective ต้องเข้าถึงได้
ไม่มี isolated mandatory objective
River ที่ขวาง objective ต้องมี crossing solution
Wall/Gate ต้องมี access/breach solution
Mission-required unit ต้อง traverse route ได้
```

Metrics:

```text
Choke count
Route diversity
Cover distribution
Elevation balance
Spawn exposure
Objective access
```

---

# 56. Fixed-point Geometry

Logic ไม่ใช้ float equality

ใช้:

```text
GEOM_SCALE = 10000

u           0..10000
widthRatio  0..3000
heightHU    integer
```

Rendering จึงแปลง canonical integer → pixels

Connectivity ไม่พึ่ง pixel contact

---

# 57. Map Revision

ทุก Map มี:

```text
mapRevision
```

แก้โครงสร้างต้องเพิ่ม revision

Stable IDs ห้าม reuse หลังลบ

---

# 58. Tombstones and Migration

Anchor/Segment ที่ถูกลบให้เก็บ Tombstone

ถ้า Segment split:

```text
SEG:17
→ SEG:17A
→ SEG:17B
```

Migration:

```js
{
  from: "SEG:17",
  byU: [
    [0,5000,"SEG:17A"],
    [5000,10000,"SEG:17B"]
  ]
}
```

Save เก่า resolve ไป Segment ใหม่ได้

---

# 59. Save Architecture

แยก:

```text
Static Map Definition
Runtime Save State
```

Save header:

```json
{
  "schemaVersion": 2,
  "mapId": "battle_001",
  "mapRevision": 12
}
```

Runtime State:

```text
Unit semantic locations
HP
Component states
Gate state
Wall HP
Bridge state
Effects
Objectives
Faction knowledge
Control
```

---

# 60. Save Migration

รองรับ:

```text
Schema Migration
Map Revision Migration
Anchor Migration
Segment Split/Merge Mapping
Unit Relocation Fallback
```

---

# 61. Mobile UX

Editor/Game UI ใช้ Contextual Density

Default:

```text
Terrain
Units
Major Edges
Objectives
```

Edge Mode:

```text
select only edges
expand touch target
hide irrelevant core interactions
```

Touch target:

```text
~44 CSS px minimum
```

โดยไม่เปลี่ยน gameplay width

---

# 62. Semantic Zoom

Far:

```text
Terrain
Major Road
River
Wall
Objectives
```

Medium:

```text
Gate
Bridge
Junction
Minor Road
```

Near:

```text
Cross Section
L/C/R
Cover
Elevation
Nodes
Units
```

Gameplay Geometry ไม่เปลี่ยนตาม Zoom

---

# 63. Editor Modes

```text
Core Mode
Edge Mode
Junction Mode
Route Mode
Unit Mode
Test Mode
```

---

# 64. Editor Features

```text
Undo
Redo
Paint Drag
Copy Properties
Delete
Continue Route
Split Route
Layer Visibility
Validate
Movement Test
LOS Test
AI Test
```

---

# 65. Central Rule Resolver

ทุก subsystem query source data ชุดเดียว

Functions:

```text
resolveTraversal()
resolveOccupancy()
resolveLOS()
resolveCover()
resolveAttack()
resolveHazard()
resolveDestruction()
resolveControl()
```

Components เป็นข้อมูล

Resolver เป็น authority

---

# 66. Rule Resolution Order

เพื่อ deterministic:

```text
Base
Structural Constraints
Access Providers
Movement Modifiers
Hazards
Effects
Unit Capabilities
```

Feature array order ห้ามมีผล

---

# 67. Map Compiler

Input:

```text
Persistent World Model
```

Output:

```text
Runtime Navigation Graph
Occupancy Graph
LOS Query Data
Cover Data
Visibility Graph
AI Coarse Graph
Spatial Indices
```

---

# 68. Validator — Geometry

ต้องผ่าน:

```text
37 Core
90 Internal Edge
42 Outer Edge
96 Junction Anchors
```

และ:

```text
No gameplay polygon overlap
Core Area >= 65%
widthRatio <= 0.30
```

---

# 69. Validator — Topology

ตรวจ:

```text
Neighbor symmetry
Canonical edge IDs
Valid endpoints
No duplicate edge
No corner cutting
Valid zLayer connectors
```

---

# 70. Validator — Components

ตรวจ:

```text
Exactly 1 Base per Edge
Unique Component IDs
Valid dependencies
Valid slots
Valid U/V ranges
Valid states
Valid transformations
```

ตัวอย่าง:

```text
Ford without water = FAIL
```

---

# 71. Validator — Networks

ตรวจ:

```text
Segment host exists
Route ports valid
Network IDs valid
Route continuity
Overpass does not auto-connect
Bridge does not auto-connect road to river
Boundary continuation valid
```

---

# 72. Validator — Navigation

ตรวจ:

```text
No dangling connectors
No illegal zero-cost cycles
All travel links > 0 tick
Capacity valid
No route teleport
Runtime nodes map to semantic anchors
```

---

# 73. Validator — Save Compatibility

ตรวจ:

```text
Stable IDs
Tombstones
Schema migration
Map revision migration
Segment mappings
Semantic unit locations
```

---

# 74. Golden Test Maps

ต้องมี Canonical deterministic test maps:

```text
G00 Blank-37
G01 Road
G02 Wall-Gate
G03 River-Bridge
G04 Junction
G05 Composite Edge
G06 Overpass
G07 Destruction
G08 Vertical
G09 Fog
G10 Large Unit
G11 Adaptive Resolution
G12 Save Migration
```

---

# 75. Golden Test G00 — Blank-37

พิสูจน์:

```text
37 Core
90 Internal Edge
42 Outer Edge
96 Junction
```

ไม่มี terrain special

---

# 76. G01 — Road

พิสูจน์:

```text
road route continuity
physical length cost
no double counting
```

---

# 77. G02 — Wall-Gate

พิสูจน์:

```text
Gate Closed = block
Gate Open = pass
Wall Walk remains
Directional Cover works
```

---

# 78. G03 — River-Bridge

พิสูจน์:

```text
Non-swimmer uses bridge
Swimmer has water option
Bridge destruction removes bridge path
River remains
```

---

# 79. G04 — Junction

พิสูจน์:

```text
No corner cutting
Road does not auto-connect to wall_walk
Explicit stairs link works
```

---

# 80. G05 — Composite Edge

พิสูจน์:

```text
Wall + Gate + Road
component order independence
```

---

# 81. G06 — Overpass

พิสูจน์:

```text
Visual crossing != navigation connection
Different zLayer traversal
```

---

# 82. G07 — Destruction

พิสูจน์:

```text
Bridge/Wall state changes
Transformation Recipe
Local graph invalidation
Event ordering
```

---

# 83. G08 — Vertical

พิสูจน์:

```text
Tunnel / Ground / Bridge overlap XY
but remain separate topology
```

---

# 84. G09 — Fog

พิสูจน์:

```text
Hidden obstacle unknown
Perceived Graph differs from World Graph
Discovery interrupts stale path
AI does not cheat
```

---

# 85. G10 — Large Unit

พิสูจน์:

```text
Infantry passes
Cart blocked by narrow clearance
Boss footprint validation
Rotation sweep validation
```

---

# 86. G11 — Adaptive Resolution

พิสูจน์:

```text
Level 2 ↔ Level 3
semantic location preserved
capacity-safe collapse
```

---

# 87. G12 — Save Migration

พิสูจน์:

```text
old anchor/segment reference
migrates across mapRevision
without losing unit/component state
```

---

# 88. Test Determinism

แต่ละ Golden Map มี:

```text
fixed seed
fixed commands
expected path
expected costs
expected event order
expected final state
expected state hash
```

CI ต้อง FAIL เมื่อผลเปลี่ยนโดยไม่มี approved design change

---

# 89. Development Phases

## Phase 1 — Geometry Foundation

ทำ:

```text
37 Core
90 Internal Edge
42 Outer Edge
96 Junction Anchors
Stable IDs
Fixed-point geometry
Validator
```

---

## Phase 2 — Core Terrain

ทำ:

```text
Grass
Forest
Swamp
Mountain
Ruins
```

Movement surface ownership

---

## Phase 3 — Simple Edge MVP

ทำ:

```text
Normal
Road
Wall
Gate
River
Bridge
```

ยังไม่เปิด Walkable Edge

---

## Phase 4 — Movement MVP

ทำ:

```text
Core-node Dijkstra
Integer ticks
Physical segment lengths
Road speed
Wall block
Gate state
River/Bridge
Incremental movement execution
Navigation revision
```

---

## Phase 5 — Editor MVP

ทำ:

```text
Core Mode
Edge Mode
Terrain Paint
Edge Paint
Save
Load
Validate
Movement Test
```

---

## Phase 6 — Composite Edge

เพิ่ม:

```text
Base + Components
Requirements/Providers
Wall+Gate+Road
River+Bridge
Road+Barricade
```

---

## Phase 7 — Combat Geometry

เพิ่ม:

```text
Facing
Directional Cover
LOS
Elevation
ZOC
AoE
```

---

## Phase 8 — Destruction

เพิ่ม:

```text
HP
Transformation Recipes
Graph invalidation
Collapse Resolver
Debris
```

---

## Phase 9 — Networks

เพิ่ม:

```text
Road Network
River Network
Wall Network
Canal Network
Route
Segment
Connector
```

---

## Phase 10 — Walkable Thick Edge

เพิ่ม:

```text
Edge Nodes
Wall Walk
Major Road
Bridge Positions
Playable Junction
```

---

## Phase 11 — Advanced Resolution

เพิ่ม:

```text
Cross Sections
L/C/R
Large Units
zLayers
Tunnels
Overpasses
```

---

## Phase 12 — World Systems

เพิ่ม:

```text
Fog of War
Control
Portal Groups
Cross-map Networks
Tactical AI
Procedural Generation
```

---

# 90. MVP Acceptance Criteria

MVP ผ่านเมื่อ:

1. 37 Core exactly
2. 90 Internal Edge exactly
3. 42 Outer Edge exactly
4. 96 Junction Anchors exactly
5. Stable Semantic IDs
6. Fixed-point geometry
7. Terrain movement works
8. Road affects movement without double counting
9. Wall blocks
10. Gate state changes path
11. River blocks invalid movement
12. Bridge creates valid crossing
13. Dijkstra returns minimum tick path
14. All travel edges have positive cost
15. Movement validates every committed step
16. navigationRevision invalidates stale plans
17. Save uses semantic anchors
18. Save/Load preserves component state
19. Validator catches invalid topology
20. G00–G05 Golden Tests pass

---

# 91. Engineering PASS Criteria

Architecture V2 ไม่ถือว่า Engineering PASS จนกว่า:

```text
Golden Tests G00–G12 PASS
Save/Load deterministic
No invalid zero-cost loops
No corner cutting
No stale path traversal
No semantic anchor loss
Map migration test PASS
Mobile editor basic interaction PASS
```

ดังนั้น:

```text
UNKNOWN ≠ PASS
```

จนกว่าจะมี test evidence

---

# 92. Full Architecture

```text
SUPERHEX-37 V2
│
├── PERSISTENT WORLD MODEL
│   ├── 37 Core Anchors
│   ├── 90 Internal Edge Anchors
│   ├── 42 Boundary Anchors
│   ├── 96 Junction Anchors
│   ├── Components
│   ├── Linear Networks
│   ├── Control
│   ├── Faction Knowledge
│   └── Map Revision
│
├── GAMEPLAY GEOMETRY
│   ├── Core Polygons
│   ├── Thick Edges
│   ├── Cross Sections
│   ├── Junction Zones
│   └── zLayers / Height Units
│
├── MAP COMPILER
│   ├── Geometry Compile
│   ├── Navigation Compile
│   ├── LOS Compile
│   ├── Cover Compile
│   ├── Visibility Compile
│   └── AI Abstract Graph
│
├── RUNTIME MODEL
│   ├── Navigation Graph
│   ├── Occupancy
│   ├── LOS Data
│   ├── Cover Fields
│   ├── Visibility/Knowledge
│   └── AI Graph
│
├── CENTRAL RULE RESOLVER
│   ├── Traversal
│   ├── Occupancy
│   ├── LOS
│   ├── Cover
│   ├── Combat
│   ├── AoE
│   ├── Hazard
│   ├── Destruction
│   └── Control
│
├── EVENT PIPELINE
│   ├── Intent
│   ├── Validation
│   ├── Reaction
│   ├── Commit
│   ├── Effects
│   ├── Structural Resolution
│   ├── Forced Movement
│   ├── Visibility
│   ├── Invalidation
│   └── Cleanup
│
├── AI
│   ├── Reachability
│   ├── Coarse Corridor
│   ├── Local Expansion
│   └── Tactical Evaluation
│
├── EDITOR
│   ├── Core
│   ├── Edge
│   ├── Junction
│   ├── Route
│   ├── Unit
│   └── Test
│
└── INFRASTRUCTURE
    ├── Validator
    ├── Versioned Save
    ├── Map Migration
    ├── Golden Tests
    └── CI Regression Checks
```

---

# 93. Final Rules to Lock

```text
1. Superhex always has exactly 37 Core Hexes.

2. Thick Edge adds tactical meaning,
   not additional Core Hexes.

3. World identity uses Semantic Anchors.

4. Runtime Nodes are derived and disposable.

5. Save never depends on Runtime Node identity.

6. Geometry uses fixed-point canonical values.

7. Movement uses physical segment length and one primary surface per segment.

8. All travel graph costs are positive integers.

9. Geometry contact never implies navigation connection.

10. Edge supports Base + Components.

11. Crossing and Along are separate.

12. Junction connectivity is explicit.

13. Networks use Network → Route → Segment.

14. Visual crossing does not imply route intersection.

15. Destruction transforms gameplay state and may transform terrain.

16. Every topology change increments navigationRevision.

17. Unit movement is validated incrementally.

18. Combat/Cover/LOS/Movement use the same authoritative component data.

19. Fog of War uses faction knowledge, not omniscient world state.

20. UNKNOWN ≠ PASS until Golden Tests pass.
```

---

# 94. Implementation Directive

```text
Implement SUPERHEX-37 Tactical RPG Architecture V2.

Start only with:
- fixed 37-Core geometry
- 90 internal edges
- 42 boundary edges
- 96 junction anchors
- semantic stable IDs
- fixed-point coordinates
- terrain
- simple road/wall/gate/river/bridge
- positive integer movement ticks
- core-node Dijkstra
- navigationRevision
- versioned save
- validator
- Golden Maps G00–G05

Do not implement advanced Lane/Junction/Network detail
until the geometry and movement gates pass.

Do not expand core count beyond 37.

Do not treat visual overlap as connectivity.

Do not use runtime navigation node IDs as save identity.

Do not claim PASS without deterministic test evidence.
```

---

# 95. Status

เอกสารนี้ให้ถือเป็น:

```text
SUPERHEX-37
TACTICAL RPG ARCHITECTURE V2
DESIGN BASELINE
```

ใช้เป็นฐานสำหรับ:

```text
HTML Prototype
Godot Implementation
Map Editor
RPG Movement
Tactical Combat
AI
World Map Expansion
Save/Load
Automated Tests
```

**Current engineering verdict: UNKNOWN — implementation proof required.**