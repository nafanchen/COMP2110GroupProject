import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { getUser } from './auth.js';
import { BASE_URL } from './config.js';

class ShoppingListWidget extends LitElement {
  static properties = {
    list: { type: Object },
    error: { type: String },
    newItemContent: { type: String },
  };

  static styles = css`
    :host {
      position: relative;
      display: block;
      width: 400px;
      background: rgba(16, 16, 19, 0.85);
      padding: 1rem;
      border-radius: 12px;
      color: white;
      font-family: sans-serif;
      border-style: solid;
      border-width:3px;
      border-color: gray;
      z-index: 0;
    }
    
    .bg-image{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      object-fit: cover; /* contain image without distortion */
      opacity: 0.5;
      z-index: -1;
    }

    h2 {
      margin-top: 0;
      font-weight: bold;
      font-size: 1.6em;
      border-bottom: 2px solid #888;
      padding-bottom: 0.2rem;
    }
    ul {
      list-style: none;
      padding-left: 0;
      margin-top: 0.1rem;
    }

    li {
      background:rgba(87, 87, 88, 0.34);
      margin-bottom: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 1.1em;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .error {
      color: #ff5555;
      font-weight: bold;
    }
    button.deleteButton {
      background: #900;
      border: none;
      color: white;
      border-radius: 4px;
      padding: 0 6px;
      cursor: pointer;
      font-weight: bold;
    }
    button.deleteButton:hover {
      background: #f00;
    }
    form {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    input[type="text"] {
      flex-grow: 1;
      padding: 0.5rem;
      font-size: 1em;
      border-radius: 6px;
      border: none;
    }
    button.addButton {
      background:rgb(0, 146, 92);
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    button.addButton:hover {
      background: #005ea1;
    }
    .error {
      color: #ff5555;
      font-weight: bold;
      margin-top: 0.5rem;
    }
  `;

  constructor() {
    super();
    this.list = null;
    this.error = '';
    this.newItemContent = '';
  }

  async firstUpdated() {
    await this.loadShoppingList();
  }

  // fetch and load list/1 from BASE_URL 
  async loadShoppingList() {
    this.error = '';
    try {
      const user = getUser();
      if (!user || !user.token) {
        this.error = 'User is not authenticated';
        return;
      }
      const res = await fetch(`${BASE_URL}lists/1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch list data: ${res.status}`);
      }
      this.list = await res.json();
    } catch (err) {
      this.error = err.message;
    }
  }

  // add item to selected list widget on the page
  async addItem(e) {
    e.preventDefault();
    if (!this.newItemContent.trim()) {
      this.error = 'Please enter an item';
      return;
    }
    this.error = '';
    try {
      const user = getUser();
      if (!user || !user.token) {
        this.error = 'User is not authenticated';
        return;
      }
      const res = await fetch(`${BASE_URL}lists/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ content: this.newItemContent.trim() }),
      });
      if (!res.ok) {
        throw new Error(`Failed to add item: ${res.status}`);
      }

      this.newItemContent = '';
      await this.loadShoppingList();
    } catch (err) {
      this.error = err.message;
    }
  }

  // remove selected item from the widget
  async removeItem(itemId) {
    this.error = '';
    try {
      const user = getUser();
      if (!user || !user.token) {
        this.error = 'User is not authenticated';
        return;
      }
      const res = await fetch(`${BASE_URL}lists/1/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to delete item: ${res.status}`);
      }

      await this.loadShoppingList();
    } catch (err) {
      this.error = err.message;
    }
  }

  render() {
    if (this.error) {
      return html`<div class="error">
      ${this.error}
      <br></br>
      <svg style="fill: white; height: 8em; width: 8em; margin-top:1em;"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>
      </div>`;
    }

    if (!this.list) {
      return html`<p>No shopping list loaded</p>`;
    }

    return html`
      <h2>${this.list.title}</h2>
      ${this.list.contents.length === 0
        
        ? html`
        <img class="bg-image" src="/visuals/cart.png" alt="background" />
        <p><em>There are no items in the list yet</em></p>`
        : html`
            <img class="bg-image" src="/visuals/cart.png" alt="background" />
            <ul>
              ${this.list.contents.map(
          item => html`
                  <li>
                    ${item.content}
                    <button
                      class="deleteButton"
                      style="width: 3em; height: 3em; fill: rgb(255, 255, 255);"
                      @click=${() => this.removeItem(item.id)}
                      aria-label="Delete ${item.content}"
                    >
                      &times;
                    </button>
                  </li>
                `
        )}
            </ul>
          `}
      <form @submit=${this.addItem}>
        <input
          style="opacity: 0.7; color:rgb(255, 255, 255); background-color:rgb(62, 62, 62)"
          type="text"
          placeholder="Add new item"
          .value=${this.newItemContent}
          @input=${e => (this.newItemContent = e.target.value)}
          aria-label="New item content"
        />
        <button class="addButton" style="font-size:1em;" type="submit">+</button>
      </form>
    `;
  }
}

customElements.define('shopping-list-widget', ShoppingListWidget);