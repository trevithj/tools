// ── Constants ─────────────────────────────────────────────────────────────
const STATE_H     = 36;
const STATE_PAD_X = 20;
const TRANS_H     = 30;
const TRANS_PAD_X = 16;
const LINE_HEIGHT = 15;
const TEXT_PAD_Y  = 10;

// ── State ─────────────────────────────────────────────────────────────────
const state = { 
    nodes: [], // { id, type: 'state'|'transition', label, x, y }
    edges: [], // { id, from, to }
    nextId: 1, 
    mode: 'normal',
}
let selected    = null;
let linkSource  = null;
let panX = 0, panY = 0;
let isPanning = false, panStart = null;
let draggingNode = null, dragOffset = null;
let mouseDownMoved = false;
let mousePos = { x: 0, y: 0 };

// ── DOM refs ──────────────────────────────────────────────────────────────
const svg             = document.getElementById('graph');
const viewport        = document.getElementById('viewport');
const edgesLayer      = document.getElementById('edges-layer');
const nodesLayer      = document.getElementById('nodes-layer');
const linkPreviewPath = document.getElementById('link-preview-path');
const nodeInput       = document.getElementById('node-input');

// ── ID generator ──────────────────────────────────────────────────────────
function uid() { return 'n' + (state.nextId++); }

// ── Node geometry ─────────────────────────────────────────────────────────

function nodeLines(node) {
  return node.label.split('|');
}

function nodeSize(node) {
  const lines = nodeLines(node);
  const longestChars = Math.max(...lines.map(l => l.length));
  const padX = node.type === 'state' ? STATE_PAD_X : TRANS_PAD_X;
  const padY = TEXT_PAD_Y;
  const baseH = node.type === 'state' ? STATE_H : TRANS_H;
  const w = Math.max(90, longestChars * 7.2 + padX * 2);
  const h = Math.max(baseH, lines.length * LINE_HEIGHT + padY * 2);
  return { w, h };
}

/**
 * Returns the point on node n's boundary in the direction of (tx, ty).
 * Uses rect intersection for both node types.
 */
function boundaryPoint(n, tx, ty) {
  const dx = tx - n.x, dy = ty - n.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.001) return { x: n.x, y: n.y };
  const ux = dx / dist, uy = dy / dist;
  const { w, h } = nodeSize(n);
  const hw = w / 2, hh = h / 2;
  let t = Infinity;
  if (Math.abs(ux) > 1e-9) { const tc = (ux > 0 ? hw : -hw) / ux; if (tc > 0) t = Math.min(t, tc); }
  if (Math.abs(uy) > 1e-9) { const tc = (uy > 0 ? hh : -hh) / uy; if (tc > 0) t = Math.min(t, tc); }
  return { x: n.x + ux * t, y: n.y + uy * t };
}

// ── Coordinate helpers ────────────────────────────────────────────────────
function toSVG(cx, cy) {
  const r = svg.getBoundingClientRect();
  return { x: cx - r.left - panX, y: cy - r.top - panY };
}

function updateViewport() {
  viewport.setAttribute('transform', `translate(${panX},${panY})`);
}

// ── Mode management ───────────────────────────────────────────────────────
function setMode(m) {
  state.mode = (m === state.mode) ? 'normal' : m;
  linkSource = null;
  if (state.mode !== 'normal' && state.mode !== 'add') {
    // keep selection in normal; clear otherwise
  }
  linkPreviewPath.style.display = 'none';

  // Badge
  const badge = document.getElementById('mode-badge');
  const labels = { normal: 'NORMAL', add: 'ADD', link: 'LINK', delete: 'DELETE' };
  badge.textContent = labels[state.mode];
  badge.className   = 'mode-' + state.mode;

  // Canvas class
  const wrap = document.getElementById('canvas-wrap');
  wrap.className = 'canvas-' + state.mode;

  // Button active states
  ['btn-add', 'btn-link', 'btn-delete'].forEach(id => {
    document.getElementById(id).classList.remove('btn-active');
  });
  if (state.mode !== 'normal') {
    document.getElementById('btn-' + state.mode).classList.add('btn-active');
  }

  // Input hint
  if (state.mode !== 'normal' && !selected) {
    nodeInput.value = '';
    nodeInput.classList.remove('input-editing');
  }

  render();
}

