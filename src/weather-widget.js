import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { getUser } from './auth.js';
import { BASE_URL } from './config.js'; 

class WeatherWidget extends LitElement {
  static properties = {
    weather: { type: Object }, // holds the current weather data fetched from api
    error: { type: String }, // stores any error message
    sensorData: { type: Object },   // stores outdoor sensor temperature & humidity
  };

  static styles = css`
    :host {
      position: relative;
      display: block;
      width: 400px;
      height: 450px;
      background: rgba(22, 22, 29, 0.68);
      padding: 1rem;
      border-radius: 12px;
      color: white;
      font-family: sans-serif;
      border-style: solid;
      z-index: 1;
    }
    
    .background-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.1;
      z-index: -1;
     }

    .weather-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(3, auto);
      gap: 1rem;
      margin-top: 1rem;
      color: #ffffff;
    }
    
    .house{
      grid-column: 1/2;
      grid-row: 1/4;
      margin-top: 2.5em;
    }

    .temperature {
      font-size: 3em;
      font-weight: bold;
      grid-column: 2/3;
      grid-row: 1/2;
      justify-self: start;
      color: #ffffff;
    }

    .windspeed {
      grid-column: 2/3;
      grid-row: 2/3;
      font-size: 1.5em;
      color: #ffffff;
      font-weight: bold;
      justify-self: start;
    }

    .description {
      grid-column: 2/3;
      grid-row: 3/4;
      font-size: 1.5em;
      color: #ccc;
      justify-self: start;
    }

    /* New styles for outdoor sensor display */
    .sensor-box {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #555;
    }

    .sensor-title {
      font-style: italic;
      font-size: 1.3em;
      margin-bottom: 0.5rem;
    }

    .sensor-data {
      font-size: 1.2em;
      color: #ddd;
    }
    
    .senstemp{
      font-size: 2em;
      justify-self: right;
      margin-left: 0;
      font-weight: bold;
    }
  `;

