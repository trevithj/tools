import BASE from "../base.js";
// TODO: rework this to do direct manipulation of top-level elements,
// instead of re-rendering each time. Easier to set event-listeners.

const display = BASE.select(".view");
//renderers

function makeTextArea(name, content) {
    return [
        '<textarea class="form-control input" name="', name, '"',
        'rows="16" cols="70" >',
        content,
        '</textarea>'
    ].join("");
}

function makeColHeaders(cols) {
    return cols.map(function (col) {
        return '<th class="byCol">' + col.name + '</th>';
    }).join("\n");
}

function makeTableRows(cols) {
    var rows = [];
    cols[0].data.forEach(function (ignore, r) {
        rows.push("<tr>");
        cols.forEach(function (col) {
            rows.push("<td>");
            rows.push(col.data[r]);
            rows.push("</td>");
        });
        rows.push("</tr>");
    });
    return rows.join("\n");
}

function makeTableView(state) {
    const { cols } = state.data;
    console.dir(cols);
    return [
        '<table><thead><tr>',
        makeColHeaders(cols),
        '</tr></thead><tbody>',
        makeTableRows(cols),
        '</tbody></table>'
    ].join("");
}

function makeStatsView(state) {
    function makeTableRow(rowTitle, rowData) {
        var row = rowData.map(function (d) {
            return '<td>' + d + '</td>';
        });
        row.unshift('</th>');
        row.unshift(rowTitle);
        row.unshift('<tr><th class="byRow">');
        row.push('</tr>');
        return row.join("");
    }
    var stats = state.stats;
    // function sorter(a, b) {
    //     if (isNaN(a) || isNaN(b)) {return a - b;}
    //     return
    // }
    return [
        '<table><tbody>',
        makeTableRow("Column names:", stats.columnNames),
        makeTableRow("Unique values:", stats.uniqueMaps.map(function (d) {
            return Object.keys(d).length;
        })),
        makeTableRow("Numeric values:", stats.dataTypes.map(function (d) {
            return d.Number;
        })),
        makeTableRow("String values:", stats.dataTypes.map(function (d) {
            return d.String;
        })),
        makeTableRow("Empty values:", stats.dataTypes.map(function (d) {
            return d.Null;
        })),
        makeTableRow("Min/first values:", stats.uniqueValues.map(function (d) {
            return d[0];
        })),
        makeTableRow("Max/last values:", stats.uniqueValues.map(function (d) {
            return d[d.length - 1];
        })),
        '</tbody></table>'
    ].join("");
}

function makeSankeyView() {
    return [
        '<svg><g id="theViz"></g></svg>'
    ].join("");
}


function makeView(state) {
    switch (state.view) {
        case "Input":
            return makeTextArea("data", localStorage.getItem("RawData"));
        case "Table":
            return makeTableView(state);
        case "Stats":
            return makeStatsView(state);
        case "Sankey":
            return makeSankeyView(state);
        default:
            return "Unknown View";
    }
}

