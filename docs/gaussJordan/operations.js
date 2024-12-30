// ---------------
export function getNumbers(label, defaultValue) {
    const values = prompt(label, defaultValue);
    if (!values) return {status: "cancelled "};
    try {
        const numbers = values.split(",").map(v => eval(v)); // allow entering expressions
        if (numbers.some(n => isNaN(n))) return {
            numbers, status: "invalid"
        };
        return {numbers, status: "ok"};
    } catch (err) {
        console.warn(err);
        return {status: `${err.message}, "${values}"`};
    }
}


export function getOperations(store) {

    function log(msg) {
        store.logs.unshift(msg);
        document.querySelector("#logs > pre").innerHTML = store.logs.join("\n");
    }

    function doMove(rowIndex) {
        const msg = store.moveRow(rowIndex);
        if (msg === "ok") log(`Row ${rowIndex} moved.`);
        else log(msg);
    }

    function doScale(rowIndex) {
        const {numbers, status} = getNumbers("How much to multiply row by?", 1);
        if (status !== "ok") return log(`Data entry status: ${status}`);
        const [scale] = numbers;
        store.scaleRow(rowIndex, scale);
        log(`Row ${rowIndex} multiplied by ${scale}.`)
    }

    function doAdd(rowIndex) {
        const {numbers, status} = getNumbers("Enter which row to add", 0);
        if (status !== "ok") return log(`Data entry status: ${status}`);
        const [refRowIndex] = numbers;
        const msg = store.addRows(rowIndex, refRowIndex);
        if (msg === "ok") log(`Row ${refRowIndex} added to Row ${rowIndex}.`);
        else log(msg);
    }

    return {
        log, doMove, doScale, doAdd
    };

}

export function getEquation(vals) {
    const variables = "abcdefghijklmnop".split("");
    const cells = vals.map((n, i) => {
        if (i+1 === vals.length) return ` = ${n}`;
        const prefix = i === 0 ? "" : " + ";
        if (n === 0) return "";
        const vName = variables[i];
        const coef = n === 1 ? "" : n;
        return `${prefix}${coef}${vName}`;
    });
    return cells.join("");
}
