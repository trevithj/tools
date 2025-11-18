class Base extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    render() {
        this.shadowRoot.innerHTML = "Pending";
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }
}

// const inputStyle = `
// div.set0 { border: solid 3px #ddd; }
// div.set1 { border: solid 3px #dd9; }
// div.set2 { border: solid 3px #d9d; }
// div.set3 { border: solid 3px #d99; }
// div.set4 { border: solid 3px #9dd; }
// div.set5 { border: solid 3px #9d9; }
// div.set6 { border: solid 3px #99d; }
// div.set7 { border: solid 3px #999; }
// button.remove { font-size: 14pt; font-weight: 800; color:#d00; }
// input.label {
//     text-align: right;
//     width: 7rem;
//     font-weight: bold;
//     line-height: 2rem;
//     padding-right: 1rem;
//     border: solid thin silver;
// }
// input.data {
//     width: calc(100% - 11rem);
//     line-height: 2rem;
//     border: none;
// }
// `;
// class DataInput extends Base {
//     static observedAttributes = ["row", "value", "label"];

//     render() {
//         const i = +this.getAttribute("row") || "0";
//         const className = `set${i % 8}`;
//         const defaultLabel = `Set ${i + 1}`;
//         const value = this.getAttribute("value") || "1 2 3 4 5";
//         const label = this.getAttribute("label") || defaultLabel;

//         let html = `<style>${inputStyle}</style>` 
//             + `<div class="${className}">`
//             + `<input type="text" class="label" name="text${i}" value="${label}"></input>`
//             + `<input type="text" class="data" name="data${i}" value="${value}"></input>`
//             + '<button class="remove" title="Delete this row">&minus;</button></div>';
//         this.shadowRoot.innerHTML = html;
//     }
// }
// customElements.define("data-input", DataInput);

// TODO: add change and click listeners

function rounded(n) {
    return Math.round(n * 1000) / 1000;
}

const statsStyle = "<style> div p { margin: 0; padding: 0; }</style>";

class StatsBox extends Base {
    static observedAttributes = ["stats"];

    render() {
        const stats = JSON.parse(this.getAttribute("stats") || "{}");
        const {min, lq, med, uq, max, label} = stats;
        const html = statsStyle
            + `<div><strong>${label}</strong>`
            + `<p>Median: ${rounded(med)}</p>`
            + `<p>IQR: ${rounded(lq)} to ${rounded(uq)}</p>`
            + `<p>Range: ${rounded(min)} to ${rounded(max)}</p></div>`;
        this.shadowRoot.innerHTML = html;
    }
}
customElements.define("stats-box", StatsBox);


const plotStyles = `
g#plots text { fill:#aaa; }
path.scale { stroke: #ccc; stroke-width: 1px;}
path.plot { stroke: black; }
path.row0 { fill: #ddd; }
path.row1 { fill: #dd9; }
path.row2 { fill: #d9d; }
path.row3 { fill: #d99; }
path.row4 { fill: #9dd; }
path.row5 { fill: #9d9; }
path.row6 { fill: #99d; }
path.row7 { fill: #999; }
.row-back { fill: #f6f6f6; 
`;

class PlotChart extends Base {
    static observedAttributes = ["labels", "scale-path", "row", "width", "d"];

    render() {
        const labels = JSON.parse(this.getAttribute("labels"))?.map(d => {
            const { x, val } = d;
            return `<text y="100" x="${x}">${val}</text>`;
        }) || [];
        const scalePath = this.getAttribute("scale-path");
        const row = +this.getAttribute("row");
        const width = +this.getAttribute("width");
        const d = this.getAttribute("d");

        const plotClass = `plot row${row % 8}`;
        const svg = `<style>${plotStyles}</style>`
            +`<svg height="75" viewbox="0 0 ${width * 4 / 3}, 100">`
            + `<rect x="0" y="0" width="${width}" height="100%" class="row-back" />`
            + `<g id="plots">`
            + `<path class="scale" d="${scalePath}"></path>`
            + labels.join("")
            + `<path class="${plotClass}" d="${d}"></path> </g> </svg>`

        this.shadowRoot.innerHTML = svg;
    }
}
customElements.define("plot-chart", PlotChart);
