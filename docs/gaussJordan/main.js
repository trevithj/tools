import {getStore} from "./store.js";
import {getNumbers, getOperations} from "./operations.js";

const store = getStore();
const { log, doMove, doScale, doAdd } = getOperations(store);

const rows = document.querySelector("#rows");

const range =  document.querySelector("input[name=cols]");
store.cols = Number.parseInt(range.value);

range.addEventListener("input", e => {
    store.cols = eval(e.target.value);
    document.querySelector("label span").innerText = store.cols;
    render(store);
});

const controlsData = [
    "delete|Delete this row",
    "move|Move this row up one",
    "scale|Multiply this row's values by a scalar",
    "add|Add another row's contents to this row"];
function makeCtrls(rowIndex) {
    return controlsData.map(data => {
        const [type, label] = data.split("|");
        const invalid = type==="move" && rowIndex === 0 ? "disabled" : "";
        return `<button class="ctrl ${type}" data-type="${type}" title="${label}" data-row="${rowIndex}" ${invalid}>&nbsp;</button>`;
    })
}

function getRowStyle(cols) {
    const common = "display:grid; gap:3px; grid-template-columns";
    return `${common}: repeat(5, 2em) repeat(${cols }, 5em);`;
}

function renderRow(data) {
    const { index, values, cols } = data;
    const equation = store.getEquation(index);
    const rowDiv = `<div class="row" data-index="${index}" style="${getRowStyle(cols)}" title="${equation}">`;
    const indexCell = `<div class="cell index">${index}</div>`;
    const info = `<span class="info" title=${equation}></span>`

    const valCells = values.map((n,i) => {
        if (i < values.length-1)
            return `<div class="cell value">${n}</div>`;
        return `<div class="cell value rhs">${n}</div>`;
    });
    return [rowDiv, ...makeCtrls(index), indexCell, ...valCells, info, "</div>"].join("");
}

// ---------------

function btnListener(evt) {
    const { type, row } = evt.target.dataset;
    const rowIndex = Number.parseInt(row);
    if(type === "delete") {
        store.deleteRow(rowIndex);
        log(`Row ${rowIndex} deleted`);
    } else if(type === "move") {
        doMove(rowIndex);
    } else if(type === "scale") {
        doScale(rowIndex);
    } else if(type === "add") {
        doAdd(rowIndex);
    } else {
        console.log({type, rowIndex});
    }
    render();
}

// Top buttons
document.querySelector("#newRow").addEventListener("click", () => {
    const { cols } = store;
    const defaultValues = Array.from({ length: cols }, () => "0").join(",");
    const { status, numbers } = getNumbers(`Enter ${cols} comma-delimited values:`, defaultValues);
    if (status !== "ok") return log(`Data entry status: ${status}`);
    if (numbers.length !== cols) return log(`Expected ${cols} numbers: actual=${numbers.length}`);
    store.rows.push(numbers);
    log("New row added successfully.");
    render();
});
document.querySelector("#dupRow").addEventListener("click", () => {
    const{ status, numbers } = getNumbers("Enter the row number to duplicate", 0);
    if (status !== "ok") return log(`Data entry status: ${status}`);
    const [rowIndex] = numbers;
    if (!store.isRowIndexOk(rowIndex)) return log(`Invalid row number: ${rowIndex}`);
    const refRow = store.rows[rowIndex];
    store.rows.push([...refRow]);
    log(`Row ${rowIndex} duplicated successfully.`);
    render();
});

function render() {
    // Remove any listeners
    document.querySelectorAll("button.ctrl").forEach(btn => btn.removeEventListener("click", btnListener));
    const { cols } = store;
    const html = store.rows.map((values, index) => {
        return renderRow({ index, values, cols });
    })
    rows.innerHTML = html.join("");
    // re-add listeners
    document.querySelectorAll("button.ctrl").forEach(btn => btn.addEventListener(
        "click", btnListener
    ));
}

render();
log("Ready");
