# COMP2110 Portal - Starter

This is the starter repository for the COMP2110 Portal front end assignment 2023. You are
expected to customise this README file to describe your own project.  You should update this
file with some documentation on your group's implementation.

## Installation

The project has no external dependencies, it uses Lit via a CDN load directly into
the HTML page.   Node is used only to run a local HTTP server.

```bash
npm install
```

Will install the `http-server` node module.

```bash
npm start
```

will run the server.

## Assignment

Details about the assignment and back-end server are provided in [this document](Assignment.md).

Weather Widget(Mushfiqur):
 I created a weather widget that fetches public weather sensor data from /home/outside without requiring authentication. I fixed issues with data format, ensured the correct API schema was used. Now, both widgets display accurate sensor data as expected.

 I cleaned up my WeatherWidget component. I added emojis to better represent the weather description. I pulled data about the outdoor sensor (temperature and humidity) by making an authenticated API request to the backend, extracting the latest sensor reading, and displaying it one section below the main weather info. To make my code cleaner and easier to maintain, I refactored the backend URL usage by importing a BASE_URL constant from a config.js file and replaced all hardcoded backend URLs with ${BASE_URL}, so future URL changes can be managed in one place.

 I changed the look of the weather widget more. Added a video background. Removed the time as there is already time displayed on the indoor sensor widget. Added svg icons and adjusted css.

 I changed the entire css for the entire website to make it look better. I added svg art to make it look good. Changed the login functionality so that when wrong credentials or empty fields are submitted, they show some text to let the user know of what is needed to verify. Made the webpage responsive for different device sizes. 

Useful variable information:

weather: holds the current weather data object fetched from the Open-Meteo API, including temperature, windspeed, and weathercode.
error: stores error messages to be displayed in the UI when API calls fail or other errors occur.
sensorData: holds the latest temperature and humidity readings from a local outdoor sensor.
getUser: imported function used to retrieve the current authenticated user and their token for API authorization.
BASE_URL: imported constant representing the base URL of the sensor API endpoint.
coords: local variable in fetchWeather and getCoordinates methods; stores latitude and longitude fetched from the geocoding API.
latitude: extracted latitude value from geocoding API response coordinates.
longitude: extracted longitude value from geocoding API response coordinates.
weatherRes: response object from the weather API fetch call.
data: generic local variable used to store JSON-parsed responses from API calls (both weather and geocoding).
geoRes: response object from the geocoding API fetch call.
user: local variable representing the authenticated user object with authorization token for sensor API calls.
sensorId: hardcoded sensor ID used to fetch outdoor sensor data.
res: response object from the outdoor sensor API fetch call.
sensor: JSON-parsed object containing sensor data history fetched from the sensor API.
latest: the most recent data point extracted from the sensor data history for display.
weatherDescriptions: an object mapping Open-Meteo weather codes to human-readable weather descriptions.
weatherIcons: an object mapping general weather conditions to emoji icons representing weather visually.
weatherIcon: the selected emoji icon string that corresponds to the current weather condition.
weatherDescription: human-readable weather description string derived from the weather code.
weatherTime: a JavaScript Date object created by parsing the time string from the weather API response.
formattedTime: a string representing the formatted local time extracted from weatherTime for display in the UI.


Sensor Widget(Shawal)
    This section displays real-time data from the Living Room Light Sensor via the /home/sensors/737 API endpoint. It retrieves the current lux value (brightness) and refreshes dynamically every 30 seconds to display the current reading.

    Features:
    ux Display: Shows the most recent lux reading as a bulb icon with bold visual emphasis.

    Auto Theme Adjustment: Darkens background when lux is below 50 to indicate low-light conditions.

     Animated Feedback: Triggers a glow effect whenever the lux value increases, enabling users to instantly sense environmental changes.

    Timestamp Formatting: Easy-to-read date and time of the previous measurement.
    
    Auto Refresh: Periodically updates the latest data every 30 seconds.

    Contextual Suggestion: Incorporates basic understanding based on level of brightness (e.g., "Very bright!" or "Dim lighting").
    
    API Usage
    Endpoint: GET /home/sensors/737?count=1

    Authentication: Requires a valid Bearer token from the logged-in user.

    Data Fields Used:

    lux: Light level in lux (numeric)

    timestamp: Millisecond timestamp of the last reading

    Tech Stack
    Framework: Lit

    Custom Element: <sensor-widget>



    Shopping List Widget (Nathan) 
        The shopping list widget shows the current list of items needed. It displays the data using the list/1 API endpoint from the BASE_URL. It requires the user to be logged in and authenticated on the page otherwise it will display an error message. I originally had all the work done in commits but it was on a detached head so when staging the changes in main its all one lump sum of work. 

        Features: It has a minimalistic look with contrasting colours between the main components and the background of the widget. The widget has a red cross icon to signify the ability to delete items from the list while there is a textbox at the bottom with a brightly coloured add button to allow the user to add items into the list if need be. The main list itself is dark however the item lettering is bright white to contrast allowing users to easily see. This improves both visibility and accessibility. 

        Added comments to the shopping list widget.

Some useful variables and their descriptions:

        LitElement, html, css: imported from the Lit library to create a web component, define HTML templates, and apply CSS styles.
getUser: imported function to retrieve the current authenticated user and their token for API calls.
BASE_URL: imported constant representing the base API endpoint URL.
list: property holding the shopping list object fetched from the backend, including the title and contents (items).
error: property holding error message strings to be displayed in the UI when something goes wrong.
newItemContent: property holding the string content entered by the user for adding a new shopping list item.
styles: CSS styles applied to the component for layout, colors, fonts, and interactive elements.
constructor: initializes the component's reactive properties (list, error, newItemContent) with default values.
firstUpdated: lifecycle method called once after the component's first render, used here to load the shopping list from the API.
loadShoppingList: asynchronous method fetching the shopping list data from the API, sets error messages or updates the list property.
user: local variable representing the authenticated user object including token, used to authorize API requests.
res: local variable holding the fetch response object from API calls.
addItem: event handler method triggered on form submission; posts a new item to the API and reloads the list.
e: event object parameter in addItem method representing the form submission event.
removeItem: asynchronous method triggered by clicking the delete button; sends a DELETE request for the specified item ID and reloads the list.
itemId: parameter passed to removeItem representing the ID of the item to be deleted.
render: method returning the HTML template for the component, conditionally displaying errors, loading state, or the shopping list with interactive controls.
item: local variable used in the render method’s map function to represent each shopping list item object, with properties like id and content.
deleteButton: CSS class applied to the delete buttons in the list items.
addButton: CSS class applied to the button for adding new items.
bg-image: CSS class applied to the background image used for visual styling behind the list or empty list message.
aria-label: accessibility attributes used on buttons and inputs to describe their function for screen readers.