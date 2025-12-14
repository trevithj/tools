function toArray(txt = "") {
    return txt.split("\n").flatMap(line => {
        line = line.trimEnd();
        return line.length === 0 ? [] : line;
    });
}

let index = 0;
// Sketch-format parser
export function stateParser(txt) {
    index = 0;
    let currentNode = null;
    const lines = toArray(txt);
    const nodeMap = {}; // map id -> node
    const nameMap = {}; // map name -> node
    const links = [];
    lines.forEach(line => {
        const {type, ...data} = parseLine(line);
        if (type === "node") {
            const node = processNode(data, nameMap);
            nodeMap[node.id] = node;
            nameMap[node.name] = node;
            currentNode = node;
        } else { // assume a link, re-process once all nodes are in.
            const {label, target} = data;
            const node = processNode({name: target.trim()}, nameMap);
            nodeMap[node.id] = node;
            nameMap[node.name] = node;
            links.push({src: currentNode.id, tgt: node.id, label});
        }
    })
    return {nodes: Object.values(nodeMap), links, nodeMap};
}

function parseLine(raw) {
    const indent = raw.search(/\S/);
    const name = raw.trim();
    const link = name.split("->").map(s => s.trim());
    if (link.length > 1) {
        const [label, target] = link;
        return {indent, type: "link", label, target};
    } // otherwise it is a node
    return {indent, type: "node", name};
}

function processNode(data, nameMap) {
    const existingNode = nameMap[data.name];
    if (existingNode) {
        return existingNode;
    }
    const id = `n${index++}`;
    const newNode = {...data, id};
    return newNode;
}

function updateStack(stack, node) {
    if (stack.length === 0 || node.indent === 0) {
        stack.push(node);
        return;
    }
    const peek = stack[stack.length - 1];
    if (node.indent > peek.indent) {
        stack.push(node);
    } else {
        stack.pop();
        updateStack(stack, node);
    }
}

function makeLink(stack, label) {
    const len = stack.length;
    const {id: src, indent: srcI} = stack[len - 2];
    const {id: tgt, indent: tgtI} = stack[len - 1];
    if (srcI > tgtI) return null;
    return label ? {src, tgt, label} : {src, tgt};
}

function checkNode(node) {
    const [part1, part2] = node.name.split("->");
    if (!part2) return [null, node];
    node.name = part2.trim();
    return [part1.trim(), node];
}

// Structure-format parser
export function structureParser(txt) {
    index = 0;
    const nodeStack = [];
    const lines = toArray(txt);
    const nodeMap = {}; // map id -> node
    const links = [];
    const nodes = [];
    lines.forEach(line => {
        const node = parseLineWithIndent(line);
        nodeMap[node.id] = node;
        nodes.push(node);
    })

    nodes.forEach((node, index) => {
        if (index === 0) {
            nodeStack.push(node);
            return;
        }
        // if (node.indent === 0) {
        //     throw new Error("Invalid format: must only have one parent node");
        // }
        const [label, checkedNode] = checkNode(node);
        updateStack(nodeStack, checkedNode);
        const link = makeLink(nodeStack, label);
        if (link) links.push(link);
    })

    return {nodes, links, nodeMap};
}

function parseLineWithIndent(raw) {
    const indent = raw.search(/\S/);
    let name = raw.trim();
    const id = `n${index++}`;
    return Object.freeze({
        id,
        indent,
        get name() {return name},
        set name(arg) {name = arg}
    });
}

export function stringify(parsed) {
    const {nodeMap, ...rest} = parsed;
    const value = [];
    Object.entries(rest).forEach(([k, v]) => {
        value.push(
            `"${k}":[`,
            v.map(val => "  " + JSON.stringify(val)).join(",\n"),
            "],"
        );
    })
    if (nodeMap) {
        value.push(
            '"nodeMap": {',
            Object.entries(nodeMap).map(([k, v]) => {
                return `  "${k}": ${JSON.stringify(v)}`;
            }).join(",\n"),
            "}"
        );
    }
    return value.join("\n");
}
