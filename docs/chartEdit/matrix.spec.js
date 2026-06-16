import {describe, it, expect} from "vitest";
import {multiply, squareMatrix} from "./matrix.js";

describe('squareMatrix', () => {
    it('should correctly square the matrix', () => {
        const matrix = [
            [0, 1, 0],
            [0, 0, 1],
            [1, 0, 0]
        ];
        const result = squareMatrix(matrix);
        expect(result[0]).toEqual([0, 0, 1]);
        expect(result[1]).toEqual([1, 0, 0]);
        expect(result[2]).toEqual([0, 1, 0]);
    });
});

describe('multiply', () => {
    it('should multiply square matrices', () => {
        const A = [
            [1, 2],
            [3, 4]
        ];
        const B = [
            [5, 6],
            [7, 8]
        ];
        const C = multiply(A, B);
        expect(C[0]).toEqual([19, 22]);
        expect(C[1]).toEqual([43, 50]);
    });

    it('should multiply rectangular matrices', () => {
        const A = [
            [1, 2]
        ];
        const B = [
            [5],
            [7]
        ];
        const C = multiply(A, B);
        expect(C[0]).toEqual([19]);
    });
});

