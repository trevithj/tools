// import {TheStore} from "./store";

import {makeElement} from "../selectors";

function NumberCell(v, i) {
    const view = makeElement("div", "style=display:grid;grid-template-columns:2em 3em 2em;");
    const input = makeElement("input", "type=number", "min=1", "max=20", "step=1", `name=x${i+1}`);
    input.value = v;
    // input.setAttribute("style", "");
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
    view.append(btnDec, input, btnInc);
    return {
        view,
        subscribe: (type, fn) => input.addEventListener(type, () => fn(input.value))
    };
}

const controlView = document.querySelector("section#controls");

function render(state) {
    const {values, setValue} = state;
    const numbers = values.flatMap(NumberCell);
    console.log(numbers);
    controlView.replaceChildren(...numbers.map(n => n.view));
    numbers.forEach((n, i) => {
        n.subscribe("change", value => {
            setValue(i, value);
        });
    });
}

export function initControls(TheStore) {
    render(TheStore.getState());
    TheStore.subscribe((state, oldState) => {
        // console.log(state);
        if (state.vCount === oldState.vCount) return;
        render(state);
    });
}

/*

<div class="rangeRow" data-index="0">
    <div class="cell index">x<sub>1</sub></div>
    <div class="cell value">1</div>
    <input name="x1" type="range" step="1" min="1" max="20" value="1" />
</div>

*/