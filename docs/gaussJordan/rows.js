function makeIsIndexOk(data) {
    return function isIndexOk(index) {
        if (index < 0) return false;
        if (index >= data.rows.length) return false;
        return true;
    }
}

function swapRows(data, index1, index2) {
    const thisRow = data.rows[index1];
    data.rows[index1] = data.rows[index2];
    data.rows[index2] = thisRow;
}

const calcScalar = scalar => n => {
    const result = n * scalar;
    const error = Math.abs(result - Math.trunc(result));
    if (error > 0.9999999999) return Math.ceil(result);
    if (error < 0.0000000001) return Math.floor(result);
    return result;
}

function doAddRows(data, targetRow, sourceRow) {
    const refRow = data.rows[sourceRow];
    const tgtRow = data.rows[targetRow].map((v, i) => v + refRow[i]);
    data.rows[targetRow] = tgtRow;
}

// Main export here
export function getRows() {
    const data = { rows: [] };

    const isIndexOk = makeIsIndexOk(data);

    function add(rowData, rowIndex = -1) {
        if (rowIndex < 0 || rowIndex >= data.rows.length) {
            data.rows.push(rowData);
        } // else TODO insert
    }
    
    function addRows(rowIndex, refRowIndex) {
        if (!isIndexOk(refRowIndex)) return `Invalid row number: ${refRowIndex}`;
        if (!isIndexOk(rowIndex)) return `Invalid row number: ${rowIndex}`;
        doAddRows(data, rowIndex, refRowIndex);
        return "ok";
    }

    function moveUp(rowIndex) {
        if (rowIndex === 0) return "Can't move first row upward"; //not allowed
        if (!isIndexOk(rowIndex)) return `Invalid row number: ${rowIndex}`;
        swapRows(data, rowIndex, rowIndex -1);
        return "ok";
    }

    function scale(rowIndex, scalar) {
        data.rows[rowIndex] = data.rows[rowIndex].map(calcScalar(scalar));
    };

    function remove(rowIndex) {
        data.rows = data.rows.filter((r, i) => i !== rowIndex);
    }
    
    function clear() {
        data.rows = [];
    }
    function row(rowIndex) {
        if (!isIndexOk(rowIndex)) return [];
        return data.rows[rowIndex];
    }
    function map(callback) {
        return data.rows.map(callback);
    }
    return {
        row,
        map,
        add,
        remove,
        clear,
        isIndexOk,
        addRows,
        moveUp,
        scale,
    };
}
