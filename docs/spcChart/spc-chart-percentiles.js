import {strToNumberArray} from "../_common/convert.js";
import {getPercentiles} from "../_common/stats.js";

const chart = document.querySelector("spc-chart");
const DefaultPoints = [12, 22, 14, 15, 11, 22, 14, 15, 11, 13, 18, 17, 16, 15, 19];

const params = new URLSearchParams(window.location.search);

const sPoints = params.get("points");
const points = sPoints ? strToNumberArray(sPoints) : DefaultPoints;
const perc = getPercentiles(points);
const lq = perc(.25);
const uq = perc(0.75);
const whisker = (uq - lq) * 1.5;
const cValues = [
    lq - whisker, lq, perc(0.5), uq, uq + whisker
].map(v => v.toFixed(3));
const cLabels = "LCL, Q1, Median, Q3, UCL";
chart.setAttribute("points", points);
chart.setAttribute("lines", cValues);
chart.setAttribute("labels", cLabels);

const rawLabel = params.get("label") || "Default Label";
document.querySelector("h3").textContent = rawLabel;
