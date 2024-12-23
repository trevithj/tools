export const NS = {
    SVG: "http://www.w3.org/2000/svg",
    HTML: "http://www.w3.org/1999/xhtml",
    MathML: "http://www.w3.org/1998/Math/MathML"
}

// Misc helper functions
export const select = (selector, el = document) => el.querySelector(selector);

export const selectAll = (selector, el = document) => el.querySelectorAll(selector);

export const makeElement = (type, className) => {
    const el = document.createElement(type);
    if (className) el.classList.add(className);
    return el;
}

export const makeSVGElement = type => document.createElementNS(NS.SVG, type);

export function getSelectors(element) {
    return Object.freeze({
        first: selector => select(selector, element),
        all: selector => selectAll(selector, element),
        byAttrib: (name, value) => selectAll(`[${name}="${value}"]`, element),
    });
}

// xmlns="http://www.w3.org/1999/xhtml

export function makeNSElement(namespace) {
    return (type, ...attributes) => {
        const el = document.createElementNS(namespace, type);
        attributes.forEach(attrib => {
            const [name, value] = attrib.split("=");
            el.setAttribute(name, value);
        });
        return el;
    }
}
