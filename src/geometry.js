export const RADIUS = 3;
export const EXPECTED_COUNTS = Object.freeze({
  cores: 37,
  internalEdges: 90,
  boundaryEdges: 42,
  junctions: 96,
});

export const DIRECTIONS = Object.freeze([
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]);

// Pointy-top corners in an integer lattice where:
// X = 2*x/sqrt(3), Y = 2*y. This keeps junction identity integer-only.
export const VERTEX_OFFSETS = Object.freeze([
  [1, 1],
  [0, 2],
  [-1, 1],
  [-1, -1],
  [0, -2],
  [1, -1],
]);

export const SIDE_VERTEX_INDEXES = Object.freeze([
  [5, 0],
  [4, 5],
  [3, 4],
  [2, 3],
  [1, 2],
  [0, 1],
]);

export function coreId(q, r) {
  return `C:${q},${r}`;
}

export function junctionId(x, y) {
  return `V:${x},${y}`;
}

export function boundaryId(q, r, dir) {
  return `B:${q},${r}:d${dir}`;
}

export function compareAxial(a, b) {
  return a.q - b.q || a.r - b.r;
}

export function isCoreCoordinate(q, r, radius = RADIUS) {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= radius;
}

export function generateCores(radius = RADIUS) {
  const cores = [];
  for (let r = -radius; r <= radius; r += 1) {
    const qMin = Math.max(-radius, -r - radius);
    const qMax = Math.min(radius, -r + radius);
    for (let q = qMin; q <= qMax; q += 1) {
      if (isCoreCoordinate(q, r, radius)) {
        cores.push(Object.freeze({ q, r, id: coreId(q, r) }));
      }
    }
  }
  return cores.sort(compareAxial);
}

function axialKey(q, r) {
  return `${q},${r}`;
}

export function canonicalEdgeId(a, b) {
  const [first, second] = compareAxial(a, b) <= 0 ? [a, b] : [b, a];
  return `E:${first.q},${first.r}|${second.q},${second.r}`;
}

