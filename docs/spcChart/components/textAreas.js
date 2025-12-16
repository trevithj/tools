const TextAreaStyles = `
.input-section .output-section {
    display: flex;
    flex-direction: column;
}
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}
.section-title {
    font-size: 1.3em;
    font-weight: 600;
    color: #333;
}
.char-count {
    font-size: 0.9em;
    color: #666;
}
textarea {
    flex: 1;
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 1em;
    resize: none;
    transition: border-color 0.3s;
    background: #f8f9fa;
    min-height: 230px;
    width: calc(100% - 35px);
}
textarea:focus {
    outline: none;
    border-color: #667eea;
}
.button-group {
    margin-top: 10px;
    display: flex;
    gap: 10px;
}
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 0.95em;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
}
.btn-clear {
    background: #dc3545;
    color: white;
}
.btn-clear:hover {
    background: #c82333;
    transform: translateY(-2px);
}`;

const HeaderHTML = `
<style>
    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
    }
    .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
    }
    .header p {
        font-size: 1.1em;
        opacity: 0.9;
    }
</style>
<div class="header">
    <h1></h1><p></p>
</div>`;

// Header Component
class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = HeaderHTML;
    }
    static observedAttributes = ["title", "subtitle"];

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === "title") {
            this.shadowRoot.querySelector("h1").innerHTML = newValue;
        }
        if (name === "subtitle") {
            this.shadowRoot.querySelector("p").innerHTML = newValue;
        }
    }

}

function updateCharCount(textarea, countElement) {
    const count = textarea.value.length;
    countElement.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}


const InputHTML = `<style>
</style>
<div class="input-section">
    <div class="section-header">
        <span class="section-title">Input</span>
        <span class="char-count" id="inputCount">0 characters</span>
    </div>
    <textarea id="inputText" placeholder="Enter your text here..."></textarea>
    <div class="button-group">
        <button class="btn btn-clear" id="clearBtn">Clear</button>
    </div>
</div>`;


// Input Section Component
class TextInputSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = InputHTML;
        this.shadowRoot.querySelector("style").textContent = TextAreaStyles;
        this.textarea = this.shadowRoot.getElementById('inputText');
        this.countElement = this.shadowRoot.getElementById('inputCount');
    }

    connectedCallback() {
        const clearBtn = this.shadowRoot.getElementById('clearBtn');

        this.textarea.addEventListener('input', () => {
            updateCharCount(this.textarea, this.countElement);
            this.dispatchEvent(new CustomEvent('textchange', {
                detail: {text: this.value},
                bubbles: true,
                composed: true
            }));
        });

        clearBtn.addEventListener('click', () => {
            this.value = '';
            updateCharCount(this.textarea, this.countElement);
            this.textarea.focus();
        });
    }
    set value(value) {
        this.textarea.value = value;
    }
    get value() {
        return this.textarea.value;
    }
}

const OutputHTML = `<style>
</style>
<div class="output-section">
    <div class="section-header">
        <span class="section-title">Output</span>
        <span class="char-count" id="outputCount">0 characters</span>
    </div>
    <textarea id="outputText" placeholder="Converted text will appear here..." readonly></textarea>
    <div class="button-group">
        <button class="btn btn-copy" id="copyBtn">Copy</button>
        <button class="btn btn-clear" id="clearBtn">Clear</button>
    </div>
</div>`;

// Output Section Component
class TextOutputSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = OutputHTML;
        this.shadowRoot.querySelector("style").textContent = TextAreaStyles;
        this.textarea = this.shadowRoot.getElementById('outputText');
        this.countElement = this.shadowRoot.getElementById('outputCount');
    }

    connectedCallback() {
        const copyBtn = this.shadowRoot.getElementById('copyBtn');
        const clearBtn = this.shadowRoot.getElementById('clearBtn');

        this.textarea.addEventListener('input', () => {
            updateCharCount(this.textarea, countElement);
        });

        copyBtn.addEventListener('click', async () => {
            if (!this.textarea.value) return;

            try {
                await navigator.clipboard.writeText(this.textarea.value);
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                this.textarea.select();
                document.execCommand('copy');
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
        });

        clearBtn.addEventListener('click', () => {
            this.textarea.value = '';
            updateCharCount(this.textarea, this.countElement);
        });
    }

    set value(value) {
        this.textarea.value = value;
        updateCharCount(this.textarea, this.countElement);
    }
    get value() {
        return this.textarea.value;
    }
}

// Register custom elements
customElements.define('app-header', AppHeader);
customElements.define('text-input-section', TextInputSection);
customElements.define('text-output-section', TextOutputSection);
