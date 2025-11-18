import {strToNumberArray} from "../_common/convert.js";

function parseListAttribute(attr, delim = ",") {
  if (!attr) return [];
  return attr.split(delim).map(v => v.trim());
}

function buildControlLines(valuesTxt, labelsTxt, coloursTxt) {
  const values = strToNumberArray(valuesTxt || "");
  const labels = parseListAttribute(labelsTxt);
  const colours = parseListAttribute(coloursTxt);

  const lines = values.map((value, i) => {
    const label = labels[i] || "";
    const color = colours[i] || colours[colours.length - 1] || "gray";
    return { value, label, color };
  })
  return lines;
}

const getXY = (x1, y1, x2, y2) => `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`;

const width = 800;
const height = 400;
const padding = 50;

function renderAxes(width, height, padding = 0) {
    // <!-- Axes -->
    const xyValues1 = getXY(padding, height - padding, width - padding, height - padding);
    let html = `<line ${xyValues1}" stroke="#000" />`;
    const xyValues2 = getXY(padding, padding, padding, height - padding);
    html += `<line ${xyValues2}" stroke="#000" />`;
    return html;
}

// const controlLines = this.controlLines;

const makeText = (x,y, fill, label) => `<text x="${x}" y="${y}"\
 fill="${fill}" font-size="12">${label}</text>`;

const controlLineSVG = yScale => controlLines => controlLines.map(line => {
    const y = yScale(line.value);
    const x2 = width - padding;
    const labelTxt = line.label ? makeText(x2 + 4, y + 4, line.color, line.label) : ""
    const valueTxt = makeText(padding + 2, y - 2, line.color, line.value);

    return `<line x1="${padding}" x2="${x2}"\
 y1="${y}" y2="${y}" stroke="${line.color}" stroke-dasharray="5,5" />\
 ${labelTxt} ${valueTxt}`}).join("");

const makeSvg = (width, height) =>`<svg viewBox="0 0 ${width} ${height}"\
 width="95%" style="background:white; border:1px solid #ccc; border-radius:8px;">`;

function renderSVG(component) {
    const values = strToNumberArray(component.getAttribute("points")); 
    const lineValues = component.getAttribute("lines") || ""; 
    const lineLabels = component.getAttribute("labels") || "";
    const lineColors = component.getAttribute("colors") || "";

    const controlLines = buildControlLines(lineValues, lineLabels, lineColors);

    const lineVals = controlLines.map(c => c.value);
    const minY = Math.min(...values, ...lineVals);
    const maxY = Math.max(...values, ...lineVals);
    const rangeY = maxY === minY ? 1 : maxY - minY;

    const xScale = (i) => padding + (i / (values.length - 1)) * (width - 2 * padding);
    const yScale = (v) => height - padding - ((v - minY) / rangeY) * (height - 2 * padding);

    const points = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");

    let html = makeSvg(width, height);
    // <!-- Axes -->
    html += renderAxes(width, height, padding);

    // <!-- Data line -->
    html += `<polyline points="${points}" fill="none" stroke="blue" stroke-width="2" />`;

    // <!-- Data points -->
    html += values.map((v, i) =>
        `<circle cx="${xScale(i)}" cy="${yScale(v)
        }" r="4" fill="blue"><title>Value = ${v}</title></circle>`
    ).join("");

    // <!-- Control lines -->
    html += controlLineSVG(yScale)(controlLines);
    html += '</svg>';
    return html;
}


/////////////////////////////////////
class SPCChart extends HTMLElement {
    // static observedAttributes = ["values", "percentiles", "sigmas", "center"];
    //values="1,2,3" percentiles="5,95" sigmas="-2,2,3" center="median"
    //values=1,2,3" lines="2,0.5" line-labels="lcl,ucl"

    // static observedAttributes = ["values", "type"];
    static observedAttributes = ["points", "lines", "labels", "colors"];

    connectedCallback() {
        // test
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.innerHTML = renderSVG(this);
        }
    }
}

 customElements.define("spc-chart", SPCChart);
