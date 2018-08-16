// Initialize leaflet.js
const L = require('leaflet');

// Initialize the map
const map = L.map('map', {
    scrollWheelZoom: true
});

L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// Set the position and zoom level of the map
map.setView([47.70, 13.35], 7);

// Initialize the base layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 0,
    id: 'map',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);
