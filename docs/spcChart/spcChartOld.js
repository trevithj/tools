function parseNumbers(str) {
    return str ? str.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v)) : [];
}

function calcMean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calcStddev(arr, mean) {
    const m = mean === undefined ? calcMean(arr) : mean;
    const variance = arr.reduce((sum, x) => sum + ((x - m) ** 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

function calcStats(values, sigmas) {
    // Compute stats
    const mean = calcMean(values);
    const sd = calcStddev(values, mean);
    return [
        [mean - (3 * sd), "red", "-3 SD"],
        [mean - (2 * sd), "orange", "-2 SD"],
        [mean, "green", "Mean"],
        [mean + (2 * sd), "orange", "+2 SD"],
        [mean + (3 * sd), "red", "+3 SD"],
    ]
}

function getPercentile(sorted) {
    const n = sorted.length;
    return p => {
        if (n === 1) return sorted[0];
        const idx = (p / 100) * (n - 1);
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        const weight = idx - lower;
        return sorted[lower] + weight * (sorted[upper] - sorted[lower]);
    }
}

/**
 * Compute median and percentiles for a numeric array.
 * @param {number[]} values - Array of numeric values
 * @returns {{ median: number, p05: number, p95: number }}
 */
function calcPercentileStats(values) {
    if (!values.length) {
        return {mid: NaN, lcl: NaN, ucl: NaN};
    }

    // Sort a copy ascending
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    // Median
    const mid = n / 2;
    const median = n % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[Math.floor(mid)];

    // Helper for percentile interpolation
    const percentile = getPercentile(sorted);
    return [
        [percentile(5), "red", "p-05"],
        [percentile(25), "orange", "p-25"],
        [median, "green", "median"],
        [percentile(75), "orange", "p-75"],
        [percentile(95), "red", "p-95"],
    ]
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

function renderSVG(component) {
    const {values, compute} = component;
    // Compute stats
    const lines = compute(values);
    console.log(lines);
    const lineVals = lines.map(line => line[0]);

    const minY = Math.min(...values, ...lineVals);
    const maxY = Math.max(...values, ...lineVals);
    const rangeY = maxY === minY ? 1 : maxY - minY;

    const xScale = (i) => padding + (i / (values.length - 1)) * (width - 2 * padding);
    const yScale = (v) => height - padding - ((v - minY) / rangeY) * (height - 2 * padding);

    const points = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");

    // Helper for horizontal lines
    const hLine = ([yValue, color, label]) => `<line x1="${padding
        }" x2="${width - padding}" y1="${yScale(yValue)}" y2="${yScale(yValue)
        }" stroke="${color}" stroke-dasharray="5,5" /><text x="${width - padding - 40
        }" y="${yScale(yValue) - 4}" fill="${color}" font-size="12">${label
        } (${yValue.toFixed(2)})</text>`;

    let html = `
          <svg viewBox="0 0 ${width} ${height}" width="95%" style="background:white; border:1px solid #ccc; border-radius:8px;">`;
    // <!-- Axes -->
    html += renderAxes(width, height, padding);

    // <!-- Data line -->
    html += `<polyline points="${points}" fill="none" stroke="blue" stroke-width="2" />`;

    // <!-- Data points -->
    html += values.map((v, i) =>
        `<circle cx="${xScale(i)}" cy="${yScale(v)
        }" r="4" fill="blue"><title>Point ${i + 1
        }: ${v}</title></circle>`
    ).join("");
    // <!-- Control lines -->
    lines.forEach(line => {
        html += hLine(line);
    });
    html += '</svg>';
    return html;
}


/////////////////////////////////////
class SPCChart extends HTMLElement {
    // static observedAttributes = ["values", "percentiles", "sigmas", "center"];
    //values="1,2,3" percentiles="5,95" sigmas="-2,2,3" center="median"
    //values=1,2,3" lines="2,0.5" line-labels="lcl,ucl"
    static observedAttributes = ["values", "type"];

    values = [];
    type = "sp";
    compute = () => {
        if (this.type ==="sp") return calcStats(this.values);
        return calcPercentileStats(this.values);
    }

    connectedCallback() {
        // test
        console.log(this.dataset);
        // Parse values from attribute or URL
        const attrValues = this.getAttribute("values");
        this.values = parseNumbers(attrValues);
        if (!this.values.length) {
            this.innerHTML = '<p>No data provided. Use values="10,11,..."</p>';
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "values" && oldValue !== newValue) {
            this.values = parseNumbers(newValue);
            if (!this.values.length) {
                this.innerHTML = '<p>No data provided. Use values="10,11,..."</p>';
                return;
            }
            this.innerHTML = renderSVG(this);
        }
        if (name === "type" && oldValue !== newValue) {
            this.type = newValue;
            this.innerHTML = renderSVG(this);
        }
    }
}

customElements.define("spc-chart", SPCChart);
