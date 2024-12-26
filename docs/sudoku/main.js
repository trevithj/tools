import BASE from "../base.js";
import { initView, render } from "./sudoku.view.js"
import reducer from "./sudoku.state.js"

initView();
BASE.initState(reducer);
window.BASE = BASE;


document.querySelector('button[name="work"]').addEventListener("click", () => {
    BASE.dispatch('SET_GRID','working');
});
document.querySelector('button[name="stnd"]').addEventListener("click", () => {
    BASE.dispatch('SET_GRID','standard');
});
document.querySelector('button[name="undo"]').addEventListener("click", () => {
    BASE.dispatch('UNDO');
});

BASE.listen("ERROR", function (msg) {
    console.error(msg);
});

BASE.listen("CELL_CLICKED", function (obj) {
    const state = BASE.getState();
    if (state.grid === "working") {
        obj.value = 2;
        BASE.dispatch("UPDATE_CELL", obj);
    } else { //assume grid=="standard"
        BASE.dispatch("SELECT_CELL", obj);
    }
    console.info(obj);
});

BASE.listen("NBR_CLICKED", function (obj) {
    obj.value = 2;
    BASE.dispatch("UPDATE_CELL", obj);
});


BASE.listen("STATE_CHANGED", function (state) {
    switch (state.actionType) {
        case "UPDATE_CELL":
        case "RESET":
            return render(state);
        default: return render(state);
    }
});

BASE.dispatch("RESET");
