// Via ChatGPT, needs refining
export function createRandomGenerator(seed) {
    // LCG constants (commonly used values)
    const a = 1664525; // Multiplier
    const c = 1013904223; // Increment
    const m = Math.pow(2, 32); // Modulus (2^32)

    let state = seed % m; // Ensure seed is within bounds

    // The generator function
    return function getRandom() {
        state = (a * state + c) % m; // Generate the next value
        return state / m; // Return a floating-point number between 0 and 1
    }
}

export function generateRandomAscii(getRandom, valueString) {
    const randomChar = () => pickRandomArrayItem(getRandom, valueString);
    return function generate(length) {
        return Array.from({ length }, randomChar).join("");
    }
}

export function generateAsciiValues({min = 32, max = 126}) {
    min = Math.max(min, 32);
    max = Math.min(max, 126);
    const length = max - min;
    return Array.from({ length }, (_, i) => {
        const asciiCode = min + i;
        return String.fromCharCode(asciiCode);
    }).join("");
}

function pickRandomArrayItem(getRandom, array) {
    if (array.length === 0) return null;
    if (array.length === 1) return array[0];
    const index = Math.floor(getRandom() * array.length);
    return array[index];
}
