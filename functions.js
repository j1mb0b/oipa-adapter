'use strict';

//let request = require('request-promise');
// setup a cache object
const cacheManager = require('cache-manager');
const cache = cacheManager.caching({
    store: 'memory',
    max: 500 // keep maximum 500 different URL responses
});

const rp = require('request-plus');

// create a concrete wrapper
// you have can multiple in one project with different settings
const request = rp({
    // use retry wrapper
    retry: {
        attempts: 3
    },
    // use cache wrapper
    cache: {
        cache: cache,
        cacheOptions: {
            ttl: 3600 * 4 // 4 hours
        }
    }
});

let output = [];
module.exports = {
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
        return module.exports.activity(url, domain, "activity");
    }
};
