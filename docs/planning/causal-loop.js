import {bipartiteAutoLayout} from "./graphLayout";

// ── Constants ─────────────────────────────────────────────────────────────
const TEXT_H = 36;
const GATE_R = 22;   // radius of circular AND gate
const TEXT_PAD = 18;   // horizontal padding inside text node

// ── DOM refs ──────────────────────────────────────────────────────────────
const svg = document.getElementById('graph');
const viewport = document.getElementById('viewport');
const edgesLayer = document.getElementById('edges-layer');
const nodesLayer = document.getElementById('nodes-layer');
const linkPreviewPath = document.getElementById('link-preview-path');

// ── State ─────────────────────────────────────────────────────────────────
let nodes = [];  // { id, type:'text'|'gate', label, x, y }
let edges = [];  // { id, from, to }
let nextId = 1;

let selected = null;
let linkMode = false;
let linkSource = null;

let panX = 0, panY = 0;
let isPanning = false, panStart = null;
let draggingNode = null, dragOffset = null;
let mousePos = {x: 0, y: 0};  // in viewport (SVG) space

// ── Helpers ───────────────────────────────────────────────────────────────
function uid() {return 'n' + (nextId++);}

function textNodeWidth(label) {
    return Math.max(110, label.length * 7.4 + TEXT_PAD * 2);
}

/**
 * Compute the point on node n's boundary in the direction of (tx, ty).
 * For text nodes: intersection with the rounded rectangle.
 * For gate nodes: point on the circle circumference.
 */
function boundaryPoint(n, tx, ty) {
    const dx = tx - n.x, dy = ty - n.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.001) return {x: n.x, y: n.y};
    const ux = dx / dist, uy = dy / dist;

    if (n.type === 'gate') {
        return {x: n.x + ux * GATE_R, y: n.y + uy * GATE_R};
    } else {
        // Axis-aligned rect intersection
        const hw = textNodeWidth(n.label) / 2;
        const hh = TEXT_H / 2;
        // parameterise ray: find smallest t > 0 that hits a wall
        let t = Infinity;
        if (Math.abs(ux) > 1e-9) {const tc = (ux > 0 ? hw : -hw) / ux; if (tc > 0) t = Math.min(t, tc);}
        if (Math.abs(uy) > 1e-9) {const tc = (uy > 0 ? hh : -hh) / uy; if (tc > 0) t = Math.min(t, tc);}
        return {x: n.x + ux * t, y: n.y + uy * t};
    }
}

// ── Mutation helpers ──────────────────────────────────────────────────────
function addTextNode() {
    const inp = document.getElementById('node-input');
    const label = inp.value.trim();
    if (!label) return;
    inp.value = '';

    const r = svg.getBoundingClientRect();
    const x = (r.width / 2 - panX) + (Math.random() - 0.5) * 120;
    const y = (r.height / 2 - panY) + (Math.random() - 0.5) * 80;
    nodes.push({id: uid(), type: 'text', label, x, y});
    render();
    inp.focus();
}
document.getElementById('node-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTextNode();
});

function addGateNode(x, y) {
    const id = uid();
    nodes.push({id, type: 'gate', label: 'AND', x, y});
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
    if (fromId === toId) return;
    if (!edges.find(e => e.from === fromId && e.to === toId))
        edges.push({id: uid(), from: fromId, to: toId});
}

function deleteEdge(id) {
    edges = edges.filter(e => e.id !== id);
    render();
}

// ── Link mode ─────────────────────────────────────────────────────────────
function toggleLinkMode() {
    linkMode = !linkMode;
    linkSource = null;
    selected = null;
    const badge = document.getElementById('mode-badge');
    badge.className = linkMode ? 'mode-link' : 'mode-normal';
    badge.textContent = linkMode ? 'LINK MODE' : 'NORMAL';
    linkPreviewPath.style.display = 'none';
    render();
}

