export function linksToMatrix(nodes, links) {
    // Map node.id → matrix index
    const idToIndex = {};
    nodes.forEach((node, idx) => {
        idToIndex[node.id] = idx;
    });

    const nodeCount = nodes.length;

    // Create matrix filled with zeros
    const matrix = Array.from({length: nodeCount}, () =>
        Array(nodeCount).fill(0)
    );

    // Fill in weights
    links.forEach(link => {
        const i = idToIndex[link.src];
        const j = idToIndex[link.tgt];
        if (i !== undefined && j !== undefined) {
            matrix[i][j] = link.wgt;
        }
    });

    return matrix;
}

export function checkRowSumsTo1(row) {
    const sum = row.reduce((sum, v) => sum + v, 0);
    return (sum.toFixed(3) === 1);
}

// export function checkRows(matrix, callback) {
//     matrix.forEach(row => {

//     })
// }

export function getDimensions(matrix) {
    if (!Array.isArray(matrix))
        throw new Error("Matrix must be a 2D array.");
    const rows = matrix.length;
    const col0 = rows === 0 ? [] : matrix[0];
    let cols = col0.length; //rows === 0 ? 0 : -1;
    // const cols = rows === 0 ? 0 : matrix[0].length;
    matrix.forEach(row => {
        if (!Array.isArray(row))
            throw new Error("Matrix has a non-array row.");
        if (row.length !== cols) throw new Error("Inconsistent columns in matrix");
    })
    return {rows, cols};
}

export function multiply(A, B) {
    const da = getDimensions(A);
    const db = getDimensions(B);

    // Check dimension compatibility: A.cols === B.rows
    if (da.cols !== db.rows) {
        throw new Error(`Cannot multiply: A is ${da.rows}×${da.cols}, B is ${db.rows}×${db.cols}`);
    }
    const result = Array.from({length: da.rows}, () =>
        Array(db.cols).fill(0)
    );
    for (let i = 0; i < da.rows; i++) {
        for (let j = 0; j < db.cols; j++) {
            for (let k = 0; k < da.cols; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

export function squareMatrix(matrix) {
    return multiply(matrix, matrix);
}

export function toTheNthPower(matrix, n=100) {
    const A = matrix;
    let B = matrix;
    while(n > 0) {
        n-=1;
        B = multiply(A, B);
    }
    B.forEach(row => {
        row.forEach((cell, i) => {
            row[i] = Math.round(cell*1000) / 1000;
        });
    })
    return B;
}