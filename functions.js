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
    getActivity: async function (url) {
        let output = [];
        return new Promise( async function(resolve, reject) {
            await recursiveGetActivity(url);
            async function recursiveGetActivity(url) {
                Axios({
                    method: 'GET',
                    url: url,
                    json: true,
                }).then(activities => {

                    activities.data.results.map(function (result) {
                        output.push(module.exports.getLocation(result.url));
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
    getLocation: async function (item) {
        let locations = [];

        const response = await Axios({
            method: 'GET',
            url: item,
            json: true,
        });

        response.data.locations.map(function (loc) {
            if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
        });

        return locations;
    },
    main: function (url) {
        return module.exports.getActivity(url);
    }
};