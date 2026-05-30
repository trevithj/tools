import {stateParser as parser, stringify} from "./chartEdit.js";
// import {forceDirectedLayout, generateSVG} from "./fdg.js";
import {linksToMatrix, toTheNthPower} from "./matrix.js";
// import { digraph2DotBipartite} from "./formatters.js";
import {svgEl, makeNodes} from "../_common/makeSvgNode.js";
import {bipartiteAutoLayout} from "../planning/graphLayout.js";

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
    0.3 -> Shares Steady
    0.4 -> Shares Go Down
`;
const input = document.querySelector(".the-input > textarea");
const display = document.querySelector(".the-display > textarea");
const chart = document.querySelector("base-svg");
const linkGroup = svgEl("g", {class: "link-group"});
const nodeGroup = svgEl("g", {class: "node-group"});
chart.append(linkGroup, nodeGroup);
const scaler = document.querySelector("range-slider");
scaler.addEventListener("input", evt => {
    const scale = parseFloat(evt.target.value) || 1;
    chart.zoom = scale;
})

input.value = window.localStorage.getItem("MARKOV_CHAIN") || SAMPLE_INPUT;

let parsed = {};

input.addEventListener("blur", evt => {
    parsed = parser(evt.target.value);
    window.localStorage.setItem("MARKOV_CHAIN", evt.target.value);
    console.log({parsed})
})

// Raw format
document.querySelector("button#b0").addEventListener("click", () => {
    display.value = stringify(parsed);
})

// Chart render
// document.querySelector("button#b1").addEventListener("click", () => {
//     const links = parsed.links.map(l => {
//         const { src:source, tgt:target } = l;
//         return { source, target };
//     });
//     display.value = JSON.stringify(links);

//     // const nodes = forceDirectedLayout(parsed.nodeMap, links);
//     // const svgHTML = generateSVG(nodes, links, parsed.nodeMap);
//     // document.querySelector("#chart").innerHTML = svgHTML;
// })

// Matrix
document.querySelector("button#b2").addEventListener("click", () => {
    const links = parsed.links.map(link => {
        const wgt = Number.parseFloat(link.label);
        return {...link, wgt};
    });
    const matrix = linksToMatrix(parsed.nodes, links);
    display.value = matrix.map(row => {
        return JSON.stringify(row);
    }).join("\n");
    //checkRows
})

// A^100
document.querySelector("button#b3").addEventListener("click", () => {
    const links = parsed.links.map(link => {
        const wgt = Number.parseFloat(link.label);
        return {...link, wgt};
    });
    const matrix = linksToMatrix(parsed.nodes, links);
    const m2 = toTheNthPower(matrix, 30);
    display.value = m2.map(row => {
        return JSON.stringify(row);
    }).join("\n");
    //checkRows
})

// Bi-graph and Render
document.querySelector("button#b4").addEventListener("click", () => {
    const stateNodes = parsed.nodes.map(n => {
        const {name, id} = n;
        return {lines: [name], id, type: "state", x: 0, y: 0};
    });
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
    const nodeEls = makeNodes(nodes);
    // display.value = stringify(nodes);
    nodeGroup.innerHTML = "";
    nodeEls.forEach(node => {
        nodeGroup.append(node);
    })
})

input.focus();
