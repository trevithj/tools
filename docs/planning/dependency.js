const COLORS = ['#00e5ff', '#ff4d6d', '#a8ff78', '#ffd166', '#c77dff', '#ff9e00', '#4cc9f0'];

let tasks = []; // {id, name, x, y, done}
let deps = [];  // {from, to}
let nextId = 1;
let colorIdx = 0;
let selected = null;
let linkMode = false;
let linkSource = null;

// pan/drag
let panX = 0, panY = 0;
let isPanning = false;
let panStart = null;
let draggingNode = null;
let dragOffset = null;

const svg = document.getElementById('graph');
const viewport = document.getElementById('viewport');
const edgesLayer = document.getElementById('edges-layer');
const nodesLayer = document.getElementById('nodes-layer');
const emptyState = document.getElementById('empty-state');

function uid() {return 't' + (nextId++);}
function color() {return COLORS[colorIdx++ % COLORS.length];}

function addTask() {
    const inp = document.getElementById('task-input');
    const name = inp.value.trim();
    if (!name) return;
    inp.value = '';

    const svgRect = svg.getBoundingClientRect();
    const x = (svgRect.width / 2 - panX) + (Math.random() - 0.5) * 80;
    const y = (svgRect.height / 2 - panY) + (Math.random() - 0.5) * 80;

    tasks.push({id: uid(), name, x, y, done: false, color: color()});
    render();
    inp.focus();
}

document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
});

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    deps = deps.filter(d => d.from !== id && d.to !== id);
    if (selected === id) selected = null;
    if (linkSource === id) linkSource = null;
    render();
}

function toggleDone(id) {
    const t = tasks.find(t => t.id === id);
    if (t) t.done = !t.done;
    render();
}

function toggleLinkMode() {
    linkMode = !linkMode;
    linkSource = null;
    selected = null;
    document.getElementById('mode-badge').className = linkMode ? 'mode-link' : 'mode-normal';
    document.getElementById('mode-badge').textContent = linkMode ? 'LINK MODE' : 'NORMAL';
    render();
}

function selectNode(id) {
    if (linkMode) {
        if (!linkSource) {
            linkSource = id;
        } else if (linkSource !== id) {
            // add dep if not exists
            const exists = deps.find(d => d.from === linkSource && d.to === id);
            if (!exists) {
                deps.push({from: linkSource, to: id});
            }
            linkSource = null;
            render();
            return;
        }
    } else {
        selected = selected === id ? null : id;
    }
    render();
}

function deleteDep(from, to) {
    deps = deps.filter(d => !(d.from === from && d.to === to));
    render();
}

function autoLayout() {
    if (!tasks.length) return;
    // Topological sort based layout
    const adj = {};
    const indegree = {};
    tasks.forEach(t => {adj[t.id] = []; indegree[t.id] = 0;});
    deps.forEach(d => {adj[d.from].push(d.to); indegree[d.to]++;});

    const levels = {};
    const queue = tasks.filter(t => indegree[t.id] === 0).map(t => t.id);
    queue.forEach(id => levels[id] = 0);

    const topo = [];
    const inq = {};
    queue.forEach(id => inq[id] = true);
    let qi = 0;
    const tempQ = [...queue];
    while (qi < tempQ.length) {
        const cur = tempQ[qi++];
        topo.push(cur);
        adj[cur].forEach(nxt => {
            levels[nxt] = Math.max(levels[nxt] || 0, (levels[cur] || 0) + 1);
            indegree[nxt]--;
            if (indegree[nxt] === 0) tempQ.push(nxt);
        });
    }

    // tasks with no level (cycles) get level 0
    tasks.forEach(t => {if (levels[t.id] === undefined) levels[t.id] = 0;});

    const maxLevel = Math.max(...Object.values(levels));
    const levelGroups = {};
    tasks.forEach(t => {
        const l = levels[t.id];
        if (!levelGroups[l]) levelGroups[l] = [];
        levelGroups[l].push(t.id);
    });

    const svgRect = svg.getBoundingClientRect();
    const W = svgRect.width;
    const H = svgRect.height;
    const colW = Math.min(200, W / (maxLevel + 2));
    const startX = 60;

    Object.entries(levelGroups).forEach(([lvl, ids]) => {
        const x = startX + Number(lvl) * colW;
        ids.forEach((id, i) => {
            const t = tasks.find(t => t.id === id);
            const rowH = Math.min(80, (H - 60) / ids.length);
            t.x = x;
            t.y = 40 + i * rowH + rowH / 2;
        });
    });

    panX = 0; panY = 0;
    updateViewport();
    render();
}

