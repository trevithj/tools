import assert from "assert"; // built-in Node assertions
import {getStore} from "../../docs/gaussJordan/store.js";

describe("getStore fn", () => {
    it("should get a store", () => {
        const store = getStore();
        assert.equal(store.cols, 4);
        assert.equal(store.rows[0].length, 4);
        // checking that rowIndex check works
        assert.equal(store.isRowIndexOk(-1), false);
        assert.equal(store.isRowIndexOk(5), false);
        assert.equal(store.isRowIndexOk(2), true);

        // check that changing cols also changes rows
        store.cols = 6;
        assert.equal(store.rows[0].length, 6);
    });

    
    it("should scale a row as expected", () => {
        function makeRow() {
            return [1,2,3,4];
        }
        const store = getStore(makeRow);
        assert.equal(JSON.stringify(store.rows[0]), "[1,2,3,4]");
        // check that scaling a row works
        store.scaleRow(0, 3);
        assert.equal(JSON.stringify(store.rows[0]), "[3,6,9,12]");
    });

    it("should add rows as expected", () => {
        function makeRow(index) {
            return index === 0 ? [1,2,3,4] : [3,3,3,3];
        }
        const store = getStore(makeRow);
        assert.equal(JSON.stringify(store.rows[0]), "[1,2,3,4]");
        // check that adding a row works
        store.addRows(0, 2);
        assert.equal(JSON.stringify(store.rows[0]), "[4,5,6,7]");
    });


})

