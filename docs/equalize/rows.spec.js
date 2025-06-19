import { describe, it, expect } from "vitest";
// import assert from "assert"; // built-in Node assertions
import {getRows} from "./rows.js";

describe("getRows fn", () => {
    it("should get a Rows matrix", () => {
        const rows = getRows(3);
        expect(rows.length).toBe(3);
        rows.forEach(row => {
            expect(row.length).toBe(4);
        })
    });

    it("should get a valid matrix", () => {
        const rows = getRows(2);
        expect(rows.length).toBe(2);
        rows.forEach(row => {
            expect(row.length).toBe(3);
        })
    });

    
})