// ── Node creation ─────────────────────────────────────────────────────────
function createNode(type, x, y, label) {
  const id = uid();
  state.nodes.push({ id, type, label: label || (type === 'state' ? 'State' : 'Transition'), x, y });
  return id;
}

function addStateNode() {
  if (selected && state.mode === 'normal') return; // editing
  const r = svg.getBoundingClientRect();
  const id = createNode('state',
    r.width  / 2 - panX + (Math.random() - 0.5) * 100,
    r.height / 2 - panY + (Math.random() - 0.5) * 80
  );
  selectNode(id);
  render();
}

function addTransitionNode() {
  if (selected && state.mode === 'normal') return;
  const r = svg.getBoundingClientRect();
  const id = createNode('transition',
    r.width  / 2 - panX + (Math.random() - 0.5) * 100,
    r.height / 2 - panY + (Math.random() - 0.5) * 80
  );
  selectNode(id);
  render();
}

function deleteNode(id) {
  state.nodes = state.nodes.filter(n => n.id !== id);
  state.edges = state.edges.filter(e => e.from !== id && e.to !== id);
  if (selected   === id) { selected = null; nodeInput.value = ''; nodeInput.classList.remove('input-editing'); }
  if (linkSource === id) linkSource = null;
  render();
}

function addEdge(fromId, toId) {
  if (fromId === toId) return;
  if (!state.edges.find(e => e.from === fromId && e.to === toId))
    state.edges.push({ id: uid(), from: fromId, to: toId });
}

function deleteEdge(id) {
  state.edges = state.edges.filter(e => e.id !== id);
  render();
}

// ── Selection ─────────────────────────────────────────────────────────────
function selectNode(id) {
  selected = id;
  const node = state.nodes.find(n => n.id === id);
  if (node) {
    nodeInput.value = node.label;
    nodeInput.classList.add('input-editing');
    nodeInput.focus();
    nodeInput.select();
  }
}

function deselect() {
  selected = null;
  nodeInput.value = '';
  nodeInput.classList.remove('input-editing');
}

// ── Link logic ────────────────────────────────────────────────────────────
function handleLinkClick(id) {
  if (!linkSource) {
    linkSource = id;
    render();
    return;
  }
  if (linkSource === id) { linkSource = null; render(); return; }

  const src = state.nodes.find(n => n.id === linkSource);
  const tgt = state.nodes.find(n => n.id === id);
  if (!src || !tgt) { linkSource = null; render(); return; }

  if (src.type === 'transition' && tgt.type === 'transition') {
    // transition → transition: not allowed
    linkSource = null;
    flashBadge('T→T NOT ALLOWED');
    render();
    return;
  }

  if (src.type !== tgt.type) {
    // state↔transition: direct edge
    addEdge(linkSource, id);
  } else {
    // state→state: auto-insert transition node between them
    const gx = (src.x + tgt.x) / 2 + (Math.random() - 0.5) * 20;
    const gy = (src.y + tgt.y) / 2 + (Math.random() - 0.5) * 20;
    const tid = createNode('transition', gx, gy);
    addEdge(linkSource, tid);
    addEdge(tid, id);
  }

  linkSource = null;
  render();
}

function flashBadge(msg) {
  const badge = document.getElementById('mode-badge');
  const saved = { txt: badge.textContent, cls: badge.className };
  badge.textContent = msg;
  badge.style.cssText = 'border-color:var(--red);color:var(--red)';
  setTimeout(() => {
    badge.textContent = saved.txt;
    badge.className   = saved.cls;
    badge.style.cssText = '';
  }, 900);
}

