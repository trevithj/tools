import BASE from "../base.js";

///////// View rendering /////////
const display = document.querySelector('#display');
const view = {};

export function initView() {
    view.main = display.querySelector("#main");
    view.main.innerHTML = "";
    view.undoBtn = display.querySelector("button[name='undo']");
    view.workBtn = display.querySelector("button[name='work']");
    view.stndBtn = display.querySelector("button[name='stnd']");
}

function makeFlagTD(cell, flagNum) {
    const flag = cell.flags[flagNum];
    return [
        '<td class="flag flag-', flag,
        '" onclick="BASE.send(\'CELL_CLICKED\',{index:', cell.index, ', flag:', flagNum, '})">',
        (flagNum + 1), '</td>'
    ];
}

function makeCellTable(cell) {
    return [].concat(
        '<table class="cellTable"><tbody><tr>',
        makeFlagTD(cell, 0), makeFlagTD(cell, 1), makeFlagTD(cell, 2),
        '</tr><tr>',
        makeFlagTD(cell, 3), makeFlagTD(cell, 4), makeFlagTD(cell, 5),
        '</tr><tr>',
        makeFlagTD(cell, 6), makeFlagTD(cell, 7), makeFlagTD(cell, 8),
        '</tr></tbody></table>'
    );
}

function makeCell(cell, state) {
    if (state.grid === 'working') {
        return makeCellTable(cell);
    } else {
        const sel = state.selectedCell;
        const selClass = (sel !== undefined && sel.index === cell.index) ? "selected" : "";
        let v = cell.flags.indexOf(2);
        v = (v === -1) ? "&nbsp;" : (v + 1);
        return ['<div class="standard ', selClass, '" ',
            'onclick="BASE.send(\'CELL_CLICKED\',{index:', cell.index, '})">',
            v, '</div>'
        ];
    }
}


function makeRow(row, state) {
    const tr = row.map(function (cell) {
        const ra = [].concat(
            '<td class="box box-', cell.box, '">', makeCell(cell, state), '</td>'
        );
        return ra.join("");
    });
    return ["<tr>"].concat(tr, "</tr>");
}

function renderRows(rows, state) {
    const html = rows.map(function (row) {
        return makeRow(row, state).join("\n");
    });
    view.main.innerHTML = html.join("");
}


function filterByRow(cells, row) {
    const ra = cells.filter(function (cell) {
        return cell.row === row;
    });
    ra.sort(function (c1, c2) {
        return c1.col - c2.col;
    });
    return ra;
}

function getRows(cells) {
    return [
        filterByRow(cells, 1),
        filterByRow(cells, 2),
        filterByRow(cells, 3),
        filterByRow(cells, 4),
        filterByRow(cells, 5),
        filterByRow(cells, 6),
        filterByRow(cells, 7),
        filterByRow(cells, 8),
        filterByRow(cells, 9)
    ];
}

function renderNumberBtns(state) {
    //buttons at bottom of standard screen, 1-9
    //all disabled if no cell selected
    //else only allowed numbers are enabled.
    //on-click, update that cell.
    const na = "0123456789X".split("");
    const row = na.map(function (n) {
        switch (n) {
            case "0": return "<tr>";
            case "X": return "</tr>";
            default: return makeNumberBtn(n, state.selectedCell);
        }
    });
    view.main.innerHTML = view.main.innerHTML + row.join("");
}

function makeNumberBtn(n, sel) {
    const flag = (+n) - 1;
    let indx = -1;
    let dis = 'disabled="disabled"';
    let onc = '';
    if (sel) {
        dis = (sel.flags[flag] === 0) ? '' : dis;
        indx = sel.index;
    }
    onc = (dis === '') ? ['BASE.send(\'NBR_CLICKED\', {index:', indx, ',flag:', flag, '});'].join("") : onc;
    return [
        '<td><button class="btn btn-sm btn-primary" style="width:95%" ', dis,
        ' onclick="', onc, '"',
        '>', n, '</button></td>'
    ].join("");
}

export function render (state) {
    const rows = getRows(state.cells);
    renderRows(rows, state);
    if (state.grid === "standard") {
        renderNumberBtns(state);
    }
    toggle(view.undoBtn, state.history.length === 0);
    toggle(view.workBtn, state.grid === "working");
    toggle(view.stndBtn, state.grid === "standard");
};

function toggle(btn, flag) {
    if (flag) {
        btn.setAttribute("disabled", "");
    } else {
        btn.removeAttribute("disabled");
    }
}

BASE.value("VIEW", view);
