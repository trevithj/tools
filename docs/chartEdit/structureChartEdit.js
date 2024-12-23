import {structureParser as parser, stringify} from "./chartEdit.js";
import {digraph2Dot, digraph2DotBipartite} from "./formatters.js";

window.DATA = {};

// Initial view.
const SAMPLE_INPUT = `Grandmother\n  Mother\n    Daughter1\n    Daughter2\n      GrandDaughter`;
const input = document.querySelector(".the-input > textarea");
const display = document.querySelector(".the-display > textarea");
input.value = window.localStorage.getItem("INPUT_STRUCTURE") || SAMPLE_INPUT;

let parsed = {};

input.addEventListener("blur", evt => {
    parsed = parser(evt.target.value);
    window.localStorage.setItem("INPUT_STRUCTURE", evt.target.value);
})

// Raw format
document.querySelector("button#b0").addEventListener("click", evt => {
    display.value = stringify(parsed);
})

// DOT format
document.querySelector("button#b1").addEventListener("click", evt => {
    display.value = digraph2Dot(parsed);
})
// DOT format, bipartite graph
document.querySelector("button#b2").addEventListener("click", evt => {
    const defaultVerb = document.querySelector("input[name='verb']").value;
    display.value = digraph2DotBipartite(parsed, defaultVerb);
})

input.focus();
