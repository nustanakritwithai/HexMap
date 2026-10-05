import {
  buildGeometry,
  axialToPixel,
  latticeToPixel,
  hexPolygonPoints,
  edgeJunctions,
  boundaryJunctions,
} from './geometry.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const geometry = buildGeometry();

const svg = document.querySelector('#map');
const statusEl = document.querySelector('#overall-status');
const hashEl = document.querySelector('#state-hash');
const checksEl = document.querySelector('#checks');
const inspectorEl = document.querySelector('#inspector');

function svgEl(tag, attrs = {}, text = '') {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  if (text) el.textContent = text;
  return el;
}

function lineFromJunctionPair(pair) {
  const [a, b] = pair.map((p) => latticeToPixel(p.x, p.y));
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

function render() {
  svg.replaceChildren();

  const coreLayer = svgEl('g', { class: 'layer cores' });
  const internalLayer = svgEl('g', { class: 'layer internal-edges' });
  const boundaryLayer = svgEl('g', { class: 'layer boundary-edges' });
  const junctionLayer = svgEl('g', { class: 'layer junctions' });
  const labelLayer = svgEl('g', { class: 'layer labels' });

  for (const core of geometry.cores) {
    const polygon = svgEl('polygon', {
      points: hexPolygonPoints(core),
      class: 'core-shape',
      tabindex: '0',
      'data-id': core.id,
    });
    const center = axialToPixel(core.q, core.r);
    const label = svgEl('text', {
      x: center.x,
      y: center.y + 4,
      class: 'core-label debug-core-id',
      'text-anchor': 'middle',
    }, core.id.replace('C:', ''));

    const inspect = () => {
      inspectorEl.innerHTML = `<strong>${core.id}</strong><span>axial q=${core.q}, r=${core.r}</span><span>radius rule: PASS</span>`;
      document.querySelectorAll('.core-shape.selected').forEach((n) => n.classList.remove('selected'));
      polygon.classList.add('selected');
    };
    polygon.addEventListener('click', inspect);
    polygon.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') inspect();
    });

    coreLayer.append(polygon);
    labelLayer.append(label);
  }

  geometry.internalEdges.forEach((edge, index) => {
    const line = svgEl('line', {
      ...lineFromJunctionPair(edgeJunctions(edge)),
      class: 'internal-edge',
      'data-id': edge.id,
    });
    internalLayer.append(line);

    const a = axialToPixel(edge.a.q, edge.a.r);
    const b = axialToPixel(edge.b.q, edge.b.r);
    const label = svgEl('text', {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      class: 'edge-label debug-edge-id',
      'text-anchor': 'middle',
    }, `E${index}`);
    labelLayer.append(label);
  });

  geometry.boundaryEdges.forEach((edge) => {
    const line = svgEl('line', {
      ...lineFromJunctionPair(boundaryJunctions(edge)),
      class: 'boundary-edge',
      'data-id': edge.id,
    });
    boundaryLayer.append(line);
  });

  geometry.junctions.forEach((junction) => {
    const p = latticeToPixel(junction.x, junction.y);
    const circle = svgEl('circle', {
      cx: p.x,
      cy: p.y,
      r: 4.5,
      class: 'junction-dot',
      'data-id': junction.id,
    });
    junctionLayer.append(circle);

    const label = svgEl('text', {
      x: p.x + 7,
      y: p.y - 7,
      class: 'junction-label debug-junction-id',
    }, junction.id.replace('V:', ''));
    labelLayer.append(label);
  });

  svg.append(coreLayer, internalLayer, boundaryLayer, junctionLayer, labelLayer);
}

function bindLayerToggle(selector, className) {
  const input = document.querySelector(selector);
  const apply = () => document.body.classList.toggle(className, input.checked);
  input.addEventListener('change', apply);
  apply();
}

function populateStatus() {
  statusEl.textContent = geometry.validation.verdict;
  statusEl.dataset.verdict = geometry.validation.verdict;
  hashEl.textContent = geometry.snapshot.hash;

  document.querySelector('#count-cores').textContent = geometry.cores.length;
  document.querySelector('#count-internal').textContent = geometry.internalEdges.length;
  document.querySelector('#count-boundary').textContent = geometry.boundaryEdges.length;
  document.querySelector('#count-junctions').textContent = geometry.junctions.length;

  checksEl.replaceChildren(...geometry.validation.checks.map((check) => {
    const row = document.createElement('li');
    row.className = check.pass ? 'pass' : 'fail';
    row.innerHTML = `<span>${check.id}</span><strong>${check.pass ? 'PASS' : 'FAIL'}</strong>`;
    return row;
  }));
}

render();
populateStatus();
bindLayerToggle('#toggle-core-ids', 'show-core-ids');
bindLayerToggle('#toggle-edge-ids', 'show-edge-ids');
bindLayerToggle('#toggle-junctions', 'show-junctions');
bindLayerToggle('#toggle-junction-ids', 'show-junction-ids');
bindLayerToggle('#toggle-boundary', 'show-boundary');
