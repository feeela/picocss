/**
 * A switch to change between light and dark scheme.
 * Implemented as a custom element.
 * 
 * Requires Pico CSS module "forms/checkbox-radio-switch" to be enabled.
 * Also the two CSS variables "--pico-icon-color-scheme-light" & "--pico-icon-color-scheme-dark"
 * must have been defined in the CSS and should contain the icons as SVG data-URI.
 * 
 * Usage:
 * 
 * ```css
 * // see also: scss/themes/default/_styles.scss
 * :root, :host {
 *   --pico-icon-color-scheme-light: url("data:image/svg+xml;charset=UTF-8,<svg>…</svg>");
 *   --pico-icon-color-scheme-dark: url("data:image/svg+xml;charset=UTF-8,<svg>…</svg>");
 * }
 * ```
 * 
 * ```html
 * <pico-switch-color-mode>
 * 
 * <script src="js/SwitchColorMode.js"></script>
 * ```
 * 
 * Usage with pre-selected scheme (overrides system value i.e. ignores "prefers-color-scheme"):
 * ```html
 * <pico-switch-color-mode scheme="dark">
 * 
 * <script src="js/SwitchColorMode.js"></script>
 * ```
 */
class SwitchColorMode extends HTMLElement {
    static observedAttributes = ["scheme"];

    static storageKey = "pico-preferred-color-scheme";

    static ariaLabel = "Toggle Light or Dark Mode";

    static rootAttribute = "data-theme";

    constructor() {
        super();

        this.switch = null;

        // Set scheme to stored preference
        // …or use the value from the scheme-attribute on the custom element
        // …or use the theme from the `html` element attribute
        // …or use  the CSS preferred color scheme.
        this.scheme = this.schemeFromLocalStorage ?? this.schemeFromAttribute ?? this.schemeFromHTML ?? this.preferredColorScheme;
        this.applyScheme();
        this.setAttribute("scheme", this.scheme);
    }

    /**
     * Get color scheme from local storage
     * 
     * @returns {"dark"|"light"|null}
     */
    get schemeFromAttribute() {
        return this.getAttribute("scheme");
    }

    /**
     * Get color scheme from local storage
     * 
     * @returns {"dark"|"light"|null}
     */
    get schemeFromLocalStorage() {
        return localStorage.getItem(SwitchColorMode.storageKey);
    }

    /**
     * Get the default theme from the <html> attribute
     * 
     * @returns {"dark"|"light"|null}
     */
    get schemeFromHTML() {
        return document.documentElement.getAttribute(SwitchColorMode.rootAttribute);
    }

    /**
     * Preferred color scheme from system
     * 
     * @returns {"dark"|"light"}
     */
    get preferredColorScheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    /**
     * Set the current scheme as attribute on the `html` element
     */
    applyScheme() {
        document.documentElement.setAttribute(SwitchColorMode.rootAttribute, this.scheme);
    }

    /**
     * Store scheme to local storage
     */
    saveScheme() {
        localStorage.setItem(SwitchColorMode.storageKey, this.scheme);
    }

    connectedCallback() {
        if(!this.switch) {
            // Insert styles
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(this.getStyle(getComputedStyle(document.documentElement).getPropertyValue("--var-prefix").replace(/^"(.*)"$/, "$1")));
            document.adoptedStyleSheets.push(sheet);

            // Setup the input[type=checkbox]
            this.switch = document.createElement("input");
            this.switch.type = "checkbox";
            this.switch.name = "pico-switch-color-mode";
            this.switch.ariaLabel = SwitchColorMode.ariaLabel;
            this.switch.value = 1;
            this.switch.role = "switch";
            this.switch.checked = this.scheme == "dark" ? true : false;

            // User input handler
            this.switch.addEventListener("change", () => {
                this.scheme = this.switch.checked ? "dark" : "light";
                this.applyScheme();
                this.saveScheme();
                this.setAttribute("scheme", this.scheme);
            });

            this.append(this.switch);
        }
    }

    getStyle(cssVariablePrefix) {
        return `
            pico-switch-color-mode {
                display: block;
            }

            [name="pico-switch-color-mode"]::before {
                mask-position: center;
                mask-repeat: no-repeat;
                // Use masking to include the SVG as the content for the dot
                mask-size: contain;
                -webkit-mask-size: contain; /* For WebKit browsers */
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: center;
            }

            [name="pico-switch-color-mode"]:checked::before {
                mask-image: var(${cssVariablePrefix}icon-color-scheme-dark);
                -webkit-mask-image: var(${cssVariablePrefix}icon-color-scheme-dark);
                background-color: var(${cssVariablePrefix}primary-inverse);
            }

            [name="pico-switch-color-mode"]:not(:checked)::before {
                mask-image: var(${cssVariablePrefix}icon-color-scheme-light);
                -webkit-mask-image: var(${cssVariablePrefix}icon-color-scheme-light);
                background-color: var(${cssVariablePrefix}primary-inverse);
            }
        `;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(oldValue == null || newValue == null || oldValue == newValue) {
            return;
        }

        this.scheme = newValue;
        this.switch.checked = this.scheme == "dark" ? true : false;
        this.applyScheme();
        this.saveScheme();
    }
}

customElements.define("pico-switch-color-mode", SwitchColorMode);
