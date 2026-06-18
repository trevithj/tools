export function setAttributes(el, attribs = {}) {
    for (const [k, v] of Object.entries(attribs)) el.setAttribute(k, v);
    return el;
}

export function makePolylinePoints(p1, p2) {
    //include an intermediate point for the marker.
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    return [p1.x, p1.y, mx, my, p2.x, p2.y].join(",");
}

export function makePathPoints(p1, p2, curvature = 0.2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Straight-line midpoint
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;

    // Perpendicular offset (clockwise, per earlier convention)
    const offsetX = -dy * curvature;
    const offsetY = dx * curvature;

    // Actual vertex at the midpoint of the curve
    const mid = {
        x: mx + offsetX,
        y: my + offsetY,
    };

    // Control points for each half, placed along the chord direction
    // from the midpoint, so the tangent is continuous at the joint.
    const c1 = {
        x: mid.x - dx * curvature,
        y: mid.y - dy * curvature,
    };
    const c2 = {
        x: mid.x + dx * curvature,
        y: mid.y + dy * curvature,
    };

    const d = `M ${p1.x},${p1.y} Q ${c1.x},${c1.y} ${mid.x},${mid.y} Q ${c2.x},${c2.y} ${p2.x},${p2.y}`;

    return d;
}

const attribs = {
    fill: "none", "stroke-width": 2, stroke: "#888", "marker-mid": "url(#arrowhead)"
}

// Each link should have properties that describe the ids of linked nodes.
export function makeLinkEl(link) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    setAttributes(line, attribs);
    line.__data = link;
    return line;
}

// export function makeLinkEl(link) {
//     const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
//     setAttributes(line, attribs);
//     line.__data = link;
//     return line;
// }

// Each link should have properties that describe the ids of linked nodes.
export function makeLinkEls(links = []) {
    const els = links.map(makeLinkEl);
    return Array.from(els);
}

// linkEls should be polyline elements with the custom .__data property.
// getNodes should return two node elements, each with the position attribute { x, y }.
// export function updateLinkLines(linkEls = [], getNodes) {
//     linkEls.forEach(el => {
//         const link = el.__data || {};
//         const [srcNode, tgtNode] = getNodes(link);
//         // const tgtNode = getNode(link.tgt);
//         if (!srcNode || !tgtNode) return;
//         const p1 = srcNode.position;
//         const p2 = tgtNode.position;
//         const points = makePolylinePoints(p1, p2);
//         el.setAttribute("points", points);
//     });
// }
export function updateLinkLines(linkEls = [], getNodes) {
    linkEls.forEach(el => {
        const link = el.__data || {};
        const [srcNode, tgtNode] = getNodes(link);
        // const tgtNode = getNode(link.tgt);
        if (!srcNode || !tgtNode) return;
        const p1 = srcNode.position;
        const p2 = tgtNode.position;
        // const points = makePolylinePoints(p1, p2);
        const d = makePathPoints(p1, p2);
        el.setAttribute("d", d);
    });
}
