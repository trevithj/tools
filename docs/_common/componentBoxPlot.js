import {strToNumberArray} from "./convert";
import { ComponentBase, makeCircle, makeLine, makeRect } from "./componentBase";

function getRenderFn(element) {
    const parseListAttribute = (name) => {
        const attr = element.getAttribute(name);
        if (!attr) return [];
        return strToNumberArray(attr);
    }

    const render = () => {
        const data = parseListAttribute("data");   // [min, q1, median, q3, max]
        const points = parseListAttribute("points");
        const range = parseListAttribute("range");
        const [xMin, xMax] = range.length === 2 ? range : [Math.min(...data, ...points), Math.max(...data, ...points)];

        const fill = element.getAttribute("fill") || "lightgray";
        const width = 400;
        const height = 50;
        const padding = 5;
        const boxHeight = 20;
        const midY = height / 2;

        const scale = x => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);

        const [min, q1, median, q3, max] = data;

        const boxX1 = scale(q1);
        const boxX2 = scale(q3);
        const medianX = scale(median);
        const minX = scale(min);
        const maxX = scale(max);

        const pointsSVG = points.map(p => makeCircle(scale(p), midY, 2.5, "blue")).join("");

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

class BoxPlot extends ComponentBase {
    static observedAttributes = ["points", "data", "range", "fill"];

    constructor() {
        super();
        this.render = getRenderFn(this);
    }

 }

customElements.define("box-plot", BoxPlot);
