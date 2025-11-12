import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { getUser, storeUser, deleteUser } from '../auth.js';
import { BASE_URL } from '../config.js';

class LoginWidget extends LitElement {
  static properties = {
    loginUrl: { type: String },
    user: { type: Object, state: true },
    loginError: { type: String, state: true }
  }

  static styles = css`
    :host {
      display: block;
    }

    form, p {
      color: rgb(255, 255, 255);
      font-weight: bold;
      border-radius: 12px;
      border: 3px solid white;
      padding: 0.5em;
      background-color: rgba(22, 22, 29, 0.8);
    }

    input[type='text'], input[type='password'] {
      background-color:rgb(47, 47, 71);
      color: rgb(255, 255, 255);
      border-radius: 8px;
      padding: 0.5em;
      border: none;
    }

    input[type='submit'], button {
      width: 10em;
      height: 3em;
      border-radius: 12px;
      font-size: 1em;
      color: #16161d;
      font-weight: bold;
      background-color: #ffffff;
      border: 3px solid white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    input[type='submit']:hover, button:hover {
      background-color:rgb(85, 85, 86);
      color:rgb(255, 255, 255);
      border-color:rgb(255, 255, 255);
    }

    .error {
      color: #ff4d4d;
      font-weight: bold;
      margin-bottom: 0.5em;
    }
  `;

  constructor() {
    super();
    this.loginUrl = `${BASE_URL}users/login`;
    this.user = getUser();
    this.loginError = '';
  }

  submitForm(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch(this.loginUrl, {
      method: 'post',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(result => result.json())
      .then(response => {
        if (response && response.name) {
          this.user = response;
          storeUser(response);
          this.loginError = '';
          window.location.reload(); //the screen reloads and unlocks the widgets
        } else {
          this.loginError = 'Invalid username or password.';
        }
      })
      .catch(() => {
        this.loginError = 'Login failed. Please try again later.';
      });
  }

  logout() {
    deleteUser();
    this.user = null;
    window.location.reload(); //browser refreshes so widget locked again
  }

  render() {
    if (this.user) {
      return html`
        <p>Logged in as ${this.user.name}</p>
        <button @click=${this.logout}>Logout</button>
      `;
    }

    return html`
      <form @submit=${this.submitForm}>
        ${this.loginError ? html`<div class="error">${this.loginError}</div>` : ''}
        Username: <input type="text" name="username" required>
        <br><br>
        Password: <input type="password" name="password" required>
        <br><br>
        <input type="submit" value="Login">
      </form>
    `;
  }
}

customElements.define('login-widget', LoginWidget);
