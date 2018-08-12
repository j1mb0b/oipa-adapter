'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let request = require('request-promise');
let Axios = require('axios');
let output = [];
module.exports = {
    cacheGet: function (key) {
        oipaCache.get(key, function (err, value) {
            if (!err) {
                return value;
            }
        });
    },
    cacheSet: function (key, obj) {
        oipaCache.set(key, obj, function (err, success) {
            if (!err && success) {
                return obj;
            }
        });
    },
    activity: async function (url, domain) {
        return request({
            "method": "GET",
            "uri": url,
            "json": true
        }).then(function(activities) {
            activities.results.map(function (result) {
                output.push(result.url);
            });

            if (activities.next) {
                return module.exports.activity(activities.next, domain);
            }

            return output;
        });
    },
    locations: async function (url) {
        return request({
            "method": "GET",
            "uri": url,
            "json": true
        }).then(function(results) {
            results.locations.map(function (loc) {
                if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                    locations.push(loc.point.pos);
            });

            if (results.next) {
                module.exports.locations(results.next);
            }

            return locations;
        });
    },
    getActivity: async function (url) {
        const activities = await Axios({
            method: 'GET',
            url: url,
            json: true,
        });

        activities.data.results.map(function (result) {
            output.push(result.url);
        });

        // Wait for the promises to resolve
        return Promise.all(output).then(function(result) {
            // If next is empty, return the result
            console.log(activities.data.next);
            if (activities.data.next)
                return module.exports.getActivity(activities.data.next);
            // If there is a next, repeat results.
            return result;
        });
    },
    getLocations: async function (urls) {
        const promises = urls.map(async item => {
            //return await module.exports.locations(item);
            const response = await Axios({
                method: 'GET',
                url: item,
                json: true,
            });

            let locations = [];
            response.data.locations.map(function (loc) {
                if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                    locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
            });

            return locations;
        });

        return await Promise.all(promises);
    },
    main: function (url) {
        return module.exports.getActivity(url)
            .then(module.exports.getLocations);
    }
};