export function extrapolate(n1, n2, factor = 0.5) {
    const range = n2 - n1;
    return Math.round(n1 + (factor * range));
}

export function extrapolateHueCodes(colr1, colr2, barCount) {
    colr1 = parseInt(colr1);
    colr2 = parseInt(colr2);
    const length = barCount -1;
    const hueCodes = Array.from({ length}, (_, i) => {
        const factor = i / length;
        return extrapolate(colr1, colr2, factor);
    });
    hueCodes.push(colr2);
    return hueCodes;
}
