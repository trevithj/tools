const _canvas = document.createElement('canvas');
const _ctx = _canvas.getContext('2d');

const DEFAULT_FONT = "normal 16px sans-serif"

export function measureTextWidth(text, cssFont = DEFAULT_FONT) {
    if (!_ctx) return 0;

    _ctx.font = cssFont;
    const metric = _ctx.measureText(text);
    // return metric.width;
    return metric.actualBoundingBoxRight - metric.actualBoundingBoxLeft;
}

export function svgEl(tag, attribs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attribs)) el.setAttribute(k, v);
    return el;
}

const DEFAULT_CONFIG = {
    lineHeight: 20,
    font: DEFAULT_FONT,
    padX: 8, padY: 8,
};

export function prepareNode(config = DEFAULT_CONFIG) {
    const {lineHeight, font, padX, padY} = {...DEFAULT_CONFIG, ...config};

    return node => {
        const width = padX + padX + Math.max(...node.lines.map(l => measureTextWidth(l, font)));
        const height = padY + padY + node.lines.length * lineHeight;
        const box = {
            cx: node.x || 0, cy: node.y || 0,
            width,
            height,
            get x() {return this.cx - (width / 2);},
            get y() {return this.cy - (height / 2);}
        }
        const type = node.type.replaceAll(" ", "_");
        return {...node, type, box, config}
    }
}

export function makeNodes(nodes, config = DEFAULT_CONFIG) {
    const enhancedNodes = nodes.map(prepareNode(config));
    return enhancedNodes.map(makeNode);
}

export function makeNode(nodeData) {
    const {type, box, config} = nodeData;
    const {lineHeight, font, padX} = config;
    const cls = `node-${type}`;

    const g = svgEl('g', {
        class: `${cls}-group`,
        transform: `translate(${box.x}, ${box.y})`,
    });

    const rectStyle = `fill: var(--node-${type}-color-bg, silver); stroke: var(--node-${type}-color-fg, black);`;

    const rect = svgEl('rect', {
        class: `${cls}__rect`,
        width: box.width,
        height: box.height,
        style: rectStyle,
    });

    const text = svgEl('text', {
        class: `${cls}__label`,
        y: 0,
    });
    text.style.fill = `var(--node-${type}-color-fg, blue)`;

    nodeData.lines.forEach((line, i) => {
        const tspan = svgEl('tspan', {
            x: padX,
            dy: i === 0 ? lineHeight : lineHeight,
            style: "font:" + font,
        });
        tspan.textContent = line;
        text.appendChild(tspan);
    });

    g.appendChild(rect);
    g.appendChild(text);
    g.__data = nodeData;
    return g;
}
