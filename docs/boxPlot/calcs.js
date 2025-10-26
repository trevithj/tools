import {makeQuantile} from "../_common/stats";
export { strToArray } from "../_common/convert";

// TODO: generalize this?
function generateNumericScale({min, max}, count = 5) {
    const range = max - min;
    const step = Math.pow(10, Math.floor(Math.log10(range / (count - 1))));
    const start = Math.ceil(min / step) * step;
    const scale = [];

    for (let value = start; value <= max; value += step) {
        scale.push(value);
    }
    return scale;
}


// Calculate the stats
export function getStats(vals, index) {
    if (!vals.length) return null;
    vals.sort((a,b) => a - b);
    const quantile = makeQuantile(vals);
    const last = vals.length - 1;
    const max = vals[last];
    const min = vals[0];
    const med = quantile(0.5);
    const lq = quantile(0.25);
    const uq = quantile(0.75);
    const iqr = uq - lq;
    const ucl = uq + (1.5 * iqr);
    const lcl = lq - (1.5 * iqr);
    return {min, lq, med, uq, max, iqr, ucl, lcl, vals, index};
}

function getToPercent(statsList) {
    const all = {max: 0, min: 9999999};
    statsList.forEach(stats => {
        if (!stats) return '';
        const {max, min} = stats;
        all.max = Math.max(all.max, max);
        all.min = Math.min(all.min, min);
    });
    all.range = all.max - all.min;
    const toPercent = v => (v - all.min) / all.range;
    return { toPercent, ...all };
}

export function calcPercents(statsList) {
    const fields = "min lq med uq max lcl ucl".split(" ");
    const { toPercent, ...range } = getToPercent(statsList);
    const percents = statsList.map(stats => {
        const vals = stats.vals.map(toPercent);
        return fields.reduce((map, field) => {
            const v = stats[field];
            map[field] = toPercent(v);
            return map;
        }, {vals});
    });
    const scale = generateNumericScale(range).map(label => {
        const percent = toPercent(label);
        return { label, percent };
    });
    return { percents, scale };
}

const INPUT_VALS = "InputValues";
const INPUT_TEXT = "InputLabels";

export function getInputValues() {
    const json = localStorage.getItem(INPUT_VALS);
    if (!json) return [
        [4,5,6,7,8],
        [5,6,7,8,9]
    ];
    return JSON.parse(json);
}

export function setInputValues(values, labels) {
    localStorage.setItem(INPUT_VALS, JSON.stringify(values));
    if (labels) localStorage.setItem(INPUT_TEXT, JSON.stringify(labels));
}

export function getInputLabels() {
    const json = localStorage.getItem(INPUT_TEXT);
    if (!json) return ["Set 1", "Set 2"];
    return JSON.parse(json);
}

export function clearInputs() {
    localStorage.removeItem(INPUT_VALS);
    localStorage.removeItem(INPUT_TEXT);
}
