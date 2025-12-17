import {strToNumberArray} from "../_common/convert.js";
import {calcMean, calcSigma, calcStdDev, minMax, getPercentiles, movingAverages} from "../_common/stats.js";

const inputElement = document.querySelector("#inputSection");
const outputElement = document.querySelector("#outputSection");
const controls = document.querySelector(".control-panel");
const viz = document.querySelector("#theViz");

function rand(max) {
    return Math.floor(Math.random() * max);
}

// Basic points with min/max lines
controls.querySelector("#b-raw").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const lines = minMax(values).join(",");
    const labels = "min,max";
    const points = values.join(",");
    outputElement.value = JSON.stringify({points, lines, labels}, null, 2);
    viz.setAttribute("points", points);
    viz.setAttribute("labels", labels);
    viz.setAttribute("lines", lines);
})

// mean and +-three sigma lines
controls.querySelector("#b-sig").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    doThreeSigma(values);
})

// percentiles, UQ, LQ +-IQR
controls.querySelector("#b-per").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const perc = getPercentiles(values);
    const lq = perc(0.25);
    const uq = perc(0.75);
    const whisker = (uq - lq) * 1.5;
    const lines = [
        lq - whisker, lq, perc(0.5), uq, uq + whisker
    ].map(v => v.toFixed(3)).join(",");
    const labels = "LCL, Q1, Median, Q3, UCL";
    // const points = JSON.stringify(values);
    const points = values.join(",");
    // const lines = JSON.stringify(cLines);
    viz.setAttribute("points", points);
    viz.setAttribute("lines", lines);
    viz.setAttribute("labels", labels);
    outputElement.value = JSON.stringify({points, lines, labels}, null, 2);
})

// 3-sigma, 2-point moving average
controls.querySelector("#b-ma2").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const avgs = movingAverages(values, 2);
    doThreeSigma(avgs);
})

// 3-sigma, 3-point moving average
controls.querySelector("#b-ma3").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const avgs = movingAverages(values, 3);
    doThreeSigma(avgs);
})

// 3-sigma, 5-point moving average
controls.querySelector("#b-ma5").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const avgs = movingAverages(values, 5);
    doThreeSigma(avgs);
})


function doThreeSigma(values) {
    const mean = calcMean(values);
    const sdev = calcStdDev(values, mean);
    const sigma = calcSigma(sdev, mean);
    const lines = [
        sigma(-3), sigma(-2), sigma(-1), mean, sigma(1), sigma(2), sigma(3)
    ].map(v => v.toFixed(3)).join(",");
    const labels = "-3σ,-2σ,-1σ,mean,+1σ,+2σ,+3σ";
    const points = values.join(",");
    viz.setAttribute("points", points);
    viz.setAttribute("lines", lines);
    viz.setAttribute("labels", labels);
    outputElement.value = JSON.stringify({points, lines, labels}, null, 2);
}

// Initialise the chart
// set default values;
const initVals = Array.from({length: 20 }, () => rand(20));
// inputElement.value = "10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30";
inputElement.value = initVals.join(" ");

controls.querySelector("#b-raw").click();