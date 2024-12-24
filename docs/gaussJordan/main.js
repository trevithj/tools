const store = {
    cols: 4,
    logs: [],
    rows: []
};
// TEMP
store.rows.push([1,2,3,6]);
store.rows.push([2,3,4,9]);
store.rows.push([1,1,2,4]);

function isRowIndexOk(index) {
    if (index < 0) return false;
    if (index >= store.rows.length) return false;
    return true;}

function log(msg) {
    store.logs.unshift(msg);
    document.querySelector("#logs > pre").innerHTML = store.logs.join("\n");
}

const rows = document.querySelector("#rows");

const range =  document.querySelector("input[name=cols]");
store.cols = Number.parseInt(range.value);

range.addEventListener("change", e => {
    store.cols = eval(e.target.value);
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

function getEquation(vals) {
    const variables = "abcdefghijklmnop".split("");
    const cells = vals.map((n, i) => {
        if (i+1 === vals.length) return ` = ${n}`;
        const prefix = i === 0 ? "" : " + ";
        if (n === 0) return "";
        const vName = variables[i];
        const coef = n === 1 ? "" : n;
        return `${prefix}${coef}${vName}`;
    });
    return cells.join("");
}

function renderRow(data) {
    const { index, values, cols } = data;
    const equation = getEquation(values);
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
function getNumbers(label, defaultValue) {
    const values = prompt(label, defaultValue);
    if (!values) return { status: "cancelled "};
    try {
        const numbers = values.split(",").map(v => eval(v)); // allow entering expressions
        if(numbers.some(n => isNaN(n))) return {
            numbers, status: "invalid"
        };
        return { numbers, status: "ok" };
    } catch (err) {
        console.warn(err);
        return  { status: `${err.message}, "${values}"`};
    }
}

function doMove(rowIndex) {
    if(rowIndex === 0) return log("Can't move first row upward"); //not allowed
    const thisRow = store.rows[rowIndex];
    if(!thisRow) return log(`Invalid row number: ${rowIndex}`);
    store.rows[rowIndex] = store.rows[rowIndex-1];
    store.rows[rowIndex-1] = thisRow;
    log(`Row ${rowIndex} moved.`)
}

function doScale(rowIndex) {
    const { numbers, status } = getNumbers("How much to multiply row by?", 1);
    if (status !== "ok") return log(`Data entry status: ${status}`);
    const [scale] = numbers;
    store.rows[rowIndex] = store.rows[rowIndex].map(n => n * scale);
    log(`Row ${rowIndex} multiplied by ${scale}.`)
}

function doAdd(rowIndex) {
    const { numbers, status } = getNumbers("Enter which row to add", 0);
    if (status !== "ok") return log(`Data entry status: ${status}`);
    const [refRowIndex] = numbers;
    if (!isRowIndexOk(refRowIndex)) return log(`Invalid row number: ${refRowIndex}`);
    const refRow = store.rows[refRowIndex];
    const tgtRow = store.rows[rowIndex].map((v, i) => v + refRow[i]);
    store.rows[rowIndex] = tgtRow;
    log(`Row ${refRowIndex} added to Row ${rowIndex}.`)
}

function btnListener(evt) {
    const { type, row } = evt.target.dataset;
    const rowIndex = Number.parseInt(row);
    if(type === "delete") {
        store.rows = store.rows.filter((r, i) => i !== rowIndex);
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
    if (!isRowIndexOk(rowIndex)) return log(`Invalid row number: ${rowIndex}`);
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
