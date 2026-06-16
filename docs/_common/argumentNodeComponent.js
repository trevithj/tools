const BASE_HTML = `
  <style>
    :host {
      position: absolute;
      display: inline-block;
      background: var(--node-bg, #fff);
      color: var(--node-colour, #000);
      border: var(--node-border, 2px solid #555);
      border-radius: var(--node-radius, 0.5rem);
      padding: var(--node-padding, 0.5rem 0.75rem);
      min-width: var(--node-min-width, 5rem);
      max-width: var(--node-max-width, 20rem);
      min-height: var(--node-min-height, 1rem);
      box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
      user-select: none;
      cursor: move;
      font-family: var(--node-font, sans-serif);
    }
    div[contenteditable] {
      outline: none;
      cursor: text;
    }
  </style>
  <div></div>
`;

export class ArgumentNode extends HTMLElement {
    #x = 0;
    #y = 0;
    #dragging = false;
    #initX = 0;
    #initY = 0;

    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.innerHTML = BASE_HTML;

        this.box = shadow.querySelector("div");

        this.addEventListener("pointerdown", this.#onPointerDown.bind(this));
        window.addEventListener("pointermove", this.#onPointerMove.bind(this));
        window.addEventListener("pointerup", this.#onPointerUp.bind(this));
    }

    setPosition(x, y) {
        this.style.left = x + "px";
        this.style.top = y + "px";
        this.#x = x;
        this.#y = y;
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
        const x = Number(this.getAttribute("x") || "0");
        const y = Number(this.getAttribute("y") || "0");
        this.setPosition(x, y);
        this.box.textContent = this.getAttribute("text") || "Argument";
        this.parentRect = this.parentElement.getBoundingClientRect();
        this.rect = this.getBoundingClientRect();
    }

    #onPointerDown(e) {
        if (e.target !== this.box) {
            this.#dragging = true;
            this.#initX = e.clientX;
            this.#initY = e.clientY;
            this.setPointerCapture(e.pointerId);
            // this.parentRect = this.parentElement.getBoundingClientRect();
            // console.log(this.rect, this.parentRect, e.clientY);
        }
    }

    #onPointerMove(e) {
        if (!this.#dragging) return;
        // const newX = Math.round(e.clientX - this.#initX);
        // const newY = Math.round(e.clientY - this.#initY);
        const newX = (e.clientX - this.#initX) + this.#x;
        const newY = (e.clientY - this.#initY) + this.#y;
        if (newX === this.#x && newY === this.#y) return;
        this.setPosition(newX, newY);

        this.#initX = e.clientX;
        this.#initY = e.clientY;

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

export default "argument-node";
