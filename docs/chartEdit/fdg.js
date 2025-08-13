const FDGDefaultOptions = {
    width: 800,
    height: 600,
    iterations: 600,
    linkDistance: 100,
    chargeStrength: -200,
    damping: 0.75,
    nodeRadius: 10
}

export function forceDirectedLayout(nodeMap, links, options = {}) {
    const opts = {...options, ...FDGDefaultOptions};
    const {width, height, damping, nodeRadius} = opts;
    // Random initial positions
    const nodes = Object.values(nodeMap);
    nodes.forEach(node => {
        node.x = Math.random() * (width - 2 * nodeRadius) + nodeRadius;
        node.y = Math.random() * (height - 2 * nodeRadius) + nodeRadius;
        node.vx = 0; // velocity x
        node.vy = 0; // velocity y
    });

    for (let iter = 0; iter < opts.iterations; iter++) {
        // REPULSION: Push nodes away from each other
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const distSq = dx * dx + dy * dy || 1;
                const force = opts.chargeStrength / distSq;

                const fx = force * dx;
                const fy = force * dy;

                nodes[i].vx -= fx;
                nodes[i].vy -= fy;
                nodes[j].vx += fx;
                nodes[j].vy += fy;
            }
        }

        // ATTRACTION: Pull connected nodes toward each other
        links.forEach(link => {
            const source = nodeMap[link.source];
            const target = nodeMap[link.target];
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const diff = dist - opts.linkDistance;
            const force = diff * 0.02; // spring stiffness

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
        });

        // UPDATE POSITIONS with damping + keep inside bounds
        nodes.forEach(node => {
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;

            // Clamp to boundaries
            node.x = Math.max(nodeRadius, Math.min(width - nodeRadius, node.x));
            node.y = Math.max(nodeRadius, Math.min(height - nodeRadius, node.y));
        });
    }

    // final rounding
    nodes.forEach(node => {
        delete node.vx;
        delete node.vy;
        node.x = node.x.toFixed(1); //Math.round(node.x);
        node.y = node.y.toFixed(1); //Math.round(node.y);
    });

    return nodes; // Nodes now have x, y positions inside the canvas
}

const arrowHeadDef = `<defs>
<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill="#888">
    <polygon points="0 0, 10 3.5, 0 7"/>
    </marker>
</defs>`;


export function generateSVG(nodes, links, nodeMap, {
    width = 800,
    height = 600,
    nodeRadius = 10,
    curveOffset = 30 // how far to offset curved edges
} = {}) {

    // Start SVG and define arrow marker
    const svgParts = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
        arrowHeadDef
    ];

    // Clamp node positions so circles don't get cut off
    nodes.forEach(node => {
        node.x = Math.max(nodeRadius, Math.min(width - nodeRadius, node.x));
        node.y = Math.max(nodeRadius, Math.min(height - nodeRadius, node.y));
    });

    // Helper: check if reverse link exists
    function hasReverseLink(a, b) {
        return links.some(l => l.source === b && l.target === a);
    }

    // Draw links
    links.forEach(link => {
        const s = nodeMap[link.source];
        const t = nodeMap[link.target];

        if (link.source === link.target) {
            // Self-loop
            let loopRadius = nodeRadius * 2;
            let startX = s.x + nodeRadius;
            let startY = s.y;
            let endX = s.x;
            let endY = s.y - nodeRadius;
            svgParts.push(
                `<path d="M ${startX} ${startY}
                  A ${loopRadius} ${loopRadius} 0 1 1 ${endX} ${endY}"
              fill="none" stroke="#888" stroke-width="2"
              marker-end="url(#arrowhead)"/>`
            );
        } else {
            let dx = t.x - s.x;
            let dy = t.y - s.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let normX = dx / dist;
            let normY = dy / dist;

            // Shorten so arrow doesn't overlap nodes
            let startX = s.x + normX * nodeRadius;
            let startY = s.y + normY * nodeRadius;
            let endX = t.x - normX * nodeRadius;
            let endY = t.y - normY * nodeRadius;

            if (hasReverseLink(link.source, link.target)) {
                // Curved link for bidirectional edge
                let midX = (startX + endX) / 2;
                let midY = (startY + endY) / 2;
                // Offset perpendicular to link direction
                let offsetX = -normY * curveOffset;
                let offsetY = normX * curveOffset;
                let controlX = midX + offsetX;
                let controlY = midY + offsetY;

                svgParts.push(
                    `<path d="M ${startX.toFixed(1)} ${startY.toFixed(1)}
                    Q ${controlX.toFixed(1)} ${controlY.toFixed(1)}
                      ${endX.toFixed(1)} ${endY.toFixed(1)}"
                fill="none" stroke="#888" stroke-width="2"
                marker-end="url(#arrowhead)"/>`
                );
            } else {
                // Straight link
                svgParts.push(
                    `<line x1="${startX}" y1="${startY}"  x2="${endX}" y2="${endY}"
                 stroke="#888" stroke-width="2" marker-end="url(#arrowhead)"/>`
                );
            }
        }
    });

    // Draw nodes with labels
    nodes.forEach((node, i) => {
        svgParts.push(
            `<circle cx="${node.x}" cy="${node.y}" r="${nodeRadius}"
               fill="orange" stroke="black" stroke-width="1"/>`
        );
        svgParts.push(
            `<text x="${(node.x + nodeRadius + 2)}" y="${(node.y + 4)}"
             font-size="12" font-family="sans-serif">${node.id ?? i}</text>`
        );
    });

    svgParts.push(`</svg>`);

    return svgParts.join("\n");
}
