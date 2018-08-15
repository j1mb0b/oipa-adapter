// Initialize leaflet.js
const L = require('leaflet');

// Initialize the map
const map = L.map('map', {
    scrollWheelZoom: false
});

// Set the position and zoom level of the map
map.setView([47.70, 13.35], 7);

// Initialize the base layer
const osm_mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);