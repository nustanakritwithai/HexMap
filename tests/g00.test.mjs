import test from "node:test";
import assert from "node:assert/strict";
import {EXPECTED,generateTopology,validateTopology,deterministicStateHash} from "../src/geometry.mjs";

test("G00 Blank-37 canonical geometry",()=>{
  const w=generateTopology(), v=validateTopology(w);
  assert.equal(v.pass,true,v.errors.join("\n"));
  assert.equal(w.cores.length,EXPECTED.cores);
  assert.equal(w.internalEdges.length,EXPECTED.internalEdges);
  assert.equal(w.boundaryEdges.length,EXPECTED.boundaryEdges);
  assert.equal(w.junctions.length,EXPECTED.junctions);
  assert.ok(w.cores.some(c=>c.id==="C:0,0"));
  assert.equal(new Set(w.internalEdges.map(e=>e.id)).size,90);
  assert.match(deterministicStateHash(w),/^[0-9a-f]{8}$/);
});
test("G00 deterministic rebuild",()=>{
  const a=generateTopology(),b=generateTopology();
  assert.deepEqual(a,b);
  assert.equal(deterministicStateHash(a),deterministicStateHash(b));
});
test("validator rejects invalid topology",()=>{
  const w=generateTopology(),bad={...w,cores:w.cores.slice(1)};
  const v=validateTopology(bad);
  assert.equal(v.pass,false);
  assert.ok(v.errors.some(e=>e.startsWith("cores expected")));
});
