const rowsView = document.querySelector("section#rows");

const gridStyle = "display:grid; gap:3px; grid-template-columns";

function makeCoeffCells(coefficients) {
    return coefficients.map((coef, i) => {
        const cell = `<div class="cell value">${coef}⋅x<sub>${i+1}</sub></div>`;
        if(i===0) {
            return cell;
        }
        return '<div class="cell">+</div>' + cell;
    });
}

// Add coefficients and dynamic columns.
function makeRow(coefficients, i) {
    const cols = coefficients.length;
    const cells = makeCoeffCells(coefficients);
    return [
        `<div class="row row-${i}" style="${gridStyle}: repeat(${cols+1}, 5em 2em) 5em;">`,
        ...cells,
        `<div class="cell">-</div>`,
        `<div class="cell value consts">?</div>`,
        `<div class="cell">=</div>`,
        `<div class="cell value rhs-value">?</div>`,
        '</div>'
    ].join("\n");
};

let rhsCols = [];
let kCols = [];
export function initRows(theStore) {
    theStore.subscribe((state, prev) => {
        // console.log(state, prev);
        if (state.coefficients !== prev.coefficients) {
            const html = state.coefficients.map(makeRow).join("\n");
            rowsView.innerHTML = html;
            rhsCols = rowsView.querySelectorAll("div.rhs-value");
            kCols = rowsView.querySelectorAll("div.consts");
        };
        if (state.consts !== prev.consts) {
            state.consts.forEach((k,i) => {
                kCols[i].innerText = k;
            })
        };
        if (state.rhs !== prev.rhs) {
            state.rhs.forEach((r,i) => {
                rhsCols[i].innerText = r;
            })
        };
    })
}
