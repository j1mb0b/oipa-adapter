'use strict';

let rp = require('request-promise');
let output = [];
module.exports = {
    getLocations: function(domain, id) {
        let options = {
            method: 'GET',
            uri: domain + "/api/locations/?format=json&activity_id=" + id,
            gzip: true,
            json: true
        };

        rp(options)
            .then(function (data) {
                let locations = [];

                if (typeof data.results !== 'undefined') {
                    locations.push(data.results.map(function (result) {
                        if (result.point.pos !== 'null')
                            return result.point.pos;
                    }));
                }
                return locations;
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
                if (typeof data.results !== 'undefined') {
                    output.push(data.results.map(function (result) {
                        return [result.iati_identifier];
                    }));
                }

                if (data.next) {
                    return module.exports.getProjects(data.next, domain);
                }
                else {
                    console.log(output);
                    return output;
                }
            })
            .catch(function (error) {
                throw error;
            });
    }
};
