import { describe, it } from "vitest";
import assert from "assert"; // built-in Node assertions
import {getRows} from "./rows.js";

describe("getRows fn", () => {
    it("should get a Rows object", () => {
        const rows = getRows();
        rows.add([1,2,3,4]);
        rows.add([5,6,7,8]);
        assert.equal(rows.row(0).length, 4);
        // checking that rowIndex check works
        assert.equal(rows.isIndexOk(-1), false);
        assert.equal(rows.isIndexOk(5), false);
        assert.equal(rows.isIndexOk(1), true);
        // can move rows
        assert.equal(JSON.stringify(rows.row(0)), "[1,2,3,4]");
        rows.moveUp(1);
        assert.equal(JSON.stringify(rows.row(0)), "[5,6,7,8]");
    });

    
    it("should scale a row as expected", () => {
        const rows = getRows();
        rows.add([1,2,3,4]);
        assert.equal(JSON.stringify(rows.row(0)), "[1,2,3,4]");
        // check that scaling a row works
        rows.scale(0, 3);
        assert.equal(JSON.stringify(rows.row(0)), "[3,6,9,12]");
    });
    
    it("should scale without rounding errors", () => {
        function makeRow() {
            return [7,7,7,7];
        }
        const rows = getRows(makeRow);
        rows.add([7,7,7]);
        // check that scaling handles rounding glitches
        rows.scale(0, 1/3);
        rows.scale(0, 12);
        assert.equal(JSON.stringify(rows.row(0)), "[28,28,28]");
    });

    it("should add rows as expected", () => {
        const rows = getRows();
        rows.add([3,3,3,3]);
        rows.add([1,2,3,4]);
        assert.equal(JSON.stringify(rows.row(0)), "[3,3,3,3]");
        assert.equal(JSON.stringify(rows.row(1)), "[1,2,3,4]");
        // check that adding a row works
        rows.addRows(1, 0); // target-row, source-row
        assert.equal(JSON.stringify(rows.row(1)), "[4,5,6,7]");
        // source row is unaltered
        assert.equal(JSON.stringify(rows.row(0)), "[3,3,3,3]");
    });
})
