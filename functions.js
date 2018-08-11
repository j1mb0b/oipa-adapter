'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache({stdTTL: 100, checkperiod: 120});
let request = require('request-promise');
let output = [];
module.exports = {
    cacheGet: function (key) {
        oipaCache.get(key, function (err, value) {
            if (!err) {
                if (value == undefined) {
                    return false;
                } else {
                    return value;
                }
            }
        });
    },
    cacheSet: function (key, obj) {
        oipaCache.set(key, obj, function (err, success) {
            if (!err && success) {
                return true;
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

            if (Object.keys(output).length > 0)
                console.log(output);

            return output;
        });
    },
    main: function (url, domain) {
        let results;
        if (results = module.exports.cacheGet(url)) {
            return results;
        }
        else {
            results = module.exports.activity(url, domain, "activity");
            module.exports.cacheSet(url, results);
            return results;
        }
    }
};
