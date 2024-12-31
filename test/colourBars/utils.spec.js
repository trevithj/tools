import assert from "assert"; // built-in Node assertions
import * as Utils from "../../docs/colourBars/utils.js";

it("hex2RGB fn should work", () => {
    const { hex2RGB } = Utils;
    const tests = [
        ["#ff000a", 255, 0, 10],
        ["#101010", 16, 16, 16],
    ]
    tests.forEach(test => {
        const [hexCode, ...expected] = test;
        const result = hex2RGB(hexCode);
        assert.equal(result.length, 3);
        result.forEach((c, i) => {
            assert.equal(c, expected[i]);
        })
    })
})

it("decimal2Hex fn should work", () => {
    const { decimal2Hex } = Utils;
    const tests = [
        [10, "0a"],
        [255, "ff"],
        [0, "00"],
    ]
    tests.forEach(pair => {
        const [dec, expected] = pair;
        const result = decimal2Hex(dec);
        assert.equal(result, expected);
    })
});

it("extrapolate fn should work with defaults", () => {
    const { extrapolate } = Utils;
    const tests = [
        [0, 10, 5],
        [10, 20, 15],
        [256, 0, 128]
    ];
    tests.forEach(test => {
        const [n1, n2, expected] = test;
        const result = extrapolate(n1, n2);
        assert.equal(result, expected);
    })
});

it("extrapolate fn should work with given factors", () => {
    const { extrapolate } = Utils;
    const tests = [
        [0, 100, 0.25, 25],
        [100, 0, 0.25, 75],
        [0, 100, 0.3333, 33],
        [0, 100, 1.0, 100],
        [154, 0, 3/16, 125],
    ];
    tests.forEach(test => {
        const [n1, n2, factor, expected] = test;
        const result = extrapolate(n1, n2, factor);
        assert.equal(result, expected);
    })
});

it("extrapolateRGB fn should work", () => {
    const { extrapolateRGB } = Utils;
    const results = [
        extrapolateRGB([0,0,0], [200,200,200]),
        extrapolateRGB([50,40,30], [0,0,0], 0.9),
    ];
    const expecteds = [
        [100,100,100],
        [5,4,3]
    ]
    expecteds.forEach((expected, i) => {
        const result = results[i];
        expected.forEach((v, j) => {
            assert.equal(result[j], v);
        })
    })
})

it("extrapolateColrCodes fn should work", () => {
    const { extrapolateColrCodes } = Utils;
    const results = [
        extrapolateColrCodes("#000000", "#d0d0d0", 3),
        extrapolateColrCodes("#FF00FF", "#00FF00", 3),
    ];
    const expecteds = [
        ["#000000","#686868","#d0d0d0"],
        ["#ff00ff","#808080","#00ff00"],
    ]
    expecteds.forEach((expected, i) => {
        const result = results[i];
        expected.forEach((v, j) => {
            assert.equal(result[j], v);
        })
    });
})