function handleLinkClick(id) {
    if (!linkSource) {linkSource = id; render(); return;}
    if (linkSource === id) {linkSource = null; render(); return;}

    const src = nodes.find(n => n.id === linkSource);
    const tgt = nodes.find(n => n.id === id);
    if (!src || !tgt) {linkSource = null; render(); return;}

    if (src.type === 'gate' && tgt.type === 'gate') {
        // forbidden — flash badge
        linkSource = null;
        flashBadge();
        render();
        return;
    }

    if (src.type !== tgt.type) {
        // text↔gate: direct edge
        addEdge(linkSource, id);
    } else {
        // text→text: auto-insert AND gate
        const gx = (src.x + tgt.x) / 2 + (Math.random() - 0.5) * 30;
        const gy = (src.y + tgt.y) / 2 + (Math.random() - 0.5) * 30;
        const gid = addGateNode(gx, gy);
        addEdge(linkSource, gid);
        addEdge(gid, id);
    }

    linkSource = null;
    render();
}

function flashBadge() {
    const badge = document.getElementById('mode-badge');
    const saved = {cls: badge.className, txt: badge.textContent};
    badge.textContent = 'GATE↔GATE ✗';
    badge.style.cssText = 'border-color:var(--red);color:var(--red)';
    setTimeout(() => {
        badge.className = saved.cls;
        badge.textContent = saved.txt;
        badge.style.cssText = '';
    }, 900);
}

// ── Rendering ─────────────────────────────────────────────────────────────
function svgNS(tag) {return document.createElementNS('http://www.w3.org/2000/svg', tag);}

function renderEdges() {
    edgesLayer.innerHTML = '';
    edges.forEach(e => {
        const src = nodes.find(n => n.id === e.from);
        const tgt = nodes.find(n => n.id === e.to);
        if (!src || !tgt) return;

        // Use boundary points for clean connection regardless of angle
        const p1 = boundaryPoint(src, tgt.x, tgt.y);
        const p2 = boundaryPoint(tgt, src.x, src.y);

        // const dx = Math.abs(p2.x - p1.x) * 0.45;
        // const d = `M${p1.x},${p1.y} C${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`;
        const d = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

        const g = svgNS('g');
        const path = svgNS('path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'edge-line');

        const hit = svgNS('path');
        hit.setAttribute('d', d);
        hit.setAttribute('class', 'edge-hit');
        hit.addEventListener('dblclick', ev => {ev.stopPropagation(); deleteEdge(e.id);});

        g.appendChild(path);
        g.appendChild(hit);
        edgesLayer.appendChild(g);
    });
}

function renderTextNode(g, node, isSource, isSelected) {
    const w = textNodeWidth(node.label);
    const h = TEXT_H;
    const rx = node.x - w / 2;
    const ry = node.y - h / 2;

    const rect = svgNS('rect');
    rect.setAttribute('class', 'text-node-rect');
    rect.setAttribute('x', rx); rect.setAttribute('y', ry);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('rx', 5); rect.setAttribute('ry', 5);

    // left accent bar
    const accent = svgNS('rect');
    accent.setAttribute('x', rx + 1); accent.setAttribute('y', ry + 7);
    accent.setAttribute('width', 3); accent.setAttribute('height', h - 14);
    accent.setAttribute('rx', 1.5);
    accent.setAttribute('fill', isSource || isSelected ? '#5ecfbe' : '#a07020');
    accent.setAttribute('opacity', '0.7');
    accent.setAttribute('pointer-events', 'none');

    const text = svgNS('text');
    text.setAttribute('class', 'node-label');
    text.setAttribute('x', rx + TEXT_PAD);
    text.setAttribute('y', node.y);
    text.textContent = node.label;

    g.appendChild(rect); g.appendChild(accent); g.appendChild(text);
}

function renderGateNode(g, node) {
    // Circular AND gate
    const circle = svgNS('circle');
    circle.setAttribute('class', 'gate-circle');
    circle.setAttribute('cx', node.x); circle.setAttribute('cy', node.y);
    circle.setAttribute('r', GATE_R);

    const label = svgNS('text');
    label.setAttribute('class', 'gate-label');
    label.setAttribute('x', node.x);
    label.setAttribute('y', node.y + 1);
    label.textContent = '&';

    g.appendChild(circle); g.appendChild(label);
}

function renderNodes() {
    nodesLayer.innerHTML = '';

    nodes.forEach(node => {
        const isSelected = selected === node.id;
        const isSource = linkSource === node.id;

        const g = svgNS('g');
        const classes = [
            node.type === 'text' ? 'text-node-group' : 'gate-group',
            isSelected ? 'selected' : '',
            isSource ? 'link-source' : ''
        ].filter(Boolean).join(' ');
        g.setAttribute('class', classes);

        if (node.type === 'text') {
            renderTextNode(g, node, isSource, isSelected);
        } else {
            renderGateNode(g, node);
        }

        // ── Drag + click ───────────────────────────────────────────────────
        g.style.cursor = 'pointer';

        g.addEventListener('mousedown', ev => {
            ev.stopPropagation();
            draggingNode = node.id;
            const pt = toSVG(ev.clientX, ev.clientY);
            dragOffset = {x: pt.x - node.x, y: pt.y - node.y};
        });

        // distinguish click vs drag in mouseup listener below (global)
        g.addEventListener('contextmenu', ev => {ev.preventDefault(); deleteNode(node.id);});

        nodesLayer.appendChild(g);
    });
}

function renderSidebar() {
    ['text-list', 'gate-list'].forEach(id => document.getElementById(id).innerHTML = '');
    nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'task-item' +
            (node.type === 'gate' ? ' gate-item' : '') +
            (selected === node.id ? ' selected' : '') +
            (linkSource === node.id ? ' link-source' : '');
        el.innerHTML = `
      <span class="task-icon">${node.type === 'gate' ? '◯' : '◈'}</span>
      <span class="task-name-sb" title="${node.label}">${node.label}</span>
      <span class="task-del" onclick="event.stopPropagation();deleteNode('${node.id}')">×</span>`;
        el.onclick = () => {
            if (linkMode) handleLinkClick(node.id);
            else {selected = selected === node.id ? null : node.id; render();}
        };
        document.getElementById(node.type === 'gate' ? 'gate-list' : 'text-list').appendChild(el);
    });
}

