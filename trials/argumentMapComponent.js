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
</style>
<svg></svg>
<slot></slot>
`;

class ArgumentMap extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.innerHTML = BASE_HTML;
        this.svg = shadow.querySelector("svg");
        this.nodes = new Map();
        this.connections = [
            {from: "a1", to: "a2"},
            {from: "a1", to: "a3"}
        ];

        this.addEventListener("node-moved", (e) => this.updateLines());
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
        node.setAttribute("text", text);
        node.setAttribute("x", x);
        node.setAttribute("y", y);
        this.appendChild(node);
        // this.updateLines();
    }

    updateLines() {
        if (this.connections.length === 0) {
            return
        }
        this.svg.innerHTML = "";
        this.connections.forEach(conn => {
            const fromNode = this.querySelector(`#${conn.from}`);
            const toNode = this.querySelector(`#${conn.to}`);
            if (!fromNode || !toNode) return;
            const p1 = fromNode.position;
            const p2 = toNode.position;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "line");
            path.setAttribute("x1", p1.x);
            path.setAttribute("y1", p1.y);
            path.setAttribute("x2", p2.x);
            path.setAttribute("y2", p2.y);
            path.setAttribute("stroke", "#888");
            path.setAttribute("stroke-width", "2");
            this.svg.appendChild(path);
        });
    }
}

customElements.define("argument-map", ArgumentMap);