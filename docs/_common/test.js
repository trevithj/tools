import * as SVG from "./makeSvgNode";
import {makeDragHandlers} from "./makeDragHandler";

const graph = {};
graph.nodes = [
    {id: "n0", type: "text", lines: "Bob's donuts are|fresher".split("|"), x: 175, y: 227},
    {id: "n1", type: "text", lines: "Fresh donuts|sell faster".split("|"), x: 277, y: 343},
    {id: "n2", type: "text", lines: "Faster-selling|donuts are|fresher".split("|"), x: 534, y: 133},
    {id: "n3", type: "text", lines: "Bob's donuts sell|faster".split("|"), x: 600, y: 236},
    {id: "n4", type: "gate", lines: ["AND"], x: 408, y: 287},
    {id: "n5", type: "gate", lines: ["AND"], x: 383, y: 169},
    {id: "n6", type: "text", lines: ["TEST"], x: 0, y: 0},
];
graph.edges = [
    {id: "e6", from: "n0", to: "n4"},
    {id: "e7", from: "n4", to: "n3"},
    {id: "e8", from: "n1", to: "n4"},
    {id: "e9", from: "n3", to: "n5"},
    {id: "e10", from: "n5", to: "n0"},
    {id: "e11", from: "n2", to: "n5"}
];

function renderBigraph(graph) {
    const view = document.querySelector("bi-graph");
    view.nodes = graph.nodes;
    view.edges = graph.edges;
}

function midWay(b1, b2) {
    const lengthX = (b2.cx - b1.cx) / 2;
    const lengthY = (b2.cy - b1.cy) / 2;
    return {cx: b1.cx + lengthX, cy: b1.cy + lengthY};
}

function getPoints(src, tgt) {
    if (!src || !tgt) return;
    const bs = src.box;
    const bt = tgt.box;
    const bm = midWay(bs, bt);
    return `${bs.cx},${bs.cy} ${bm.cx},${bm.cy} ${bt.cx},${bt.cy}`;
}

const makeEdge = nodes => e => {
    const src = nodes.find(n => n.id === e.from);
    const tgt = nodes.find(n => n.id === e.to);
    const points = getPoints(src, tgt);
    if (!points) return;
    const line = SVG.svgEl('polyline', {
        points, fill: "none"
    });
    line.style.stroke = "var(--edge-color, blue)";
    line.style.markerMid = "url(#arrowhead)";
    line.__data = {src, tgt};
    return line;
}

function updateEdge(e) {
    const {src, tgt} = e.__data;
    const points = getPoints(src, tgt);
    if (!points) return;
    e.setAttribute("points", points);
}
function updateNode(n) {
    const {box} = n.__data;
    const txfm = `translate(${box.x}, ${box.y})`;
    n.setAttribute("transform", txfm);
}

function getPanBy(el, edges) {
    const nodeData = el.__data;
    return (dx, dy) => {
        nodeData.box.cx += dx;
        nodeData.box.cy += dy;
        updateNode(el);
        edges.forEach(updateEdge);
    }
}

function renderBaseSVG(graph) {
    const view = document.querySelector("base-svg");
    const edgeGroup = SVG.svgEl("g");
    const nodeGroup = SVG.svgEl("g");
    const enhancedNodes = graph.nodes.map(SVG.prepareNode());
    const nodeElements = enhancedNodes.map(SVG.makeNode);
    nodeGroup.append(...nodeElements);
    const edgeElements = graph.edges.map(makeEdge(enhancedNodes));
    edgeGroup.append(...edgeElements);
    view.append(edgeGroup, nodeGroup);

    nodeElements.forEach(nodeEl => {
        const panBy = getPanBy(nodeEl, edgeElements)
        makeDragHandlers(nodeEl, panBy);       
    })
    
    const zoomBtns = document.querySelectorAll("button.zoom");
    zoomBtns[0].addEventListener("click", () => {
        view.zoom = view.zoom * 1.2;
    })
    zoomBtns[1].addEventListener("click", () => {
        view.zoom = view.zoom / 1.2;
    })
}

renderBigraph(graph);
renderBaseSVG(graph);