function updateLinkPreview() {
    if (!linkMode || !linkSource) {linkPreviewPath.style.display = 'none'; return;}
    const src = nodes.find(n => n.id === linkSource);
    if (!src) {linkPreviewPath.style.display = 'none'; return;}
    const p1 = boundaryPoint(src, mousePos.x, mousePos.y);
    const dx = Math.abs(mousePos.x - p1.x) * 0.45;
    linkPreviewPath.setAttribute('d',
        `M${p1.x},${p1.y} C${p1.x + dx},${p1.y} ${mousePos.x - dx},${mousePos.y} ${mousePos.x},${mousePos.y}`);
    linkPreviewPath.style.display = '';
}

function render() {
    renderEdges();
    renderNodes();
    renderSidebar();
    document.getElementById('s-text').textContent = nodes.filter(n => n.type === 'text').length;
    document.getElementById('s-gates').textContent = nodes.filter(n => n.type === 'gate').length;
    document.getElementById('s-edges').textContent = edges.length;
    document.getElementById('empty-state').style.display = nodes.length ? 'none' : 'flex';
    updateLinkPreview();
}

function updateViewport() {
    viewport.setAttribute('transform', `translate(${panX},${panY})`);
}

// ── Auto layout ────────────────────────────────────────────────────────────
function autoLayout() {
    const textNodes = nodes.filter(n => n.type === "text");
    const gateNodes = nodes.filter(n => n.type === "gate");
    const r = svg.getBoundingClientRect();
    nodes = bipartiteAutoLayout(textNodes, gateNodes, edges, r.width, r.height);
    panX = 20; panY = 20;
    updateViewport();
    render();
}

function clearAll() {
    if (!nodes.length || confirm('Clear everything?')) {
        nodes = []; edges = []; selected = null; linkSource = null;
        if (linkMode) toggleLinkMode(); else render();
    }
}

