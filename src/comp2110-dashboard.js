import {LitElement, html, css} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './components/widget-block.js';
import './components/widget-column.js';
import './components/ad-widget.js';
import './components/login-widget.js';
import './weather-widget.js';
import './shopping-list-widget.js';
import './sensor-widget.js'; 

class Comp2110Dashboard extends LitElement {
  static properties = {
    header: { type: String },
  }

  static styles = css`
    :host {
      min-height: 100vh;   
      font-size: 14pt;
      color: white;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: rgb(0, 0, 15);
    }

    main {
      display: flex;
      justify-content: center;
      padding-top: 2em;
      background-color: rgb(1, 1, 28);
    }

    .main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 1rem;
      width: 100%;
    }

    .header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      background-color: rgb(27, 31, 58);
      border-bottom: 3px solid white;
      padding: 1em 0;
    }

    .title {
      grid-column: 1/2;
      font-size: 3em;
      justify-self: center;
      color: white;
    }

    .login {
      grid-column: 2/3;
      justify-self: center;
      margin-top: 1em;
    }

    ad-widget {
      grid-column: 2/3;
      grid-row: 2/3;
      justify-self: left;
      margin-left: 2.5em;
    }

    shopping-list-widget {
      grid-column: 2/3;
      grid-row: 1/2;
      justify-self: left;
    }

    sensor-widget {
      grid-column: 1/2;
      grid-row: 2/3;
      justify-self: right;
    }

    weather-widget {
      grid-column: 1/2;
      grid-row: 1/2;
      justify-self: right;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      padding: 1em 0;
    }

    /* responsive grid for small screens */
    @media (max-width: 768px) {
      .header {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .title, .login {
        grid-column: 1/2;
      }

      .main {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
      }

      ad-widget,
      shopping-list-widget,
      sensor-widget,
      weather-widget {
        grid-column: 1/2 !important;
        grid-row: auto !important;
        justify-self: center !important;
        margin: 1em 0 !important;
      }
    }
  `;

  constructor() {
    super();
    this.header = 'COMP2110 Home Automation';
  }

  render() {
    return html`
      <header class="header">
        <h1 class="title">${this.header}</h1>
        <login-widget class="login"></login-widget>
      </header>

      <main class="main">
        <ad-widget></ad-widget>
        <shopping-list-widget></shopping-list-widget>
        <sensor-widget></sensor-widget>
        <weather-widget city="Sydney"></weather-widget>
      </main>

      <p class="app-footer">
        A product of the COMP2110 Web Development Collective &copy; 2025
      </p>
    `;
  }
}

customElements.define('comp2110-dashboard', Comp2110Dashboard);
