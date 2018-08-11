'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let request = require('request-promise');
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
    activity: async function (url) {
        let output = ['pds'];
        await function getActivity(url, type) {
            try {
                request({
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
                            return getActivity(result.url, "location");
                        });
                    }

                    if (data.next)
                        return getActivity(data.next, "activity");
                });
            }
            catch (err) {
                console.log(err);
            }
        };
        console.log(output);
        return output;
    }
};