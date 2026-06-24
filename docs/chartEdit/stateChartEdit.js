import {stateParser as parser, stringify} from "./chartEdit.js";
import {digraph2Dot, digraph2DotBipartite} from "./formatters.js";
import {bipartiteAutoLayout} from "../planning/graphLayout.js";

// Initial view.
const SAMPLE_INPUT = `Green\n  tick -> Yellow\nYellow\n  tick -> Red\nRed\n  tick -> Green`;
const input = document.querySelector(".the-input > textarea");
const display = document.querySelector(".the-display > textarea");
const argMap = document.querySelector("argument-map");
input.value = window.localStorage.getItem("INPUT_STATE") || SAMPLE_INPUT;

function renderArgMap({nodes, links}) {
    argMap.clear();
    nodes.forEach(node => {
        const {lines, type, ...rest} = node;
        argMap.addNode({...rest, text: lines.join(" "), className: type});
    })
    links.forEach(link => {
        console.log(link);
        argMap.addLink(link.src, link.tgt);
    })
}

let parsed = {};

input.addEventListener("blur", evt => {
    parsed = parser(evt.target.value);
    window.localStorage.setItem("INPUT_STATE", evt.target.value);
})

// Raw format
document.querySelector("button#b0").addEventListener("click", () => {
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
document.querySelector("button#b3").addEventListener("click", () => {
    const stateNodes = parsed.nodes.map(n => {
        const {name, id} = n;
        return {lines: [name], id, type: "state", x: 0, y: 0};
    });
    if (!stateNodes) return;

    const txtnNodes = [];
    const links = [];
    let index = 0;
    parsed.links.forEach(link => {
        const {src, tgt, label} = link;
        const id = "t" + index++;
        const tNode = {id, lines: [label], type: 'txtn', x: 0, y: 0};
        txtnNodes.push(tNode);
        links.push({src, tgt: id});
        links.push({src: id, tgt});
    })

    const opts = {viewWidth: 600, viewHeight: 400, type1: "state", type2: "txtn"};
    const nodes = bipartiteAutoLayout(stateNodes, txtnNodes, links, opts);
    const net = {nodes, links};
    display.value = stringify(net);
    renderArgMap(net);
})

input.focus();
