import "./components";

export function makeInput(value, i, label) {
    // For now, return an html string. TODO: create elements directly
    const className = `set${i % 8}`;
    const defaultLabel = `Set ${i + 1}`;
    const v = value || "1 2 3 4 5";
    const l = label || defaultLabel;
    // const x = `<data-input row="${i}" value="${v}" label="${l}"></data-input>`;
    return `<div class="${className}">`
        + `<input type="text" class="label" name="text${i}" value="${l}"></input>`
        + `<input type="text" class="data" name="data${i}" value="${v}"></input>`
        + `<button class="remove" title="Delete this row">&minus;</button>`
        + `</div>`;
}

function rounded(n) {
    return Math.round(n * 1000) / 1000;
}

export function makeInputs(values, labels) {
    const html = values.map((v, i) => {
        const label = labels[i];
        return makeInput(v, i, label);
    });
    return html.join("\n");
}

export function getScaleData(scale, width) {
    const path = [];
    const text = scale.map(s => {
        const {label, percent} = s;
        const x = rounded(percent * width);
        const val = rounded(label);
        path.push(`M${x},0 V100`);
        return {x, val};
    });
    return {scalePath: path.join(""), labels: JSON.stringify(text)};
}

export function getPath(percents, width) {
    const y = p => rounded(p * (width - 4) + 2);
    const {min, lq, med, uq, max, lcl, ucl, vals} = percents;
    const lmin = y(Math.max(min, lcl));
    const lmax = y(Math.min(max, ucl));
    const ylq = y(lq);
    const yuq = y(uq);
    const ymed = y(med);
    const d = [`M${lmin},40 V60 M${lmax},40 V60`];
    d.push(`M${lmin},50 H${ylq} M${lmax},50 H${yuq}`);
    d.push(`M${ylq},20 H${ymed} V80 H${ylq}Z`);
    d.push(`M${yuq},20 H${ymed} V80 H${yuq}Z`);
    // draw any outliers
    vals.forEach(v => {
        const yv = y(v);
        if (yv < lmin || yv > lmax) {
            d.push(`M${yv - 2},50 l2,5 l2,-5 l-2,-5 Z`)
        }
    })
    return d.join(" ");
}

const makePlotChart = (width, scaleData) => (d, i) => {
    const {labels, scalePath} = scaleData;
    return `<plot-chart`
        + ` labels='${labels}'`
        + ` width="${width}"`
        + ` scale-path="${scalePath}"`
        + ` d="${d}" row="${i}">`
        + `</plot-chart>`;
}

export const makeDisplayRow = (width, scaleData) => {
    const plotChart = makePlotChart(width, scaleData);
    return (stats, d, i) => {
        const statsBlock = `<stats-box stats='${JSON.stringify(stats)}'></stats-box>`;
        const plotBlock = plotChart(d, i);
        return ['<div class="display-row">', statsBlock, plotBlock, "</div>"].join("");
    }
}

export function stringify(state) {
    return [
        "{",
        '\n   "labels": [',
        state.labels.map(label => `\n      "${label}"`),
        "\n   ],",
        '\n   "values": [',
        state.values.map(vals => `\n      ${JSON.stringify(vals)}`),
        "\n   ]",
        "\n}"
    ].join("")
}