import {makeLinkEls, setAttributes, updateLinkLines} from "../_common/makeSvgLink";

function makeConnections(linksString) {
    return linksString.split(",").map(substr => {
        const [src, tgt] = substr.split("->");
        return { src, tgt };
    });
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
    <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
    <path d="M0,1 L0,8 L8,4 z" fill="black"/>
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
        // this.nodes = new Map();
        this.connections = [
            {src: "a1", tgt: "a2"},
            {src: "a1", tgt: "a3"},
            {src: "a1", tgt: "a4"}
        ];

        this.addEventListener("node-moved", () => this.updateLines());
    }

    connectedCallback() {
        this.svg.style.width = this.getAttribute("width") || "100%";
        this.svg.style.height = this.getAttribute("height") || "100vh";
        const links = this.getAttribute("links") || "a1->a2,a1->a3,a1->a4";
        console.log(links); //todo convert to connections structure
        this.connections = makeConnections(links);

        // Add a few example nodes
        if (!this.children.length) {
            this.innerHTML = `
        <argument-node id="a1" text="Main Claim" x="300" y="0"></argument-node>
        <argument-node id="a2" text="Supporting Reason1" x="0" y="100"></argument-node>
        <argument-node id="a3" text="Opposing Reason1" x="300" y="100"></argument-node>
        <argument-node id="a4" text="Opposing Reason2" x="600" y="100"></argument-node>
      `;
        }
        this.linkEls = makeLinkEls(this.connections);
        this.linkEls.forEach(link => {
            this.view.appendChild(link);
        });

        requestAnimationFrame(() => this.updateLines());
    }

    addNode({text, x, y, className }) {
        const id = `node${Date.now()}`;
        const node = document.createElement("argument-node");
        node.id = id;
        setAttributes(node, {text, x, y, class:className });
        this.appendChild(node);
        // this.updateLines();
    }

    updateLines() {
        if (this.connections.length === 0) {
            return
        }
        const getNodes = link => {
            return [
                this.querySelector(`argument-node#${link.src}`),
                this.querySelector(`argument-node#${link.tgt}`)
            ];
        }
        updateLinkLines(this.linkEls, getNodes);
    }
}

customElements.define("argument-map", ArgumentMap);