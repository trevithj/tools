import assert from "assert"; // built-in Node assertions
import MockDoc from "../mockDocument.js";
import { createRandomGenerator, generateRandomAscii, generateAsciiValues } from "../../docs/random/generators.js";

describe("createRandomGenerator fn", () => {
    it("should generate a deterministic float based on seed", () => {
        const randoms = [0,123,5000,0].map(seed => createRandomGenerator(seed));
        const results = [
            0.23606797284446657,
            0.2837369213812053,
            0.1738301084842533,
            0.23606797284446657 //same result as first
        ];
        results.forEach((result, i) => {
            assert.equal(randoms[i](), result);
        })
    });
})

describe("generateRandomAscii fn", () => {
    it("should generate a deterministic sequence based on seed", () => {
        const random = createRandomGenerator(0);
        const generate = generateRandomAscii(random, "0123456789abcdefg");
        const results = [
            generate(12),
            generate(12)
        ];
        results.forEach(result => {
            assert.equal(result.length, 12);
        })
        assert.equal(results[0], "44db6a5a89dc");
        assert.equal(results[1], "af08c56a8964");
    });
})

describe("generateAsciiValues fn", () => {
    it("should create expected sequence of characters", () => {
        const results = [
            generateAsciiValues({}),
            generateAsciiValues({max:39}),
            generateAsciiValues({min:40, max:48}),
            generateAsciiValues({min:48, max:58}),
            generateAsciiValues({min:58, max:65}),
            generateAsciiValues({min:65, max:91}),
        ];
        assert.equal(results[0].length, 126 - 32);
        assert.equal(results[1], ' !"#$%&');
        assert.equal(results[2], "()*+,-.\/");
        assert.equal(results[3], "0123456789");
        assert.equal(results[4], ":;<=>?@");
        assert.equal(results[5], "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    });
})
