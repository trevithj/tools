function setAttributes(el, attribs = {}) {
    for (const [k, v] of Object.entries(attribs)) el.setAttribute(k, v);
    return el;
}


function makePolylinePoints(p1, p2) {
    //include an intermediate point for the marker.
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    return [p1.x, p1.y, mx, my, p2.x, p2.y].join(",");
}

const BASE_HTML = `
<style>
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    svg {
      position: absolute;
      top: 0; left: 0;
      pointer-events: none;
    }
    .link {
        stroke-width: 2;
        marker-mid: url(#arrowhead);
    }
</style>
<svg>
<defs>
    <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
    <path d="M0,1 L0,11 L12,6 z" fill="black"/>
    </marker>
</defs>
<g id="theView"></g>
</svg>
<slot></slot>
`;

class ArgumentMap extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.innerHTML = BASE_HTML;
        this.svg = shadow.querySelector("svg");
        this.view = this.svg.querySelector("#theView");
        this.nodes = new Map();
        this.connections = [
            {from: "a1", to: "a2"},
            {from: "a1", to: "a3"}
        ];

        this.addEventListener("node-moved", () => this.updateLines());
    }

    connectedCallback() {
        this.svg.style.width = this.getAttribute("width") || "100%";
        this.svg.style.height = this.getAttribute("height") || "100vh";

        // Add a few example nodes
        if (!this.children.length) {
            this.innerHTML = `
        <argument-node id="a1" text="Main Claim" x="300" y="200"></argument-node>
        <argument-node id="a2" text="Supporting Reason" x="100" y="100"></argument-node>
        <argument-node id="a3" text="Opposing Reason" x="500" y="100"></argument-node>
      `;
        }
        requestAnimationFrame(() => this.updateLines());
    }

    addNode({text, x, y}) {
        const id = `node${Date.now()}`;
        const node = document.createElement("argument-node");
        node.id = id;
        setAttributes(node, {text, x, y });
        this.appendChild(node);
        // this.updateLines();
    }

    updateLines() {
        if (this.connections.length === 0) {
            return
        }
        this.view.innerHTML = "";
        this.connections.forEach(conn => {
            const fromNode = this.querySelector(`#${conn.from}`);
            const toNode = this.querySelector(`#${conn.to}`);
            if (!fromNode || !toNode) return;
            const p1 = fromNode.position;
            const p2 = toNode.position;
            const points = makePolylinePoints(p1, p2);
            const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            // setAttributes(line, {x1: p1.x, y1: p1.y, x2:p2.x, y2:p2.y, stroke:"#888"})
            setAttributes(line, {points, stroke:"#888"})
            line.setAttribute("stroke-width", "2");
            // line.setAttribute("class", "link");
            line.setAttribute("marker-mid", "url(#arrowhead)");//marker-mid: url(#arrowhead);
            this.view.appendChild(line);
        });
    }
}

customElements.define("argument-map", ArgumentMap);