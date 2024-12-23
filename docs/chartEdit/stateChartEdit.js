import { stateParser as parser, stringify } from "./chartEdit.js";
import {digraph2Dot, digraph2DotBipartite} from "./formatters.js";
// Initial view.
const SAMPLE_INPUT = `Green\n  tick -> Yellow\nYellow\n  tick -> Red\nRed\n  tick -> Green`;
const input = document.querySelector(".the-input > textarea");
const display = document.querySelector(".the-display > textarea");
input.value = window.localStorage.getItem("INPUT_STATE") || SAMPLE_INPUT;

let parsed = {};

input.addEventListener("blur", evt => {
    parsed = parser(evt.target.value);
    window.localStorage.setItem("INPUT_STATE", evt.target.value);
})

// Raw format
document.querySelector("button#b0").addEventListener("click", evt => {
    display.value = stringify(parsed);
})

// DOT format
document.querySelector("button#b1").addEventListener("click", () => {
    display.value = digraph2Dot(parsed);
})

// DOT format, bipartite graph
document.querySelector("button#b2").addEventListener("click", () => {
    display.value = digraph2DotBipartite(parsed);
})

// Bi-graph systems format
document.querySelector("button#b3").addEventListener("click", evt => {
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
