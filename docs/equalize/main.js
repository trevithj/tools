import {getStore} from "./store.js";

const store = getStore();

const rows = document.querySelector("#rows");

const ranges = document.querySelectorAll("div.rangeRow");

ranges.forEach((range, i) => {
    range.querySelector("input").addEventListener("input", e => {
        // store.cols = eval(e.target.value);
        // document.querySelector("label span").innerText = store.cols;
        // render(store);
        console.log(i, e.target.value);
    });
})

// function getRowStyle(cols) {
//     const common = "display:grid; gap:3px; grid-template-columns";
//     return `${common}: repeat(5, 2em) repeat(${cols }, 5em);`;
// }

function renderRow(data) {
    // const { index, values, cols } = data;
    // const equation = store.getEquation(index);
    // const rowDiv = `<div class="row" data-index="${index}" style="${getRowStyle(cols)}" title="${equation}">`;
    // const indexCell = `<div class="cell index">${index}</div>`;
    // const info = `<span class="info" title=${equation}></span>`

    // const valCells = values.map((n,i) => {
    //     if (i < values.length-1)
    //         return `<div class="cell value">${n}</div>`;
    //     return `<div class="cell value rhs">${n}</div>`;
    // });
    // return [rowDiv, ...makeCtrls(index), indexCell, ...valCells, info, "</div>"].join("");
}

// ---------------

// Top buttons
// document.querySelector("#newRow").addEventListener("click", () => {
    // const { cols } = store;
    // const defaultValues = Array.from({ length: cols }, () => "0").join(",");
    // const { status, numbers } = getNumbers(`Enter ${cols} comma-delimited values:`, defaultValues);
    // if (status !== "ok") return log(`Data entry status: ${status}`);
    // if (numbers.length !== cols) return log(`Expected ${cols} numbers: actual=${numbers.length}`);
    // store.rows.push(numbers);
    // render();
// });

function render() {
    // // Remove any listeners
    // document.querySelectorAll("button.ctrl").forEach(btn => btn.removeEventListener("click", btnListener));
    // const { cols } = store;
    // const html = store.rows.map((values, index) => {
    //     return renderRow({ index, values, cols });
    // })
    // rows.innerHTML = html.join("");
    // // re-add listeners
    // document.querySelectorAll("button.ctrl").forEach(btn => btn.addEventListener(
    //     "click", btnListener
    // ));
}

render();
