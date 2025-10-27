import {strToArray} from "./convert";

function makeCircle(cx, cy, r=3, fill="black") {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`;
}
function makeLine(x1, x2, y1, y2) {
    return `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke="black" />`;
}

function makeRect(x,y,width,height, fill = "lightGrey") {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="black" />`;
}

function getRenderFn(element) {
    const parseListAttribute = (name) => {
        const attr = element.getAttribute(name);
        if (!attr) return [];
        return strToArray(attr);
    }

    const render = () => {
        const data = parseListAttribute("data");   // [min, q1, median, q3, max]
        const points = parseListAttribute("points");
        const range = parseListAttribute("range");
        const [xMin, xMax] = range.length === 2 ? range : [Math.min(...data, ...points), Math.max(...data, ...points)];

        const fill = element.getAttribute("fill") || "lightgray";
        const width = 400;
        const height = 80;
        const padding = 30;
        const boxHeight = 20;
        const midY = height / 2;

        const scale = x => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);

        const [min, q1, median, q3, max] = data;

        const boxX1 = scale(q1);
        const boxX2 = scale(q3);
        const medianX = scale(median);
        const minX = scale(min);
        const maxX = scale(max);

        const pointsSVG = points.map(p => makeCircle(
            scale(p), midY, 2.5, "blue"
        )).join("");

        let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%">`;
        // <!-- Whiskers -->
        svg += makeLine(minX, q1 ? boxX1 : minX, midY, midY);
        svg += makeLine(q3 ? boxX2 : maxX, maxX, midY, midY);

        // <!-- Whisker ends -->
        svg += makeLine(minX, minX, midY - boxHeight / 2, midY + boxHeight / 2);
        svg += makeLine(maxX, maxX, midY - boxHeight / 2, midY + boxHeight / 2);

        // <!-- Box -->
        svg += makeRect(boxX1, midY - boxHeight / 2, boxX2 - boxX1, boxHeight, fill);

        // <!-- Median -->
        svg += makeLine(medianX, medianX, midY - boxHeight / 2, midY + boxHeight / 2);

        // <!-- Points -->
        svg += pointsSVG
        svg += "</svg>";

        element.shadowRoot.innerHTML = svg;
    }

    return render;
}

class BoxPlot extends HTMLElement {
    static get observedAttributes() {
        return ["points", "data", "range", "fill"];
    }

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.render = getRenderFn(this);
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

}

customElements.define("box-plot", BoxPlot);
