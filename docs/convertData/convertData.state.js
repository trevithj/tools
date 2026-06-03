import {strToNumberArray} from "../_common/convert.js";

//useful helper function
function setProp(prop, type, action) {
    return (action.type === type) ? action.payload : prop;
}

//check for and remove duplicates, add a row-count field
function collapseDuplicateLines(lines) {
    // TODO: use a Set for this
    var map = {}, titleRow = "_rows\t";
    lines.forEach(function (line, r) {
        if (r === 0) {
            titleRow += line;
        } else {
            var count = map[line] || 0;
            map[line] = count + 1;
        }
    });
    lines = Object.keys(map).map(function (key) {
        var count = map[key];
        return count + "\t" + key;
    });
    lines.unshift(titleRow);
    return lines;
}

function setRowHeadings(state, action) {
    var v = state.rowHeadings || [];
    if (action.type === "SET_DATA") {
        const i = action.payload.indexOf("\n");
        const line1 = action.payload.substr(0, i);
        v = strToNumberArray(line1);
    }
    return v;
}

function setRowCount(state, action) {
    var v = state.rowCount || 0;
    if (action.type === "SET_DATA") {
        const i = action.payload.indexOf("\n");
        const line1 = action.payload.substr(0, i);
        v = strToNumberArray(line1).length;
    }
    return v;
}

function setData(state, action) {
//    var cols = state.data.cols || [{name: "Empty", data: []}];//array of column objects
//    const colMap = state.columns || {}; //map of column-name => column-values-array
    if (action.type === "SET_DATA") {
        const cols = []; //new array
        const colMap = {};
        var lines = action.payload.split("\n");
        // if (state.collapseDuplicates) {
        //     lines = collapseDuplicateLines(lines);
        // }
        var colNames;
        lines.forEach(function (line, r) {
            const cells = strToNumberArray(line);
            if (r === 0) colNames = cells;
            cells.forEach(function (cell, c) {
                if (r === 0) {
                    cols.push({name: cell, data: []});
                } else {
                    var v = isNaN(cell) ? cell : +cell;
                    cols[c].data.push(v);

                    const colName = colNames[c];
                    const colData = colMap[colName] || [];
                    colData.push(v);
                    colMap[colName] = colData;
                }
            });
        });
        return { cols, colMap, colNames };
    } else {
        return state.data || { cols:[], colMap:{}, colNames:[]};
    }
}

function getUniqueValuesMap(da) {
    var unique = {};
    da.forEach(function (d) {
        if (unique[d] === undefined) {
            unique[d] = 0;
        }
        unique[d] += 1;
    });
    return unique;
}

function getDataTypes(da) {
    var types = {String: 0, Number: 0, Null: 0};
    da.forEach(function (d) {
        var type = "Null";
        switch (typeof d) {
            case "number":
                type = (isNaN(d)) ? "Null" : "Number";
                break;
            case "string":
                type = (isNaN(d)) ? "String" : "Number";
                type = (d === "") ? "Null" : type;
                break;
            //				default: type = "Null";
        }
        types[type] += 1;
    });
    return types;
}

function setStats(state, action) {
    var dt = state.stats || {};
    if (action.type === "CALC_STATS") {
        const { cols, colMap } = state.data;
        dt = {
            columnNames: Object.keys(colMap),
            uniqueMaps: cols.map(function (d) {
                return getUniqueValuesMap(d.data);
            }),
            dataTypes: cols.map(function (d) {
                return getDataTypes(d.data);
            })
        };
        dt.uniqueValues = dt.uniqueMaps.map(function (d) {
            var vals = Object.keys(d).map(function (v) {
                return isNaN(v) ? v : +v;
            });
            return vals.sort(function (a, b) {
                if (a == b) return 0;
                return (a < b) ? -1 : 1;
            });
        });
    }
    return dt;
}

// //set up reducer
// BASE.initState(function (state, action) {
function reducer(state, action) {
    state = state || {};
    return {
        view: setProp(state.view || "Input", "SET_VIEW", action),
        data: setData(state, action),
        rowCount: setRowCount(state, action),
        colHeadings: setRowHeadings(state, action),
        collapseDuplicates: true,
        stats: setStats(state, action),
        actionType: action.type
    };
};

export {reducer};
