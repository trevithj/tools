// Not for instantiating, but for sub-classing.

export class ComponentBase extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    getFloatAttribute(name, defaultValue = 0) {
        return parseFloat(this.getAttribute(name)) || defaultValue;
    }

    getIntAttribute(name, defaultValue = 0) {
        return parseInt(this.getAttribute(name)) || defaultValue;
    }

    render() {
        this.shadowRoot.innerHTML = "Pending";
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

}

export function makeCircle(cx, cy, r = 3, fill = "black") {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`;
}
export function makeLine(x1, x2, y1, y2, stroke = "black") {
    return `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke="${stroke}" />`;
}

export function makeRect(x, y, width, height, fill = "lightGrey") {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="black" />`;
}

export function makeText(x,y,text, fontSize = "10") {
    return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fontSize}">${text}</text>`;
}
