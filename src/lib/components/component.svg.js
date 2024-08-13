customElements.define('bxs-svg', class extends HTMLElement {
    constructor() {
        super();
        this.setHTMLUnsafe(`<svg><use xlink:href="/src/assets/svgs/site_symbols.svg#${this.getAttribute('icon')}" /></svg`);
    }
})
