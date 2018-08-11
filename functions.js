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
    activity: async function (url, domain) {
        const activities = await request({
            "method": "GET",
            "uri": url,
            "json": true
        });

        activities.results.map(function (result) {
            //const activity = request({
               // "method": "GET",
              //  "uri": result.url,
               // "json": true
            //});

            output.push(result.url);

          //  activity.locations.map(function (loc) {
               // if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                  //  output.push(loc.point.pos.latitude, loc.point.pos.longitude);
           // });
        });

        //if (activities.next) {
         //   module.exports.activity(activities.next, domain);
       // }

        console.log(output);
        return output;
    }
};