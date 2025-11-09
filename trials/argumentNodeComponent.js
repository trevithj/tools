const BASE_HTML = `
  <style>
    :host {
      position: absolute;
      display: inline-block;
      background: #fff;
      border: 2px solid #555;
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      min-width: 120px;
      min-height: 40px;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
      user-select: none;
      cursor: move;
      font-family: sans-serif;
    }
    div[contenteditable] {
      outline: none;
      cursor: text;
    }
  </style>
  <div contenteditable="true"></div>
`;

class ArgumentNode extends HTMLElement {
    #x = 0;
    #y = 0;
    #dragging = false;
    #offsetX = 0;
    #offsetY = 0;

    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.innerHTML = BASE_HTML;

        this.box = shadow.querySelector("div");

        this.addEventListener("pointerdown", this.#onPointerDown.bind(this));
        window.addEventListener("pointermove", this.#onPointerMove.bind(this));
        window.addEventListener("pointerup", this.#onPointerUp.bind(this));
    }

    get position() {
        const rect = this.getBoundingClientRect();
        const parentRect = this.parentElement.getBoundingClientRect();
        return {
            x: rect.left - parentRect.left + rect.width / 2,
            y: rect.top - parentRect.top + rect.height / 2
        };
    }

    connectedCallback() {
        this.style.left = this.getAttribute("x") || "0px"
        this.style.top = this.getAttribute("y") || "0px";
        this.box.textContent = this.getAttribute("text") || "Argument";
    }

    #onPointerDown(e) {
        if (e.target !== this.box) {
            this.#dragging = true;
            const rect = this.getBoundingClientRect();
            this.#offsetX = e.clientX - rect.left;
            this.#offsetY = e.clientY - rect.top;
            this.setPointerCapture(e.pointerId);
        }
    }

    #onPointerMove(e) {
        if (!this.#dragging) return;
        const newX = Math.round(e.clientX - this.#offsetX);
        const newY = Math.round(e.clientY - this.#offsetY);
        if (newX === this.#x && newY === this.#y) return;
        this.#x = newX;
        this.#y = newY;
        this.style.left = newX + "px";
        this.style.top = newY + "px";
        this.dispatchEvent(new CustomEvent("node-moved", {
            bubbles: true,
            composed: true,
            detail: {id: this.id, x: this.#x, y: this.#y}
        }));
    }

    #onPointerUp(e) {
        this.#dragging = false;
        this.releasePointerCapture(e.pointerId);
    }
}

customElements.define("argument-node", ArgumentNode);
