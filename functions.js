'use strict';

let request = require('request');
let datasets = [];
module.exports = class Api {
    constructor(domain) {
        this.domain = domain;
    }

    getProjects(url) {
        console.log(this.domain);
        request.get({
            uri: url,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                throw error;
            console.log(this.domain);

            datasets.push(data.body.results.map(function (result) {
                let locations = [];
                //this.getLocations(this.domain + "/api/locations/?format=json&activity_id=" + result.iati_identifier, locations);

                request.get({
                    uri: this.domain + "/api/locations/?format=json&activity_id=" + result.iati_identifier,
                    gzip: true,
                    json: true
                }, function (error, data) {
                    if (error)
                        throw error;

                    locations.push(data.body.results.map(function (result) {
                        return [result.point.pos.latitude, result.point.pos.longitude];
                    }));
                });

                return [result.iati_identifier, locations];
            }));

            if (result.next) {
                this.getProjects(result.next);
            }
            else {
                return datasets;
            }
        });
    }
};
