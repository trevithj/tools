import {createStore} from 'zustand/vanilla'

function rand(max) {
    return Math.round(Math.random() * max);
}

function updateRow(row, values) {
    // A.x1 + B.x2 + ... = C
    let C = 0;
    values.forEach((x, i) => {
        const coef = row[i];
        C += (coef * x);
    });
    row[row.length-1] = C;
    return row;
}

function updateRows(coefficients, values) {
    return coefficients.map(row => updateRow(row, values));
}

function makeCoefficients(state) {
    const { vCount, values } = state;
    const coefficients = Array.from({ length: vCount}, () => {
        return Array.from({ length: vCount+1}, () => (1 + rand(20)));
    });
    updateRows(coefficients, values);
    return coefficients;
}

const INIT_STATE = {
    vCount: 2,
    values: [1, 1],
    message: ""
}

export const getStore = () => createStore((set) => ({
    ...INIT_STATE,
    coefficients: makeCoefficients(INIT_STATE),
    setVCount: (v) => set(() => {
        if (v < 2 || v > 5) return {message: "vCount out of range"};
        const vCount = Math.round(v);
        const values = Array.from({ length: vCount}, () => 1);
        const coefficients = makeCoefficients({values, vCount});
        return { values, vCount, message: "OK", coefficients };
    }),
    setValue: (index, newValue) => set(state => {
        const { vCount } = state;
        const values = [...state.values];
        values[index] = newValue;
        const coefficients = updateRows(state.coefficients, values);
        // console.log(values, coefficients);
        return { values, vCount, message: "OK", coefficients };

    })
    // status: "ok",
    // push: qty => set(state => {
    //     if (qty < 0) {
    //         return { status: "Error - can't push a negative qty" };
    //     } 
    //     return { soh: state.soh + qty, status: "ok" }; 
    // }),
    // pull: qty => set(state => {
    //     const newQty = state.soh - qty;
    //     if(newQty < 0) {
    //         return { status: "Error - insufficient stock" };
    //     }
    //     return { status: "ok", soh: newQty };
    // }),
}));

export const TheStore = getStore(); 
// const { getState, setState, subscribe, getInitialState } = store

export function isDiffShallow(obj1, obj2, fields = []) {
    return fields.some(fieldName => obj1[fieldName] !== obj2[fieldName]);
}
