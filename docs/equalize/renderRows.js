const rowsView = document.querySelector("section#rows");

const gridStyle = "display:grid; gap:3px; grid-template-columns";

// TODO: add coefficients
function makeRow(coefficients, i) {
    const cols = coefficients.length + 2;
    return [
        `<div class="row row-${i}" style="${gridStyle}: repeat(${cols}, 5em);">`,
        `<div class="cell value">3⋅x<sub>1</sub></div>`,
        `<div class="cell">+</div>`,
        `<div class="cell value">5⋅x<sub>2</sub></div>`,
        `<div class="cell">=</div>`,
        `<div class="cell value">8</div>`,
        '</div>'
    ]
};

export function initRows(theStore) {
    // TODO: listen to state change, display coefficients
}

/*
<div class="row" style="display:grid; gap:3px; grid-template-columns: repeat(5, 5em);">
    <div class="cell value">3⋅x<sub>1</sub></div>
    <div class="cell">+</div>
    <div class="cell value">5⋅x<sub>2</sub></div>
    <div class="cell">=</div>
    <div class="cell value">8</div>
</div>
*/
