'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let request = require('request-promise');
let output = [];
module.exports = {
    cacheGet: function (key) {
        oipaCache.get(key, function (err, value) {
            if (!err) {
                console.log(value);
                if (typeof value !== 'undefined') {
                    console.log('success');
                    return value;
                } else {
                    return "cacheMe";
                }
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
    activity: function (url, domain, type) {
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
                    return module.exports.activity(result.url, domain, "location");
                });
            }

            if (data.next) {
                return module.exports.activity(data.next, domain, "activity");
            }
            else if (Object.keys(output).length > 0) {
                return module.exports.cacheSet(url, output);
            }
        });
    },
    main: function (url, domain) {
        return module.exports.cacheGet(url)
            .then(function (response) {
                if (response !== "cacheMe")
                    return response;

                return module.exports.activity(url, domain, "activity");
            })
            .then(function (result) {
                return result;
            })
            .catch(function (error) {
                throw error;
            });
    }
};