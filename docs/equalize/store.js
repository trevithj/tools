import createStore from "../zustandVanilla.js";

function calcRow(row, values) {
    // A.x1 + B.x2 + ... = C
    let C = 0;
    values.forEach((x, i) => {
        const coef = row[i];
        C += (coef * x);
    });
    return C;
}

const INIT_STATE = {
    vCount: 2,
    values: [1, 1],
    coefficients: [],
    consts: [],
    rhs: [],
    message: ""
}

export const getStore = (makeCoefficients) => {
    const theStore = createStore((set) => {
        return {
            ...INIT_STATE,
            setVCount: (v) => set(() => {
                if (v < 2 || v > 5) return {message: "vCount out of range"};
                const vCount = Math.round(v);
                const values = Array.from({length: vCount}, () => 1);
                const coefficients = makeCoefficients({values, vCount});
                const consts = makeConsts({coefficients, vCount});
                const rhs = makeRHS({coefficients, consts, values});
                logRMS(rhs);
                return {values, vCount, message: "OK", coefficients, consts, rhs};
            }),
            setValue: (index, newValue) => set(state => {
                const {vCount, consts} = state;
                const values = [...state.values];
                values[index] = newValue;
                const {coefficients} = state;
                const rhs = makeRHS({coefficients, consts, values});
                logRMS(rhs);
                // const rhs = coefficients.map(coeff => calcRow(coeff, values));
                // console.log(values, coefficients);
                return {values, vCount, message: "OK", coefficients, rhs};
            })
        }
    });
    return theStore;
}

export const TheStore = getStore();

export function isDiffShallow(obj1, obj2, fields = []) {
    return fields.some(fieldName => obj1[fieldName] !== obj2[fieldName]);
}

function rand(max) {
    return Math.floor(Math.random() * max);
}

export function determinant(matrix) {
    const size = matrix.length;
    if (size === 1) return matrix[0][0];
    if (size === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    let det = 0;
    for (let i = 0; i < size; i++) {
        const minor = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
        det += (i % 2 === 0 ? 1 : -1) * matrix[0][i] * determinant(minor);
    }
    return det;
}

// export this so we can do dependency-injection for getStore - easier to test
export function makeCoefficients(state) {
    const {vCount} = state;
    const coefficients = Array.from({length: vCount}, () => {
        const sign = Math.random() > 0.5 ? 1 : -1;
        return Array.from({length: vCount}, () => (sign * (1 + rand(20))));
    });
    const d = determinant(coefficients);
    console.log("D", d);
    if (d === 0) return makeCoefficients(state);
    return coefficients;
}

function makeConsts(state) {
    const {vCount, coefficients} = state;
    const values = Array.from({length: vCount}, () => (2 + rand(19)));
    console.log("Target solution:", values);
    const ka = coefficients.map(row => {
        return calcRow(row, values);
    })
    return ka;
}

function makeRHS(state) {
    const {coefficients, consts, values} = state;
    const rhs = coefficients.map(coeff => calcRow(coeff, values));
    return rhs.map((v, i) => v - consts[i]);
}

function logRMS(vals) {
    const sumOfSquares = vals.reduce((s,v) => {
        return s + (v*v);
    }, 0);
    const mean = sumOfSquares / vals.length;
    console.log(Math.round(Math.sqrt(mean)*10)/10);
}