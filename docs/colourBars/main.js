import {extrapolateColrCodes} from "./utils.js";

const controls = document.querySelector(".controls");
const barCountInput = controls.querySelector("input[name='bar-count']");

const updateCount = () => {
    controls.querySelector("span.count").innerText = barCountInput.value;
}
updateCount();
barCountInput.addEventListener("input", updateCount);

function renderBar(hex) {
    const style = `background-color: ${hex};`;
    return `<div class="bar" style="${style}"></div>`;
}

const output = document.querySelector("div.output");
const startColrInput = controls.querySelector("input[name='start-colr']");
const endColrInput = controls.querySelector("input[name='end-colr']");

function renderOutput() {
    const barCount = barCountInput.value;
    const colr1 = startColrInput.value;
    const colr2 = endColrInput.value;

    const colrCodes = extrapolateColrCodes(colr1, colr2, barCount);
    const data = colrCodes.map((hex, i) => {
        return `<div>${i}</div><div>${hex}</div>${renderBar(hex)}`;
    });
    output.innerHTML = data.join("");
}
controls.querySelectorAll("input").forEach(el => el.addEventListener("input", renderOutput));

renderOutput();