function clearAll() {
    if (!tasks.length || confirm('Clear everything?')) {
        tasks = []; deps = []; selected = null; linkSource = null; linkMode = false;
        document.getElementById('mode-badge').className = 'mode-normal';
        document.getElementById('mode-badge').textContent = 'NORMAL';
        render();
    }
}

function getDepth() {
    if (!tasks.length) return 0;
    const memo = {};
    function depth(id) {
        if (memo[id] !== undefined) return memo[id];
        const parents = deps.filter(d => d.to === id).map(d => d.from);
        if (!parents.length) return memo[id] = 0;
        return memo[id] = 1 + Math.max(...parents.map(depth));
    }
    return Math.max(...tasks.map(t => depth(t.id)));
}

function computeCritical() {
    // simple: edges on longest path
    const memo = {};
    function longest(id) {
        if (memo[id] !== undefined) return memo[id];
        const children = deps.filter(d => d.from === id).map(d => d.to);
        if (!children.length) return memo[id] = 0;
        return memo[id] = 1 + Math.max(...children.map(longest));
    }
    tasks.forEach(t => longest(t.id));
    const critDeps = new Set();
    deps.forEach(d => {
        if (memo[d.from] === 1 + memo[d.to]) critDeps.add(d.from + '>' + d.to);
    });
    return critDeps;
}

function nodeWidth(name) {
    return Math.max(120, name.length * 7.5 + 32);
}
const NODE_H = 36;

function render() {
    // empty state
    emptyState.style.display = tasks.length ? 'none' : 'flex';

    // sidebar
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach(t => {
        const el = document.createElement('div');
        el.className = 'task-item' + (selected === t.id ? ' selected' : '');
        el.innerHTML = `<div class="task-dot" style="background:${t.color}"></div>
      <div class="task-name" title="${t.name}">${t.name}</div>
      <div class="task-del" onclick="event.stopPropagation();deleteTask('${t.id}')">×</div>`;
        el.onclick = () => selectNode(t.id);
        list.appendChild(el);
    });

    // stats
    const roots = tasks.filter(t => !deps.find(d => d.to === t.id)).length;
    document.getElementById('stat-tasks').textContent = tasks.length;
    document.getElementById('stat-deps').textContent = deps.length;
    document.getElementById('stat-roots').textContent = roots;
    document.getElementById('stat-depth').textContent = getDepth();

    const critical = computeCritical();

    // edges
    edgesLayer.innerHTML = '';
    deps.forEach(d => {
        const from = tasks.find(t => t.id === d.from);
        const to = tasks.find(t => t.id === d.to);
        if (!from || !to) return;
        const fw = nodeWidth(from.name);
        const tw = nodeWidth(to.name);
        const x1 = from.x + fw / 2, y1 = from.y;
        const x2 = to.x - tw / 2, y2 = to.y;
        const isCrit = critical.has(d.from + '>' + d.to);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const mx = (x1 + x2) / 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        path.setAttribute('class', 'edge' + (isCrit ? ' critical' : ''));
        path.setAttribute('marker-end', isCrit ? 'url(#arrow-critical)' : 'url(#arrow)');
        // click to delete
        const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hitPath.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        hitPath.setAttribute('fill', 'none');
        hitPath.setAttribute('stroke', 'transparent');
        hitPath.setAttribute('stroke-width', '12');
        hitPath.style.cursor = 'pointer';
        hitPath.addEventListener('click', (e) => {e.stopPropagation(); deleteDep(d.from, d.to);});
        g.appendChild(path);
        g.appendChild(hitPath);
        edgesLayer.appendChild(g);
    });

    // nodes
    nodesLayer.innerHTML = '';
    tasks.forEach(t => {
        const w = nodeWidth(t.name);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'graph-node' + (selected === t.id || linkSource === t.id ? ' selected' : '') + (t.done ? ' done' : ''));
        g.setAttribute('transform', `translate(${t.x - w / 2}, ${t.y - NODE_H / 2})`);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', w); rect.setAttribute('height', NODE_H);
        rect.setAttribute('rx', 6);
        if (linkSource === t.id) rect.setAttribute('stroke', '#ff4d6d');
        else if (selected === t.id) rect.setAttribute('stroke', '#ff4d6d');
        else rect.setAttribute('stroke', t.color + '55');

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', 14); dot.setAttribute('cy', NODE_H / 2);
        dot.setAttribute('r', 4); dot.setAttribute('fill', t.color);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 26); text.setAttribute('y', NODE_H / 2 + 4);
        text.textContent = t.name;
        if (t.done) text.setAttribute('text-decoration', 'line-through');

        g.appendChild(rect); g.appendChild(dot); g.appendChild(text);

        // interactions
        g.style.cursor = 'pointer';
        let moved = false;
        g.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            moved = false;
            draggingNode = t.id;
            const svgPt = svgPoint(e.clientX, e.clientY);
            dragOffset = {x: svgPt.x - t.x, y: svgPt.y - t.y};
        });
        g.addEventListener('dblclick', (e) => {e.stopPropagation(); toggleDone(t.id);});

        nodesLayer.appendChild(g);
    });
}

