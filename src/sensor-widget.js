// Import required modules from Lit, authentication, and config
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { getUser } from './auth.js';
import { BASE_URL } from './config.js';

// Define the custom element class
class SensorWidget extends LitElement {
  // Declare reactive properties
  static properties = {
    sensor: { type: Object },       // Holds sensor data fetched from API
    error: { type: String },        // Stores any error messages
    previousLux: { type: Number },  // Previous lux value for detecting changes
    tip: { type: String },          // Suggestion based on lux level
    freshness: { type: String },    // How recently the data was updated
  };

  // CSS styles scoped to this component
  static styles = css`
    :host {
      position: relative;
      display: block;
      width: 400px;
      height: 300px;
      padding: 1rem;
      border-radius: 12px;
      color: #ff5c00;
      font-family: sans-serif;
      transition: background 0.3s ease-in-out;
      border-style: solid;
      border-color: #ff5c00;
      border-width: 3px;
      background-color: rgba(0, 0, 0, 0.82);
      font-weight: bold;
      z-index: 0;
    }

    /* Background image styling */
    .bg-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.2;
      z-index: 1;
    }

    /* Dim background for low light */
    :host([lowlux]) {
      background: rgb(0, 0, 0);
    }

    /* Lux value styling with animation on increase */
    .lux {
      font-size: 3em;
      font-weight: bold;
      margin-top: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5em;
      transition: color 0.3s ease-in-out;
      justify-self: center;
    }

    .lux.increase {
      animation: glow 0.5s ease-in-out;
    }

    @keyframes glow {
      0% { color: yellow; }
      100% { color: white; }
    }

    /* Text elements */
    .timestamp, .tip, .freshness {
      font-size: 0.9em;
      color: #ccc;
      margin-top: 0.5rem;
    }

    .tip {
      color: #0ff;
    }

    .label {
      font-size: 1.5em;
    }

    .timestamp {
      color: #ff5c00;
      font-size: 1.5em;
    }
  `;

  // Initialize properties
  constructor() {
    super();
    this.sensor = null;
    this.error = '';
    this.previousLux = null;
    this.tip = '';
    this.freshness = '';
  }

  // Lifecycle method: runs when element is added to the DOM
  connectedCallback() {
    super.connectedCallback();
    this.loadSensor(); // Initial fetch
    this.intervalId = setInterval(() => this.loadSensor(), 30000); // Auto-refresh every 30s
  }

  // Lifecycle method: runs when element is removed
  disconnectedCallback() {
    clearInterval(this.intervalId);
    super.disconnectedCallback();
  }

  // Return tip message based on current lux value
  getSuggestion(lux) {
    if (lux > 800) return "☀️ Very bright! Consider dimming lights.";
    if (lux < 100) return "🌙 Dim lighting detected.";
    return "✅ Light level looks good!";
  }

  // Fetch the latest sensor reading from the API
  async loadSensor() {
    const user = getUser();
    const token = user?.token;

    if (!token) {
      this.error = 'Not logged in.';
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}home/sensors/737?count=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      // Store previous lux value to detect change
      this.previousLux = this.sensor?.data?.[0]?.lux ?? null;
      this.sensor = data;

      // Calculate lux freshness
      const currentLux = data.data?.[0]?.lux ?? 0;
      const timestamp = data.data?.[0]?.timestamp ?? Date.now();
      const minsAgo = Math.floor((Date.now() - timestamp) / 60000);

      // Update UI feedback properties
      this.freshness = minsAgo < 1 ? 'Just now' : `${minsAgo} min ago`;
      this.tip = this.getSuggestion(currentLux);

      // Add lowlux attribute to style the background
      this.toggleAttribute('lowlux', currentLux < 50);
    } catch (err) {
      console.error(err);
      this.error = 'Failed to fetch sensor data.';
    }
  }

  // Render the component UI
  render() {
    // Show error UI with icon if request fails
    if (this.error) return html`
      <p style="color:red;">
        ${this.error}<br>
        <svg style="fill: #ff5c00; height: 8em; width: 8em; margin-top:1em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/>
        </svg>
      </p>`;

    if (!this.sensor) return html`<p>Loading Living Room Light Sensor...</p>`;

    const lux = this.sensor.data?.[0]?.lux?.toFixed(1) ?? 'N/A';
    const time = this.sensor.data?.[0]?.timestamp
      ? new Date(this.sensor.data[0].timestamp).toLocaleString()
      : 'Unknown';

    const isIncrease = this.previousLux !== null && lux > this.previousLux;

    return html`
      <img class="bg-image" src="/visuals/living.jpg" alt="background" />
      <div class="label">${this.sensor.label}</div>
      <div class="lux ${isIncrease ? 'increase' : ''}">
        <svg style="width: 40px; height: 0.8em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <path fill="#ff5c00" d="..."/>
        </svg>
        ${lux}
      </div>
      <div class="freshness" style="color: #ff5c00; font-size: 0.8em;">Updated ${this.freshness}</div>
      <div class="tip" style="color: white; font-size:1.2em;">${this.tip}</div>
      <br>
      <div class="timestamp">
        <svg style="width: 40px; height: 0.8em; fill: #ff5c00;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="..."/>
        </svg>
        ${time}
      </div>
    `;
  }
}

// Register the component as a custom element
customElements.define('sensor-widget', SensorWidget);
