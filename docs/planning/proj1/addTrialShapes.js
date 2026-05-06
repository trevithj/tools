const NS = 'http://www.w3.org/2000/svg';

export function makeEl(ns, tag, attrs) {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

export function makeShapes(width, height) {
    const cx = width / 2;
    const cy = height / 2;

    // ── Placeholder shapes ───────────────────────────────────────────────
    return [
        // Central circle
        makeEl(NS, 'circle', {cx, cy, r: 40, fill: '#3b82f6'}),
        // Four corner squares
        makeEl(NS, 'rect', {x: 20, y: 20, width: 50, height: 50, fill: '#f59e0b', rx: 6}),
        makeEl(NS, 'rect', {x: width - 70, y: 20, width: 50, height: 50, fill: '#10b981', rx: 6}),
        makeEl(NS, 'rect', {x: 20, y: height - 70, width: 50, height: 50, fill: '#ef4444', rx: 6}),
        makeEl(NS, 'rect', {x: width - 70, y: height - 70, width: 50, height: 50, fill: '#8b5cf6', rx: 6}),
        // Cross-hairs
        makeEl(NS, 'line', {x1: cx, y1: cy - 55, x2: cx, y2: cy + 55, stroke: '#1e293b', 'stroke-width': 2}),
        makeEl(NS, 'line', {x1: cx - 55, y1: cy, x2: cx + 55, y2: cy, stroke: '#1e293b', 'stroke-width': 2}),
    ];
}
