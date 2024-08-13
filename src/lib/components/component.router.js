import { html, render } from 'lit-html';
customElements.define('app-router', class extends HTMLElement {

    constructor() {
        super();
        this.$root = this.attachShadow({ mode: 'open' });
        render(html`
                <style>
                    :host {display: grid;height: 100%;grid-template-columns: auto 1fr;}
                    ::slotted([name=content]) {overflow: hidden; overflow-y: auto;}
                </style>
                <slot name="aside"></slot>
                <slot name="content"></slot>
            `, this.$root);
        this.$contentContainer = this.querySelector('[slot=content]');
    }

    get $routeElements() {
        return this.querySelectorAll('[view]')
    }

    get $routeViews() {
        return Array.from(this.$routeElements).map(a => a.getAttribute('view'))
    }

    connectedCallback() {
        // attach click event to all route-links
        this.$routeElements.forEach(elem => {
            elem.addEventListener('click', ({ target }) => {
                this.$routeElements.forEach(element => {
                    element.classList.remove('active');
                    if (element === target && !element.classList.contains('active')) {
                        target.classList.add('active');
                        this.$render(target.getAttribute('view'));
                    }
                });
            }, false);
        });
        this.$routeElements[0]?.click();
    }

    async $render(view) {
        document.startViewTransition(async _ => {
            const { default: page } = (await import(`/src/views/${view}.js`));
            render(page, this.$contentContainer);
        })
    }
})