// ── Canvas add-mode click ─────────────────────────────────────────────────
function handleCanvasClick(clientX, clientY) {
  const pt = toSVG(clientX, clientY);
  const id = createNode('state', pt.x, pt.y);
  selectNode(id);
  render();
}

// ── Auto layout ───────────────────────────────────────────────────────────
function autoLayout() {
  if (!state.nodes.length) return;

  const PASSES   = 5;
  const PAD_TOP  = 60;
  const PAD_BOT  = 60;
  const MIN_GAP  = 60;
  const r        = svg.getBoundingClientRect();
  const W        = r.width, H = r.height;

  const COL_X = {
    state:      W * 0.28,
    transition: W * 0.68
  };

  const stateNodes = state.nodes.filter(n => n.type === 'state');
  const transNodes = state.nodes.filter(n => n.type === 'transition');

  // Build neighbour map (undirected)
  const neighbours = {};
  state.nodes.forEach(n => neighbours[n.id] = []);
  state.edges.forEach(e => {
    if (neighbours[e.from]) neighbours[e.from].push(e.to);
    if (neighbours[e.to])   neighbours[e.to].push(e.from);
  });

  function assignY(ordered, height) {
    const n = ordered.length;
    if (n === 0) return {};
    const span = Math.max(height - PAD_TOP - PAD_BOT, n * MIN_GAP);
    const gap  = n > 1 ? span / (n - 1) : 0;
    const startY = PAD_TOP + (n === 1 ? (height - PAD_TOP - PAD_BOT) / 2 : 0);
    const yMap = {};
    ordered.forEach((node, i) => { yMap[node.id] = startY + i * gap; });
    return yMap;
  }

  function barySort(group, otherYMap) {
    return [...group].sort((a, b) => {
      const bary = node => {
        const nbrs = neighbours[node.id].filter(id => id in otherYMap);
        if (!nbrs.length) return 1e9;
        return nbrs.reduce((sum, id) => sum + otherYMap[id], 0) / nbrs.length;
      };
      return bary(a) - bary(b);
    });
  }

  // Initialise order by current Y
  let sOrder = [...stateNodes].sort((a, b) => a.y - b.y);
  let tOrder = [...transNodes].sort((a, b) => a.y - b.y);

  for (let pass = 0; pass < PASSES; pass++) {
    const tYMap = assignY(tOrder, H);
    sOrder = barySort(sOrder, tYMap);
    const sYMap = assignY(sOrder, H);
    tOrder = barySort(tOrder, sYMap);
  }

  const sYMap = assignY(sOrder, H);
  const tYMap = assignY(tOrder, H);

  state.nodes = state.nodes.map(n => ({
    ...n,
    x: COL_X[n.type],
    y: n.type === 'state' ? sYMap[n.id] : tYMap[n.id]
  }));

  panX = 0; panY = 0;
  updateViewport();
  render();
}

function clearAll() {
  if (!state.nodes.length || confirm('Clear everything?')) {
    state.nodes = []; state.edges = [];
    selected = null; linkSource = null;
    nodeInput.value = '';
    nodeInput.classList.remove('input-editing');
    setMode('normal');
  }
}

