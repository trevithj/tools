import {getRows} from "./rows.js";

const store = {
    cols: 0,
    equations: [],
    rows: getRows()
};

function isRowIndexOk(index) {
    return store.rows.isIndexOk(index);
}

function moveRow(rowIndex) {
    return store.rows.moveUp(rowIndex);
}

function scaleRow(rowIndex, scalar) {
    return store.rows.scale(rowIndex, scalar);
};

function addRows(rowIndex, refRowIndex) {
    return store.rows.addRows(rowIndex, refRowIndex)
}

function deleteRow(rowIndex) {
    store.rows = store.rows.filter((r, i) => i !== rowIndex);
}

function makeExampleRow() {
    return Array.from({length: store.cols}, (_, i) => {
        return Math.round(Math.random() * 10);
    })
}

const variables = "abcdefghijklmnop".split("");

function getEquation(rowIndex) {
    if (!isRowIndexOk(rowIndex)) return `Invalid row number: ${rowIndex}`;
    const vals = store.rows.row(rowIndex);
    const cells = vals.flatMap((n, i) => {
        if (i+1 === vals.length) return `= ${n}`;
        if (n === 0) return [];
        const vName = variables[i];
        const coef = n === 1 ? "" : n;
        return `${coef}${vName}`;
    });
    return cells.join(" + ").replace(" + =", " =");
}


export function getStore(makeRow = makeExampleRow) {
    const theStore = {
        get cols() {return store.cols;},
        set cols(n) {
            store.cols = n;
            store.rows.clear();
            store.rows.add(makeRow(0, store.cols));
            store.rows.add(makeRow(1, store.cols));
            store.rows.add(makeRow(2, store.cols));
            store.equations = [
                getEquation(0),
                getEquation(1),
                getEquation(2),
            ]
        },
        get rows() {
            return store.rows;
        },
        get equations() { return store.equations },
        isRowIndexOk,
        addRows,
        getEquation,
        moveRow,
        scaleRow,
        deleteRow

    };
    // initialize
    theStore.cols = 4;
    return theStore;
}
