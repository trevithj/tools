import {initConfigs} from "./renderConfigs.js";
import {initControls} from "./renderControls.js";
import {initRows} from "./renderRows.js";
import {getStore, makeCoefficients} from "./store.js";

const theStore = window.STORE = getStore(makeCoefficients);

initConfigs(theStore);
initControls(theStore);
initRows(theStore);
theStore.getState().setVCount(2);