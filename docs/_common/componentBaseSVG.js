import { makeDragHandlers } from "./makeDragHandler.js";

function applyResize(comp) {
    const svg = comp.view;
    const {width, height} = comp.size;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
}

function applyTransform(comp) {
    const g = comp.pannable;
    const txfm = comp.transform || {};
    if (!g) return;
    const {x = 0, y = 0, scale = 1} = txfm;
    g.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
}

function transformAroundCenter(size, txfm, scale) {
    const {width, height} = size;
    // Centre of the visible element
    const cx = width / 2;
    const cy = height / 2;

    const oldScale = txfm.scale;
    const factor = scale / oldScale;

    const x = cx - (cx - txfm.x) * factor;
    const y = cy - (cy - txfm.y) * factor;
    return {x, y, scale};
}

const BASE_STYLE = `
<style>
:host {
    display: inline-block;
}
svg {
    display: block;
    width: 100%;
    height: 100%;
    background-color: var(--graph-bg, lightblue);
}
</style>`;

function makeHTML(width, height) {
    return `
      ${BASE_STYLE}
      <svg
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
            <path d="M0,1 L0,11 L12,6 z" fill="black"/>
          </marker>
        </defs>
        <g class="pannable" id="viewport"></g>
      </svg>
    `;
} // TODO: figure out how to control arrowhead color

class BaseSvg extends HTMLElement {
    #state = {
        scale: 1,
        elements: {},
        txfm: {x: 0, y: 0, scale: 1}
    };
    #setTransform(txfm = {}) {
        this.#state.txfm = {...this.#state.txfm, ...txfm};
        applyTransform(this);
    }

    static get observedAttributes() {
        return ['width', 'height'];
    }

    panTo(x, y) {
        this.#setTransform({x, y});
    }
    panBy = (dx, dy) => {
        const {x, y} = this.#state.txfm;
        this.#setTransform({x: x + dx, y: y + dy});
    }
    set zoom(scale) {
        this.#state.scale = scale;
        const txfm = transformAroundCenter(this.size, this.#state.txfm, scale);
        this.#setTransform(txfm);
    }
    get zoom() {
        return this.#state.scale;
    }
    get transform() {
        return this.#state.txfm;
    }
    get pannable() {
        return this.#state.elements.pannable;
    }
    get view() {
        return this.#state.elements.svg;
    }
    get size() {
        const width = Number.parseFloat(this.getAttribute("width")) || 300;
        const height = Number.parseFloat(this.getAttribute("height")) || 150;
        return {width, height};
    }

    // Pass responsibility to external code to control the content rendering
    append(...nodes) {
        return this.pannable.append(...nodes);
    }
    connectedCallback() {
        if (!this.shadowRoot) {
            const {width, height} = this.size;
            this.attachShadow({mode: 'open'});
            this.shadowRoot.innerHTML = makeHTML(width, height);
            this.#state.elements.svg = this.shadowRoot.querySelector("svg");
            makeDragHandlers(this.view, this.panBy);
        }

        this.#state.elements.svg = this.shadowRoot.querySelector("svg");
        this.#state.elements.pannable = this.shadowRoot.querySelector("g.pannable");
    }

    attributeChangedCallback(name) {
        Promise.resolve().then(() => {
            switch (name) {
                case "width":
                case "height":
                    return applyResize(this);
                default: return;
            }
        })
    }
}

customElements.define('base-svg', BaseSvg);