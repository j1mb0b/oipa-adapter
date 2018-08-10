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
                if (typeof result.point.pos !== 'undefined')
                    return;

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

            data.body.results.map(function (result) {
                datasets.push(result.iati_identifier);

                result.iati_identifier,
                    async.waterfall(
                    [
                        function(callback) {
                            let locations = [];
                            module.exports.getLocations(domain, result.iati_identifier, locations);
                            callback(null, locations);
                        }
                    ],
                    function (err, locations) {
                        datasets.push(locations);
                    }
                );

                console.log(url);

                if (result.next) {
                    module.exports.getProjects(result.next, domain);
                }
                else {
                    return datasets;
                }
            });
        });
    }
};
