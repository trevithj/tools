function hex2Decimal(hexString) {
    return Number.parseInt(hexString, 16);
}

export function decimal2Hex(decimalNumber) {
    const hex = Math.abs(decimalNumber).toString(16);
    return `0${hex}`.slice(-2);
}

export function extrapolate(n1, n2, factor = 0.5) {
    const range = n2 - n1;
    return Math.round(n1 + factor*(range));
}

export function hex2RGB(hexColourCode) {
    hexColourCode = hexColourCode.replace("#", "");
    return [
        hex2Decimal(hexColourCode.slice(0,2)),
        hex2Decimal(hexColourCode.slice(2,4)),
        hex2Decimal(hexColourCode.slice(4,6))
    ];
}

export function RGB2Hex(rgb) {
    return [
        "#",
        decimal2Hex(rgb[0]),
        decimal2Hex(rgb[1]),
        decimal2Hex(rgb[2])
    ].join("");
}

export function extrapolateRGB(rgb1, rgb2, factor = 0.5) {
    return [
        extrapolate(rgb1[0], rgb2[0], factor),
        extrapolate(rgb1[1], rgb2[1], factor),
        extrapolate(rgb1[2], rgb2[2], factor),
    ];
}

export function extrapolateColrCodes(colr1, colr2, barCount) {
    const length = barCount -1;
    const colrCodes = Array.from({ length}, (_, i) => {
        const factor = i / length;
        const rgb = extrapolateRGB(hex2RGB(colr1), hex2RGB(colr2), factor);
        return RGB2Hex(rgb);
    });
    colrCodes.push(colr2.toLowerCase());
    return colrCodes;
}

/*
Notes: setting element style is a matter of using the right setter on the `element.style` property. Eg: `element.style.backgroundColor = "red"`.

*/
