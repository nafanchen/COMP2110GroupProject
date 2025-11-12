import {LitElement, html, css} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';

class AdWidget extends LitElement {
  static properties = {
    adUrl: { type: String },
  }

  static styles = css`
    :host {
        display: grid;
        grid-template-row: 1fr 1fr;
        width: 310px;
        height: 310px;
        background-color: rgb(40, 48, 92);
        border-radius: 12px;
        padding-top: 1.5em;
        border: 3px solid rgb(114, 122, 171);
    }
    :host p {
      position: relative;
      top: -50px;
      text-align: right;
      padding-right: 10px;
      z-index: 0;
      
    }
    
    .advert{
      border-style: solid;
      border-width: 3px;
      border-color: white;
      border-radius: 12px;
    }
    
    .advertwriting{
      grid-row: 2/3;
      color: white;
      font-style: Helvetica;
      font-weight: bold;
      font-size: 1em;
      justify-self: center;
      margin-top: 2em;
    }


  `;

  constructor() {
    super();
    this.adUrl = `${BASE_URL}adserver`;
  }

  render() {
    return html`
  <div>
        <img class="advert" src=${this.adUrl} alt="Advertisment">
        <br></br>
        <p class="advertwriting">Advertisment</p>
  </div>
    `;
  }
}

customElements.define('ad-widget',  AdWidget);