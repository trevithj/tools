// ── Data ──────────────────────────────────────────────────────────────────
let nodes = []; // { id, type:'text'|'gate', label, x, y }
let edges = []; // { id, from, to }
let nextId = 1;

// ── UI State ──────────────────────────────────────────────────────────────
let selected = null;
let linkMode = false;
let linkSource = null;
let panX = 0, panY = 0;
let isPanning = false, panStart = null;
let draggingNode = null, dragOffset = null;
let mousePos = { x: 0, y: 0 }; // in SVG space

// ── SVG elements ──────────────────────────────────────────────────────────
const svg = document.getElementById('graph');
const viewport = document.getElementById('viewport');
const edgesLayer = document.getElementById('edges-layer');
const nodesLayer = document.getElementById('nodes-layer');
const linkPreview = document.getElementById('link-preview-path');

function uid() { return 'n' + (nextId++); }

// ── Node geometry ─────────────────────────────────────────────────────────
const TEXT_H = 36;
const GATE_W = 54; // width of gate shape
const GATE_H = 36;

function textNodeWidth(label) {
  return Math.max(110, label.length * 7.4 + 36);
}

// Connection point: right edge center for source, left edge center for target
// For text nodes: rect edges. For gates: specific points on the D-shape.
function nodePort(node, side) {
  // side: 'right' or 'left'
  if (node.type === 'text') {
    const w = textNodeWidth(node.label);
    return {
      x: node.x + (side === 'right' ? w / 2 : -w / 2),
      y: node.y
    };
  } else {
    // gate: left ports at left flat edge, right at the curved tip
    const hw = GATE_W / 2, hh = GATE_H / 2;
    if (side === 'right') return { x: node.x + hw, y: node.y };
    else return { x: node.x - hw, y: node.y };
  }
}

// ── Add nodes ─────────────────────────────────────────────────────────────
function addTextNode() {
  const inp = document.getElementById('node-input');
  const label = inp.value.trim();
  if (!label) return;
  inp.value = '';

  const rect = svg.getBoundingClientRect();
  const cx = rect.width / 2, cy = rect.height / 2;
  const x = (cx - panX) + (Math.random() - 0.5) * 100;
  const y = (cy - panY) + (Math.random() - 0.5) * 80;

  nodes.push({ id: uid(), type: 'text', label, x, y });
  render();
  inp.focus();
}

document.getElementById('node-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTextNode();
});

function addGateNode(x, y) {
  const id = uid();
  nodes.push({ id, type: 'gate', label: 'AND', x, y });
  return id;
}

function deleteNode(id) {
  nodes = nodes.filter(n => n.id !== id);
  edges = edges.filter(e => e.from !== id && e.to !== id);
  if (selected === id) selected = null;
  if (linkSource === id) linkSource = null;
  render();
}

function addEdge(fromId, toId) {
  const exists = edges.find(e => e.from === fromId && e.to === toId);
  if (!exists && fromId !== toId) {
    edges.push({ id: uid(), from: fromId, to: toId });
  }
}

function deleteEdge(id) {
  edges = edges.filter(e => e.id !== id);
  render();
}

// ── Link logic ────────────────────────────────────────────────────────────
function toggleLinkMode() {
  linkMode = !linkMode;
  linkSource = null;
  selected = null;
  const badge = document.getElementById('mode-badge');
  badge.className = linkMode ? 'mode-link' : 'mode-normal';
  badge.textContent = linkMode ? 'LINK MODE' : 'NORMAL';
  linkPreview.style.display = 'none';
  render();
}

function handleLinkClick(id) {
  if (!linkSource) {
    linkSource = id;
    render();
    return;
  }
  if (linkSource === id) {
    linkSource = null;
    render();
    return;
  }

  const src = nodes.find(n => n.id === linkSource);
  const tgt = nodes.find(n => n.id === id);

  if (!src || !tgt) { linkSource = null; render(); return; }

  if (src.type === 'gate' && tgt.type === 'gate') {
    // ignore: gate → gate not allowed
    linkSource = null;
    render();
    flashBadge();
    return;
  }

  if (src.type !== tgt.type) {
    // text→gate or gate→text: direct edge
    addEdge(linkSource, id);
  } else {
    // text→text: insert AND gate between them
    const gx = (src.x + tgt.x) / 2;
    const gy = (src.y + tgt.y) / 2 + (Math.random() - 0.5) * 40;
    const gid = addGateNode(gx, gy);
    addEdge(linkSource, gid);
    addEdge(gid, id);
  }

  linkSource = null;
  render();
}

