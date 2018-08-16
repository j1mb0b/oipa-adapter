// Initialize leaflet.js
const L = require('leaflet');

// Initialize the map
const map = L.map('map', {
    scrollWheelZoom: false
});

L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// Set the position and zoom level of the map
map.setView([47.70, 13.35], 7);

// Initialize the base layer
const osm_mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
