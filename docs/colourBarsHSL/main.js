import {makeSlider} from "./barSlider.js";
import {makePicker} from "./colrPicker.js";
import {extrapolateHueCodes} from "./utils.js";

const data = {
    barCount: 16,
    startColr: 0,
    endColr: 0,
};

function renderOutput() {
    const barCount = data.barCount || 0;
    const colr1 = data.startColr || 0;
    const colr2 = data.endColr || 0;

    const hueCodes = extrapolateHueCodes(colr1, colr2, barCount);
    const html = hueCodes.map((hue, i) => {
        return `<div>${i}</div><div>${hue}deg</div>${renderBar(hue)}`;
    });
    output.innerHTML = html.join("");
}

const inputListener = (name, value) => {
    data[name] = value;
    renderOutput();
}

function renderBar(hue) {
    const style = `background-color: hsl(${hue}, 100%, 50%);`;
    return `<div class="bar" style="${style}"></div>`;
}
const output = document.querySelector("div.output");

const controls = document.querySelector(".controls");

const barCountInput = makeSlider('barCount', "Number of Bars:", inputListener);
const startColrInput = makePicker('startColr', "Start Colour:", inputListener);
const endColrInput = makePicker('endColr', "End Colour:", inputListener);

controls.appendChild(barCountInput);
controls.appendChild(startColrInput);
controls.appendChild(endColrInput);

// controls.querySelectorAll("input").forEach(el => el.addEventListener("input", renderOutput));

renderOutput();