// ── SVG helpers ───────────────────────────────────────────────────────────
function svgEl(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function makeEdgePath(p1, p2) {
  const dx = Math.abs(p2.x - p1.x) * 0.5;
//   return `M${p1.x},${p1.y} C${p1.x+dx},${p1.y} ${p2.x-dx},${p2.y} ${p2.x},${p2.y}`;
  return `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
}

// ── Rendering ─────────────────────────────────────────────────────────────
function renderEdges() {
  edgesLayer.innerHTML = '';
  state.edges.forEach(e => {
    const from = state.nodes.find(n => n.id === e.from);
    const to   = state.nodes.find(n => n.id === e.to);
    if (!from || !to) return;

    const p1 = boundaryPoint(from, to.x,   to.y);
    const p2 = boundaryPoint(to,   from.x, from.y);
    const d  = makeEdgePath(p1, p2);

    const g    = svgEl('g');
    const path = svgEl('path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'edge-line');

    const hit = svgEl('path');
    hit.setAttribute('d', d);
    hit.setAttribute('class', 'edge-hit');
    hit.addEventListener('click',    ev => { ev.stopPropagation(); if (state.mode === 'delete') deleteEdge(e.id); });
    hit.addEventListener('dblclick', ev => { ev.stopPropagation(); if (state.mode !== 'delete') deleteEdge(e.id); });

    // edge-hit must come before edge-line in DOM for the CSS sibling selector
    g.appendChild(hit);
    g.appendChild(path);
    edgesLayer.appendChild(g);
  });
}

function renderNodes() {
  nodesLayer.innerHTML = '';

  state.nodes.forEach(node => {
    const isSelected = selected    === node.id;
    const isSource   = linkSource  === node.id;
    const typeClass  = node.type === 'state' ? 'state-group' : 'trans-group';

    const g = svgEl('g');
    g.setAttribute('class', [typeClass, isSelected ? 'selected' : '', isSource ? 'link-source' : ''].filter(Boolean).join(' '));

    const { w, h } = nodeSize(node);
    const rx = node.x - w / 2;
    const ry = node.y - h / 2;
    const cornerR = node.type === 'state' ? 18 : 4;
    const rectClass = node.type === 'state' ? 'state-rect' : 'trans-rect';

    const rect = svgEl('rect');
    rect.setAttribute('class', rectClass);
    rect.setAttribute('x', rx); rect.setAttribute('y', ry);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('rx', cornerR); rect.setAttribute('ry', cornerR);

    // Multi-line label
    const lines   = nodeLines(node);
    const textEl  = svgEl('text');
    textEl.setAttribute('class', 'node-label');
    textEl.setAttribute('pointer-events', 'none');
    const totalTH = lines.length * LINE_HEIGHT;
    const startY  = node.y - totalTH / 2 + LINE_HEIGHT / 2 + 1;
    lines.forEach((line, i) => {
      const tspan = svgEl('tspan');
      tspan.setAttribute('x', node.x);
      tspan.setAttribute('y', startY + i * LINE_HEIGHT);
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });

    g.appendChild(rect);
    g.appendChild(textEl);

    // Cursor
    g.style.cursor = state.mode === 'delete' ? 'not-allowed' : 'pointer';

    // Drag
    g.addEventListener('mousedown', ev => {
      ev.stopPropagation();
      mouseDownMoved = false;
      draggingNode = node.id;
      const pt = toSVG(ev.clientX, ev.clientY);
      dragOffset = { x: pt.x - node.x, y: pt.y - node.y };
    });

    // Right-click delete
    g.addEventListener('contextmenu', ev => { ev.preventDefault(); deleteNode(node.id); });

    nodesLayer.appendChild(g);
  });
}

function updateLinkPreview() {
  if (state.mode !== 'link' || !linkSource) { linkPreviewPath.style.display = 'none'; return; }
  const src = state.nodes.find(n => n.id === linkSource);
  if (!src) { linkPreviewPath.style.display = 'none'; return; }
  const p1 = boundaryPoint(src, mousePos.x, mousePos.y);
  linkPreviewPath.setAttribute('d', makeEdgePath(p1, mousePos));
  linkPreviewPath.style.display = '';
}

function renderStats() {
  document.getElementById('s-states').textContent      = state.nodes.filter(n => n.type === 'state').length;
  document.getElementById('s-transitions').textContent = state.nodes.filter(n => n.type === 'transition').length;
  document.getElementById('s-edges').textContent       = state.edges.length;
  document.getElementById('empty-state').style.display = state.nodes.length ? 'none' : 'flex';
}

function render() {
  renderEdges();
  renderNodes();
  renderStats();
  updateLinkPreview();
}

// ── Input: live edit ──────────────────────────────────────────────────────
nodeInput.addEventListener('input', () => {
  if (selected) {
    const node = state.nodes.find(n => n.id === selected);
    if (node) { node.label = nodeInput.value; render(); }
  }
});

nodeInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (selected) { deselect(); render(); }
    else if (state.mode === 'normal') addStateNode();
  }
  if (e.key === 'Escape') {
    if (selected) { deselect(); render(); }
    else setMode('normal');
  }
});

// ── Global mouse events ───────────────────────────────────────────────────
svg.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  if (state.mode === 'add' && (e.target === svg || e.target === viewport || e.target.id === 'graph')) {
    handleCanvasClick(e.clientX, e.clientY);
    return;
  }
  if (!draggingNode) {
    isPanning = true;
    panStart = { x: e.clientX - panX, y: e.clientY - panY };
    document.getElementById('canvas-wrap').classList.add('dragging');
  }
});

window.addEventListener('mousemove', e => {
  const r = svg.getBoundingClientRect();
  mousePos = { x: e.clientX - r.left - panX, y: e.clientY - r.top - panY };

  if (draggingNode) {
    mouseDownMoved = true;
    const node = state.nodes.find(n => n.id === draggingNode);
    if (node) {
      const pt = toSVG(e.clientX, e.clientY);
      node.x = pt.x - dragOffset.x;
      node.y = pt.y - dragOffset.y;
      render();
    }
    return;
  }
  if (isPanning) {
    panX = e.clientX - panStart.x;
    panY = e.clientY - panStart.y;
    updateViewport();
  }
  if (state.mode === 'link' && linkSource) updateLinkPreview();
});

window.addEventListener('mouseup', () => {
  if (draggingNode) {
    const id    = draggingNode;
    const moved = mouseDownMoved;
    draggingNode   = null;
    dragOffset     = null;
    mouseDownMoved = false;

    if (!moved) {
      if (state.mode === 'delete') {
        deleteNode(id);
      } else if (state.mode === 'link') {
        handleLinkClick(id);
      } else {
        // normal or add: select/deselect
        if (selected === id) { deselect(); render(); }
        else { selectNode(id); render(); }
      }
    }
  }
  if (isPanning) {
    isPanning = false;
    document.getElementById('canvas-wrap').classList.remove('dragging');
  }
});

svg.addEventListener('click', e => {
  if (e.target === svg || e.target === viewport) {
    if (state.mode === 'link') { linkSource = null; linkPreviewPath.style.display = 'none'; }
    deselect();
    render();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMode('normal');
});

// ── Sample data ───────────────────────────────────────────────────────────
function loadSample() {
  state.nodes = [
    { id: 'n1', type: 'state',      label: 'Idle',       x: 160, y: 100 },
    { id: 'n2', type: 'state',      label: 'Running',    x: 160, y: 230 },
    { id: 'n3', type: 'state',      label: 'Paused',     x: 160, y: 360 },
    { id: 'n4', type: 'state',      label: 'Stopped',    x: 160, y: 490 },
    { id: 't1', type: 'transition', label: 'start',      x: 420, y: 165 },
    { id: 't2', type: 'transition', label: 'pause',      x: 420, y: 295 },
    { id: 't3', type: 'transition', label: 'resume',     x: 420, y: 295 },
    { id: 't4', type: 'transition', label: 'stop',       x: 420, y: 425 },
    { id: 't5', type: 'transition', label: 'reset',      x: 420, y: 100 },
  ];
  state.edges = [
    { id: 'e1', from: 'n1', to: 't1' },
    { id: 'e2', from: 't1', to: 'n2' },
    { id: 'e3', from: 'n2', to: 't2' },
    { id: 'e4', from: 't2', to: 'n3' },
    { id: 'e5', from: 'n3', to: 't3' },
    { id: 'e6', from: 't3', to: 'n2' },
    { id: 'e7', from: 'n2', to: 't4' },
    { id: 'e8', from: 't4', to: 'n4' },
    { id: 'e9', from: 'n4', to: 't5' },
    { id: 'e10', from: 't5', to: 'n1' },
  ];
  state.nextId = 20;
  panX = 80; panY = 30;
  updateViewport();
  render();
}

loadSample();
