'use strict';

let rp = require('request-promise');
let output = [];
module.exports = {
    getLocations: function(domain, id, locations) {
        let options = {
            method: 'GET',
            uri: domain + "/api/locations/?format=json&activity_id=" + id,
            gzip: true,
            json: true
        };

        rp(options)
            .then(function (data) {
                if (typeof data.body.results !== 'undefined') {
                    locations.push(data.body.results.map(function (result) {
                        if (result.point.pos !== 'null')
                            return result.point.pos;
                    }));
                }
            })
            .catch(function (error) {
                throw error;
            });
    },
    getProjects: function(url, domain) {
        let options = {
            method: 'GET',
            uri: url,
            gzip: true,
            json: true
        };

        rp(options)
            .then(function (data) {
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
                else {
                    return output;
                }
            })
            .catch(function (error) {
                throw error;
            });
    }
};
