'use strict';

let request = require('request');
const autoBind = require('auto-bind');
let datasets = [];

module.exports = class Api {
    constructor(req, res, domain) {
        autoBind(this);
        this.req = req;
        this.res = res;
        this.domain = domain;
    }

    getLocations(url, locations) {
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
                this.getLocations(result.next, locations);
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
                return [result.iati_identifier];
            }));

            console.log(datasets[0]);

            let locations = [];
            this.getLocations(this.domain + "/api/locations/?format=json&activity_id=" + datasets[0], locations);

            console.log(locations);

            if (result.next) {
                this.getProjects(result.next);
            }
            else {
                return this.res.status(200).json(datasets);
            }
        });
    }
};