  constructor() {
    super();
    this.weather = null;
    this.error = '';
    this.sensorData = null;  
  }
// lifecycle method called after first render
  async firstUpdated() {
    await this.fetchWeather('Sydney');
    await this.fetchOutdoorSensorData();
  }
// fetch weather data for a city by first getting coordinates, then weather
  async fetchWeather(city) {
    try {
      this.error = '';
      this.weather = null;
// get latitude and longitude for city
      const coords = await this.getCoordinates(city);
      if (!coords) {
        this.error = 'Could not find city coordinates.';
        return;
      }

      const { latitude, longitude } = coords;

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      if (!weatherRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await weatherRes.json();
      this.weather = data.current_weather;
    } catch (err) {
      this.error = err.message;
    }
  }

  async getCoordinates(city) {
    // call open-meteo geocoding api with city name
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    if (!geoRes.ok) return null;

    const data = await geoRes.json();
    if (data.results && data.results.length > 0) {
      const { latitude, longitude } = data.results[0];
      return { latitude, longitude };
    }
    return null;
  }

  //fetch outdoor sensor data (temp & humidity)
  async fetchOutdoorSensorData() {
    try {
      const user = getUser();
      if (!user || !user.token) {
        this.error = 'User is not authenticated';
        return;
      }

      // fetch latest sensor data from backend with authorization token
      const sensorId = 1690;
      const res = await fetch(`${BASE_URL}home/sensors/${sensorId}?count=1`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch sensor data: ${res.status}`);
      }

      const sensor = await res.json();

      if (!sensor.data || sensor.data.length === 0) {
        throw new Error('No sensor data available');
      }

      const latest = sensor.data[0];
      this.sensorData = {
        temperature: parseFloat(latest.temperature.toFixed(1)),
        humidity: parseFloat(latest.humidity.toFixed(1)),
      };
    } catch (err) {
      this.error = err.message;
    }
  }
// mapping of weather codes to descriptions
  render() {
    const weatherDescriptions = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Heavy Drizzle',
      56: 'Light Freezing Drizzle',
      57: 'Heavy Freezing Drizzle',
      61: 'Light Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      66: 'Light Freezing Rain',
      67: 'Heavy Freezing Rain',
      71: 'Light Snowfall',
      73: 'Moderate Snowfall',
      75: 'Heavy Snowfall',
      77: 'Snow Grains',
      80: 'Light Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Heavy Rain Showers',
      85: 'Light Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Light Hail',
      99: 'Thunderstorm with Heavy Hail',
    };

    const weatherIcons = {
      clear: '☀️',
      partlyCloudy: '🌤️',
      cloudy: '☁️',
      fog: '🌫️',
      drizzle: '🌦️',
      rain: '🌧️',
      heavyRain: '⛈️',
      snow: '🌨️',
    };

    let weatherIcon = '❓';
    let weatherDescription = 'Unknown Weather';
    // if weather data available, determine description and icon by weathercode

    if (this.weather) {
      const code = this.weather.weathercode;
      weatherDescription = weatherDescriptions[code] || 'Unknown Weather';

      if (code === 0 || code === 1) {
        weatherIcon = weatherIcons.clear;
      } else if (code === 2) {
        weatherIcon = weatherIcons.partlyCloudy;
      } else if (code === 3) {
        weatherIcon = weatherIcons.cloudy;
      } else if ([45, 48].includes(code)) {
        weatherIcon = weatherIcons.fog;
      } else if ([51, 53, 55, 56, 57].includes(code)) {
        weatherIcon = weatherIcons.drizzle;
      } else if ([61, 63, 65, 66, 67, 80, 81].includes(code)) {
        weatherIcon = weatherIcons.rain;
      } else if ([82, 95, 96, 99].includes(code)) {
        weatherIcon = weatherIcons.heavyRain;
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        weatherIcon = weatherIcons.snow;
      }
    } //weather icons grouped for convenience

    const content = this.error
      ? html`<p style="color:red;">
      ${this.error}
      <br></br>
      <svg style="fill: cyan; height: 8em; width: 8em; margin-top:1em;"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>
      </p>`
      : !this.weather
      ? html`<p>Loading weather for Sydney...</p>`
      : (() => {
          return html`
            <div class="weather-box">
              <video class="background-video" autoplay muted loop playsinline>
              <source src="/visuals/clouds.mp4" type="video/mp4" />
              </video>
              <span class ="house"><svg style="width: 5.5em; height: 5.5em; fill:rgb(255, 255, 255);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg></span>
              <div class="temperature">
              <p style="font-size: 0.5em; grid-column:2/3; grid-row:1/2; margin-bottom:-2em; justify-self: right;font-style: italic;">Sydney</p><br/>
              ${this.weather.temperature}°C
              </div>
              <div class="windspeed"><svg style="width: 40px; height: 1em; fill:rgb(156, 240, 255);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M288 32c0 17.7 14.3 32 32 32l32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128c-17.7 0-32 14.3-32 32s14.3 32 32 32l320 0c53 0 96-43 96-96s-43-96-96-96L320 0c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32l32 0c53 0 96-43 96-96s-43-96-96-96L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0c-17.7 0-32 14.3-32 32zM128 512l32 0c53 0 96-43 96-96s-43-96-96-96L32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/></svg>
              ${this.weather.windspeed} km/h</div>
              <div class="description">${weatherIcon} ${weatherDescription}</div>
            </div>

            ${this.sensorData
              ? html`
                  <div class="sensor-box">
                    <div class="sensor-title">Local Temperature</div>
                    <div class="sensor-data">
                      <svg style="width: 40px; height: 1.5em; fill:rgb(255, 255, 255);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M160 64c-26.5 0-48 21.5-48 48l0 164.5c0 17.3-7.1 31.9-15.3 42.5C86.2 332.6 80 349.5 80 368c0 44.2 35.8 80 80 80s80-35.8 80-80c0-18.5-6.2-35.4-16.7-48.9c-8.2-10.6-15.3-25.2-15.3-42.5L208 112c0-26.5-21.5-48-48-48zM48 112C48 50.2 98.1 0 160 0s112 50.1 112 112l0 164.4c0 .1 .1 .3 .2 .6c.2 .6 .8 1.6 1.7 2.8c18.9 24.4 30.1 55 30.1 88.1c0 79.5-64.5 144-144 144S16 447.5 16 368c0-33.2 11.2-63.8 30.1-88.1c.9-1.2 1.5-2.2 1.7-2.8c.1-.3 .2-.5 .2-.6L48 112zM208 368c0 26.5-21.5 48-48 48s-48-21.5-48-48c0-20.9 13.4-38.7 32-45.3L144 144c0-8.8 7.2-16 16-16s16 7.2 16 16l0 178.7c18.6 6.6 32 24.4 32 45.3z"/></svg>
                      <span class="senstemp">${this.sensorData.temperature}°C</span><br/>
                      <svg style="width: 40px; height: 1.5em; fill:rgb(255, 255, 255);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0l1.8 0c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192zM96 336c0-8.8-7.2-16-16-16s-16 7.2-16 16c0 61.9 50.1 112 112 112c8.8 0 16-7.2 16-16s-7.2-16-16-16c-44.2 0-80-35.8-80-80z"/></svg>
                      <span class="senstemp">${this.sensorData.humidity} %</span>
                    </div>
                  </div>
                `
              : html`<p>Loading outdoor sensor data...</p>`}
          `;
        })();

    return html`${content}`;
  }
}




customElements.define('weather-widget', WeatherWidget);