// ── Coordinate helpers ────────────────────────────────────────────────────
function toSVG(cx, cy) {
    const r = svg.getBoundingClientRect();
    return {x: cx - r.left - panX, y: cy - r.top - panY};
}

// ── Global mouse events ───────────────────────────────────────────────────
// let mouseDownNode = null;
let mouseDownMoved = false;

svg.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (!draggingNode) {
        isPanning = true;
        panStart = {x: e.clientX - panX, y: e.clientY - panY};
        document.getElementById('canvas-wrap').classList.add('dragging');
    }
});

window.addEventListener('mousemove', e => {
    const r = svg.getBoundingClientRect();
    mousePos = {x: e.clientX - r.left - panX, y: e.clientY - r.top - panY};

    if (draggingNode) {
        mouseDownMoved = true;
        const node = nodes.find(n => n.id === draggingNode);
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
    if (linkMode && linkSource) updateLinkPreview();
});

window.addEventListener('mouseup', () => {
    if (draggingNode) {
        const id = draggingNode;
        const moved = mouseDownMoved;
        draggingNode = null;
        dragOffset = null;
        mouseDownMoved = false;
        // If barely moved → treat as click
        if (!moved) {
            if (linkMode) handleLinkClick(id);
            else {selected = selected === id ? null : id; render();}
        }
    }
    if (isPanning) {
        isPanning = false;
        document.getElementById('canvas-wrap').classList.remove('dragging');
    }
});

svg.addEventListener('click', e => {
    if (e.target === svg || e.target === viewport) {
        if (linkMode) {linkSource = null; linkPreviewPath.style.display = 'none';}
        else selected = null;
        render();
    }
});

// ── Sample: thermostat feedback loop ─────────────────────────────────────
function loadSample() {
    nodes = [
        // Feedback loop: temperature regulation
        {id: 'n1', type: 'text', label: 'Room Temp', x: 400, y: 120},
        {id: 'n2', type: 'text', label: 'Setpoint', x: 160, y: 220},
        {id: 'g1', type: 'gate', label: 'AND', x: 310, y: 220},
        {id: 'n3', type: 'text', label: 'Error Signal', x: 460, y: 220},
        {id: 'n4', type: 'text', label: 'Heater Output', x: 620, y: 330},
        {id: 'g2', type: 'gate', label: 'AND', x: 460, y: 330},
        {id: 'g3', type: 'gate', label: 'AND', x: 620, y: 220},
        {id: 'n5', type: 'text', label: 'Fuel Supply', x: 300, y: 370},
        // feedback edge: room temp feeds back into gate g1
    ];
    edges = [
        {id: 'e1', from: 'n1', to: 'g1'},   // room temp → gate
        {id: 'e2', from: 'n2', to: 'g1'},   // setpoint  → gate
        {id: 'e3', from: 'g1', to: 'n3'},   // gate → error signal
        {id: 'e4', from: 'n3', to: 'g2'},   // error → gate2
        {id: 'e5', from: 'n5', to: 'g2'},   // fuel   → gate2
        {id: 'e6', from: 'g2', to: 'n4'},   // gate2 → heater output
        // heater output → gate3 → room temp (FEEDBACK)
        {id: 'e7', from: 'n4', to: 'g3'},
        {id: 'e8', from: 'g3', to: 'n1'},
    ];
    nextId = 20;
    panX = 60; panY = 60;
    updateViewport();
    render();
}

loadSample();

const buttons = document.querySelectorAll("button.btn");
buttons[0].addEventListener("click", addTextNode);
buttons[1].addEventListener("click", toggleLinkMode);
buttons[2].addEventListener("click", autoLayout);
buttons[3].addEventListener("click", clearAll);
// <button class="btn btn-amber" onclick="addTextNode()">+ NODE</button>
// <div class="sep"></div>
// <span id="mode-badge" class="mode-normal">NORMAL</span>
// <button class="btn btn-teal" onclick="toggleLinkMode()">⇒ LINK</button>
// <button class="btn btn-ghost" onclick="autoLayout()">⊞ LAYOUT</button>
// <button class="btn btn-ghost" onclick="clearAll()">✕ CLEAR</button>