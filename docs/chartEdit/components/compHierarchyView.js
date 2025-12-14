const HTML = `
<style>
:host {
    display: block;
    width: 100%;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

button:active {
    transform: translateY(0);
}

.zoom-controls {
    display: flex;
    gap: 5px;
    align-items: center;
}

.zoom-btn {
    padding: 8px 16px;
    font-size: 18px;
    line-height: 1;
}

#svgContainer {
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    margin-top: 25px;
    background: #f7fafc;
    overflow: hidden;
    width: 100%;
    height: 600px;
}

#svg {
    cursor: grab;
    width: 100%;
    height: 100%;
}

#svg:active {
    cursor: grabbing;
}

.error {
    color: #e53e3e;
    background: #fff5f5;
    border: 1px solid #feb2b2;
    padding: 12px;
    border-radius: 8px;
    margin-top: 15px;
    font-size: 14px;
    display: none;
}

.controls {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    flex-wrap: wrap;
}

.link {
    fill: none;
    stroke: #a0aec0;
    stroke-width: 2;
}

.node-rect {
    fill: url(#nodeGradient);
    stroke: #5a67d8;
    stroke-width: 2;
    rx: 8;
}

.node-text {
    fill: white;
    font-size: 14px;
    font-weight: bold;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
}
</style>

<div class="controls">
<button id="resetBtn">Reset View</button>
<div class="zoom-controls">
    <button class="zoom-btn" id="zoomInBtn">+</button>
    <button class="zoom-btn" id="zoomOutBtn">-</button>
</div>
</div>

<div id="error" class="error"></div>

<div id="svgContainer">
<svg id="svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    </defs>
    <g id="mainGroup"></g>
</svg>
</div>
`;

const SVG_NS = 'http://www.w3.org/2000/svg';

class HierarchyView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.networkData = null;
        this.nodePositions = {};
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.currentTransform = {x: 0, y: 0, scale: 1};
        this.shadowRoot.innerHTML = HTML;
    }

    static observedAttributes = ['json'];

    connectedCallback() {
        this.setupEventListeners();
        if (this.hasAttribute('json')) {
            this.loadData(this.getAttribute('json'));
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'json' && oldValue !== newValue) {
            this.loadData(newValue);
        }
    }

    setupEventListeners() {
        const svg = this.shadowRoot.getElementById('svg');
        const resetBtn = this.shadowRoot.getElementById('resetBtn');
        const zoomInBtn = this.shadowRoot.getElementById('zoomInBtn');
        const zoomOutBtn = this.shadowRoot.getElementById('zoomOutBtn');

        resetBtn.addEventListener('click', () => this.resetView());
        zoomInBtn.addEventListener('click', () => this.zoomIn());
        zoomOutBtn.addEventListener('click', () => this.zoomOut());

        svg.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStartX = e.clientX - this.currentTransform.x;
            this.dragStartY = e.clientY - this.currentTransform.y;
        });

        svg.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.currentTransform.x = e.clientX - this.dragStartX;
                this.currentTransform.y = e.clientY - this.dragStartY;
                this.updateTransform();
            }
        });

        svg.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        svg.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
    }

    loadData(jsonString) {
        const errorDiv = this.shadowRoot.getElementById('error');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        try {
            this.networkData = JSON.parse(jsonString);

            if (!this.networkData.nodes || !Array.isArray(this.networkData.nodes)) {
                throw new Error('Invalid data: "nodes" array is required');
            }

            if (!this.networkData.links || !Array.isArray(this.networkData.links)) {
                throw new Error('Invalid data: "links" array is required');
            }

            this.calculatePositions();
            this.draw();
        } catch (e) {
            errorDiv.textContent = 'Error: ' + e.message;
            errorDiv.style.display = 'block';
        }
    }

    calculatePositions() {
        const nodeHeight = 28;
        const verticalSpacing = nodeHeight + 12;
        const indentSpacing = 16;
        const minNodeWidth = 80;
        const padding = 12;

        const offsetX = 20;
        const offsetY = 20;

         // Create a temporary canvas for text measurement
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 14px sans-serif';
        
        this.networkData.nodes.forEach((node, idx) => {
          // Measure text width
          const textWidth = ctx.measureText(node.name).width;
          const nodeWidth = Math.max(minNodeWidth, textWidth + padding * 2);
          
          this.nodePositions[node.id] = {
            x: offsetX + node.indent * indentSpacing,
            y: offsetY + idx * verticalSpacing,
            width: nodeWidth,
            height: nodeHeight,
            node: node
          };
        });       

        const svg = this.shadowRoot.getElementById('svg');
        const maxX = Math.max(50, ...Object.values(this.nodePositions).map(p => p.x + p.width)) + 50;
        const maxY = Math.max(50, ...Object.values(this.nodePositions).map(p => p.y + p.height)) + 50;
        svg.setAttribute('viewBox', `0 0 ${maxX} ${maxY}`);
    }

    createElbowPath(src, tgt) {
        const x1 = src.x + 20;
        const y1 = src.y + src.height;
        const x2 = tgt.x;
        const y2 = tgt.y + tgt.height / 2;
        return `M ${x1},${y1} V ${y2} H ${x2}`;
    }

    draw() {
        const mainGroup = this.shadowRoot.getElementById('mainGroup');
        mainGroup.innerHTML = '';

        this.networkData.links.forEach(link => {
            const src = this.nodePositions[link.src];
            const tgt = this.nodePositions[link.tgt];

            if (src && tgt) {
                const path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('class', 'link');
                path.setAttribute('d', this.createElbowPath(src, tgt));
                mainGroup.appendChild(path);
            }
        });

        Object.values(this.nodePositions).forEach(pos => {
            const nodeGroup = document.createElementNS(SVG_NS, 'g');

            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('class', 'node-rect');
            rect.setAttribute('x', pos.x);
            rect.setAttribute('y', pos.y);
            rect.setAttribute('width', pos.width);
            rect.setAttribute('height', pos.height);

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('class', 'node-text');
            text.setAttribute('x', pos.x + pos.width / 2);
            text.setAttribute('y', pos.y + pos.height / 2);
            text.textContent = pos.node.name;

            nodeGroup.appendChild(rect);
            nodeGroup.appendChild(text);
            mainGroup.appendChild(nodeGroup);
        });
    }

    resetView() {
        this.currentTransform = {x: 0, y: 0, scale: 1};
        this.updateTransform();
        if (this.networkData) {
            this.calculatePositions();
            this.draw();
        }
    }

    updateTransform() {
        const mainGroup = this.shadowRoot.getElementById('mainGroup');
        mainGroup.setAttribute('transform',
            `translate(${this.currentTransform.x}, ${this.currentTransform.y}) scale(${this.currentTransform.scale})`);
    }

    zoomIn() {
        this.currentTransform.scale = Math.min(this.currentTransform.scale * 1.2, 5);
        this.updateTransform();
    }

    zoomOut() {
        this.currentTransform.scale = Math.max(this.currentTransform.scale / 1.2, 0.2);
        this.updateTransform();
    }
}

customElements.define('hierarchy-view', HierarchyView);
