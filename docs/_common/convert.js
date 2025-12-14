export function strToNumberArray(str = "") {
  //strip out any character that isn't a digit, period or minus, then split into numbers.
  return str.replace(/[^\d.-]/g, '|')
    .split('|')
    .flatMap(v => {
      const n = Number.parseFloat(v.trim());
      return isNaN(n) ? [] : [n];
    });
}

export function stringToIntHash(str) {
  const hash = str.split("").reduce((h, char) => {
    h = (h << 5) - h + char.charCodeAt(0);
    h |= 0;
    return h;
  }, 0);
  return Math.abs(hash);
}
