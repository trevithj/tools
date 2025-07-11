// import {TheStore} from "./store";

const configView = document.querySelector("section#config");

const VALUES = [2, 3, 4, 5];

function makeCell(vCount) {
    return (value) => {
        const selected = value === vCount;
        const cls = selected ? "cell value selected" : "cell value";
        return `<div id="v-${value}" class="${cls}">${value}</div>`;
    }
}

function updateVars(vCount, theVars) {
    const selectedId = `v-${vCount}`;
    theVars.forEach(el => {
        el.classList.remove("selected");
        console.log(el.id, selectedId);
        if (el.getAttribute("id") === selectedId) {
            el.classList.add("selected");
        }
    })
}

function handleClick(state, theVars) {
    return (evt) => {
        // console.log(evt);
        const value = +evt.target.innerText;
        state.setVCount(value);
        updateVars(value, theVars);
    }
}

export function initConfigs(TheStore) {
    const state = TheStore.getState();
    const html = VALUES.map(makeCell(state.vCount));
    const varsView = configView.querySelector(".vars");
    varsView.innerHTML = html.join("");
    setTimeout(() => {
        const theVars = varsView.querySelectorAll(".cell");
        theVars.forEach(el => {
            el.addEventListener("click", handleClick(state, theVars));
        });
        updateVars(TheStore.getState().vCount, theVars);
    }, 0);
}

/*
<div class="row-5 vars">
    <div class="cell value">2</div>
    <div class="cell value">3</div>
    <div class="cell value">4</div>
    <div class="cell value">5</div>
</div>
*/

// const configView = document.querySelector("section#config");
// const vCountInput = configView.querySelector("input[name='v-count']");

// vCountInput.addEventListener("input", (e) => {
//     const vCount = e.target.value;
//     configView.querySelector("div.value").innerText = vCount;
// });
// vCountInput.addEventListener("change", (e) => {
//     const vCount = e.target.value;
//     theStore.getState().setVCount(+vCount);
// });
// configView.querySelector("button").addEventListener("click", () => {
//     const vCount = +vCountInput.value;
//     theStore.getState().setVCount(vCount);
// })
