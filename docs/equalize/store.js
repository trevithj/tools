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

function makeCoefficients(state) {
    const { vCount, values } = state;
    const coefficients = Array.from({ length: vCount}, () => {
        const row = Array.from({ length: vCount+1}, () => (1 + rand(20)));
        return updateRow(row, values);
    });
    return coefficients;
}

const INIT_STATE = {
    vCount: 2,
    values: [1, 1],
    message: ""
}

const getStore = () => createStore((set) => ({
    ...INIT_STATE,
    coefficients: makeCoefficients(INIT_STATE),
    setVCount: (v) => set(() => {
        if (v < 2 || v > 5) return {message: "vCount out of range"};
        const vCount = Math.round(v);
        const values = Array.from({ length: vCount}, () => 1);
        const coefficients = makeCoefficients({values, vCount});
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

export default getStore;
// const { getState, setState, subscribe, getInitialState } = store
