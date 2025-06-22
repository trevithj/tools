import {initControls} from "./renderControls.js";
import {initRows} from "./renderRows.js";
import {getStore} from "./store.js";

const theStore = window.STORE = getStore();
const configView = document.querySelector("section#config");
const vCountInput = configView.querySelector("input[name='v-count']");

vCountInput.addEventListener("input", (e) => {
    const vCount = e.target.value;
    theStore.getState().setVCount(+vCount);
    configView.querySelector("div.value").innerText = vCount;
});
// configView.querySelector("button").addEventListener("click", () => {
//     const vCount = +vCountInput.value;
//     theStore.getState().setVCount(vCount);
// })

initControls(theStore);
initRows(theStore);
