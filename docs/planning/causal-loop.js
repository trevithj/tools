import {bipartiteAutoLayout} from "./graphLayout.js";

// ── Constants ─────────────────────────────────────────────────────────────
const TEXT_H = 36;
const GATE_R = 12;   // radius of circular AND gate
const LINE_HEIGHT = 16;
const TEXT_PAD_X = 18;
const TEXT_PAD_Y = 10;
const NL_CHAR = "|"; // character to indicate a new line/line break

// ── DOM refs ──────────────────────────────────────────────────────────────
const svg = document.getElementById('graph');
const viewport = document.getElementById('viewport');
const edgesLayer = document.getElementById('edges-layer');
const nodesLayer = document.getElementById('nodes-layer');
const linkPreviewPath = document.getElementById('link-preview-path');
const nodeInput = document.getElementById('node-input');

// ── State ─────────────────────────────────────────────────────────────────
let nodes = [];  // { id, type:'text'|'gate', label, x, y }
let edges = [];  // { id, from, to }
let nextId = 1;
let mode = 'normal'; // 'normal' | 'add' | 'link' | 'delete'

let selected = null;
let linkSource = null;

let panX = 0, panY = 0;
let isPanning = false, panStart = null;
let draggingNode = null, dragOffset = null;
let mousePos = {x: 0, y: 0};  // in viewport (SVG) space

// ── Helpers ───────────────────────────────────────────────────────────────
function uid() {return 'n' + (nextId++);}

function nodeSize(node) {
    if (node.type === 'gate') return {w: GATE_R * 2, h: GATE_R * 2};
    const lines = node.label.split(NL_CHAR);
    const w = Math.max(110, Math.max(...lines.map(l => l.length)) * 7.4 + TEXT_PAD_X * 2);
    const h = Math.max(TEXT_H, lines.length * LINE_HEIGHT + TEXT_PAD_Y * 2);
    return {w, h};
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
        const {w, h} = nodeSize(n);
        const hw = w / 2, hh = h / 2;
        // parameterise ray: find smallest t > 0 that hits a wall
        let t = Infinity;
        if (Math.abs(ux) > 1e-9) {const tc = (ux > 0 ? hw : -hw) / ux; if (tc > 0) t = Math.min(t, tc);}
        if (Math.abs(uy) > 1e-9) {const tc = (uy > 0 ? hh : -hh) / uy; if (tc > 0) t = Math.min(t, tc);}
        return {x: n.x + ux * t, y: n.y + uy * t};
    }
}

// ── Mutation helpers ──────────────────────────────────────────────────────
function addTextNode() {
    if (selected || mode !== 'normal') return;
    const label = nodeInput.value.trim();
    if (!label) return;
    nodeInput.value = '';

    const r = svg.getBoundingClientRect();
    const x = (r.width / 2 - panX) + (Math.random() - 0.5) * 120;
    const y = (r.height / 2 - panY) + (Math.random() - 0.5) * 80;
    nodes.push({id: uid(), type: 'text', label, x, y});
    render();
    nodeInput.focus();
}
nodeInput.addEventListener('keydown', e => {
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
function doSetMode(m) {
    return () => {
        mode = m === mode ? 'normal' : m; // clicking active mode returns to normal
        linkSource = null;
        selected = null;
        linkPreviewPath.style.display = 'none';

        // Badge
        const badge = document.getElementById('mode-badge');
        const labels = {normal: 'NORMAL', add: 'ADD', link: 'LINK', delete: 'DELETE'};
        badge.textContent = labels[mode];
        badge.className = 'mode-' + mode;

        // Canvas cursor + class
        const wrap = document.getElementById('canvas-wrap');
        wrap.className = 'canvas-' + mode;

        // Button active states
        ['btn-add', 'btn-link', 'btn-delete'].forEach(id => {
            document.getElementById(id).classList.remove('btn-active');
        });
        if (mode !== 'normal') {
            document.getElementById('btn-' + mode).classList.add('btn-active');
        }

        render();
    }
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
        hit.addEventListener('click', ev => {
            ev.stopPropagation();
            if (mode === 'delete') deleteEdge(e.id);
        });
        hit.addEventListener('dblclick', ev => {
            ev.stopPropagation();
            if (mode !== 'delete') deleteEdge(e.id);
        });

        g.appendChild(path);
        g.appendChild(hit);
        edgesLayer.appendChild(g);
    });
}

