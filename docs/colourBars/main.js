import {extrapolateRGB, hex2RGB, RGB2Hex} from "./utils.js";

const controls = document.querySelector(".controls");
const barCountInput = controls.querySelector("input[name='bar-count']");

const updateCount = () => {
    controls.querySelector("span.count").innerText = barCountInput.value;
}
updateCount();
barCountInput.addEventListener("change", updateCount);

function renderBar(hex) {
    const style = `background: linear-gradient( to bottom, ${hex} 0%, ${hex} 100% );`;
    return `<div class="bar" style="${style}"></div>`;
    // return `<svg viewBox="0 0 100 10"><rect x="0" y="0" width="100" height="10" fill=${hex} /></svg>`;
    // return `<div class="bar">${img}</div>`;
}

function renderBar2(colrCodes) {
    const len = colrCodes.length;
    const percentInc = 100 / len;
    const gradientBars = colrCodes.map((hex, i) => {
        const percent1 = Math.round(10 * i * percentInc) / 10;
        const percent2 = Math.round(10 * (i+1) * percentInc) / 10;
        return `${hex} ${percent1}%,${hex} ${percent2}%`;
    });

    const backgroundStyle = `linear-gradient( to bottom, ${gradientBars.join(",")})`;
    const test = document.querySelector("div.color-bar");
    test.style.background = backgroundStyle;
    console.log(backgroundStyle);
}

const output = document.querySelector("div.output");
const startColrInput = controls.querySelector("input[name='start-colr']");
const endColrInput = controls.querySelector("input[name='end-colr']");

function renderOutput() {
    const barCount = barCountInput.value;
    const colr1 = startColrInput.value;
    const colr2 = endColrInput.value;

    const colrCodes = Array.from({ length: barCount}, (_, i) => {
        const factor = i / barCount;
        const rgb = extrapolateRGB(hex2RGB(colr1), hex2RGB(colr2), factor);
        return RGB2Hex(rgb);
    });
    const data = colrCodes.map((hex, i) => {
        return `<div>${i}</div><div>${hex}</div>${renderBar(hex)}`;
    });
    output.innerHTML = data.join("");
    renderBar2(colrCodes);
}
controls.querySelectorAll("input").forEach(el => el.addEventListener("change", renderOutput));

renderOutput();