function render(state) {
    console.log(state);
    if (state.actionType === "SET_VIEW") {
        Array.from(BASE.selectAll("button.control-btn")).forEach(btn => {
            if (state.view === btn.innerText) {
                btn.classList.replace("btn-default", "btn-primary");
            } else {
                btn.classList.replace("btn-primary", "btn-default");
            }
        });
        display.innerHTML = makeView(state);

        if (state.view === "Input") {
            const input = BASE.select('textarea[name="data"]');
            input.focus();
            input.addEventListener("blur", e => {
                BASE.send("INPUT", e.target.value);
            })
        // } else if (state.view === "Sankey") {
        //     var rows = [
        //         {_rows: 13, class: "Second Class", age: "Child", sex: "Female", survived: "Survived"},
        //         {_rows: 11, class: "Second Class", age: "Child", sex: "Male", survived: "Survived"},
        //         {_rows: 80, class: "Second Class", age: "Adult", sex: "Female", survived: "Survived"},
        //         {_rows: 13, class: "Second Class", age: "Adult", sex: "Female", survived: "Perished"},
        //         {_rows: 14, class: "Second Class", age: "Adult", sex: "Male", survived: "Survived"},
        //         {_rows: 154, class: "Second Class", age: "Adult", sex: "Male", survived: "Perished"},
        //         {_rows: 1, class: "First Class", age: "Child", sex: "Female", survived: "Survived"},
        //         {_rows: 5, class: "First Class", age: "Child", sex: "Male", survived: "Survived"},
        //         {_rows: 140, class: "First Class", age: "Adult", sex: "Female", survived: "Survived"},
        //         {_rows: 4, class: "First Class", age: "Adult", sex: "Female", survived: "Perished"},
        //         {_rows: 57, class: "First Class", age: "Adult", sex: "Male", survived: "Survived"},
        //         {_rows: 118, class: "First Class", age: "Adult", sex: "Male", survived: "Perished"},
        //         {_rows: 14, class: "Third Class", age: "Child", sex: "Female", survived: "Survived"},
        //         {_rows: 17, class: "Third Class", age: "Child", sex: "Female", survived: "Perished"},
        //         {_rows: 13, class: "Third Class", age: "Child", sex: "Male", survived: "Survived"},
        //         {_rows: 35, class: "Third Class", age: "Child", sex: "Male", survived: "Perished"},
        //         {_rows: 76, class: "Third Class", age: "Adult", sex: "Female", survived: "Survived"},
        //         {_rows: 89, class: "Third Class", age: "Adult", sex: "Female", survived: "Perished"},
        //         {_rows: 75, class: "Third Class", age: "Adult", sex: "Male", survived: "Survived"},
        //         {_rows: 387, class: "Third Class", age: "Adult", sex: "Male", survived: "Perished"},
        //         {_rows: 20, class: "Crew", age: "Adult", sex: "Female", survived: "Survived"},
        //         {_rows: 3, class: "Crew", age: "Adult", sex: "Female", survived: "Perished"},
        //         {_rows: 192, class: "Crew", age: "Adult", sex: "Male", survived: "Survived"},
        //         {_rows: 670, class: "Crew", age: "Adult", sex: "Male", survived: "Perished"}
        //     ];
            // var chart = d3.parsets();
            // chart.dimensions(state.rowHeadings);
            // chart.value(function (d) {
            //     return d._rows;
            // });
            // var viz = d3.select("svg")
            //     .attr("width", chart.width()).attr("height", chart.height());
            // viz = viz.select("g#theViz");
            // viz.datum(rows).call(chart);
            // renderSankeyDiagram(rows, "svg");
        }
    }
};

export {render};

// function renderSankeyDiagram(data, containerSelector) {
//     // Set up the dimensions and margins of the diagram
//     const width = 500;
//     const height = 400;

//     // Create the SVG container
//     const svg = d3.select(containerSelector)
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);

//     // Create the Sankey generator
//     const sankey = d3.sankey()
//         .nodeWidth(15)
//         .nodePadding(10)
//         .size([width, height]);

//     // Generate the Sankey diagram layout
//     const {nodes, links} = sankey(data);

//     // Create the links
//     svg.append("g")
//         .selectAll(".link")
//         .data(links)
//         .enter()
//         .append("path")
//         .attr("class", "link")
//         .attr("d", d3.sankeyLinkHorizontal())
//         .style("stroke", "gray")
//         .style("stroke-width", d => d.width)
//         .style("fill", "none");

//     // Create the nodes
//     svg.append("g")
//         .selectAll(".node")
//         .data(nodes)
//         .enter()
//         .append("rect")
//         .attr("class", "node")
//         .attr("x", d => d.x0)
//         .attr("y", d => d.y0)
//         .attr("width", d => d.x1 - d.x0)
//         .attr("height", d => d.y1 - d.y0)
//         .style("fill", "steelblue");

//     // Add labels to the nodes
//     svg.append("g")
//         .selectAll(".label")
//         .data(nodes)
//         .enter()
//         .append("text")
//         .attr("class", "label")
//         .attr("x", d => d.x0 - 6)
//         .attr("y", d => (d.y1 + d.y0) / 2)
//         .attr("dy", "0.35em")
//         .attr("text-anchor", "end")
//         .text(d => d.name)
//         .style("fill", "black")
//         .style("font-size", "12px");
// }

// // Example usage
// const data = {
//     nodes: [
//         {name: "A"},
//         {name: "B"},
//         {name: "C"},
//         {name: "D"}
//     ],
//     links: [
//         {source: 0, target: 1, value: 20},
//         {source: 0, target: 2, value: 30},
//         {source: 1, target: 3, value: 10},
//         {source: 2, target: 3, value: 25}
//     ]
// };

// renderSankeyDiagram(data, "sankey-container");

