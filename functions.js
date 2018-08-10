'use strict';

let async = require('async');
let request = require('request');
let datasets = [];
module.exports = {
    getLocations: function(domain, id, locations) {
        request.get({
            uri: domain + "/api/locations/?format=json&activity_id=" + id,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                throw error;

            locations.push(data.body.results.map(function (result) {
                return [result.point.pos.latitude, result.point.pos.longitude];
            }));
        });
    },
    getProjects: function(url, domain) {
        request.get({
            uri: url,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                throw error;

            datasets.push(data.body.results.map(function (result) {
                async.waterfall(
                    [
                        function(callback) {
                            let locations = [];
                            this.getLocations(domain, result.iati_identifier, locations);
                            callback(null, locations);
                        }
                    ],
                    function (err, locations) {
                        console.log(locations);
                        return [result.iati_identifier, locations];
                    }
                );
                //return [result.iati_identifier, locations];
            }));

            if (result.next) {
                this.getProjects(result.next, domain);
            }
            else {
                return datasets;
            }
        });
    }
};
