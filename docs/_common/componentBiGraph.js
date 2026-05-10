import {ComponentBase, makeCircle, makeLine, makeRect} from "./componentBase.js";
import {makeNode, prepareNode, svgEl} from "./makeSvgNode.js";

function log(...args) {
    console.log(Date.now(), ...args);
}

// ── Constants ─────────────────────────────────────────────────────────────
const STATE_H     = 36;
const STATE_PAD_X = 20;
const TRANS_H     = 30;
const TRANS_PAD_X = 16;
const LINE_HEIGHT = 15;
const TEXT_PAD_Y  = 10;

const SVG = `<svg id="graph" style="width:100%; height:100%;">
<defs>
  <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
    <path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#3d5470"/>
  </marker>
  <marker id="arrowhead-hover" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
    <path d="M0,0.5 L0,6.5 L8,3.5 z" fill="#4fc3f7"/>
  </marker>
</defs>
<g id="viewport">
  <g id="edges-layer"></g>
  <g id="nodes-layer"></g>
  <path id="link-preview-path" class="link-preview-path" d="" style="display:none"/>
</g>
</svg>`;


// ── Rendering ─────────────────────────────────────────────────────────────

function nodeLines(node) {
  return Array.isArray(node.lines) ? node.lines : [node.lines];
}

function nodeSize(node) {
  const lines = nodeLines(node);
  const longestChars = Math.max(...lines.map(l => l.length));
  const padX = node.type === 'state' ? STATE_PAD_X : TRANS_PAD_X;
  const padY = TEXT_PAD_Y;
  const baseH = node.type === 'state' ? STATE_H : TRANS_H;
  const w = Math.max(90, longestChars * 7.2 + padX * 2);
  const h = Math.max(baseH, lines.length * LINE_HEIGHT + padY * 2);
  return { w, h };
}

/**
 * Returns the point on node n's boundary in the direction of (tx, ty).
 * Uses rect intersection for both node types.
 */
function boundaryPoint(n, tx, ty) {
  const dx = tx - n.x, dy = ty - n.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.001) return { x: n.x, y: n.y };
  const ux = dx / dist, uy = dy / dist;
  const { w, h } = nodeSize(n);
  const hw = w / 2, hh = h / 2;
  let t = Infinity;
  if (Math.abs(ux) > 1e-9) { const tc = (ux > 0 ? hw : -hw) / ux; if (tc > 0) t = Math.min(t, tc); }
  if (Math.abs(uy) > 1e-9) { const tc = (uy > 0 ? hh : -hh) / uy; if (tc > 0) t = Math.min(t, tc); }
  return { x: n.x + ux * t, y: n.y + uy * t };
}

// fill: none;
// stroke: var(--edge-color, blue);
// stroke-width: 1.5;
// marker-end: url(#arrowhead);
function addEdge(e, nodes, path) {
    const src = nodes.find(n => n.id === e.from);
    const tgt = nodes.find(n => n.id === e.to);
    if (!src || !tgt) return;

    // Use boundary points for clean connection regardless of angle
    const p1 = boundaryPoint(src, tgt.x, tgt.y);
    const p2 = boundaryPoint(tgt, src.x, src.y);

    // const dx = Math.abs(p2.x - p1.x) * 0.45;
    // const d = `M${p1.x},${p1.y} C${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`;
    // const d = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;

    const g = svgEl('g');
    const line = svgEl('line', {
        x1:Math.round(p1.x), x2: Math.round(p2.x),
        y1:Math.round(p1.y), y2: Math.round(p2.y),
    });
    line.style.stroke = "var(--edge-color, blue)";
    line.style.markerEnd = "url(#arrowhead)";

    g.appendChild(line);
    return g;
}



function getRenderFn(element) {
    log("getRenderFn");
    // ── DOM refs ──────────────────────────────────────────────────────────────
    const root = element.shadowRoot;
    const {svg, nodesLayer, edgesLayer} = element.state;
    // const parseListAttribute = (name) => {
    //     const attr = element.getAttribute(name);
    //     if (!attr) return [];
    //     return strToNumberArray(attr);
    // }

    const render = () => {
        // const svg = root.querySelector("svg");
        // const view = root.querySelector("#viewport");
        log("render", svg);
        element.edges.forEach(e => {
            const edgeGroup = addEdge(e, element.nodes);
            edgesLayer.appendChild(edgeGroup);
        });
        const prepare = prepareNode();
        element.nodes.forEach(n => {
            const nodeGroup = makeNode(prepare(n));
            nodesLayer.appendChild(nodeGroup);
        })
        // svg.setAttribute("viewbox", element.getAttribute("viewbox"));
    }

    return render;
}
/////////////////////////////////////
class BiGraph extends ComponentBase {
    static observedAttributes = ["viewbox"];
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "viewbox") this.state.svg.setAttribute("viewbox", newValue);
    }


    set nodes(value) {
        this.state.nodes = value;
        this.render();
    }
    set edges(value) {
        this.state.edges = value;
        this.render();
    }
    get nodes() {
        return this.state.nodes || [];
    }
    get edges() {
        return this.state.edges || [];
    }

    constructor() {
        super();
        this.shadowRoot.innerHTML = SVG;
        this.state = {};
        const root = this.shadowRoot;
        this.state.svg = root.getElementById('graph');
        this.state.viewport = root.getElementById('viewport');
        this.state.edgesLayer = root.getElementById('edges-layer');
        this.state.nodesLayer = root.getElementById('nodes-layer');
        this.state.linkPreviewPath = root.getElementById('link-preview-path');
        this.state.svg.setAttribute("viewbox", this.getAttribute("viewbox"));

        this.render = getRenderFn(this);
    }

    connectedCallback() {
        log("callback");
        Promise.resolve().then(this.render);
        // this.render();
    }

}

customElements.define("bi-graph", BiGraph);
/* Idea is to encapsulate all the UI/UX of displaying a bigraph as an SVG.
The component handles the following:
- moving of nodes
- drawing of connecting links

Design issues to figure out:
- how to pass the data. Stringified object? Programmatic setting of data value?
Recommendation is to use a setter pattern to receive any data type:
set data(value) {
    this._data = value;
}
- how to update. just redraw everything? Allow a node update fn to change text?
Similar idea: define a patch method that takes a partial data object and merges it into the internal state. It also allows only some of the SVG to be updated.

- how to style. Perhaps pass some style/size variables.
Use CSS var(--name, default) inside the component, referencing variables that can be defined externally to override the default.

*/