import BASE from "../base.js";
import {getInputLabels, getInputValues, strToNumberArray} from "./calcs.js";
import {reducer} from "./state.js";
import {getPath, getScaleData, makeDisplayRow, makeInputs, stringify} from "./views.js";

BASE.initState(reducer);
const {select, selectAll, listen, dispatch} = BASE;
BASE.logging = true;

const views = {};

// Initialize the display
const inputDiv = select("div.inputs");
// const chartsDiv = select("div.charts");
const displayDiv = select("div.display");

// chartsDiv.style.width = `${state.width}px`;
const inputValues = getInputValues();
const inputLabels = getInputLabels();

function updateInputs(values, labels) {
    inputDiv.innerHTML = makeInputs(values, labels);
    views.dataInputs = Array.from(selectAll("input.data", inputDiv));
    views.dataLabels = Array.from(selectAll("input.label", inputDiv));
    // add listeners
    Array.from(selectAll("button.remove", inputDiv)).forEach((btn, index) => {
        btn.addEventListener("click", () => {
            dispatch("ROW_REMOVED", { index });
        })
    });
}

updateInputs(inputValues, inputLabels);

// Locate the updatable elements
// views.svgs = Array.from(selectAll("svg", chartsDiv));
views.inputForm = select("#input-form");
views.addRow = select("button#add");
views.reset = select("button#reset");
views.data = select("button#data");
views.dataDiv = select("div.data");
views.dataText = select("div.data textarea");
views.statsDiv = select(".stats");

views.inputForm.addEventListener("change", () => {
    const fm = views.inputForm;
    const values = Array.from(selectAll("input.data", fm)).map(e => strToNumberArray(e.value));
    const labels = Array.from(selectAll("input.label", fm)).map(e => e.value);
    dispatch("INPUTS_CHANGED", {values, labels});
})

views.addRow.addEventListener("click", () => {
    const value = [1, 2, 3, 4, 5];
    const label = "New row";
    dispatch("ROW_ADDED", {value, label});
});

// Update width if needed. TODO: replace with resizeObserver
select("#wid").addEventListener("change", evt => {
    const width = parseInt(evt.target.value);
    dispatch("WIDTH_CHANGED", {width});
});

views.reset.addEventListener("click", () => {
    dispatch("RESET");
})
views.data.addEventListener("click", () => {
    dispatch("DATA_TOGGLED");
})
views.dataText.addEventListener("change", (evt) => {
    const payload = JSON.parse(evt.target.value);
    updateInputs(payload.values, payload.labels);
    dispatch("INPUTS_CHANGED", payload);
})

// Update the display as required
listen("STATE_CHANGED", state => {
    const {stats, percents, scale, actionType} = state;
    switch(actionType) {
        case "DATA_TOGGLED": {
            console.log(views.dataDiv);
            views.dataDiv.classList.toggle("hidden");
            break;
        }
        case "ROW_ADDED":
        case "ROW_REMOVED":
        case "RESET":
            updateInputs(state.values, state.labels);
        default: {
            const scaleData = getScaleData(scale, state.width);
            const displayRow = makeDisplayRow(state.width, scaleData);
            const displayRows = percents.map((result, row) => {
                const d = getPath(result, state.width);
                return displayRow(stats[row], d, row);
            });
            displayDiv.innerHTML = displayRows.join("\n");
            views.dataText.value = stringify(state);
            // const toPercent = state.width / overview.range;
        }
    }
})

// Initial plots
dispatch("START");

/*
{
   labels: [
      "Set 1",
      "SET BBB"
   ],
   values: [
      [1,2,3,4,4,5,5,6,6,7,7,8],
      [5,6,7,8,9]
   ]
}
*/

/*
No thanks. I would like to create a similar component, but this one is for displaying horizontal box-and-whisker plots. It would take these attributes:
* points: a comma-separated array of numbers indicating points to display on the chart.
* data: a comma-separated array of the five values to represent the whisker ends, the quartiles and the median.
* range: a comma-separated pair of values indicating the width of the display. That is, it indicates the lowest and highest points the plot should allow for, so that multiple plots can be displayed beside each other on the same scale.




*/