// Initialize leaflet.js
const url = require('url');
const L = require('leaflet');
const MC = require('leaflet.markercluster');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const {window} = new JSDOM();
const {document} = (new JSDOM('')).window;
global.document = document;

let $ = jQuery = require('jquery');

$(document).ready(function () {
    (function (global, undefined) {
        /**
         * The following method is created based on Ray casting algorithm
         * Source: https://github.com/substack/point-in-polygon
         * Source: https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
         * @param marker
         * @param poly
         * @returns {boolean}
         */
        function isMarkerInsidePolygon(marker, poly) {
            let polyPoints = poly.getLatLngs();
            let x = marker.getLatLng().lat, y = marker.getLatLng().lng;
            let inside = false;
            for (let a = 0; a < polyPoints.length; a++) {
                for (let i = 0, j = polyPoints[a].length - 1; i < polyPoints[a].length; j = i++) {
                    let xi = polyPoints[a][i].lat, yi = polyPoints[a][i].lng;
                    let xj = polyPoints[a][j].lat, yj = polyPoints[a][j].lng;
                    let intersect = ((yi > y) != (yj > y))
                        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                    if (intersect) {
                        inside = !inside;
                    }
                }
            }
            return inside;
        };

        /**
         * Helpers for the markers
         * @param id
         * @param title
         * @returns {{radius: number, fillColor: string, color: string, weight: number, opacity: number, fillOpacity: number, id: *, title: *}}
         */
        function markerOptions(id, title) {
            return geojsonMarkerOptionsStuff = {
                radius: 6,
                fillColor: "#C2585C",
                color: "#fff",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                id: id,
                title: title
            };
        }

        /**
         * Callback for popup markup.
         * @param locations
         * @returns {string}
         */
        function buildClusterPopupHtml(locations) {
            //alert(iatiTitle + iatiId);
            let items = [];
            for (let i = 0; i < locations.length; i++) {
                let location = locations[i];
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

        /**
         * Function used for number formatting (100000 becomes 100,000)
         * @param nStr
         * @returns {*}
         */
        function addCommas(nStr){
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            let rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }

        /**
         * Creates the HTML for the popup when a country is clicked
         * @param countryData
         * @returns {string}
         */
        function getPopupHTML(countryData, countryCode){
            let date = new Date();
            let currentFY = "";
            if (date.getMonth() < 3)
                currentFY = "FY" + (date.getFullYear() - 1) + "/" + date.getFullYear();
            else
                currentFY = "FY" + date.getFullYear() + "/" + (date.getFullYear() + 1);
            let output = "<div class='popup' style='min-width:350px;'>" +
                "<h1><img class='flag' alt='Country Flag' src='" + countryData.flag + "' /> " + countryData.country + "</h1>";

            if (countryData.budget !== null) {
                countryData.budget.forEach(function (d) {
                    output +=
                        "<div class='col'>" +
                        "<h3>Country budget FY " + d.year +"</h3>" +
                        "</div>" +
                        "<div class='val'>" +
                        "<p>&euro;" + addCommas(d.value) + "</p>" +
                        "</div>";
                });
            }

            output += "<div class='row'>";
            if (!countryCode) {
                output += "<div class='btn'><a href='?country=" + countryData.id + "'>Filter by this country</a></div>";
            }
            else {
                output += "<div class='btn'><a href='/'>Back to all countries</a></div>";
            }
            output +=
                "</div>" +
                "</div>";

            return output;
        }

        /**
         * The code below this point is responsible for requesting OIPA data and rendering the map objects.
         * @type {jQuery}
         */

        let countryName = $("#countryName").val();
        let countryCode = country ? country : $("#countryCode").val();
        let projectType = $("#projectType").val();
        let map;

        let mapBox = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            maxZoom: 19
        });

        if (!countryCode && projectType == "global") {
            map = new L.Map('countryMap', {
                center: new L.LatLng(7.79, 21.28),
                zoom: 2,
                layers: [mapBox]
            });
        } else if (countryCode) {

            if (countryBounds[countryCode][2] != null) {
                zoomFactor = countryBounds[countryCode][2];
            }
            else zoomFactor = 6;

            map = new L.Map('countryMap', {
                center: new L.LatLng(countryBounds[countryCode][0], countryBounds[countryCode][1]),
                zoom: zoomFactor,
                layers: [mapBox]
            });
        } else {
            $('#countryMap').hide();
            $('#countryMapDisclaimer').hide();
        }

        // Create the geopoints if any are defined
        if (!map) {
            return;
        }

        // Get locations from OIPA API.
        let endpoint = "http://18.221.72.54:8000/api/activities/?format=json&reporting_organisation=XM-DAC-2-10&hierarchy=1&fields=title,iati_identifier,locations,url&page_size=500";
        $.ajax({
            type: 'GET',
            url: "/oipa",
            headers: {
                'Content-Type': 'application/json',
                'x-secret': 'TFXALAUc21Bc7iG0T3l1kdzOZ', // @TODO - remove and store securely.
                'x-url': endpoint
            }
        }).done(function (iati) {
            // Get country locations from OIPA
            // Creates the country polygons
            let select = document.getElementById("countryFilter");
            $.getJSON("/public/countries.json", function (countriesData) {
                if (countryCode) {
                    let cdata = {};
                    cdata[countryCode] = countriesData[countryCode];
                    countriesData = cdata;
                }

                for (let countryDataIndex in countriesData) {
                    let countryData = countriesData[countryDataIndex];
                    let multiVertices = new Array();
                    for (let countryPolygonesDefArrayIndex = 0; countryPolygonesDefArrayIndex < polygonsData[countryData.id].length; countryPolygonesDefArrayIndex++) {
                        let countryPolygoneDefString = polygonsData[countryData.id][countryPolygonesDefArrayIndex];
                        let verticesDefArray = countryPolygoneDefString.split(" ");
                        let vertices = new Array();
                        for (let vertexDefStringIndex = 0; vertexDefStringIndex < verticesDefArray.length; vertexDefStringIndex++) {
                            let vertexDefString = verticesDefArray[vertexDefStringIndex].split(",");
                            let longitude = vertexDefString[0];
                            let latitude = vertexDefString[1];
                            let latLng = new L.LatLng(latitude, longitude);
                            vertices[vertices.length] = latLng;
                        }
                        multiVertices[multiVertices.length] = vertices;
                    }
                    let multiPolygon = L.polygon(multiVertices, {
                        stroke: true,
                        color: 'white',
                        weight: 1,
                        fill: true,
                        fillColor: '#3BBCE0',
                        fillOpacity: 0.4
                    });

                    multiPolygon.addTo(map);
                    multiPolygon.bindPopup(getPopupHTML(countryData, countryCode), { minWidth: 200 });
                    multiPolygon.on("mouseover", function(countryData){
                        return(function(e){
                            this.setStyle({
                                fillColor: "#0F9EC9"
                            });
                        })
                    }(countryData),multiPolygon);
                    multiPolygon.on("mouseout", function(countryData){
                        return(function(e){
                            this.setStyle({
                                fillColor: '#3BBCE0'
                            });
                        })
                    }(countryData),multiPolygon);

                    $('.modal_map_markers').show();
                    //set up markerCluster
                    let markers = new L.MarkerClusterGroup({
                        spiderfyOnMaxZoom: true,
                        showCoverageOnHover: false,
                        singleMarkerMode: true,
                        maxClusterRadius: 40,
                        removeOutsideVisibleBounds: false,
                        iconCreateFunction: function (cluster) {
                            let count = cluster.getChildCount();
                            let additional = ""
                            if (count > 99) {
                                count = "+";
                                additional = "large-value";
                            }

                            return new L.DivIcon({html: '<div class="marker cluster ' + additional + '">' + count + '</div>'});
                        }
                    });

                    markers.on('clusterclick', function (a) {
                        let atMax = a.target._zoom == a.target._maxZoom
                        if (atMax) {
                            let clusterLocations = [];
                            for (let i = 0; i < a.layer._markers.length; i++) {
                                clusterLocations.push(a.layer._markers[i].options);
                            }

                            let html = buildClusterPopupHtml(clusterLocations)
                            let popup = L.popup()
                                .setLatLng(a.layer._latlng)
                                .setContent(html)
                                .openOn(map);
                        }
                    });

                    // Iterate through every activity
                    iati.results.forEach(function (d) {
                        let iatiIdentifier = d.iati_identifier;
                        let dtUrl = siteName + "/" + iatiIdentifier;
                        let title = (d.title.narratives != null) ? d.title.narratives[0].text : "";
                        // Iterate over each location
                        d.locations.forEach(function (p) {
                            if (p.point.pos !== null) {
                                try {
                                    let latlng = L.latLng(p.point.pos.latitude, p.point.pos.longitude);
                                    let marker = new L.circleMarker(latlng, markerOptions(iatiIdentifier, title));
                                    //create popup text
                                    let locationName = (p.name != null) ? p.name[0].narratives[0].text : "No narrative text at location level.";
                                    marker.bindPopup("<a href='" + dtUrl + "'>" + title + " (" + iatiIdentifier + ")</a>" + "<br />" + locationName);
                                    if (isMarkerInsidePolygon(marker, multiPolygon)) {
                                        //add to the map layer
                                        markers.addLayer(marker);
                                    }
                                }
                                catch (e) {
                                    console.log(e);
                                    console.log(iatiIdentifier);
                                    console.log("Variable doesn't exist");
                                }
                            }
                        });
                    });

                    map.addLayer(markers);
                }
            }).fail(function (jqxhr, textStatus, error) {
                let err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
            });
        }).fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

    })(this)
});