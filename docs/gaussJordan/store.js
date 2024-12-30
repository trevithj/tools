import {publish} from "../pubsub.js";

const store = {
    cols: 4,
    logs: [],
    rows: []
};

function isRowIndexOk(index) {
    if (index < 0) return false;
    if (index >= store.rows.length) return false;
    return true;
}

function moveRow(rowIndex) {
    if(rowIndex === 0) return "Can't move first row upward"; //not allowed
    if (!isRowIndexOk(rowIndex)) return `Invalid row number: ${rowIndex}`;
    const thisRow = store.rows[rowIndex];
    store.rows[rowIndex] = store.rows[rowIndex-1];
    store.rows[rowIndex-1] = thisRow;
    return "ok";
}

function scaleRow(rowIndex, scalar) {
    store.rows[rowIndex] = store.rows[rowIndex].map(n => n * scalar);
 };

function addRows(rowIndex, refRowIndex) {
    if (!isRowIndexOk(refRowIndex)) return `Invalid row number: ${refRowIndex}`;
    if (!isRowIndexOk(rowIndex)) return `Invalid row number: ${rowIndex}`;
    const refRow = store.rows[refRowIndex];
    const tgtRow = store.rows[rowIndex].map((v, i) => v + refRow[i]);
    store.rows[rowIndex] = tgtRow;
    return "ok";
}

function deleteRow(rowIndex) {
    store.rows = store.rows.filter((r, i) => i !== rowIndex);
}

function makeExampleRow() {
    return Array.from({length:store.cols}, (_,i) => {
        return Math.round(Math.random() * 10);
    })
}

export function getStore(makeRow = makeExampleRow) {
    const theStore = {
        get cols() { return store.cols; },
        set cols(n) { 
            store.cols = n;
            store.rows = [
                makeRow(0, store.cols),
                makeRow(1, store.cols),
                makeRow(2, store.cols)
            ];
         },
         get rows() {
            return store.rows;
         },
         logs: store.logs,
         isRowIndexOk,
         addRows,
         moveRow,
         scaleRow,
         deleteRow
        
    };
    // initialize
    theStore.cols = 4;
    return theStore;
}
