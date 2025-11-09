// Creates a <svg:g> element containing a horizontal scale display
// Usage: for adding within an existing <svg> doc.
import {ComponentBase, makeLine, makeText} from "./componentBase";
import {strToNumberArray} from "./convert";

function parseRange(range) {
    if (!range) return [0, 1];
    const [min, max] = strToNumberArray(range);
    return [isNaN(min) ? 0 : min, isNaN(max) ? 1 : max];
}

function makeTickValues(ticks, min, max) {
    const tickValues = [];
    for (let i = 0; i <= ticks; i++) {
        const val = min + (i * (max - min)) / ticks;
        tickValues.push(val);
    }
    return ticks;
}

const scaleStyle = `
<style>
    :host { display: contents; } /* allow <g> to render directly */
    text { font-family: sans-serif; fill: black; }
</style>`;

class ScaleGroup extends ComponentBase {
    static observedAttributes = ["range", "ticks", "y", "width"];

    render() {
        const [min, max] = parseRange(this.getAttribute("range"));
        const ticks = this.getIntAttribute("ticks", 5);
        const y = this.getFloatAttribute("y", 80);
        const width = this.getIntAttribute("width", 400);

        const labelOffset = 12;
        const padding = 30;
        const scale = x => padding + ((x - min) / (max - min)) * (width - 2 * padding);

        const tickValues = makeTickValues(ticks, min, max);
        const tickMarks = tickValues.map(val => {
            const x = scale(val);
            return makeLine(x, x, y - 5, y + 5) + makeText(x, y + labelOffset, val.toFixed(1));
        }).join("");

        this.shadowRoot.innerHTML = scaleStyle
            + '<g class="scale">'
            + makeLine(scale(min), scale(max), y, y)
            + tickMarks
            + '</g>';
    }
}

customElements.define("scale-group", ScaleGroup);
