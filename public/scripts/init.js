// Initialize leaflet.js
const L = require('leaflet');
const MC = require('leaflet.markercluster');
let jsdom = require('jsdom');
const {JSDOM} = jsdom;
const {window} = new JSDOM();
const {document} = (new JSDOM('')).window;
global.document = document;

let $ = jQuery = require('jquery');

$(document).ready(function () {
    (function (global, undefined) {
        //The following method is created based on Ray casting algorithm
        //Source: https://github.com/substack/point-in-polygon
        //Source: https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
        function isMarkerInsidePolygon(marker, poly) {
            console.log(marker);
            console.log(poly);
            var polyPoints = poly.getLatLngs();
            var x = marker.getLatLng().lat, y = marker.getLatLng().lng;
            var inside = false;
            for (var a = 0; a < polyPoints.length; a++) {
                for (var i = 0, j = polyPoints[a].length - 1; i < polyPoints[a].length; j = i++) {
                    var xi = polyPoints[a][i].lat, yi = polyPoints[a][i].lng;
                    var xj = polyPoints[a][j].lat, yj = polyPoints[a][j].lng;
                    var intersect = ((yi > y) != (yj > y))
                        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                    if (intersect) {
                        inside = !inside;
                    }
                }
            }
            return inside;
        };

        //helpers for the markers
        function markerOptions(id, title) {
            return geojsonMarkerOptionsStuff = {
                radius: 6,
                fillColor: "#a04567",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                id: id,
                title: title
            };
        }

        function buildClusterPopupHtml(locations) {
            //alert(iatiTitle + iatiId);
            var items = [];
            for (var i = 0; i < locations.length; i++) {
                var location = locations[i];
                items.push([
                    "<div class='row'>",
                    "<div class='five columns location-label'>",
                    "<a href='/projects/", location.id, "'>", location.id, "</a>",
                    "</div>",
                    "<div class='seven columns'>", location.title, "</div>",
                    "</div>"
                ].join(""));
            }

            return [
                "<div class='location-popup large'>",
                items.join(""),
                "</div>"
            ].join("")
        }

        var countryName = $("#countryName").val();
        var countryCode = $("#countryCode").val();
        var projectType = $("#projectType").val();
        var map;

        var mapBox = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        if (projectType == "global") {

            map = new L.Map('countryMap', {
                center: new L.LatLng(7.79, 21.28),
                zoom: 1,
                layers: [mapBox]
            });
        } else if (countryName && countryCode) {

            if (countryBounds[countryCode][2] != null) {
                zoomFactor = countryBounds[countryCode][2];
                console.log(zoomFactor);
            }
            else zoomFactor = 6;

            map = new L.Map('countryMap', {
                center: new L.LatLng(countryBounds[countryCode][0], countryBounds[countryCode][1]),
                zoom: zoomFactor,
                layers: [mapBox]
            });
        } else if (countryCode) {
            var bounds = regionBounds[countryCode];
            var boundary = new L.LatLngBounds(
                new L.LatLng(bounds.southwest.lat, bounds.southwest.lng),
                new L.LatLng(bounds.northeast.lat, bounds.northeast.lng)
            );

            map = new L.Map('countryMap',
                {
                    layers: [mapBox]
                });
            map.fitBounds(boundary);
            map.panInsideBounds(boundary);
        } else {
            $('#countryMap').hide();
            $('#countryMapDisclaimer').hide();
        }

        // create the geopoints if any are defined
        if (!map) {
            return;
        }

        //var url = "http://18.221.72.54:8000/api/activities/?format=json&reporting_organisation=" + reportingOrgs + "&hierarchy=1&recipient_country=&fields=title,iati_identifier,locations&page_size=500&activity_status=2";
        var iati;
        $.getJSON("/scripts/leaflet/activity.json", function (data) {
            iati = data;
        }).done(function () {
            //$('.modal_map_markers').hide();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

        //get country locations from OIPA API
        // creates the country polygons
        $.getJSON("/scripts/leaflet/countries.json", function (countriesData) {
            for (var countryDataIndex in countriesData) {
                var countryData = countriesData[countryDataIndex];
                if (countryData.budget > 0) {
                    var multiVertices = new Array();
                    for (var countryPolygonesDefArrayIndex = 0; countryPolygonesDefArrayIndex < polygonsData[countryData.id].length; countryPolygonesDefArrayIndex++) {
                        var countryPolygoneDefString = polygonsData[countryData.id][countryPolygonesDefArrayIndex];
                        var verticesDefArray = countryPolygoneDefString.split(" ");
                        var vertices = new Array();
                        for (var vertexDefStringIndex = 0; vertexDefStringIndex < verticesDefArray.length; vertexDefStringIndex++) {
                            var vertexDefString = verticesDefArray[vertexDefStringIndex].split(",");
                            var longitude = vertexDefString[0];
                            var latitude = vertexDefString[1];
                            var latLng = new L.LatLng(latitude, longitude);
                            vertices[vertices.length] = latLng;
                        }
                        multiVertices[multiVertices.length] = vertices;
                    }
                    var multiPolygon = L.polygon(multiVertices, {
                        stroke: true, /* draws the border when true */
                        color: 'red', /* border color */
                        weight: 1, /* stroke width in pixels */
                        fill: true,
                        fillColor: '#204B63',//"#204B63",
                        fillOpacity: 0.4
                    });

                    multiPolygon.addTo(map);
                    /* finally addes the polygon to the map */
                    /* polygon events: click (popup), mouseover, mouseout */
                    /* paint the country red on mouseover */
                    multiPolygon.on("click", function (countryData) {
                        //alert(countryData.country);
                    }(countryData), multiPolygon);

                    $('.modal_map_markers').show();
                    //set up markerCluster
                    var markers = new L.MarkerClusterGroup({
                        spiderfyOnMaxZoom: true,
                        showCoverageOnHover: false,
                        singleMarkerMode: true,
                        maxClusterRadius: 40,
                        removeOutsideVisibleBounds: false,
                        iconCreateFunction: function (cluster) {
                            var count = cluster.getChildCount();
                            var additional = ""
                            if (count > 99) {
                                count = "+";
                                additional = "large-value";
                            }

                            return new L.DivIcon({html: '<div class="marker cluster ' + additional + '">' + count + '</div>'});
                        }
                    });

                    markers.on('clusterclick', function (a) {
                        //alert("clusterclick" +  a.target._zoom + " "  + a.target._maxZoom);
                        var atMax = a.target._zoom == a.target._maxZoom
                        if (atMax) {
                            var clusterLocations = [];
                            for (var i = 0; i < a.layer._markers.length; i++) {
                                clusterLocations.push(a.layer._markers[i].options);
                            }

                            var html = buildClusterPopupHtml(clusterLocations)
                            var popup = L.popup()
                                .setLatLng(a.layer._latlng)
                                .setContent(html)
                                .openOn(map);
                        }
                    });


                    //iterate through every activity
                    iati.results.forEach(function (d) {
                        var iatiIdentifier = d.iati_identifier;
                        var dtUrl = "https://devtracker.dfid.gov.uk/projects/" + iatiIdentifier;
                        var title = (d.title.narratives != null) ? d.title.narratives[0].text : "";
                        //iterate over each location
                        d.locations.forEach(function (p) {
                            if (p.point.pos !== null) {
                                try {
                                    var latlng = L.latLng(p.point.pos.latitude, p.point.pos.longitude);
                                    var marker = new L.circleMarker(latlng, markerOptions(iatiIdentifier, title));
                                    //create popup text
                                    var locationName = "dsdsqdqs";//p.name[0].narratives[0].text;
                                    marker.bindPopup("<a href='" + dtUrl + "'>" + title + " (" + iatiIdentifier + ")</a>" + "<br />" + locationName);
                                    //if(tempBreaker == 0 && (p.administrative[0].code == countryCode || p.name[0].narratives[0].text)){
                                    //if(tempBreaker == 0 && (p.name[0].narratives[0].text.includes(countryName) || p.description[0].narratives[0].text.includes(countryName))){
                                    if (isMarkerInsidePolygon(marker, multiPolygon)) {
                                        console.log('SUCCESS');
                                        //add to the map layer
                                        markers.addLayer(marker);
                                    }
                                }
                                catch (e) {
                                    console.log(e);
                                    console.log(iatiIdentifier);
                                    console.log("variable doesn't exist");
                                }
                            }
                        });
                    });

                    map.addLayer(markers);
                }
            }
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

    })(this)
});