export function generateEdges(cores) {
  const byCoord = new Map(cores.map((core) => [axialKey(core.q, core.r), core]));
  const internal = new Map();
  const boundary = [];

  for (const core of cores) {
    DIRECTIONS.forEach(([dq, dr], dir) => {
      const neighbor = byCoord.get(axialKey(core.q + dq, core.r + dr));
      if (neighbor) {
        const id = canonicalEdgeId(core, neighbor);
        if (!internal.has(id)) {
          const [a, b] = compareAxial(core, neighbor) <= 0 ? [core, neighbor] : [neighbor, core];
          internal.set(id, Object.freeze({ id, a, b }));
        }
      } else {
        boundary.push(Object.freeze({
          id: boundaryId(core.q, core.r, dir),
          core,
          dir,
        }));
      }
    });
  }

  return {
    internalEdges: [...internal.values()].sort((a, b) => a.id.localeCompare(b.id)),
    boundaryEdges: boundary.sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function coreCenterLattice(q, r) {
  return Object.freeze({ x: 2 * q + r, y: 3 * r });
}

export function coreVertexLattice(core, corner) {
  const center = coreCenterLattice(core.q, core.r);
  const [ox, oy] = VERTEX_OFFSETS[corner];
  return Object.freeze({ x: center.x + ox, y: center.y + oy });
}

export function generateJunctions(cores) {
  const junctions = new Map();
  for (const core of cores) {
    for (let corner = 0; corner < 6; corner += 1) {
      const { x, y } = coreVertexLattice(core, corner);
      const id = junctionId(x, y);
      if (!junctions.has(id)) {
        junctions.set(id, Object.freeze({ id, x, y }));
      }
    }
  }
  return [...junctions.values()].sort((a, b) => a.x - b.x || a.y - b.y);
}

export function edgeDirectionFrom(core, other) {
  const dq = other.q - core.q;
  const dr = other.r - core.r;
  return DIRECTIONS.findIndex(([x, y]) => x === dq && y === dr);
}

export function edgeJunctions(edge) {
  const dir = edgeDirectionFrom(edge.a, edge.b);
  if (dir < 0) throw new Error(`Non-neighbor edge: ${edge.id}`);
  const [c0, c1] = SIDE_VERTEX_INDEXES[dir];
  const p0 = coreVertexLattice(edge.a, c0);
  const p1 = coreVertexLattice(edge.a, c1);
  return [
    Object.freeze({ ...p0, id: junctionId(p0.x, p0.y) }),
    Object.freeze({ ...p1, id: junctionId(p1.x, p1.y) }),
  ];
}

export function boundaryJunctions(edge) {
  const [c0, c1] = SIDE_VERTEX_INDEXES[edge.dir];
  const p0 = coreVertexLattice(edge.core, c0);
  const p1 = coreVertexLattice(edge.core, c1);
  return [
    Object.freeze({ ...p0, id: junctionId(p0.x, p0.y) }),
    Object.freeze({ ...p1, id: junctionId(p1.x, p1.y) }),
  ];
}

export function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function geometrySnapshot(geometry) {
  const payload = {
    radius: RADIUS,
    cores: geometry.cores.map((x) => x.id).sort(),
    internalEdges: geometry.internalEdges.map((x) => x.id).sort(),
    boundaryEdges: geometry.boundaryEdges.map((x) => x.id).sort(),
    junctions: geometry.junctions.map((x) => x.id).sort(),
  };
  const json = JSON.stringify(payload);
  return Object.freeze({ payload, hash: fnv1a32(json) });
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

export function validateGeometry(geometry) {
  const checks = [];
  const add = (id, pass, actual, expected) => {
    checks.push(Object.freeze({ id, pass, actual, expected }));
  };

  add('core-count', geometry.cores.length === EXPECTED_COUNTS.cores, geometry.cores.length, EXPECTED_COUNTS.cores);
  add('internal-edge-count', geometry.internalEdges.length === EXPECTED_COUNTS.internalEdges, geometry.internalEdges.length, EXPECTED_COUNTS.internalEdges);
  add('boundary-edge-count', geometry.boundaryEdges.length === EXPECTED_COUNTS.boundaryEdges, geometry.boundaryEdges.length, EXPECTED_COUNTS.boundaryEdges);
  add('junction-count', geometry.junctions.length === EXPECTED_COUNTS.junctions, geometry.junctions.length, EXPECTED_COUNTS.junctions);
  add('center-exists', geometry.cores.some((c) => c.q === 0 && c.r === 0), geometry.cores.some((c) => c.q === 0 && c.r === 0), true);
  add('radius-rule', geometry.cores.every((c) => isCoreCoordinate(c.q, c.r)), geometry.cores.every((c) => isCoreCoordinate(c.q, c.r)), true);

  const coreDup = duplicateValues(geometry.cores.map((x) => x.id));
  const edgeDup = duplicateValues(geometry.internalEdges.map((x) => x.id));
  const boundaryDup = duplicateValues(geometry.boundaryEdges.map((x) => x.id));
  const junctionDup = duplicateValues(geometry.junctions.map((x) => x.id));
  add('core-id-unique', coreDup.length === 0, coreDup.length, 0);
  add('edge-id-unique', edgeDup.length === 0, edgeDup.length, 0);
  add('boundary-id-unique', boundaryDup.length === 0, boundaryDup.length, 0);
  add('junction-id-unique', junctionDup.length === 0, junctionDup.length, 0);

  const allInternalAreNeighbors = geometry.internalEdges.every((edge) => edgeDirectionFrom(edge.a, edge.b) >= 0);
  add('internal-edge-neighbor-validity', allInternalAreNeighbors, allInternalAreNeighbors, true);

  const allJunctionsInteger = geometry.junctions.every((j) => Number.isInteger(j.x) && Number.isInteger(j.y));
  add('junction-fixed-point-integer-lattice', allJunctionsInteger, allJunctionsInteger, true);

  return Object.freeze({
    verdict: checks.every((check) => check.pass) ? 'PASS' : 'FAIL',
    checks,
  });
}

export function buildGeometry() {
  const cores = generateCores();
  const { internalEdges, boundaryEdges } = generateEdges(cores);
  const junctions = generateJunctions(cores);
  const geometry = Object.freeze({ cores, internalEdges, boundaryEdges, junctions });
  return Object.freeze({
    ...geometry,
    validation: validateGeometry(geometry),
    snapshot: geometrySnapshot(geometry),
  });
}

export function axialToPixel(q, r, size = 72, originX = 500, originY = 410) {
  return Object.freeze({
    x: originX + Math.sqrt(3) * size * (q + r / 2),
    y: originY + 1.5 * size * r,
  });
}

export function latticeToPixel(x, y, size = 72, originX = 500, originY = 410) {
  return Object.freeze({
    x: originX + (Math.sqrt(3) * size * x) / 2,
    y: originY + (size * y) / 2,
  });
}

export function hexPolygonPoints(core, size = 72, originX = 500, originY = 410) {
  const center = axialToPixel(core.q, core.r, size, originX, originY);
  return VERTEX_OFFSETS.map(([x, y]) => {
    const px = center.x + (Math.sqrt(3) * size * x) / 2;
    const py = center.y + (size * y) / 2;
    return `${px},${py}`;
  }).join(' ');
}
