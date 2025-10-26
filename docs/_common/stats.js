// These two do pretty much the same job. TODO: pick one.

export function makeQuantile(sorted) {
    return q => {
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };
};

export function getPercentiles(vals) {
    const sorted = [...vals].sort();
    const n = sorted.length;
    return p => {
        if (n === 1) return sorted[0];
        const idx = p * (n - 1);
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        const weight = idx - lower;
        return sorted[lower] + weight * (sorted[upper] - sorted[lower]);
    }
}

///////

export function calcMean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function calcStdDev(arr, mean) {
    const m = mean === undefined ? calcMean(arr) : mean;
    const variance = arr.reduce((sum, x) => sum + ((x - m) ** 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

export function calcSigma(stdev, mean) {
    return x => mean - (stdev * x);
}

