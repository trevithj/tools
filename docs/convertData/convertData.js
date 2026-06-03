import BASE from "../base.js";
import { reducer } from "./convertData.state.js";
import { render } from "./convertData.view.js";

//basic pattern
BASE.listen("SET_DATA", function(txt) {
	localStorage.setItem("RawData", txt);
	BASE.dispatch("SET_DATA", txt);
});
BASE.listen("INPUT", function(txt) {
	localStorage.setItem("RawData", txt);
	BASE.dispatch("SET_DATA", txt);
});

//
BASE.listen("SET_VIEW", function(view) {
	if (view==="Stats") {
		BASE.dispatch("CALC_STATS");
	}
	BASE.dispatch("SET_VIEW", view);
});

const viewBtnListener = evt => {
    const name = evt.target.innerText;
    BASE.send('SET_VIEW', name);
}

Array.from(BASE.selectAll("button.control-btn"))
.forEach(btn => btn.addEventListener("click", viewBtnListener));

//init
BASE.logging = true; // TODO: remove once dev is done
BASE.listen("STATE_CHANGED", render);
BASE.initState(reducer);
BASE.dispatch("SET_VIEW", "Input");
