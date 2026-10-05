export const RADIUS = 3;
export const GEOM_SCALE = 10000;
export const EXPECTED = Object.freeze({ cores:37, internalEdges:90, boundaryEdges:42, junctions:96 });
export const DIRECTIONS = Object.freeze([[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]);
const VERTEX_OFFSETS = Object.freeze([[1,1],[0,2],[-1,1],[-1,-1],[0,-2],[1,-1]]);

export const coreId=(q,r)=>`C:${q},${r}`;
export const isValidCore=(q,r,radius=RADIUS)=>Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=radius;
const compareAxial=(a,b)=>a.q-b.q||a.r-b.r;
export function edgeId(a,b){
  const [x,y]=[a,b].sort(compareAxial);
  return `E:${x.q},${x.r}|${y.q},${y.r}`;
}
export function generateCores(radius=RADIUS){
  const out=[];
  for(let r=-radius;r<=radius;r++){
    const q0=Math.max(-radius,-r-radius), q1=Math.min(radius,-r+radius);
    for(let q=q0;q<=q1;q++) if(isValidCore(q,r,radius)) out.push(Object.freeze({
      id:coreId(q,r),q,r,xFP:(2*q+r)*GEOM_SCALE,yFP:(3*r)*GEOM_SCALE
    }));
  }
  return Object.freeze(out);
}
export function generateTopology(radius=RADIUS){
  const cores=generateCores(radius), byCoord=new Map(cores.map(c=>[`${c.q},${c.r}`,c]));
  const internal=new Map(), boundary=[];
  for(const c of cores) DIRECTIONS.forEach(([dq,dr],dir)=>{
    const n=byCoord.get(`${c.q+dq},${c.r+dr}`);
    if(n){
      const id=edgeId(c,n);
      if(!internal.has(id)) internal.set(id,Object.freeze({id,a:c.id,b:n.id,widthRatio:0}));
    } else boundary.push(Object.freeze({id:`B:${c.q},${c.r}:D${dir}`,coreId:c.id,dir}));
  });
  const coords=new Map();
  for(const c of cores){
    const cx=2*c.q+c.r, cy=3*c.r;
    for(const [ox,oy] of VERTEX_OFFSETS){ const x=cx+ox,y=cy+oy; coords.set(`${x},${y}`,{x,y}); }
  }
  const junctions=[...coords.values()].sort((a,b)=>a.y-b.y||a.x-b.x).map((p,i)=>Object.freeze({
    id:`V:${i}`,xFP:p.x*GEOM_SCALE,yFP:p.y*GEOM_SCALE,playable:false,capacity:0
  }));
  return Object.freeze({
    radius,cores,
    internalEdges:Object.freeze([...internal.values()].sort((a,b)=>a.id.localeCompare(b.id))),
    boundaryEdges:Object.freeze(boundary.sort((a,b)=>a.id.localeCompare(b.id))),
    junctions:Object.freeze(junctions)
  });
}
export function validateTopology(w){
  const errors=[], unique=a=>new Set(a.map(x=>x.id)).size===a.length;
  if(w.radius!==RADIUS) errors.push(`radius expected 3, got ${w.radius}`);
  if(w.cores.length!==37) errors.push(`cores expected 37, got ${w.cores.length}`);
  if(w.internalEdges.length!==90) errors.push(`internalEdges expected 90, got ${w.internalEdges.length}`);
  if(w.boundaryEdges.length!==42) errors.push(`boundaryEdges expected 42, got ${w.boundaryEdges.length}`);
  if(w.junctions.length!==96) errors.push(`junctions expected 96, got ${w.junctions.length}`);
  if(!w.cores.some(c=>c.id==="C:0,0")) errors.push("missing center C:0,0");
  if(!w.cores.every(c=>isValidCore(c.q,c.r))) errors.push("core outside radius-3 constraint");
  if(!unique(w.cores)) errors.push("duplicate Core IDs");
  if(!unique(w.internalEdges)) errors.push("duplicate internal Edge IDs");
  if(!unique(w.boundaryEdges)) errors.push("duplicate boundary Edge IDs");
  if(!unique(w.junctions)) errors.push("duplicate Junction IDs");
  return Object.freeze({pass:errors.length===0,errors:Object.freeze(errors)});
}
export function deterministicStateHash(w){
  const s=JSON.stringify({
    radius:w.radius,
    cores:w.cores.map(c=>[c.id,c.xFP,c.yFP]),
    internalEdges:w.internalEdges.map(e=>[e.id,e.a,e.b]),
    boundaryEdges:w.boundaryEdges.map(e=>[e.id,e.coreId,e.dir]),
    junctions:w.junctions.map(v=>[v.id,v.xFP,v.yFP])
  });
  let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
  return h.toString(16).padStart(8,"0");
}
