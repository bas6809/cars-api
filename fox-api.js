/**
 * Copyright 2025 Bas6809
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

export class FoxApi extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "fox-api";
  }

  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      foxes: { type: Array },
      loading: { type: Boolean },
      imageCount: { type: Number },
      modalFox: { type: Object },
      modalOpen: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.title = "Fox Gallery";
    this.foxes = [];
    this.loading = false;
    this.imageCount = 9;
    this.modalFox = null;
    this.modalOpen = false;

    this.t = {
      title: "Fox Gallery",
      loadMore: "Load More Foxes",
      loading: "Loading..."
    };
      
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/fox-api.ar.json", import.meta.url).href + "/../",
      locales: ["ar", "es", "hi", "zh"]
    });
  }

  static get styles() {
    return [super.styles, css`
      :host {
        display: block;
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
      }

      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--ddd-spacing-4);
      }

      .fox-card {
        border-radius: var(--ddd-radius-md);
        overflow: hidden;
        background: white;
        box-shadow: var(--ddd-boxShadow-sm);
        transition: transform 0.2s ease;
      }

      .fox-card:hover {
        transform: translateY(-4px);
      }

      img {
        width: 100%;
        height: 250px;
        object-fit: cover;
        cursor: pointer;
      }

      .actions {
        display: flex;
        justify-content: space-around;
        padding: var(--ddd-spacing-2);
      }

      button {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
      }

      .modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        justify-content: center;
        align-items: center;
        z-index: 999;
      }

      .modal.open {
        display: flex;
      }

      .modal img {
        max-width: 90%;
        max-height: 90%;
        border-radius: var(--ddd-radius-md);
      }

      .controls {
        text-align: center;
        margin-top: var(--ddd-spacing-4);
      }
    `];
  }

  async fetchFox() {
    const res = await fetch("https://randomfox.ca/floof/");
    const data = await res.json();
    return {
      id: crypto.randomUUID(),
      image: data.image,
      link: data.link,
      liked: false
    };
  }

  async loadFoxes(count = 3) {
    this.loading = true;
    const requests = Array.from({ length: count }, () => this.fetchFox());
    const results = await Promise.all(requests);
    this.foxes = [...this.foxes, ...results];
    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.foxes.length) {
      this.loadFoxes(this.imageCount);
    }
  }

  toggleLike(fox) {
    fox.liked = !fox.liked;
    this.requestUpdate();
  }

  openModal(fox) {
    this.modalFox = fox;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.modalFox = null;
  }

  shareFox(fox) {
    if (navigator.share) {
      navigator.share({
        title: "Cute Fox 🦊",
        url: fox.link
      });
    } else {
      navigator.clipboard.writeText(fox.link);
      alert("Fox link copied!");
    }
  }

  render() {
    return html`
      <h2>${this.title}</h2>

      <div class="gallery">
        ${this.foxes.map(fox => html`
          <div class="fox-card">
            <img
              src="${fox.image}"
              alt="Random fox"
              @click="${() => this.openModal(fox)}"
              loading="lazy"
            />
            <div class="actions">
              <button @click="${() => this.toggleLike(fox)}">
                ${fox.liked ? "❤️" : "🤍"}
              </button>
              <button @click="${() => this.shareFox(fox)}">🔗</button>
            </div>
          </div>
        `)}
      </div>

      <div class="controls">
        <button ?disabled="${this.loading}" @click="${() => this.loadFoxes(3)}">
          ${this.loading ? this.t.loading : this.t.loadMore}
        </button>
      </div>

      <div class="modal ${this.modalOpen ? "open" : ""}" @click="${this.closeModal}">
        ${this.modalFox ? html`
          <img src="${this.modalFox.image}" @click="${e => e.stopPropagation()}" />
        ` : ""}
      </div>
    `;
  }

  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url).href;
  }
}

globalThis.customElements.define(FoxApi.tag, FoxApi);
