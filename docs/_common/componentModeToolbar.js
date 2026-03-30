/**
 * <mode-toolbar> Web Component
 *
 * A reusable toolbar of mode-selection buttons for editor applications.
 *
 * ATTRIBUTES
 * ----------
 * options   – Delimited list of button labels (default delimiter: "|")
 *             e.g. options="Edit|Preview|Split"
 * delimiter – Custom delimiter character (default: "|")
 * value     – (readable) The currently-selected button label
 *
 * EVENTS
 * ------
 * change    – Fired when the active button changes.
 *             event.detail = { value: string, index: number }
 *
 * USAGE
 * -----
 * <mode-toolbar options="Edit|Preview|Split"></mode-toolbar>
 *
 * <script>
 *   document.querySelector('mode-toolbar').addEventListener('change', e => {
 *     console.log(e.detail.value); // e.g. "Preview"
 *   });
 * </script>
 */


const STYLES = `
<style>
:host {
  display: inline-block;
  font-family: 'DM Mono', 'Fira Mono', 'Consolas', monospace;
}

.toolbar {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background-color: rgba(255,255,255,0.8);
  border-radius: var(--mt-radius, 10px);
  box-shadow:
    0 2px 8px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.05);
}

button {
  all: unset;
  position: relative;
  cursor: pointer;
  padding: 6px;
  font: inherit;
  font-size: var(--mt-font-size, 0.78rem);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border-radius: var(--mt-btn-radius, 7px);
  white-space: nowrap;
}

button:hover:not([aria-pressed="true"]) {
  color: var(--mt-color-hover, rgba(255,255,255,0.7));
  background-color: var(--mt-hover-bg, rgba(0,0,0,0.8));
}

button[aria-pressed="true"] {
  color: var(--mt-color-active, #ffffff);
  background-color: var(--mt-active-bg, rgba(0,0,0,0.4));
  box-shadow:
    0 1px 3px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.12);
  cursor: default;
}
</style>
`;


class ModeToolbar extends HTMLElement {

    // ─── Observed Attributes ────────────────────────────────────────────────────
    static get observedAttributes() {
        return ['options', 'delimiter', 'value'];
    }

    // ─── Constructor ────────────────────────────────────────────────────────────
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this._selectedIndex = 0;
        this._options = [];
    }

    // ─── Lifecycle ──────────────────────────────────────────────────────────────
    connectedCallback() {
        this._render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;

        if (name === 'value') {
            // Allow setting selected mode via attribute
            const idx = this._options.indexOf(newVal);
            if (idx !== -1) {
                this._selectedIndex = idx;
                this._updateActiveState();
            }
        } else {
            // options or delimiter changed — full re-render
            this._render();
        }
    }

    // ─── Public API ─────────────────────────────────────────────────────────────

    /** Returns the label of the currently selected button. */
    get value() {
        return this._options[this._selectedIndex] ?? null;
    }

    /** Programmatically select a mode by label. */
    set value(label) {
        const idx = this._options.indexOf(label);
        if (idx !== -1) {
            this._selectedIndex = idx;
            this._updateActiveState();
        }
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    /** Full render into shadow DOM. */
    _render() {
        render(this);
        // Attach click handlers
        this.shadowRoot.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => this._handleClick(btn));
        });
    }

    /** Handle a button click. */
    _handleClick(btn) {
        const idx = parseInt(btn.dataset.index, 10);
        if (idx === this._selectedIndex) return; // no change

        this._selectedIndex = idx;
        this._updateActiveState();

        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail: {
                value: this.value,
                index: this._selectedIndex,
            },
        }));
    }

    /** Update aria-pressed states without a full re-render. */
    _updateActiveState() {
        this.shadowRoot.querySelectorAll('button').forEach((btn, i) => {
            btn.setAttribute('aria-pressed', i === this._selectedIndex ? 'true' : 'false');
        });
    }

}

customElements.define('mode-toolbar', ModeToolbar);


// Helpers //


/** Basic HTML escaping. */
function escape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Full render into shadow DOM. */
function render(el) {
    el._options = parseOptions(el);

    // If a `value` attribute is present, honour it as the initial selection
    const valueAttr = el.getAttribute('value');
    const valueIdx = valueAttr ? el._options.indexOf(valueAttr) : -1;
    if (valueIdx !== -1) {
        el._selectedIndex = valueIdx;
    } else {
        // Clamp in case options shrank
        el._selectedIndex = Math.min(
            el._selectedIndex,
            Math.max(0, el._options.length - 1)
        );
    }

    el.shadowRoot.innerHTML = `
    ${STYLES}
      <div class="toolbar" role="toolbar" aria-label="Mode selector">
        ${el._options.map((label, i) => `
          <button
            type="button"
            data-index="${i}"
            aria-pressed="${i === el._selectedIndex}"
          >${escape(label)}</button>
        `).join('')}
      </div>
    `;

    // // Attach click handlers
    // el.shadowRoot.querySelectorAll('button').forEach(btn => {
    //   btn.addEventListener('click', () => el._handleClick(btn));
    // });
}

/** Parse options from the attribute string. */
function parseOptions(el) {
    const delimiter = el.getAttribute('delimiter') || '|';
    const raw = el.getAttribute('options') || '';
    return raw
        .split(delimiter)
        .map(s => s.trim())
        .filter(Boolean);
}