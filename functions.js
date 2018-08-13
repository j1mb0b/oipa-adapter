'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let Axios = require('axios');
module.exports = {
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
    getActivity: function (url) {
        let output = [];
        return new Promise(function(resolve, reject) {
            recursiveGetActivity(url);
            function recursiveGetActivity(url) {
                Axios({
                    method: 'GET',
                    url: url,
                    json: true,
                }).then(activities => {

                    activities.data.results.map(function (result) {
                        output.push(module.export.getLocation(result.url));
                    });

                    if (activities.data.next !== null) {
                        return recursiveGetActivity(activities.data.next);
                    }
                    else {
                        resolve(output);
                    }
                });
            }
        });
    },
    getLocation: function (item) {
        let locations = [];

        const response = Axios({
            method: 'GET',
            url: item,
            json: true,
        });

        response.data.locations.map(function (loc) {
            if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
        });

        return location;
    },
    main: function (url) {
        return module.exports.getActivity(url);
    }
};