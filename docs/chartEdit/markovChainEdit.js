import { stateParser as parser, stringify } from "./chartEdit.js";
import {forceDirectedLayout, generateSVG} from "./fdg.js";
import { digraph2DotBipartite} from "./formatters.js";
// Initial view.
const SAMPLE_INPUT = `Shares Go Up
    0.3 -> Shares Go Up
    0.5 -> Shares Steady
    0.2 -> Shares Go Down
Shares Steady
    0.5 -> Shares Go Up
    0.2 -> Shares Steady
    0.3 -> Shares Go Down
Shares Go Down
    0.3 -> Shares Go Up
    0.2 -> Shares Steady
    0.5 -> Shares Go Down
`;
const input = document.querySelector(".the-input > textarea");
const display = document.querySelector(".the-display > textarea");
input.value = window.localStorage.getItem("MARKOV_CHAIN") || SAMPLE_INPUT;

let parsed = {};

input.addEventListener("blur", evt => {
    parsed = parser(evt.target.value);
    window.localStorage.setItem("MARKOV_CHAIN", evt.target.value);
    console.log({ parsed })
})

// Raw format
document.querySelector("button#b0").addEventListener("click", () => {
    display.value = stringify(parsed);
})

// DOT format
document.querySelector("button#b1").addEventListener("click", () => {
    const links = parsed.links.map(l => {
        const { src:source, tgt:target } = l;
        return { source, target };
    });
    const nodes = forceDirectedLayout(parsed.nodeMap, links);
    display.value = JSON.stringify(nodes);
    const svgHTML = generateSVG(nodes, links, parsed.nodeMap);
    document.querySelector("#chart").innerHTML = svgHTML;
})

// DOT format, bipartite graph
document.querySelector("button#b2").addEventListener("click", () => {
    display.value = digraph2DotBipartite(parsed);
})

// Bi-graph systems format
document.querySelector("button#b3").addEventListener("click", () => {
    const {nodes, links} = parsed;
    if (!nodes) return;
    const output = {stateNodes: nodes};
    const linkSet = new Set();
    const txnNodes = Object.fromEntries(links.map(lnk => {
        const {src, tgt, label: name} = lnk;
        const id = `${name}_${tgt}`;
        linkSet.add(`${src}:${id}`);
        linkSet.add(`${id}:${tgt}`);
        return [id, {id, name}];
    }));
    output.txnNodes = Object.values(txnNodes);
    output.links = [...linkSet].map(line => {
        const [src, tgt] = line.split(":");
        return {src, tgt};
    });
    console.dir(output);
    // const stringified = {
    //     stateNodes: output.stateNodes.map(node => `${node.id}:${node.name}`),
    //     transNodes: output.txnNodes.map(node => `${node.id}:${node.name}`),
    //     links: output.links.map(link => `${link.src} --> ${link.tgt}`)
    // }
    // display.value = JSON.stringify(stringified, null, 3);
    display.value = stringify(output);
})

input.focus();