function renderTextNode(g, node) {
    const lines = node.label.split('|');
    const {w, h} = nodeSize(node);
    const rx = node.x - w / 2;
    const ry = node.y - h / 2;

    const rect = svgNS('rect');
    rect.setAttribute('class', 'text-node-rect');
    rect.setAttribute('x', rx); rect.setAttribute('y', ry);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('rx', 5); rect.setAttribute('ry', 5);

    const textEl = svgNS('text');
    textEl.setAttribute('class', 'node-label');
    textEl.setAttribute('pointer-events', 'none');
    const totalTextH = lines.length * LINE_HEIGHT;
    const startY = node.y - totalTextH / 2 + LINE_HEIGHT / 2 + 3;
    lines.forEach((line, i) => {
        const tspan = svgNS('tspan');
        tspan.setAttribute('x', rx + TEXT_PAD_X);
        tspan.setAttribute('y', startY + i * LINE_HEIGHT);
        tspan.textContent = line;
        textEl.appendChild(tspan);
    });
    g.appendChild(rect); g.appendChild(textEl);
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
            renderTextNode(g, node);
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
    const textList = document.getElementById("text-list");
    textList.innerHTML = '';
    nodes.forEach(node => {
        if (node.type === 'gate') return;
        const el = document.createElement('div');
        el.className = 'task-item' +
            (selected === node.id ? ' selected' : '') +
            (linkSource === node.id ? ' link-source' : '');
        el.innerHTML = `
      <span class="task-icon">${node.type === 'gate' ? '◯' : '◈'}</span>
      <span class="task-name-sb" title="${node.label}">${node.label}</span>
      <span class="task-del">×</span>`;
        el.querySelector(".task-del").addEventListener("click", (event) => {
            event.stopPropagation();
            deleteNode(node.id);
        });
        el.onclick = () => handleLinkClick(node.id);
        textList.appendChild(el);
    });
}

function updateLinkPreview() {
    if (mode !== "link" || !linkSource) {linkPreviewPath.style.display = 'none'; return;}
    const src = nodes.find(n => n.id === linkSource);
    if (!src) {linkPreviewPath.style.display = 'none'; return;}
    const p1 = boundaryPoint(src, mousePos.x, mousePos.y);
    const dx = Math.abs(mousePos.x - p1.x) * 0.45;
    linkPreviewPath.setAttribute('d',
        `M${p1.x},${p1.y} L${mousePos.x},${mousePos.y}`);
    linkPreviewPath.style.display = '';
}

function render() {
    renderEdges();
    renderNodes();
    renderSidebar();
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
        if (mode === "link") mode = "normal"; else render();
    }
}

function doSave() {
    // TODO: write to browser storage
    console.log({ nodes, edges });
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
    if (mode === 'add' && (e.target === svg || e.target === viewport)) {
        const pt = toSVG(e.clientX, e.clientY);
        const id = uid();
        nodes.push({id, type: 'text', label: 'New node', x: pt.x, y: pt.y});
        selected = id;
        document.getElementById('node-input').value = 'New node';
        document.getElementById('node-input').focus();
        document.getElementById('node-input').select();
        render();
        return;
    }
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
    if (mode === "link" && linkSource) updateLinkPreview();
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
            if (mode === 'delete') {
                deleteNode(id);
            } else if (mode === 'link') {
                handleLinkClick(id);
            } else {
                selected = selected === id ? null : id;
                if (selected === id) {
                    nodeInput.value = nodes.find(n => n.id === id).label;
                    nodeInput.focus();
                } else {
                    nodeInput.value = '';
                }
                render();
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
        if (mode === "link") {
            linkSource = null;
            linkPreviewPath.style.display = 'none';
        }
        selected = null;
        nodeInput.value = '';
        render();
    }
});


// ── Sample: thermostat feedback loop ─────────────────────────────────────
function loadSample() {
    nodes = [
        {id: "n0", type: "text", label: "Bob's donuts are|fresher", x: 175, y: 227},
        {id: "n1", type: "text", label: "Fresh donuts|sell faster", x: 277, y: 343},
        {id: "n2", type: "text", label: "Faster-selling|donuts are|fresher", x: 534, y: 133},
        {id: "n3", type: "text", label: "Bob's donuts sell|faster", x: 600, y: 236},
        {id: "n4", type: "gate", label: "AND", x: 408, y: 287},
        {id: "n5", type: "gate", label: "AND", x: 383, y: 169}
    ];
    edges = [
        {id: "n6", from: "n0", to: "n4"},
        {id: "n7", from: "n4", to: "n3"},
        {id: "n8", from: "n1", to: "n4"},
        {id: "n9", from: "n3", to: "n5"},
        {id: "n10", from: "n5", to: "n0"},
        {id: "n11", from: "n2", to: "n5"}
    ];
    nextId = 12;
    panX = 60; panY = 60;
    updateViewport();
    render();
}

loadSample();

const buttons = document.querySelectorAll("button.btn");
buttons[0].addEventListener("click", doSetMode("normal"));
buttons[1].addEventListener("click", doSetMode('add'));
buttons[2].addEventListener("click", doSetMode('link'));
buttons[3].addEventListener("click", doSetMode('delete'));
buttons[4].addEventListener("click", autoLayout);
buttons[5].addEventListener("click", clearAll);
buttons[6].addEventListener("click", doSave);
nodeInput.addEventListener('input', () => {
    if (selected) {
        const node = nodes.find(n => n.id === selected);
        if (node) {node.label = nodeInput.value; render();}
    }
});
