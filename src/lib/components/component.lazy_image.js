customElements.define('lazy-image', class extends HTMLElement {
    static observedAttributes = ['src'];

    constructor() {
        super();
        this.$root = this.attachShadow({ mode: 'open' });
        this.setAttribute('loading', '');
        this.$root.setHTMLUnsafe(
            `<style>
                @keyframes loading {50% {opacity: 0.2;}}
                :host {background: #0001;width: auto;height: auto;position:relative;overflow:hidden;}
                :host([loading]) {animation: loading 2s infinite ease alternate;}
                 img {object-fit: cover;aspect-ratio: 1/1;width:100%;height:100%;}
            </style>`
        );
    }

    get src() {
        return this.getAttribute('src')
    }

    $observe(src) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                const __img = new Image();
                __img.src = src;
                __img.addEventListener('load', () => {
                    try {
                        this.$root.append(__img);
                        this.removeAttribute('loading');
                        observer.disconnect()
                    } catch (error) {
                        this.setAttribute('loading', true);
                     }
                })
            }
        })
        observer.observe(this);
    }

    attributeChangedCallback(attrName, _, newValue) {
        switch (attrName) {
            case 'src': this.$observe(newValue); break;
        }
    }
})
