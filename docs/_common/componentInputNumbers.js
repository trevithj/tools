import {strToNumberArray} from "./convert.js";

const BASE_HTML = `
<style>
    textarea {
        width: 100%;
        height: 4em;
        padding: 6px;
        font-size: 1em;
        font-family: monospace;
        box-sizing: border-box;
        resize: vertical;
    }
</style>
<textarea placeholder="Enter numbers..."></textarea>
`;

const emit = (that, type) => {
    const values = strToNumberArray(that.textarea.value);
    that.dispatchEvent(new CustomEvent(type, {
        bubbles: true, composed: true, detail: {values},
    }));
};


class InputNumbers extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = BASE_HTML;
    }

    connectedCallback() {
        this.textarea = this.shadowRoot.querySelector("textarea");
        // Event listeners
        this.textarea.addEventListener("input", () => emit(this, "input"));
        this.textarea.addEventListener("change", () => emit(this, "change"));
    }
}

customElements.define("input-numbers", InputNumbers);
