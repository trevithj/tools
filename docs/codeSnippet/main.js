console.log("TODO");

const STYLE = `<style>
.const { color: var(--const, red); }
.value { color: var(--value, red); }
.name { color: var(--name, red); }
.keyword { color: var(--keyword, red); }
</style>`

class Const extends HTMLElement {
    static  observedAttributes = ['name'];

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        const name = this.getAttribute("name");
        this.shadowRoot.innerHTML = `${STYLE}<div class="line"><span class="const">const</span> <span class="name">${name}</span> = <span class="value"><slot></slot></span>;</div>`;
    }
}

customElements.define('c-const', Const);


class Fn extends HTMLElement {
    static  observedAttributes = ['name'];

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        const name = this.getAttribute("name");
        this.shadowRoot.innerHTML = `${STYLE}<div class="line"><span class="keyword">function</span> <span class="name">${name}</span>() {<br /><slot></slot><br />}</div>`;
    }
}

customElements.define('c-fn', Fn);