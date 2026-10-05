import {GEOM_SCALE,generateTopology,validateTopology,deterministicStateHash} from "./geometry.mjs";
const w=generateTopology(),v=validateTopology(w),svg=document.querySelector("#map"),stats=document.querySelector("#stats"),status=document.querySelector("#status"),toggle=document.querySelector("#debug");
const S=Math.sqrt(3),H=54;
const center=c=>({x:H*S*(c.q+c.r/2),y:H*1.5*c.r});
const pts=c=>{const p=center(c);return Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i-30);return `${p.x+H*Math.cos(a)},${p.y+H*Math.sin(a)}`}).join(" ")};
function el(name,attrs={},text=""){const n=document.createElementNS("http://www.w3.org/2000/svg",name);for(const [k,x] of Object.entries(attrs))n.setAttribute(k,x);if(text)n.textContent=text;return n}
function render(){
  svg.replaceChildren();const g=el("g",{transform:"translate(360 300)"});
  for(const c of w.cores){g.append(el("polygon",{points:pts(c),class:"core","data-id":c.id}));const p=center(c);g.append(el("text",{x:p.x,y:p.y+4,class:"core-label debug","text-anchor":"middle"},c.id))}
  for(const j of w.junctions){const lx=j.xFP/GEOM_SCALE,ly=j.yFP/GEOM_SCALE;g.append(el("circle",{cx:lx*(H*S/2),cy:ly*(H/2),r:3.2,class:"junction debug"}))}
  svg.append(g);svg.classList.toggle("debug-off",!toggle.checked);
}
const rows=[["Core Hexes",w.cores.length,37],["Internal Edges",w.internalEdges.length,90],["Boundary Edges",w.boundaryEdges.length,42],["Junction Anchors",w.junctions.length,96]];
stats.innerHTML=rows.map(([n,a,e])=>`<div class="stat"><span>${n}</span><strong>${a} / ${e}</strong></div>`).join("");
status.className=v.pass?"pass":"fail";
status.textContent=v.pass?`RUNTIME VALIDATOR PASS · G00 candidate · hash ${deterministicStateHash(w)}`:`FAIL · ${v.errors.join(" · ")}`;
toggle.addEventListener("change",render);render();
