customElements.define('to-top', class extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'closed' }).setHTMLUnsafe(`
            <style>:host{position:fixed;bottom:1em;right:1em;background:#0002; width:2em;height:2em;border-radius:5px;}</style>
            <a href="#" target="_top">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="pointer-event:none;"><path fill="#0003" d="M6 4h12v2H6zm5 10v6h2v-6h5l-6-6-6 6z"></path></svg></a>
        `)
    }
})
