import {createStore} from 'zustand/vanilla'
import {calcPercents, clearInputs, getInputLabels, getInputValues, getStats, setInputValues} from "../boxPlot/calcs.js";

function getInitState(actionType) {
    const values = getInputValues();
    const labels = getInputLabels();
    const { stats, percents, scale } = calcStats(values, labels);
    const width = 800;
    const showData = false;
    return {stats, percents, values, labels, width, showData, scale, actionType}
}

function calcStats(values, labels) {
    setInputValues(values, labels);
    const stats = values.map(getStats)
        .map(stat => {
            const label = labels[stat.index];
            return {...stat, label}
        });
    const {percents, scale} = calcPercents(stats);
    return {stats, percents, scale};
}

const store = createStore((set) => ({
    ...getInitState("START"),
    actions: {
        start: () => set(() => {
            return getInitState("START");
        }),
        update: ({values, labels}) => set(() => {
            // const values = getInputValues();
            // const labels = getInputLabels();
            const {stats, percents, scale} = calcStats(values, labels);
            const actionType = "UPDATED";
            return {values, labels, stats, percents, scale, actionType};
        }),
        addRow: ({value, label}) => set(state => {
            const values = [...state.values, value];
            const labels = [...state.labels, label];
            const {stats, percents, scale} = calcStats(values, labels);
            const actionType = "ROW_ADDED";
            return {values, labels, stats, percents, scale, actionType};
        }),
        removeRow: (index) => set(state => {
            const values = state.values.filter((_, i) => i !== index);
            const labels = state.labels.filter((_, i) => i !== index);
            const {stats, percents, scale} = calcStats(values, labels);
            const actionType = "ROW_REMOVED";
            return {values, labels, stats, percents, scale, actionType};
        }),
        reset: () => set(() => {
            clearInputs();
            return getInitState("RESET");
        }),
        changeWidth: width => set(() => ({width, actionType: "WIDTH_CHANGED"})),
        toggleData: () => set((state) => ({showData: !state.showData, actionType: "DATA_TOGGLED"}))
    }
}));

export default store
