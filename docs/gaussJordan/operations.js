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
        // store.logs.unshift(msg);
        const logs = document.querySelectorAll("#logs > pre");
        // logs[0].innerHTML = store.logs.join("\n");
        logs[0].innerHTML = `${msg}\n${logs[0].innerHTML}`;
        logs[1].innerHTML = store.equations.join("\n");
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
