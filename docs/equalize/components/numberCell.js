import {makeElement} from "../../selectors";

function makeView(i, v) {
    const view = makeElement("div", "style=display:grid;grid-template-columns:3em 2em 3em 2em;");
    const label = makeElement("span", "class=cell");
    label.innerHTML = `x<sub>${i + 1}</sub>:`;
    const input = makeElement("input", "type=number", "min=1", "max=20", "step=1", `name=x${i + 1}`);
    input.value = v;

    const btnInc = makeElement("button");
    btnInc.innerText = "+";
    btnInc.addEventListener("pointerdown", () => {
        input.value = Math.min(20, +input.value + 1);
        input.dispatchEvent(new Event('change', {bubbles: true}));
    });
    const btnDec = makeElement("button");
    btnDec.innerText = "-";
    btnDec.addEventListener("pointerdown", () => {
        input.value = Math.max(1, +input.value - 1);
        input.dispatchEvent(new Event('change', {bubbles: true}));
    });
    view.append(label, btnDec, input, btnInc);
    return view;
}

class NumberCell extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }
    
    connectedCallback() {
        const value = this.getAttribute('value') || 0;
        const index = this.getAttribute('index') || 0;
        const view = makeView(+index, +value);
        this.shadowRoot.appendChild(view);
    }
}

customElements.define('number-cell', NumberCell);

/*
function renderNumberInput(shadowRoot, value) {
  shadowRoot.innerHTML = ''; // Clear
  const input = document.createElement('input');
  input.type = 'number';
  input.value = value ?? '';
  shadowRoot.appendChild(input);
}

class NumberCell extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const value = this.getAttribute('value') || 0;
    renderNumberInput(this.shadowRoot, value);
  }
}



function NumberCell(v, i) {
    const view = makeElement("div", "style=display:grid;grid-template-columns:3em 2em 3em 2em;");
    const label = makeElement("span", "class=cell");
    label.innerHTML = `x<sub>${i+1}</sub>:`;
    const input = makeElement("input", "type=number", "min=1", "max=20", "step=1", `name=x${i+1}`);
    input.value = v;

    const btnInc = makeElement("button");
    btnInc.innerText = "+";
    btnInc.addEventListener("pointerdown", () => {
        input.value = Math.min(20, +input.value + 1);
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const btnDec = makeElement("button");
    btnDec.innerText = "-";
    btnDec.addEventListener("pointerdown", () => {
        input.value = Math.max(1, +input.value - 1);
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    view.append(label, btnDec, input, btnInc);
    return {
        view,
        subscribe: (type, fn) => input.addEventListener(type, () => fn(input.value))
    };
}

*/
