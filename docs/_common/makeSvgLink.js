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
const attribs = {
    "stroke-width": 2, stroke: "#888", "marker-mid": "url(#arrowhead)"
}

// Each link should have properties that describe the ids of linked nodes.
export function makeLinkEls(links = []) {
    const els = links.map(link => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        setAttributes(line, attribs);
        line.__data = link;
        return line;
    });
    return Array.from(els);
}

// linkEls should be polyline elements with the custom .__data property.
// getNodes should return two node elements, each with the position attribute { x, y }.
export function updateLinkLines(linkEls = [], getNodes) {
    linkEls.forEach(el => {
        const link = el.__data || {};
        const [srcNode, tgtNode] = getNodes(link);
        // const tgtNode = getNode(link.tgt);
        if (!srcNode || !tgtNode) return;
        const p1 = srcNode.position;
        const p2 = tgtNode.position;
        const points = makePolylinePoints(p1, p2);
        el.setAttribute("points", points);
    });
}
