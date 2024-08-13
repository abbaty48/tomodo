import { html } from "lit-html";
export default html `
<article>
    <section>
        <header><h1>Recent Uploads</h1></header>
        <rm-carousel></rm-carousel>
    </section>
    <section>
        <header><h2>This Year Movies</h2></header>
        <yearly-movies></yearly-movies>
    </section>
</article>
<to-top></to-top>
`
