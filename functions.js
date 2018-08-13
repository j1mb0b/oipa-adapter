'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let Axios = require('axios');
let output = [];
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
    checkActivity: async function(url) {
        let results;
        if (results = module.exports.cacheGet(url)) {
            console.log(results);
            return results;
        }
        else {
            const activity = await module.exports.getActivity(url);
            console.log(activity);
            module.exports.cacheSet(url, activity);
            return activity;
        }
    },
    getActivity: function (url) {
        return new Promise(function(resolve, reject) {
                Axios({
                    method: 'GET',
                    url: url + "&page=18",
                    json: true,
                }).then(activities => {

                    activities.data.results.map(function (result) {
                        output.push(result.url);
                    });

                    if (activities.data.next !== null) {
                        module.exports.getActivity(activities.data.next).then(resolve);
                    }
                    else {
                        resolve(output);
                    }
                });
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