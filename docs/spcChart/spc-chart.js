import {strToNumberArray} from "../_common/convert.js";
import {calcMean, calcSigma, calcStdDev} from "../_common/stats.js";

const chart = document.querySelector("spc-chart");
const DefaultPoints = [12, 22, 14, 15, 11, 22, 14, 15, 11, 13, 18, 17, 16, 15, 19];
const params = new URLSearchParams(window.location.search);

const sPoints = params.get("points");
const points = sPoints ? strToNumberArray(sPoints) : DefaultPoints;
const mean = calcMean(points);
const sdev = calcStdDev(points, mean);
const sigma = calcSigma(sdev, mean);
const cValues = [
    sigma(-3), sigma(-2), sigma(-1), mean, sigma(1), sigma(2), sigma(3)
].map(v => v.toFixed(3));
const cLabels = "-3σ,-2σ,-1σ,mean,+1σ,+2σ,+3σ";
chart.setAttribute("points", points);
chart.setAttribute("lines", cValues);
chart.setAttribute("labels", cLabels);

const rawLabel = params.get("label") || "Default Label";
document.querySelector("h3").textContent = rawLabel;
