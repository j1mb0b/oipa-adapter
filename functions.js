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
    activity: async function (url, domain, type) {
        await request({
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

            if (data.next)
                return module.exports.activity(data.next, domain, "activity");
        }).catch(function () {
            console.log("Promise Rejected");
        });

        if (Object.keys(output).length > 0) {
            console.log(output);
            return output;
        }
    }
};