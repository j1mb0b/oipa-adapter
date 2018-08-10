'use strict';

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
                    let obj = Object.keys(result);
                    if (typeof result.point.pos !== 'undefined')
                        return [result.point.pos[obj[0]], result.point.pos[obj[1]]];
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
                output.push(data.body.results.map(function (result) {
                    let locations = [];
                    module.exports.getLocations(domain, result.iati_identifier, locations);
                    return [result.iati_identifier, locations];
                }));
            }

            if (data.body.next) {
                module.exports.getProjects(data.body.next, domain);
            }
        });

        return output;
    }
};
