import {getInputLabels, getInputValues, strToArray} from "../boxPlot/calcs.js";
import theStore from "./boxplotStore.js";
import {getPath, getScaleData, makeDisplayRow, makeInputs, stringify} from "../boxPlot/views.js";
import {select, selectAll} from "../selectors.js";

const views = {};
const {actions} = theStore.getState();

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
            actions.removeRow(index);
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
    const values = Array.from(selectAll("input.data", fm)).map(e => strToArray(e.value));
    const labels = Array.from(selectAll("input.label", fm)).map(e => e.value);
    actions.update({values, labels});
})

views.addRow.addEventListener("click", () => {
    const value = [1, 2, 3, 4, 5];
    const label = "New row";
    actions.addRow({value, label});
});

// Update width if needed. TODO: replace with resizeObserver
select("#wid").addEventListener("change", evt => {
    const width = parseInt(evt.target.value);
    actions.changeWidth(width);
});

views.reset.addEventListener("click", () => {
    actions.reset();
})
views.data.addEventListener("click", () => {
    actions.toggleData();
})
views.dataText.addEventListener("change", (evt) => {
    const payload = JSON.parse(evt.target.value);
    updateInputs(payload.values, payload.labels);
    actions.update(payload);
})

// Update the display as required
function isDiffShallow(obj1, obj2, fields) {
    return fields.some(fieldName => obj1[fieldName] !== obj2[fieldName]);
}

theStore.subscribe((state, oldState) => {
    if (state.showData === oldState.showData) return;
    console.log(views.dataDiv);
    views.dataDiv.classList.toggle("hidden");
});

theStore.subscribe((state, prev) => {
    if (!isDiffShallow(state, prev, ["values", "labels"])) return;
    updateInputs(state.values, state.labels);
});

theStore.subscribe((state, prev) => {
    const {stats, percents, scale, width} = state;
    // if (stats === prev.stats && scale === prev.scale && width === prev.width) return;
    if (!isDiffShallow(state, prev, ["stats", "scale", "width"])) return;
    const scaleData = getScaleData(scale, width);
    const displayRow = makeDisplayRow(width, scaleData);
    const displayRows = percents.map((result, row) => {
        const d = getPath(result, width);
        return displayRow(stats[row], d, row);
    });
    displayDiv.innerHTML = displayRows.join("\n");
    views.dataText.value = stringify(state);
    // const toPercent = state.width / overview.range;
});

// Initial plots
actions.start();
