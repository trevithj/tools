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
    const sorted = [...vals].sort((a, b) => a - b);
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

export function minMax(values) {
    return values.reduce((range, val) => {
        val = isNaN(val) ? 0 : val;
        range[0] = Math.min(range[0], val);
        range[1] = Math.max(range[1], val);
        return range;
    }, [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]);
}

export function movingAverages(arr, n) {
    if (arr.length < n || n <= 0) {
        return [];
    }

    return arr.flatMap((_, i) => {
        // Only calculate when we have enough elements for a complete window
        if (i < n - 1) return [];
        const window = arr.slice(i - n + 1, i + 1);
        return window.reduce((sum, val) => sum + val, 0) / n;
    });
}