import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPECTED_COUNTS,
  buildGeometry,
  canonicalEdgeId,
  isCoreCoordinate,
} from '../src/geometry.js';

const geometry = buildGeometry();

test('G00 canonical counts are exact', () => {
  assert.equal(geometry.cores.length, EXPECTED_COUNTS.cores);
  assert.equal(geometry.internalEdges.length, EXPECTED_COUNTS.internalEdges);
  assert.equal(geometry.boundaryEdges.length, EXPECTED_COUNTS.boundaryEdges);
  assert.equal(geometry.junctions.length, EXPECTED_COUNTS.junctions);
});

test('G00 all cores satisfy radius-3 and center exists', () => {
  assert.ok(geometry.cores.every(({ q, r }) => isCoreCoordinate(q, r)));
  assert.ok(geometry.cores.some(({ q, r }) => q === 0 && r === 0));
});

test('G00 semantic IDs are unique and internal edge IDs are canonical', () => {
  const allUnique = (values) => new Set(values).size === values.length;
  assert.ok(allUnique(geometry.cores.map((x) => x.id)));
  assert.ok(allUnique(geometry.internalEdges.map((x) => x.id)));
  assert.ok(allUnique(geometry.boundaryEdges.map((x) => x.id)));
  assert.ok(allUnique(geometry.junctions.map((x) => x.id)));

  for (const edge of geometry.internalEdges) {
    assert.equal(edge.id, canonicalEdgeId(edge.a, edge.b));
  }
});

test('G00 junction identity uses integer authority coordinates', () => {
  assert.ok(geometry.junctions.every(({ x, y }) => Number.isInteger(x) && Number.isInteger(y)));
});

test('G00 validator passes all baseline geometry checks', () => {
  assert.equal(geometry.validation.verdict, 'PASS');
  assert.ok(geometry.validation.checks.every((check) => check.pass));
});

test('G00 state hash is deterministic', () => {
  const rerun = buildGeometry();
  assert.equal(rerun.snapshot.hash, geometry.snapshot.hash);
  assert.deepEqual(rerun.snapshot.payload, geometry.snapshot.payload);
  assert.equal(geometry.snapshot.hash, '817c3a7a');
});
