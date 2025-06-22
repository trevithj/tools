import {describe, it, expect, vi} from "vitest";
import { getStore, isDiffShallow } from "./store";

describe("getStore fn", () => {
    vi.spyOn(Math, "random").mockImplementation(() => 1/20);

    it("should get a store", () => {
        const store = getStore();
        let state = store.getState();
        expect(state.vCount).toBe(2);
        expect(state.values).toEqual([1, 1]);
        expect(state.coefficients.length).toEqual(2);
        expect(state.coefficients[0].length).toEqual(3);
        expect(state.coefficients[0]).toEqual([2, 2, 4]);

        state.setVCount(4);

        state = store.getState();
        expect(state.vCount).toBe(4);
        expect(state.values).toEqual([1, 1, 1, 1]);
        expect(state.message).toEqual("OK");
        expect(state.coefficients.length).toEqual(4);
        expect(state.coefficients[0]).toEqual([2, 2, 2, 2, 8]);
    });

    it("should update values", () => {
        const store = getStore();
        let state = store.getState();
        expect(state.values).toEqual([1, 1]);
        expect(state.coefficients[0]).toEqual([2, 2, 4]);

        state.setValue(0, 5);
        state.setValue(1, 3);

        state = store.getState();
        expect(state.values).toEqual([5, 3]);
        expect(state.coefficients[0]).toEqual([2, 2, 16]);
    })

    it("should update values", () => {
        const store = getStore();
        let state = store.getState();
        expect(state.values).toEqual([1, 1]);
        expect(state.coefficients[0]).toEqual([2, 2, 4]);

        state.setValue(0, 5);
        state.setValue(1, 3);

        state = store.getState();
        expect(state.values).toEqual([5, 3]);
        expect(state.coefficients[0]).toEqual([2, 2, 16]);
    })

})

describe('isDiffShallow', () => {
    it('should default to false', () => {
        const result = isDiffShallow();
        expect(result).toBe(false);
    });

    it('should identify changes', () => {
        const obj1 = {b:[1,2,3], c:"hello", d:[] }
        const obj2 = {...obj1, a:1, b:[1,2,3] };
        // true-tests identify any changes
        [
            ["a","b","c", "d"],
            ["a","c"],
            ["a"],
            ["b"],
        ].forEach(fields => {
            const result = isDiffShallow(obj1, obj2, fields);
            expect(result).toBe(true);
        });
        // false-tests ignore same field values
        [
            ["c", "d"],
            ["c"],
            ["d"]
        ].forEach(fields => {
            const result = isDiffShallow(obj1, obj2, fields);
            expect(result).toBe(false);
        });
    });
});