const FDGDefaultOptions = {
    width: 800,
    height: 600,
    iterations: 600,
    linkDistance: 100,
    chargeStrength: -200,
    damping: 0.8,
}

export function forceDirectedLayout(nodeMap, links, options = {}) {
    const opts = {...options, ...FDGDefaultOptions };
    const { width, height, damping } = opts;
    // Random initial positions
    const nodes = Object.values(nodeMap);
    nodes.forEach(node => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
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

        // UPDATE POSITIONS with damping
        nodes.forEach(node => {
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx;
            node.y += node.vy;
        });
    }

    // final rounding
    nodes.forEach(node => {
        delete node.vx;
        delete node.vy;
        node.x = Math.round(node.x);
        node.y = Math.round(node.y);
    });

    return nodes; // Now each node has x, y coordinates
}

// Example usage:
// let nodes = [{id: 0}, {id: 1}, {id: 2}];
// let links = [{source: 0, target: 1}, {source: 1, target: 2}, {source: 2, target: 0}];

// let result = forceDirectedLayout(nodes, links);
// console.log(result); // each node now has x, y

export function generateSVG(nodes, links, nodeMap, {
  width = 800,
  height = 600,
  nodeRadius = 10
} = {}) {
  // Create SVG elements as strings
  // Start SVG tag
  const svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`];

  // Draw links first (behind nodes)
  links.forEach(link => {
    let s = nodeMap[link.source];
    let t = nodeMap[link.target];
    svgParts.push(
      `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#888" stroke-width="2"/>`
    );
  });

  // Draw nodes as circles
  nodes.forEach((node, i) => {
    svgParts.push(
      `<circle cx="${node.x}" cy="${node.y}" r="${nodeRadius}" fill="orange" stroke="black" stroke-width="1"/>`
    );
    // Optional: add labels
    svgParts.push(
      `<text x="${(node.x + nodeRadius + 2)}" y="${(node.y + 4)}" font-size="12" font-family="sans-serif">${node.id ?? i}</text>`
    );
  });

  // Close SVG tag
  svgParts.push(`</svg>`);

  return svgParts.join("\n");
}

// Example usage:
// let nodes = [{id:0}, {id:1}, {id:2}];
// let links = [{source:0, target:1}, {source:1, target:2}, {source:2, target:0}];

// // Layout the graph
// nodes = forceDirectedLayout(nodes, links);

// // Generate SVG string
// let svgCode = generateSVG(nodes, links);
// console.log(svgCode);
