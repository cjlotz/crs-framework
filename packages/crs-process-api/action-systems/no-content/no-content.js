var e = class extends HTMLElement {
    constructor() {
        super(), this.attachShadow({mode: "open"})
    }

    async connectedCallback() {
        this.style.display = "none";
        let t = globalThis.translations.noContent.title, s = globalThis.translations.noContent.message,
            n = `<link rel="stylesheet" href="${import.meta.url.replace(".js", ".css")}">`,
            a = await fetch(import.meta.url.replace(".js", ".html")).then(l => l.text());
        this.shadowRoot.innerHTML = `${n}${a.replace("__title__", t).replace("__message__", s)}`, await this.load()
    }

    async load() {
        requestAnimationFrame(() => {
            this.style.display = "flex", crs.call("component", "notify_ready", {element: this})
        })
    }
};
customElements.define("no-content", e);
