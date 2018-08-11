'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let request = require('request-promise');
let output = [];
module.exports = {
    activityCache: function (url) {
        let response = module.exports.cacheGet(url);
        if (typeof response !== 'undefined')
            return response;

        return module.exports.activity(url, "activity");
    },
    cacheGet: function (key) {
        return oipaCache.get(key, function (err, value) {
            if (!err) {
                return value;
            }
        });
    },
    cacheSet: function (key, obj) {
        return oipaCache.set(key, obj, function (err, success) {
            if (!err && success) {
                return obj;
            }
        });
    },
    activity: function (url, type) {
        return request({
            "method": "GET",
            "uri": url,
            "json": true
        }).then(function (data) {
            if (type === "location") {
                data.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                        output.push(loc.point.pos.latitude, loc.point.pos.longitude);
                });
            }
            else {
                data.results.map(function (result) {
                    return module.exports.activity(result.url, "location");
                });
            }

            if (data.next) {
                return module.exports.activity(data.next, "activity");
            }
            else if (Object.keys(output).length > 0) {
                return module.exports.cacheSet(url, output);
            }
        });
    },
    main: function (url, domain) {
        return module.exports.activityCache(url)
            .then(function (result) {
                console.log(result);
                return result;
            })
            .catch(function (error) {
                throw error;
            });
    }
};