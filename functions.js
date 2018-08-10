'use strict';

let request = require('request');
let datasets = [];
module.exports = class Api {
    constructor(req, res, domain) {
        this.req = req;
        this.res = res;
        this.domain = domain;
    }

    async getLocations(url, locations) {
        request.get({
            uri: url,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                throw error;

            locations.push(data.body.results.map(function (result) {
                return [result.point.pos.latitude, result.point.pos.longitude];
            }));

            if (result.next) {
                self.getLocations(result.next, locations);
            }
        });
    }

    getProjects(url) {
        request.get({
            uri: url,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                return this.res.status(500).end('Internal Server Error');

            datasets.push(data.body.results.map(function (result) {
                let locations = [];
                parent.getLocations(this.domain + "/api/locations/?format=json&activity_id=" + result.iati_identifier, locations);
                return [result.iati_identifier, locations];
            }));

            if (result.next) {
                self.getProjects(result.next);
            }
            else {
                return this.res.status(200).json(datasets);
            }
        });
    }
};
