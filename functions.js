'use strict';

let request = require('request-promise');
let output = [];
module.exports = {
    activity: function (url, domain, type) {
        return request({
            "method": "GET",
            "uri": url,
            "json": true
        }).then(function (data) {
            if (type === "location") {
                output.push(data.locations.map(function (loc) {
                    if (loc.point.pos !== 'null')
                        return loc.point.pos.latitude;
                }));
            }
            else {
                data.results.map(function (result) {
                    //console.log(result.url);
                    return module.exports.getProjects(result.url, domain, "location");
                });
            }

            if (data.next) {
                return module.exports.getProjects(data.next, domain, "activity");
            }
            console.log(output);
            return output;
        });
    },
    main: function (url, domain) {
        return module.exports.activity(url, domain, "activity");
    }
};
