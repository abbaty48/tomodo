import {render, html, svg} from 'lit-html';
customElements.define('theme-switcher', class extends HTMLElement {
    constructor() {
        super();
        this.$root = this.attachShadow({mode: 'open'});
    }

    async connectedCallback(){
        let scheme = localStorage.getItem('tomodo-tm');
        if(scheme) {
            this.$themeMode(scheme);
        } else {
            scheme = await this.$preferColor(preferred => {
                this.$themeMode(preferred);
            });
            this.$themeMode(scheme);
        }
        render(html`
            <style>
                div {background:#0002;border-radius:50px; overflow:hidden;}
                button {width: 2em;height:2em;overflow: hidden;overflow: none;cursor: pointer;border:none;              background-color: transparent;transition:all 0.5s ease;}button:hover {scale:.9} button:active {scale:.7}
                button.preferred {background: #fff4;}
            </style>
            <div>
            <button type='button' @click="${()=> this.onSwitch('light')}"
            tooltips='Switch to light mode'  data-theme="light"
                class="${scheme === 'light' ? 'preferred' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    ${svg`
                        <path fill='hsl(102, 49%, 51%)' d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z"></path>
                        `}
                    </button>
            <button type='button' @click="${()=> this.onSwitch('auto')}"
            tooltip='Switch to auto mode' data-theme="auto" class="${scheme === 'auto' ? 'preferred' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"">
                        ${svg`
                            <path fill='hsl(102, 49%, 51%)' d="M7.08 11.25A4.84 4.84 0 0 1 8 9.05L4.43 5.49A9.88 9.88 0 0 0 2 11.25zM9.05 8a4.84 4.84 0 0 1 2.2-.91V2a9.88 9.88 0 0 0-5.76 2.43zm3.7-6v5A4.84 4.84 0 0 1 15 8l3.56-3.56A9.88 9.88 0 0 0 12.75 2zM8 15a4.84 4.84 0 0 1-.91-2.2H2a9.88 9.88 0 0 0 2.39 5.76zm3.25 1.92a4.84 4.84 0 0 1-2.2-.92l-3.56 3.57A9.88 9.88 0 0 0 11.25 22zM16 9.05a4.84 4.84 0 0 1 .91 2.2h5a9.88 9.88 0 0 0-2.39-5.76zM15 16a4.84 4.84 0 0 1-2.2.91v5a9.88 9.88 0 0 0 5.76-2.39zm1.92-3.25A4.84 4.84 0 0 1 16 15l3.56 3.56A9.88 9.88 0 0 0 22 12.75z"></path>
                            `}
                </svg>
            </button>
            <button type='button' @click="${()=> this.onSwitch('dark')}"
            tooltip='Switch to dark mode' data-theme="dark"
                class="${scheme === 'dark' ? 'preferred' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
                        ${svg`
                                <path fill='hsl(102, 49%, 51%)' d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"></path>
                        `}
                </svg>
            </button>
        </div>`, this.$root);
    }

    async onSwitch(mode) {
        this.$themeMode(mode);
        this.$root.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('preferred');
            if(btn.dataset.theme === mode && !btn.classList.contains('preferred')) {
                btn.classList.add('preferred')
            }
        });
    }

     async $preferColor(callback) {
        return new Promise(resolve => {
         const media = window.matchMedia('(prefers-color-scheme: dark)')
          media.addEventListener('change', (e)=> {
                callback.call(this, e.matches ? 'dark': 'light');
                resolve(e.matches ? 'dark': 'light')
            })
          resolve(media.matches ? 'dark': 'light');
        })
    }

    async $themeMode(mode) {
        localStorage.setItem('tomodo-tm', mode);
        document.documentElement.setAttribute('theme',
            mode !== 'auto' ? mode : await this.$preferColor()
        );
    }
})