function svgPoint(cx, cy) {
    const rect = svg.getBoundingClientRect();
    return {x: cx - rect.left - panX, y: cy - rect.top - panY};
}

function updateViewport() {
    viewport.setAttribute('transform', `translate(${panX},${panY})`);
}

// mouse events
svg.addEventListener('mousedown', e => {
    if (e.button === 0 && !draggingNode) {
        isPanning = true;
        panStart = {x: e.clientX - panX, y: e.clientY - panY};
        document.getElementById('canvas-wrap').classList.add('dragging');
    }
});

window.addEventListener('mousemove', e => {
    if (draggingNode) {
        const svgRect = svg.getBoundingClientRect();
        const t = tasks.find(t => t.id === draggingNode);
        if (t) {
            t.x = e.clientX - svgRect.left - panX - dragOffset.x + t.x - (t.x - dragOffset.x - (e.clientX - svgRect.left - panX));
            // simpler:
            t.x = e.clientX - svgRect.left - panX - dragOffset.x;
            t.y = e.clientY - svgRect.top - panY - dragOffset.y;
            render();
        }
    } else if (isPanning) {
        panX = e.clientX - panStart.x;
        panY = e.clientY - panStart.y;
        updateViewport();
    }
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

// click on node
nodesLayer.addEventListener('click', e => {
    const nodeG = e.target.closest('.graph-node');
    if (nodeG) {
        // find task by position
        const transform = nodeG.getAttribute('transform');
        const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (match) {
            const nx = parseFloat(match[1]);
            const ny = parseFloat(match[2]);
            const t = tasks.find(t => Math.abs(t.x - nodeWidth(t.name) / 2 - nx) < 2);
            if (t) selectNode(t.id);
        }
    }
});

svg.addEventListener('click', e => {
    if (e.target === svg || e.target.id === 'graph') {
        selected = null;
        linkSource = null;
        render();
    }
});

// Load sample data
function loadSample() {
    tasks = [
        {id: 't1', name: 'Design DB Schema', x: 120, y: 80, done: false, color: COLORS[0]},
        {id: 't2', name: 'Setup CI/CD', x: 120, y: 200, done: false, color: COLORS[1]},
        {id: 't3', name: 'Auth Service', x: 320, y: 80, done: false, color: COLORS[2]},
        {id: 't4', name: 'API Gateway', x: 320, y: 200, done: false, color: COLORS[3]},
        {id: 't5', name: 'Frontend App', x: 530, y: 140, done: false, color: COLORS[4]},
        {id: 't6', name: 'Integration Tests', x: 700, y: 140, done: false, color: COLORS[5]},
    ];
    deps = [
        {from: 't1', to: 't3'},
        {from: 't1', to: 't4'},
        {from: 't2', to: 't6'},
        {from: 't3', to: 't5'},
        {from: 't4', to: 't5'},
        {from: 't5', to: 't6'},
    ];
    nextId = 7; colorIdx = 6;
    panX = 60; panY = 60;
    updateViewport();
    render();
}

loadSample();
