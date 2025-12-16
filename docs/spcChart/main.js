import {strToNumberArray} from "../_common/convert.js";
import {calcMean, calcSigma, calcStdDev, minMax} from "../_common/stats.js";

const inputElement = document.querySelector("#inputSection");
const outputElement = document.querySelector("#outputSection");
const controls = document.querySelector(".control-panel");
const viz = document.querySelector("#theViz");

// set default values
inputElement.value = "12, 22, 14, 15, 11, 22, 14, 15, 11, 13, 18, 17, 16, 15, 19";

controls.querySelector("#b-raw").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const lines = minMax(values).join(",");
    const labels = "min,max";
    const points = values.join(",");
    outputElement.value = JSON.stringify({points,lines,labels}, null, 2);
    viz.setAttribute("points", points);
    viz.setAttribute("labels", labels);
    viz.setAttribute("lines", lines);
})

controls.querySelector("#b-sig").addEventListener("click", () => {
    const values = strToNumberArray(inputElement.value);
    const mean = calcMean(values);
    const sdev = calcStdDev(values, mean);
    const sigma = calcSigma(sdev, mean);
    const lines = [
        sigma(-3), sigma(-2), sigma(-1), mean, sigma(1), sigma(2), sigma(3)
    ].map(v => v.toFixed(3)).join(",");
    const labels = "-3σ,-2σ,-1σ,mean,+1σ,+2σ,+3σ";
    const points = JSON.stringify(values);
    viz.setAttribute("points", points);
    viz.setAttribute("lines", lines);
    viz.setAttribute("labels", labels);
    outputElement.value = JSON.stringify({points, lines, labels}, null, 2);
})

