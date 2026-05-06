import {measureTextWidth} from "./measureText";

function svgEl(tag, attribs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attribs)) el.setAttribute(k, v);
    return el;
}

const LINE_HEIGHT = 20;
const padX = 8;
const padY = 8;
const minHght = LINE_HEIGHT + padY * 2;
const FONT = 'normal 16px Ariel, sans-serif';

function textSize(lines = []) {
    // const longestChars = Math.max(...lines.map(l => l.length));
    const longestLine = lines.reduce((longest, line) => {
        return longest.length > line.length ? longest : line;
    }, "");
    const w = measureTextWidth(longestLine, FONT) + padX * 2;
    const h = Math.max(minHght, lines.length * LINE_HEIGHT + padY * 2);
    return {w, h};
}


function makeMultilineText(lines, x, y) {
    // Multi-line label
    const textEl = svgEl('text', {class: "node-label", style: "font:" + FONT});
    textEl.setAttribute('pointer-events', 'none');
    // const totalTH = lines.length * LINE_HEIGHT;
    // const startY = y - totalTH / 2 + LINE_HEIGHT / 2 + 1;
    lines.forEach((line, i) => {
        const dy = i * LINE_HEIGHT + (0.5 * LINE_HEIGHT);
        const tspan = svgEl('tspan', {x: x + padX, y: y + padY, dy});
        tspan.textContent = line;
        textEl.appendChild(tspan);
    });
    return textEl;
}

export function makeNode(nodeData) {
    const {lines, x, y} = nodeData;
    const type = nodeData.type.replaceAll(" ", "_");
    const typeClass = `node-${type}-group`;
    //todo: use style instead, so allow for external CSS variables to be used based on type.
    // `var(--node-${type}-color-bg, #ffeeff)`
    const g = svgEl('g', {class: typeClass});

    const {w, h} = textSize(lines, LINE_HEIGHT);
    const rectX = x - w / 2;
    const rectY = y - h / 2;
    const rectClass = `${type}-rect`;
    const rectStyle = `fill: var(--node-${type}-color-bg, silver); stroke: var(--node-${type}-color-fg, black);`;

    const rect = svgEl('rect', {
        class: rectClass, style: rectStyle,
        x: rectX, y: rectY, width: w, height: h, rx:8, ry:8
    });
    
    // Multi-line label
    const textEl = makeMultilineText(lines, rectX, rectY);
    textEl.style.fill = `var(--node-${type}-color-fg, blue)`;
    // textEl.style.stroke = `var(--node-${type}-color-fg, blue)`;

    g.appendChild(rect);
    g.appendChild(textEl);
    g.__data = {...nodeData, rx: rectX, ry: rectY, w, h};
    return g;
}
