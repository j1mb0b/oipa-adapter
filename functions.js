'use strict';

let request = require('request-promise');
let output = [];
module.exports = {
    getProjects: function (url, domain, type) {
        return request({
            "method": "GET",
            "uri": uri,
            "json": true,
        }).then(function (data) {
            if (typeof data.results !== 'undefined') {
                if (type === "location") {
                    data.results.map(function (result) {
                        output.push(result.locations.map(function (result) {
                            if (result.locations.point.pos !== 'null')
                                return result.locations.point.pos;
                        }));
                    });
                }
                else {
                    data.results.map(function (result) {
                        return module.exports.getProjects(result.url, domain, "location");
                    });
                }
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
