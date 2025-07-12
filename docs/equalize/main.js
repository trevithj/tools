import {initConfigs} from "./renderConfigs.js";
import {initControls} from "./renderControls.js";
import {initRows} from "./renderRows.js";
// import {getStore, makeCoefficients} from "./store.js";
import {TheStore} from "./store.js";

// const theStore = window.STORE = getStore(makeCoefficients);
const theStore = window.STORE = TheStore;

initConfigs(theStore);
initControls(theStore);
initRows(theStore);
const message = document.querySelector("#logs pre");
theStore.subscribe((state, oldState) => {
    if (state.message === oldState.message) return;
    message.innerText = state.message;
});

theStore.getState().setVCount(2);

/*

    <svg width="600" height="120" xmlns="http://www.w3.org/2000/svg">
        <!-- People (simple circles for heads, rectangles for bodies) -->
        <circle cx="100" cy="60" r="20" fill="#555" />
        <rect x="90" y="80" width="20" height="40" fill="#888" />
        <circle cx="250" cy="60" r="20" fill="#555" />
        <rect x="240" y="80" width="20" height="40" fill="#888" />
        <circle cx="400" cy="60" r="20" fill="#555" />
        <rect x="390" y="80" width="20" height="40" fill="#888" />

        <!-- Bucket 1 -->
        <rect id="bucket1" x="80" y="90" width="40" height="20" fill="#a52a2a" />
        <animateMotion xlink:href="#bucket1" path="M0,0 L150,0" begin="0s" dur="3s" repeatCount="indefinite" />
        <!-- Bucket 2 -->
        <rect id="bucket2" x="80" y="90" width="40" height="20" fill="#a52a2a" />
        <animateMotion xlink:href="#bucket2" path="M150,0 L300,0" begin="0s" dur="3s" repeatCount="indefinite" />
    </svg>


*/