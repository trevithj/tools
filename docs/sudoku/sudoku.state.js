import BASE from "../base.js";

///Send an event call after current thread has finished.
function sendAfter(name, value) {
    setTimeout(function () {
        BASE.send(name, value);
    }, 0);
}

///// Reducers /////
function historyR(state, action) {
    var val = state.history || [];
    switch (action.type) {
        case "UNDO":
            return val.slice(0, -1);
        case "UPDATE_CELL":
            return val.concat([state.cells]);
        default: return val;
    }
}


//flags array marks which digits are allowed, with one flag per digit.
//0 = yes, this digit is allowed.
//1 = no, this digit can't be set here.
//2 = this digit is set (so all other flags must be 1)
function makeCell(row, col, box) {
    return {
        flags: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        row: row,
        col: col,
        box: box
    };
}

function makeBoxCells(dRow, dCol, box) {
    return [
        makeCell(dRow + 1, dCol + 1, box),
        makeCell(dRow + 1, dCol + 2, box),
        makeCell(dRow + 1, dCol + 3, box),
        makeCell(dRow + 2, dCol + 1, box),
        makeCell(dRow + 2, dCol + 2, box),
        makeCell(dRow + 2, dCol + 3, box),
        makeCell(dRow + 3, dCol + 1, box),
        makeCell(dRow + 3, dCol + 2, box),
        makeCell(dRow + 3, dCol + 3, box)
    ];
}

function makeCells() {
    const ca = [
        ...makeBoxCells(0, 0, 1),
        ...makeBoxCells(0, 3, 2),
        ...makeBoxCells(0, 6, 3),
        ...makeBoxCells(3, 0, 4),
        ...makeBoxCells(3, 3, 5),
        ...makeBoxCells(3, 6, 6),
        ...makeBoxCells(6, 0, 7),
        ...makeBoxCells(6, 3, 8),
        ...makeBoxCells(6, 6, 9)
    ];
    ca.forEach(function (cell, i) {
        cell.index = i;
    });
    return ca;
}

//flagNum corresponds to a digit, value=new setting for this flag.
//eg, flagNum=8, value=1 means this cell can't contain a 9 (flagNum+1)
//eg, flagNum=6, value=2 means this cell now contains 7 (flagNum+1)
function updateCell(cell, flagNum, value) {
    //{index, flag, value}
    const flag = cell.flags[flagNum];//get the existing flag setting
    if (flag === 1 && value === 2) {//flag==1 means this digit value is forbidden
        sendAfter("ERROR", "Can't set this value here");
        return cell;
    }
    if (flag === value) {//flag already has that value
        //sendAfter("ERROR", "Nothing has changed");
        return cell;
    }
    const c2 = JSON.parse(JSON.stringify(cell));//deep clone
    if (value === 2) {//all other flags should be set to 'forbidden'
        c2.flags = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    }//else use existing flags
    c2.flags[flagNum] = value;
    return c2;
}

function doUpdateCells(cells, payload) {
    cells = [].concat(cells);
    const cell = cells[payload.index];
    const c2 = updateCell(cell, payload.flag, payload.value);
    if (c2 !== cell) {
        cells[payload.index] = c2;
        if (payload.value === 2) {	//check consequences of this change
            cells = cells.map(function (c3) {
                if (c3.index === c2.index) {return c3;}
                if (c3.row !== c2.row && c3.col !== c2.col && c3.box !== c2.box) {return c3;}
                return updateCell(c3, payload.flag, 1);
            });
        }
    }
    return cells;
}

function cellsR(state, action) {
    const val = state.cells || makeCells();
    switch (action.type) {
        case "RESET":
            return makeCells();
        case "UPDATE_CELL":
            return doUpdateCells(val, action.payload);
        case "UNDO":
            return state.history[state.history.length - 1];
        default: return val;
    }
}

function selectedCellR(state, action) {
    const val = state.selectedCell; //may be undefined
    switch (action.type) {
        case "SELECT_CELL":
            if (val !== undefined && action.payload.index === val.index) {
                return undefined; //deselect
            } //else a different cell
            return state.cells[action.payload.index];
        case "UPDATE_CELL":
            return undefined; //deselect
        default: return val;
    }
}


function gridR(state, action) {
    const val = state.grid || "working";
    switch (action.type) {
        case "SET_GRID":
            return action.payload;
        default: return val;
    }
}

export default function reducer(state, action) {
    state = state || {};
    return {
        history: historyR(state, action),
        prevState: state,
        cells: cellsR(state, action),
        selectedCell: selectedCellR(state, action),
        mode: "actual",
        grid: gridR(state, action),
        actionType: action.type
    };
}
