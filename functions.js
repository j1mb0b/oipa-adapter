'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let request = require('request-promise');
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
        }).then(function(locations) {
            console.log(locations);
            locations.results.map(function (loc) {
                if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                    output.push(loc.point.pos.latitude, loc.point.pos.longitude);
            });

            if (locations.next) {
                module.exports.locations(locations.next);
            }

            return output;
        });
    }
};