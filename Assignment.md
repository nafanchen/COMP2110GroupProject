# Web Development Assignment 2025

## Home Automation Portal

In this assignment you will implement a home automation portal that can display
a collection of **widgets** that show devices or sensors or other kinds
of information.  This is inspired by the [Home Assistant](https://www.home-assistant.io/) project, an open source home automation toolkit.

## Starter Code

The code included here implements the basic framework for the application, including
an overall page structure and the login and advertising components.  If you run
the application you will see the basic page with space for a number of _widgets_.  
You will fill these slots with your own widgets - one per team member. (A _widget_
is a name for an element of a graphical user interface, basically the same as a
component).

The module `config.js` exports a variable `BASE_URL` that contains the address
of the backend server. This is used for example in the ad-widget component
to define the URL endpoint.  You will also want to use it if you make use of
other API endpoints from the server.

The code contains implementations of the following components:

### `<comp2110-dashboard>`

This is a container for the whole application and currently contains
some of the pre-defined widgets.  You can modify this as you see fit to achieve
your overall application layout and behaviour.

### `<widget-column>`

This component implements a container for widgets and can be used to define
the style information and layout for the group.  You can modify this if you
wish or replace it with something else.

### `<login-widget>`

This component implements a login form that will allow a user to authenticate to the
backend server.   If the user is logged in, the component displays their name and
a logout button rather than the form.  

Authentication is implemented in the `auth.js` module.  Once a user login succeeds,
the current user details are stored in the browser 
[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) so that
they persist over browser sessions.  In your code, you can use the function
`getUser()` from the `auth.js` module to find out if a user is logged in and get
their details.  

### `<ad-widget>`

This component displays an advertisement from the backend portal server. You should not
modify it and it should appear somewhere in your page design.

## Home Automation API

Your portal will make use of a server that we have implemented that is running 
on <https://comp2110-portal-server.fly.dev/>.  Documentation for the services it provides
is in [this Github repository](https://github.com/MQ-COMP2110/comp2110-portal-server/).
The API is [documented in detail](https://comp2110-portal-server.fly.dev/api-docs) using the Swagger toolkit; from
that page you can try out each API endpoint to see what it returns.

The server application provides some home automation
services along with other API endpoints.   The home automation API is
simulated - there are no real devices or sensors, the data it returns to you
is fake. However, this gives you a platform to build a prototype HA dashboard
on to develop your web programming skills.

The API also provides more general purpose endpoints such as a list manager
and a task manager.

## Implementing Widgets

Widgets are components that extend the functionality of the application.
Each widget is stand-alone - that is, the application will work with or
without it, but adding it might improve the application.   Each team
member should choose one widget from the list below or (with approval
by email from Steve Cassidy) suggest their own idea.

- **Device controller widget** Displays the status of a device and allows
the user to control it - turning on/off a light, etc.
  - You can select one type of device (lights, heaters, oven) or write a widget that
  can display different types.
- **Sensor display widget** Shows the current data from a sensor
  - Again, you can select one type of sensor (temperature/humidity, indoor light, outdoor light, solar generation)
    to display data from or try to write a general sensor display widget.
  - Sensors return time-series data, your widget could just show the most recent
    values or could show how they varied over time.
- **Device or sensor control widget** A widget that allows you to create new devices
  or sensors in known locations.
- **Home overview widget** shows all of the locations in a home and the devices
or sensors in different locations. Might link to or interact with other
widgets showing sensors or devices (eg. pop up on click or just highlight in
the page).
- **Weather widget** Pulls weather data from an external API and displays it
in the dashboard alongside the local weather data (the outside temperature sensor).
For example <https://api.open-meteo.com/v1/forecast>, e.g.
[this example](https://api.open-meteo.com/v1/forecast?latitude=-33.87&longitude=151.21&current_weather=true).  
Location can be fixed or derived from the Javascript
[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
- **TODO List widget** a shared task list for your home (use the /tasks API)
- **Shopping List** manage a collective shopping list for your home (use /lists API)

The overall organisation of the dashboard can either be fixed - you hand-craft
the layout and the API endpoints that each widget talks to - or automatically
configured based on the API.  In this second case, your app would query the API
for a list of eg. sensors, and display a widget for each one.

### Devices

A device in home automation is something that has a _state_ that can be
controlled.  For example, a light switch can be _on_ or _off_ but can
also have brightness and colour controls; an oven or a heater has can
be on or off but also has a set temperature that can be adjusted.  The
API represents each device with the following JSON structure:

```JSON
{
  "id": 1,
  "owner": "bobalooba",
  "type": "light",
  "label": "Kitchen Light",
  "location": "1",
  "status": "off",
  "properties": {
    "brightness": 52,
    "color": "#ffffff"
  }
}
```

This is the response you will get when you query the API for a particular
device.  To update the state, send a PUT request to /devices/{id} with
a JSON body containing new `status` and `properties`:

```JSON
{
  "status": "on",
  "properties": {
    "brightness": 25,
    "color": "#ffff00"
  }
}
```

Properties can contain anything you want, so it would be possible to add
new properties to a device using this API endpoint.

In the sample data for each group there are three kinds of device: lights,
heaters and an oven.

### Sensors

A sensor returns information about the environment, such as
temperature, humidity and light levels. Sensors can't be controlled.
Data is delivered for different time-points, by default for the last
10.

In this example, we see three readings for a temperature and humidity
sensor.

```JSON
{
  "id": 1,
  "owner": "bobalooba",
  "label": "Temperature",
  "location": "3",
  "type": "tempHumidity",
  "properties": null,
  "data": [
    {
      "timestamp": "1742962498930.0",
      "data": {
        "timestamp": 1742962498930,
        "temperature": 24.861370767158764,
        "humidity": 60.22434642786963
      }
    },
    {
      "timestamp": "1742961322522.0",
      "data": {
        "timestamp": 1742961322522,
        "temperature": 20.4083351816522,
        "humidity": 54.262942286495715
      }
    },
    {
      "timestamp": "1742961312069.0",
      "data": {
        "timestamp": 1742961312069,
        "temperature": 26.867187295480885,
        "humidity": 59.2401460627002
      }
    }
  ]
}
```

Each reading has a timestamp which is a millisecond time; this
can be converted to a date in Javascript:

```Javascript
  const timestamp = new Date(datapoint.timestamp);
```

In the sample data generated for each group there are sensors for: temperature/humidity
indoor light, outdoor light and solar power generation.

### Locations

A location is just a label for a place, you can use the /home/locations API endpoint
to get the names for all numeric location identifiers.

### Lists

The list API lets you create lists that can contain anything you want. Create
a list with a POST request to `/lists/`, it will return the list id.
You can get all of your current lists with a GET request to `/lists/`.
A GET
request to `/lists/1` (where 1 is the list id) will return the list contents:

```JSON
{
  "id": 1,
  "title": "Shopping List",
  "creator": "bobalooba",
  "contents": [
    {
      "id": 3,
      "content": "eggs"
    },
    {
      "id": 5,
      "content": "cheese"
    }
  ]
}
```

To add something to a list just POST to `/lists/1` with a JSON payload:

```JSON
{
  "content": "this will be added to the list"
}
```

To remove something, send a DELETE request to `/lists/1/5` where 1
is the list id and 5 is the id of the list item you want to remove.

## Tasks

The `/tasks/` API implements a simple task manager application that could
be used to implement a TODO list in your dashboard.  A task in this
system is as follows:

```JSON
{
  "summary": "string",
  "text": "string",
  "priority": 1,
  "category": "ToDo",
  "due": "2025-03-28T03:18:06.979Z"
}
```

To implement a simple TODO list you could use this API to create 
tasks. When a task is completed, you could change the `category` to
`Complete`.  The API lets you create, update and delete tasks.
