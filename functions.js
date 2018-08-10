'use strict';

let async = require('async');
let request = require('request');
let output = [];
module.exports = {
    getLocations: function(domain, id, locations) {
        request.get({
            uri: domain + "/api/locations/?format=json&activity_id=" + id,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                throw error;
            if (typeof data.body.results !== 'undefined') {
                locations.push(data.body.results.map(function (result) {
                    if (typeof result.point.pos !== 'undefined')
                        return;

                    console.log(result.point.pos);
                    return [result.point.pos[latitude], result.point.pos[longitude]];
                }));
            }
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

            if (typeof data.body.results !== 'undefined') {
                data.body.results.map(function (result) {
                    async.waterfall(
                        [
                            function (callback) {
                                let locations = [];
                                module.exports.getLocations(domain, result.iati_identifier, locations);
                                callback(null, locations);
                            }
                        ],
                        function (err, locations) {
                            if (locations) {
                                output.push([result.iati_identifier, locations]);
                            }
                        }
                    );
                });
            }

            if (data.body.next) {
                module.exports.getProjects(data.body.next, domain);
            }
        });

        return output;
    }
};
