'use strict';

let request = require('request-promise');
let output = [];
module.exports = {
    getProjects: function (url, domain, type) {
        return request({
            "method": "GET",
            "uri": url,
            "json": true
        }).then(function (data) {
            if (type === "location") {
                console.log(data.locations);
                output.push(data.locations.map(function (loc) {
                    if (loc.point.pos !== 'null')
                        return loc.point.pos;
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
            return output;
        });
    },
    main: function (url, domain) {
        return module.exports.getProjects(url, domain, "activity");
    }
};
