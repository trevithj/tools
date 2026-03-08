// Barycentric sort: sort `group` by average Y of neighbours in `otherYMap`
function barySort(group, otherYMap, neighbours) {
    return [...group].sort((a, b) => {
        const bary = node => {
            const nbrs = neighbours[node.id].filter(id => id in otherYMap);
            if (!nbrs.length) return Infinity; // unconnected: push to bottom
            return nbrs.reduce((sum, id) => sum + otherYMap[id], 0) / nbrs.length;
        };
        return bary(a) - bary(b);
    });
}

// Assign Y given an ordered array and the available height
function getAssignY(PAD_TOP, PAD_BOT, MIN_VERT_GAP) {
    return (ordered, height) => {
        const offsetHeight = height - PAD_TOP - PAD_BOT;
        const n = ordered.length;
        const span = Math.max(offsetHeight, n * MIN_VERT_GAP);
        const gap = n > 1 ? span / (n - 1) : 0;
        const startY = PAD_TOP + (n === 1 ? (offsetHeight) / 2 : 0);
        const yMap = {};
        ordered.forEach((node, i) => {yMap[node.id] = startY + i * gap;});
        return yMap;
    };
}
/**
 * Assign columns — text nodes go in column 0, gate nodes in column 1. X positions are fixed constants.
 * Order within each column to minimise crossings — use a barycentric heuristic (standard in layered graph drawing, e.g. Sugiyama framework). For each node, compute its barycenter: the average vertical position of all its neighbours in the other column. Sort each column by that score. Since the two columns depend on each other, iterate this a few times (typically 3–5 passes converges well).
 * Assign Y positions — evenly distribute nodes within the column height with some top/bottom padding.
 * @param {*} col1Nodes Nodes in first set of graph, assume with x,y properties.
 * @param {*} col2Nodes Nodes in second set of graph, as above.
 * @param {*} edges Links fronm set1 to set2 and vv.
 * @param {*} viewWidth pixels
 * @param {*} viewHeight pixels
 * @returns array of all nodes with updated x,y values.
 */
export function bipartiteAutoLayout(col1Nodes, col2Nodes, edges, viewWidth, viewHeight) {
    const COL_X = {text: viewWidth * 0.3, gate: viewWidth * 0.7};
    const assignY = getAssignY(60, 60, 55);
    const PASSES = 5;
    const nodes = [...col1Nodes, ...col2Nodes];
    // Build adjacency: for each node, list neighbour ids (undirected for barycentre)
    const neighbours = {};
    nodes.forEach(n => neighbours[n.id] = []);
    edges.forEach(e => {
        if (neighbours[e.from]) neighbours[e.from].push(e.to);
        if (neighbours[e.to]) neighbours[e.to].push(e.from);
    });

    // Initialise Y positions by current order (preserve relative order on first run)
    const sortKey = arr =>
        [...arr].sort((a, b) => a.y - b.y);

    let textOrder = sortKey(col1Nodes);
    let gateOrder = sortKey(col2Nodes);

    // Iterate
    for (let pass = 0; pass < PASSES; pass++) {
        const gateYMap = assignY(gateOrder, viewHeight);
        textOrder = barySort(textOrder, gateYMap, neighbours);

        const textYMap = assignY(textOrder, viewHeight);
        gateOrder = barySort(gateOrder, textYMap, neighbours);
    }

    // Build final Y maps
    const textYMap = assignY(textOrder, viewHeight);
    const gateYMap = assignY(gateOrder, viewHeight);

    // Return updated nodes (pure — original objects untouched)
    return nodes.map(n => ({
        ...n,
        x: COL_X[n.type],
        y: n.type === 'text' ? textYMap[n.id] : gateYMap[n.id]
    }));
}

export function topologicalLayout(nodes, edges, viewWidth, viewHeight) {
    if (!nodes.length) return;
    // Kahn's algorithm for topological layering (ignores cycles gracefully)
    const adj = {}, indegree = {};
    nodes.forEach(n => {adj[n.id] = []; indegree[n.id] = 0;});
    edges.forEach(e => {if (adj[e.from]) {adj[e.from].push(e.to); indegree[e.to]++;} });

    const levels = {};
    const q = nodes.filter(n => indegree[n.id] === 0).map(n => n.id);
    q.forEach(id => levels[id] = 0);
    let qi = 0;
    while (qi < q.length) {
        const cur = q[qi++];
        adj[cur].forEach(nxt => {
            levels[nxt] = Math.max(levels[nxt] || 0, (levels[cur] || 0) + 1);
            if (--indegree[nxt] === 0) q.push(nxt);
        });
    }
    nodes.forEach(n => {if (levels[n.id] === undefined) levels[n.id] = 0;});

    const maxLevel = Math.max(...Object.values(levels), 0);
    const groups = {};
    nodes.forEach(n => {
        const l = levels[n.id];
        (groups[l] = groups[l] || []).push(n.id);
    });

    const colW = Math.min(200, (viewWidth - 80) / (maxLevel + 1));
    Object.entries(groups).forEach(([lvl, ids]) => {
        const x = 80 + Number(lvl) * colW;
        const rowH = Math.min(90, (viewHeight - 60) / ids.length);
        ids.forEach((id, i) => {
            const n = nodes.find(n => n.id === id);
            n.x = x; n.y = 40 + i * rowH + rowH / 2;
        });
    });
}
