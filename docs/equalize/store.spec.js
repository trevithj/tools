import {describe, it, expect, vi} from "vitest";
import getStore from "./store";

describe("getStore fn", () => {
    vi.spyOn(Math, "random").mockImplementation(() => 1);

    it("should get a store", () => {
        const store = getStore();
        let state = store.getState();
        expect(state.vCount).toBe(2);
        expect(state.values).toEqual([1, 1]);
        expect(state.coefficients.length).toEqual(2);
        expect(state.coefficients[0].length).toEqual(3);
        expect(state.coefficients[0]).toEqual([21, 21, 42]);

        state.setVCount(4);

        state = store.getState();
        expect(state.vCount).toBe(4);
        expect(state.values).toEqual([1, 1, 1, 1]);
        expect(state.message).toEqual("OK");
        expect(state.coefficients.length).toEqual(4);
        expect(state.coefficients[0]).toEqual([21, 21, 21, 21, 84]);
    });

})
