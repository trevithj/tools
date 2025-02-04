function makeElementMock(type = "div") {
    const vals = new Map();
    return { type, addEventListener: (event, handler) => vals.set(event, handler) };
}

function makeMockDoc() {
    const vals = new Map();
    return {
        vals,
        innerHTML: "",
        innerText: "",
        setAttribute:(name, value) => vals.set(name, ""+value),
        getAttribute:(name) => vals.get(name),
        querySelector: sel => {
            return makeElementMock();
        },
        querySelectorAll: sel => {
            return [];
        },
        appendChild() {},
    };
}

const MockDoc = makeMockDoc();

if (!globalThis.document) {
    // mock for Node testing if needed
    globalThis.document = MockDoc;
}

export default MockDoc;
