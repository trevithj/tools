const BASE_HTML = `
<style>
    :host {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      font-family: sans-serif;
    }
    button, input {
      font-size: 1rem;
      border-radius: 0.4rem;
    }
    button {
      border: none;
      padding: 0.6rem 1rem;
      cursor: pointer;
      background: #007bff;
      color: white;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
    }
    button:hover {
      background: #0056b3;
    }
    .panel {
      display: none;
      background: white;
      border: 1px solid #ccc;
      border-radius: 0.5rem;
      padding: 0.8rem;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.2);
      margin-top: 0.5rem;
    }
    .panel.visible {
      display: block;
    }
    .panel input {
      width: 200px;
      margin-right: 0.5rem;
      padding: 0.4rem;
    }
</style>

<button id="addBtn">+ Add Node</button>
<div class="panel">
    <input id="textInput" type="text" placeholder="Enter node text..." />
    <button id="createBtn">Create</button>
    <button id="cancelBtn" style="background:#888;">Cancel</button>
</div>
`;

class NodeCreator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        shadow.innerHTML = BASE_HTML;
        this.addBtn = shadow.querySelector("#addBtn");
        this.panel = shadow.querySelector(".panel");
        this.textInput = shadow.querySelector("#textInput");
        this.createBtn = shadow.querySelector("#createBtn");
        this.cancelBtn = shadow.querySelector("#cancelBtn");

        this.addBtn.addEventListener("click", () => this.togglePanel(true));
        this.cancelBtn.addEventListener("click", () => this.togglePanel(false));
        this.createBtn.addEventListener("click", () => this.#createNode());
        this.textInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.#createNode();
            if (e.key === "Escape") this.togglePanel(false);
        });
    }

    togglePanel(show) {
        if (show) {
            this.panel.classList.add("visible");
            this.textInput.focus();
        } else {
            this.panel.classList.remove("visible");
            this.textInput.value = "";
        }
    }

    #createNode() {
        const text = this.textInput.value.trim() || "New Argument";
        this.dispatchEvent(new CustomEvent("create-node", {
            bubbles: true, composed: true, detail: {
                text, x: Math.random() * 500 + 100, y: Math.random() * 300 + 100
            }
        }));
        this.togglePanel(false);
    }
}

customElements.define("node-creator", NodeCreator);
