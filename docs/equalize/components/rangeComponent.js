const STYLE = `
:host {
    display: inline-flex;
    align-items: center;
    font-family: sans-serif;
}
input[type="range"] {
    flex: 1;
}
`;


function makeData(element) {
    const input = document.createElement('input');
    input.type = 'range';

    const valueDisplay = document.createElement('span');
    valueDisplay.style.marginLeft = '0.5em';

    const style = document.createElement('style');
    style.textContent = STYLE;

    element.shadowRoot.append(style, input, valueDisplay);

    function updateDisplay() {
        valueDisplay.textContent = input.value;
    }

    const data = {
        updateDisplay,
        get value() {
            return input.value;
        },
        set value(val) {
            input.setAttribute('value', val);
            updateDisplay();
        },

        get min() {
            return input.min;
        },
        set min(val) {
            input.setAttribute('min', val);
        },

        get max() {
            return input.max;
        },
        set max(val) {
            input.setAttribute('max', val);
        }
    }

    // Handlers
    // While dragging: update displayed value
    const onInput = () => {
        valueDisplay.textContent = input.value;
    }
    // On change: propagate "change" event with the final value
    const onChange = () => {
        const event = new CustomEvent('change', {
            detail: {value: input.value},
            bubbles: true,
            composed: true
        });
        element.dispatchEvent(event);
    }

    data.connect = () => {
        // Initialize attributes
        if (element.hasAttribute('min')) data.min = element.getAttribute('min');
        if (element.hasAttribute('max')) data.max = element.getAttribute('max');
        if (element.hasAttribute('value')) data.value = element.getAttribute('value');
        updateDisplay();

        // Listen for interactions

        input.addEventListener('input', onInput);
        input.addEventListener('change', onChange);
    };
    
    data.disconnect = () => {
        input.removeEventListener('input', onInput);
        input.removeEventListener('change', onChange);
    }

    return data;
}


class RangeComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        // Create elements
        this.data = makeData(this);
    }

    static observedAttributes = ['min', 'max', 'value'];

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        if (name === 'min') this.data.min = newVal;
        if (name === 'max') this.data.max = newVal;
        if (name === 'value') {
            this.data.value = newVal;
        }
    }

    connectedCallback() {
        this.data.connect();
    }

    disconnectedCallback() {
        this.data.disconnect();
    }

    get theData() {
        return this.data;
    }
}

customElements.define('c-range', RangeComponent);
