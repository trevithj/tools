import {createStore} from 'zustand/vanilla'

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
    vCount: 0,
    values: [],
    rhs: [],
    coefficients: [],
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
                const rhs = coefficients.map(coeff => calcRow(coeff, values));
                return {values, vCount, message: "OK", coefficients, rhs};
            }),
            setValue: (index, newValue) => set(state => {
                const {vCount} = state;
                const values = [...state.values];
                values[index] = newValue;
                const {coefficients} = state;
                const rhs = coefficients.map(coeff => calcRow(coeff, values));
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

// export this so we can do dependency-injection for getStore - easier to test
export function makeCoefficients(state) {
    const {vCount} = state;
    const coefficients = Array.from({length: vCount}, () => {
        return Array.from({length: vCount}, () => (1 + rand(20)));
    });
    return coefficients;
}
