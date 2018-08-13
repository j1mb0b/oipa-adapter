'use strict';

const NodeCache = require("node-cache");
const oipaCache = new NodeCache();
let Axios = require('axios');
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
    checkActivity: async function(url) {
        let results;
        if (results = module.exports.cacheGet(url)) {
            console.log(results);
            return await Promise.all(results);
        }
        else {
            let output = [];
            const activity = await module.exports.getActivity(url, output);
            console.log(activity);
            return Promise.all([module.exports.cacheSet(url, activity)]);
        }
    },
    getActivity: async function (url, output) {
        if (!Array.isArray(output)) {
            output = [];
        }
        const activities = await Axios({
            method: 'GET',
            url: url,
            json: true,
        });

        activities.data.results.map(function (result) {
            output.push(result.url);
        });

        if (activities.data.next !== null) {
            return module.exports.getActivity(activities.data.next, output);
        }

        console.log(output);

        return output;
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
        return module.exports.checkActivity(url)
            .then(module.exports.getLocations);
    }
};