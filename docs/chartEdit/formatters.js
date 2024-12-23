export function sketchFormat(parsed) {
    const output = [];
    const {nodes, links, nodeMap} = parsed;
    if (!nodes) return;
    nodes.forEach(node => {
        const {id, name} = node;
        output.push(name);
        const fedbys = links.filter(link => link.src === id);
        fedbys.forEach(link => {
            const tgt = nodeMap[link.tgt];
            output.push(`  ${link.label || "feeds"} -> ${tgt.name}`);
        });
    })
    return output.join("\n");
}

export function digraph2Dot(parsed) {
    const {nodes, links} = parsed;
    if (!nodes) return;
    const output = ["digraph {",
        "  node [shape=box]",
        ...nodes.map(n => `  ${n.id} [label="${n.name}"]`),
        ...links.map(l => `  ${l.src} -> ${l.tgt}`),
        "}"
    ];
    return output.join("\n");
}


export function digraph2DotBipartite(parsed, defaultVerb = "feeds") {
    const {nodes, links} = parsed;
    if (!nodes) return;
    const makeLabel = l => `"${l.label || defaultVerb}" ${l.label ? "fontcolor=blue" : ""}`;
    const output = ["digraph {",
        "  node [color=blue shape=box fontsize=20]",
        ...nodes.map(n => `  ${n.id} [label="${n.name}"]`),
        '  node [color="#A0A0A0" shape=oval fontsize=10]',
        ...links.map(l => `  ${l.src}_${l.tgt} [label=${makeLabel(l)}]`),
        ...links.map(l => `  ${l.src} -> ${l.src}_${l.tgt}`),
        ...links.map(l => `  ${l.src}_${l.tgt} -> ${l.tgt}`),
        "}"
    ];
    return output.join("\n");
}