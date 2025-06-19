export function getRows(n) {
    const row = Array.from({ length: n+1 }, () => 1);
    return Array.from({length: n }, () => row);
}