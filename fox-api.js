/**
 * Copyright 2025 elliebluejay
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `fox-api`
 * A gallery component that displays random fox images from randomfox.ca API
 * @demo index.html
 * @element fox-api
 */
export class FoxApi extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "fox-api";
  }

  constructor() {
    super();
    this.title = "Fox Gallery";
    this.foxes = [];
    this.loading = false;
    this.imageCount = 9;
    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Fox Gallery",
      loadMore: "Load More Foxes",
      loading: "Loading...",
    };
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/fox-api.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      foxes: { type: Array },
      loading: { type: Boolean },
      imageCount: { type: Number },
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
      }
      .wrapper {
        margin: var(--ddd-spacing-2);
        padding: var(--ddd-spacing-4);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--ddd-spacing-4);
      }
      h2 {
        margin: 0;
        font-size: var(--ddd-font-size-xl);
        color: var(--ddd-theme-default-potential0);
      }
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--ddd-spacing-4);
        margin-bottom: var(--ddd-spacing-4);
      }
      .fox-card {
        position: relative;
        border-radius: var(--ddd-radius-md);
        overflow: hidden;
        background-color: var(--ddd-theme-default-white);
        box-shadow: var(--ddd-boxShadow-sm);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
      }
      .fox-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--ddd-boxShadow-md);
        border-color: var(--ddd-theme-default-potential50);
      }
      .fox-image {
        width: 100%;
        height: 250px;
        object-fit: cover;
        display: block;
      }
      .fox-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
        color: white;
        padding: var(--ddd-spacing-3);
        font-size: var(--ddd-font-size-xs);
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .fox-card:hover .fox-overlay {
        opacity: 1;
      }
      .controls {
        display: flex;
        gap: var(--ddd-spacing-2);
        justify-content: center;
      }
      button {
        padding: var(--ddd-spacing-3) var(--ddd-spacing-6);
        font-size: var(--ddd-font-size-s);
        font-family: var(--ddd-font-navigation);
        font-weight: var(--ddd-font-weight-bold);
        background-color: var(--ddd-theme-default-potential50);
        color: white;
        border: none;
        border-radius: var(--ddd-radius-sm);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      button:hover:not(:disabled) {
        background-color: var(--ddd-theme-default-potential70);
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .loading-spinner {
        text-align: center;
        padding: var(--ddd-spacing-4);
        color: var(--ddd-theme-default-potential50);
      }
    `];
  }

  // Fetch a single fox image from the API
  async fetchFox() {
    try {
      const response = await fetch('https://randomfox.ca/floof/');
      const data = await response.json();
      return {
        id: Date.now() + Math.random(),
        image: data.image,
        link: data.link,
      };
    } catch (error) {
      console.error('Error fetching fox:', error);
      return null;
    }
  }

  // Load multiple fox images
  async loadFoxes(count = 3) {
    this.loading = true;
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(this.fetchFox());
    }
    const newFoxes = await Promise.all(promises);
    this.foxes = [...this.foxes, ...newFoxes.filter(fox => fox !== null)];
    this.loading = false;
  }

  // Handle load more button click
  handleLoadMore() {
    this.loadFoxes(3);
  }

  // Handle fox card click - open external link
  handleFoxClick(link) {
    window.open(link, '_blank');
  }

  // Load initial foxes when component connects to DOM
  connectedCallback() {
    super.connectedCallback();
    if (this.foxes.length === 0) {
      this.loadFoxes(this.imageCount);
    }
  }

  // Lit render the HTML
  render() {
    return html`
      <div class="wrapper">
        <div class="header">
          <h2>${this.title}</h2>
        </div>
        
        <div class="gallery">
          ${this.foxes.map(fox => html`
            <div class="fox-card" @click="${() => this.handleFoxClick(fox.link)}">
              <img 
                class="fox-image" 
                src="${fox.image}" 
                alt="Random fox" 
                loading="lazy"
              />
              <div class="fox-overlay">
                Click to view source
              </div>
            </div>
          `)}
        </div>

        ${this.loading ? html`
          <div class="loading-spinner">
            ${this.t.loading}
          </div>
        ` : ''}

        <div class="controls">
          <button 
            @click="${this.handleLoadMore}" 
            ?disabled="${this.loading}"
          >
            ${this.t.loadMore}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(FoxApi.tag, FoxApi);
