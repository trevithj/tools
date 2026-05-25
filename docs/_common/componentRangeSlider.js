/*

API:
range="0,100"
step="1"
label="Percent"
label-pos="left"
show-value

options: { labelPos: "n|s|w|e|nw|sw|ne|se" }

events: input, change

CSS vars:
*/

import {strToNumberArray} from "./convert";

const PosMap = {
    n: {row: 1, col: 2},
    s: {row: 3, col: 2},
    w: {row: 2, col: 1},
    e: {row: 2, col: 3},
}

const STYLE = `
<style>
:host {
    display: block;
    width: 100%;
    font-family: system-ui, -apple-system, sans-serif;
    box-sizing: border-box;
}
.label { font-size: 13px; font-weight: 500; color: #555; white-space: nowrap; }
.value { font-size: 13px; font-weight: 600; color: #222; white-space: nowrap; font-variant-numeric: tabular-nums; }
input[type=range] { flex: 1; width: 100%; margin: 0; }
.grid {
    display: grid;
    gap: 10px;
    grid-template-columns: auto 1fr auto;
}
.labelCell {
    grid-column: 2;
    grid-row: 3;
}
.inputCell {
    grid-column:2;
    grid-row:2
}
</style>`;

const HTML = `
<div class="grid">
    <div class="labelCell">
        <span class="label"></span>
        <span class="value"></span>
    </div>
    <div class="inputCell"></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
</div>`;

function makeEl(tag, attribs = {}) {
    const el = document.createElement(tag);
    return updateEl(el, attribs);
}

function updateEl(el, attribs = {}) {
    for (const [k, v] of Object.entries(attribs)) el.setAttribute(k, v);
    return el;
}


class RangeSlider extends HTMLElement {
    static get observedAttributes() {
        return ['range', 'step', 'label', 'label-pos', 'value', 'show-value', 'disabled'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.input = makeEl("input", {
            type: "range",
            part: "input",
            "aria-label": "Range slider",
        });
        this.shadowRoot.innerHTML = `${STYLE} ${HTML}`;
    }

    connectedCallback() {
        this.labelCell = this.shadowRoot.querySelector(".labelCell");
        this.valueEl = this.labelCell.querySelector(".value");

        this.shadowRoot.querySelector(".inputCell").appendChild(this.input);
        this._render();
    }

    attributeChangedCallback() {
        if (this.labelCell) this._update();
    }

    // ── Parsed attributes ──────────────────────────────────────────────────────

    get _range() {
        const raw = (this.getAttribute('range') || '0,100');
        const [min = 0, max = 100] = strToNumberArray(raw);
        return {min, max};
    }

    get _step() {return Number(this.getAttribute('step')) || 1;}
    get _label() {return this.getAttribute('label') || '';}
    get _labelPos() {return this.getAttribute('label-pos') || 'w';}
    get _showValue() {return this.hasAttribute('show-value');}
    get _disabled() {return this.hasAttribute('disabled');}

    get _value() {
        const {min, max} = this._range;
        const v = Number(this.getAttribute('value'));
        return isNaN(v) ? min : Math.min(max, Math.max(min, v));
    }

    set _value(v) {
        if (this._showValue) {
            this.valueEl.textContent = v;
        }
        this.input.setAttribute('aria-valuenow', v);
    }

    // ── Public API: forward addEventListener to the inner input ────────────────

    addEventListener(type, handler, options) {
        if (type === 'input' || type === 'change') {
            this.input.addEventListener(type, handler, options);
        } else {
            super.addEventListener(type, handler, options);
        }
    }

    removeEventListener(type, handler, options) {
        if (type === 'input' || type === 'change') {
            this.input.removeEventListener(type, handler, options);
        } else {
            super.removeEventListener(type, handler, options);
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    _render() {
        this._bindEvents();
        this._update();
    }

    // ── Internal events (keep value display in sync) ───────────────────────────

    _bindEvents() {
        const input = this.input;
        input.addEventListener('input', (e) => {
            this._value = e.target.value;
        });
    }

    _update() {
        const {min, max} = this._range;
        const value = this._value;
        const step = this._step;
        updateEl(this.input, {min, max, step, value});
        this._value = value;

        const pos = PosMap[this._labelPos] || PosMap.w;
        console.log(pos, this._labelPos);
        this.labelCell.style.gridColumn = pos.col;
        this.labelCell.style.gridRow = pos.row;

        this.labelCell.querySelector(".label").textContent = this._label;
    }
}

customElements.define('range-slider', RangeSlider);