// import {TheStore} from "./store";

const controlView = document.querySelector("section#controls");

function makeRow(v, i) {
    const index = i + 1;
    return [
        `<div class="rangeRow rangeRow-${i}">`,
        `<div class="cell index">x<sub>${index}</sub></div>`,
        `<div class="cell value">${v}</div>`,
        `<input name="x${index}" type="range" step="1" min="1" max="20" value="1" />`,
        '</div>'
    ];
}

export function initControls(TheStore) {
    TheStore.subscribe((state, oldState) => {
        console.log(state);
        if (state.vCount === oldState.vCount) return;
        const {values} = state;
        const html = values.flatMap(makeRow);
        controlView.innerHTML = html.join("");
        
        const ranges = document.querySelectorAll("div.rangeRow");
        console.log(ranges, values);
    
        ranges.forEach((range, i) => {
            range.querySelector("input").addEventListener("input", e => {
                const value = +e.target.value;
                state.setValue(i, value);
                range.querySelector("div.value").innerText = value;
            });
        })
    });
}

/*

<div class="rangeRow" data-index="0">
    <div class="cell index">x<sub>1</sub></div>
    <div class="cell value">1</div>
    <input name="x1" type="range" step="1" min="1" max="20" value="1" />
</div>

*/