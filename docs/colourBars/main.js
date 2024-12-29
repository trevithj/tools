import {extrapolateRGB, hex2RGB, RGB2Hex} from "./utils.js";

const controls = document.querySelector(".controls");
const barCountInput = controls.querySelector("input[name='bar-count']");

const updateCount = () => {
    controls.querySelector("span.count").innerText = barCountInput.value;
}
updateCount();
barCountInput.addEventListener("change", updateCount);

function renderBar(hex) {
    return `<div class="bar" style="background-color: ${hex};"></div>`;
    // return `<svg viewBox="0 0 100 10"><rect x="0" y="0" width="100" height="10" fill=${hex} /></svg>`;
    // return `<div class="bar">${img}</div>`;
}

const output = document.querySelector("div.output");
const startColrInput = controls.querySelector("input[name='start-colr']");
const endColrInput = controls.querySelector("input[name='end-colr']");

function renderOutput() {
    const barCount = barCountInput.value;
    const colr1 = startColrInput.value;
    const colr2 = endColrInput.value;

    const data = Array.from({ length: barCount}, (_, i) => {
        const factor = i / barCount;
        const rgb = extrapolateRGB(hex2RGB(colr1), hex2RGB(colr2), factor);
        const hex = RGB2Hex(rgb);
        return `<div>${i}</div><div>${hex}</div>${renderBar(hex)}`;
    });
    output.innerHTML = data.join("");
}
controls.querySelectorAll("input").forEach(el => el.addEventListener("change", renderOutput));

renderOutput();