function flashBadge() {
  const badge = document.getElementById('mode-badge');
  const orig = badge.textContent;
  badge.textContent = 'GATE↔GATE ✗';
  badge.style.borderColor = 'var(--red)';
  badge.style.color = 'var(--red)';
  setTimeout(() => {
    badge.textContent = orig;
    badge.style.borderColor = '';
    badge.style.color = '';
  }, 900);
}

// ── Rendering ─────────────────────────────────────────────────────────────
function renderEdges() {
  edgesLayer.innerHTML = '';
  edges.forEach(e => {
    const from = nodes.find(n => n.id === e.from);
    const to = nodes.find(n => n.id === e.to);
    if (!from || !to) return;

    const p1 = nodePort(from, 'right');
    const p2 = nodePort(to, 'left');

    // bezier
    const dx = Math.abs(p2.x - p1.x) * 0.5;
    const d = `M${p1.x},${p1.y} C${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'edge-line');

    // invisible hit area
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hit.setAttribute('d', d);
    hit.setAttribute('class', 'edge-hit');
    hit.addEventListener('dblclick', ev => { ev.stopPropagation(); deleteEdge(e.id); });

    g.appendChild(path);
    g.appendChild(hit);
    edgesLayer.appendChild(g);
  });
}

function makeAndGatePath(cx, cy, w, h) {
  // D-shaped AND gate: flat left, rounded right
  const lx = cx - w / 2;
  const rx = cx + w / 2;
  const ty = cy - h / 2;
  const by = cy + h / 2;
  const r = h / 2;
  return `M${lx},${ty} L${rx - r},${ty} Q${rx},${ty} ${rx},${cy} Q${rx},${by} ${rx - r},${by} L${lx},${by} Z`;
}

function renderNodes() {
  nodesLayer.innerHTML = '';

  nodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const isSelected = selected === node.id;
    const isSource = linkSource === node.id;
    const classes = [
      node.type === 'text' ? 'text-node-group' : 'gate-group',
      isSelected ? 'selected' : '',
      isSource ? 'link-source' : ''
    ].filter(Boolean).join(' ');
    g.setAttribute('class', classes);

    if (node.type === 'text') {
      const w = textNodeWidth(node.label);
      const h = TEXT_H;
      const x = node.x - w / 2;
      const y = node.y - h / 2;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('class', 'text-node-rect');
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', w); rect.setAttribute('height', h);
      rect.setAttribute('rx', 5); rect.setAttribute('ry', 5);
      if (isSource) rect.setAttribute('stroke', '#5ecfbe');

      // small left accent bar
      const accent = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      accent.setAttribute('x', x + 1); accent.setAttribute('y', y + 6);
      accent.setAttribute('width', 3); accent.setAttribute('height', h - 12);
      accent.setAttribute('rx', 1.5);
      accent.setAttribute('fill', isSource ? '#5ecfbe' : (isSelected ? '#5ecfbe' : '#a07020'));
      accent.setAttribute('opacity', '0.7');
      accent.setAttribute('pointer-events', 'none');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-label');
      text.setAttribute('x', x + 14);
      text.setAttribute('y', node.y);
      text.textContent = node.label;

      g.appendChild(rect);
      g.appendChild(accent);
      g.appendChild(text);

    } else {
      // AND gate D-shape
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'gate-body');
      path.setAttribute('d', makeAndGatePath(node.x, node.y, GATE_W, GATE_H));
      if (isSource) path.setAttribute('stroke', '#5ecfbe');

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'gate-label');
      label.setAttribute('x', node.x - 2);
      label.setAttribute('y', node.y);
      label.setAttribute('text-anchor', 'middle');
      label.textContent = '&';

      // input tick marks on flat left side
      [-8, 8].forEach(dy => {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', node.x - GATE_W / 2 - 6);
        tick.setAttribute('y1', node.y + dy);
        tick.setAttribute('x2', node.x - GATE_W / 2);
        tick.setAttribute('y2', node.y + dy);
        tick.setAttribute('stroke', isSource ? '#5ecfbe' : '#e8a830');
        tick.setAttribute('stroke-width', '1');
        tick.setAttribute('opacity', '0.5');
        tick.setAttribute('pointer-events', 'none');
        g.appendChild(tick);
      });

      g.appendChild(path);
      g.appendChild(label);
    }

    // Interaction
    g.style.cursor = 'pointer';

    let didDrag = false;
    g.addEventListener('mousedown', ev => {
      ev.stopPropagation();
      didDrag = false;
      draggingNode = node.id;
      const pt = toSVG(ev.clientX, ev.clientY);
      dragOffset = { x: pt.x - node.x, y: pt.y - node.y };
    });
    g.addEventListener('click', ev => {
      ev.stopPropagation();
      if (didDrag) return;
      if (linkMode) {
        handleLinkClick(node.id);
      } else {
        selected = selected === node.id ? null : node.id;
        render();
      }
    });
    g.addEventListener('contextmenu', ev => {
      ev.preventDefault();
      deleteNode(node.id);
    });

    nodesLayer.appendChild(g);
  });
}

function renderSidebar() {
  const textList = document.getElementById('text-list');
  const gateList = document.getElementById('gate-list');
  textList.innerHTML = '';
  gateList.innerHTML = '';

  nodes.forEach(node => {
    const el = document.createElement('div');
    el.className = 'task-item' +
      (node.type === 'gate' ? ' gate-item' : '') +
      (selected === node.id ? ' selected' : '') +
      (linkSource === node.id ? ' link-source' : '');
    el.innerHTML = `
      <span class="task-icon">${node.type === 'gate' ? '∧' : '◈'}</span>
      <span class="task-name-sb" title="${node.label}">${node.label}</span>
      <span class="task-del" onclick="event.stopPropagation();deleteNode('${node.id}')">×</span>`;
    el.onclick = () => {
      if (linkMode) handleLinkClick(node.id);
      else { selected = selected === node.id ? null : node.id; render(); }
    };
    if (node.type === 'text') textList.appendChild(el);
    else gateList.appendChild(el);
  });
}

function renderStats() {
  const textCount = nodes.filter(n => n.type === 'text').length;
  const gateCount = nodes.filter(n => n.type === 'gate').length;
  document.getElementById('s-text').textContent = textCount;
  document.getElementById('s-gates').textContent = gateCount;
  document.getElementById('s-edges').textContent = edges.length;
  document.getElementById('empty-state').style.display = nodes.length ? 'none' : 'flex';
}

function updateLinkPreview() {
  if (!linkMode || !linkSource) { linkPreview.style.display = 'none'; return; }
  const src = nodes.find(n => n.id === linkSource);
  if (!src) { linkPreview.style.display = 'none'; return; }
  const p1 = nodePort(src, 'right');
  const p2 = { x: mousePos.x, y: mousePos.y };
  const dx = Math.abs(p2.x - p1.x) * 0.5;
  linkPreview.setAttribute('d',
    `M${p1.x},${p1.y} C${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`);
  linkPreview.style.display = '';
}

function render() {
  renderEdges();
  renderNodes();
  renderSidebar();
  renderStats();
  updateLinkPreview();
}

function updateViewport() {
  viewport.setAttribute('transform', `translate(${panX},${panY})`);
}

// ── Auto layout ────────────────────────────────────────────────────────────
function autoLayout() {
  if (!nodes.length) return;

  // Assign layers based on DAG traversal
  const adj = {}, indegree = {};
  nodes.forEach(n => { adj[n.id] = []; indegree[n.id] = 0; });
  edges.forEach(e => { if (adj[e.from]) { adj[e.from].push(e.to); indegree[e.to]++; } });

  const levels = {};
  const queue = nodes.filter(n => indegree[n.id] === 0).map(n => n.id);
  queue.forEach(id => levels[id] = 0);

  let qi = 0;
  const q = [...queue];
  while (qi < q.length) {
    const cur = q[qi++];
    (adj[cur] || []).forEach(nxt => {
      levels[nxt] = Math.max(levels[nxt] || 0, (levels[cur] || 0) + 1);
      indegree[nxt]--;
      if (indegree[nxt] === 0) q.push(nxt);
    });
  }
  nodes.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });

  const maxLevel = Math.max(...Object.values(levels), 0);
  const groups = {};
  nodes.forEach(n => {
    const l = levels[n.id];
    if (!groups[l]) groups[l] = [];
    groups[l].push(n.id);
  });

  const svgRect = svg.getBoundingClientRect();
  const W = svgRect.width, H = svgRect.height;
  const colW = Math.min(180, (W - 80) / (maxLevel + 1));

  Object.entries(groups).forEach(([lvl, ids]) => {
    const x = 80 + Number(lvl) * colW;
    const rowH = Math.min(80, (H - 60) / ids.length);
    ids.forEach((id, i) => {
      const n = nodes.find(n => n.id === id);
      n.x = x;
      n.y = 40 + i * rowH + rowH / 2;
    });
  });

  panX = 20; panY = 20;
  updateViewport();
  render();
}

function clearAll() {
  if (!nodes.length || confirm('Clear everything?')) {
    nodes = []; edges = [];
    selected = null; linkSource = null; linkMode = false;
    const badge = document.getElementById('mode-badge');
    badge.className = 'mode-normal';
    badge.textContent = 'NORMAL';
    linkPreview.style.display = 'none';
    render();
  }
}

// ── Mouse / pan / drag ────────────────────────────────────────────────────
function toSVG(cx, cy) {
  const r = svg.getBoundingClientRect();
  return { x: cx - r.left - panX, y: cy - r.top - panY };
}

svg.addEventListener('mousedown', e => {
  if (e.button === 0 && !draggingNode) {
    isPanning = true;
    panStart = { x: e.clientX - panX, y: e.clientY - panY };
    document.getElementById('canvas-wrap').classList.add('dragging');
  }
});

window.addEventListener('mousemove', e => {
  const r = svg.getBoundingClientRect();
  mousePos = { x: e.clientX - r.left - panX, y: e.clientY - r.top - panY };

  if (draggingNode) {
    const node = nodes.find(n => n.id === draggingNode);
    if (node) {
      const pt = toSVG(e.clientX, e.clientY);
      node.x = pt.x - dragOffset.x;
      node.y = pt.y - dragOffset.y;
      // mark drag happened
      const g = nodesLayer.querySelector('.link-source, .selected');
      render();
    }
    return;
  }
  if (isPanning) {
    panX = e.clientX - panStart.x;
    panY = e.clientY - panStart.y;
    updateViewport();
  }
  if (linkMode && linkSource) updateLinkPreview();
});

window.addEventListener('mouseup', e => {
  if (draggingNode) {
    draggingNode = null;
    dragOffset = null;
  }
  if (isPanning) {
    isPanning = false;
    document.getElementById('canvas-wrap').classList.remove('dragging');
  }
});

// click on empty canvas
svg.addEventListener('click', e => {
  if (e.target === svg || e.target.id === 'graph') {
    if (linkMode) { linkSource = null; linkPreview.style.display = 'none'; }
    else selected = null;
    render();
  }
});

// ── Track drag vs click ───────────────────────────────────────────────────
let mouseDownPos = null;
window.addEventListener('mousedown', e => {
  mouseDownPos = { x: e.clientX, y: e.clientY };
});
// Patch: set didDrag flag on nodes by checking movement in mousemove
// This is handled via draggingNode flag in nodegroup mousedown callbacks.
// We patch via delegated approach: expose a 'wasDragging' flag.
let wasDragging = false;
const _origMouseMove = window.onmousemove;
svg.addEventListener('mousemove', () => {
  if (draggingNode) wasDragging = true;
});
// After mouseup, reset
window.addEventListener('mouseup', () => { setTimeout(() => wasDragging = false, 0); });

// ── Sample data ───────────────────────────────────────────────────────────
function loadSample() {
  // Causal model: "System Outage" caused by combined factors
  nodes = [
    { id: 'n1', type: 'text', label: 'High Load',       x: 110, y: 80  },
    { id: 'n2', type: 'text', label: 'Memory Leak',     x: 110, y: 160 },
    { id: 'g1', type: 'gate', label: 'AND',             x: 290, y: 120 },
    { id: 'n3', type: 'text', label: 'DB Timeout',      x: 110, y: 280 },
    { id: 'n4', type: 'text', label: 'No Retry Logic',  x: 110, y: 360 },
    { id: 'g2', type: 'gate', label: 'AND',             x: 290, y: 320 },
    { id: 'n5', type: 'text', label: 'Service Crash',   x: 470, y: 120 },
    { id: 'n6', type: 'text', label: 'Request Failure', x: 470, y: 320 },
    { id: 'g3', type: 'gate', label: 'AND',             x: 650, y: 220 },
    { id: 'n7', type: 'text', label: 'System Outage',   x: 820, y: 220 },
  ];
  edges = [
    { id: 'e1', from: 'n1', to: 'g1' },
    { id: 'e2', from: 'n2', to: 'g1' },
    { id: 'e3', from: 'g1', to: 'n5' },
    { id: 'e4', from: 'n3', to: 'g2' },
    { id: 'e5', from: 'n4', to: 'g2' },
    { id: 'e6', from: 'g2', to: 'n6' },
    { id: 'e7', from: 'n5', to: 'g3' },
    { id: 'e8', from: 'n6', to: 'g3' },
    { id: 'e9', from: 'g3', to: 'n7' },
  ];
  nextId = 20;
  panX = 30; panY = 40;
  updateViewport();
  render();
}

loadSample();
