let request = require('request-promise');

module.exports = {
    getActivity: function (url, output) {
        return request({
            method: 'GET',
            url: url,
            json: true
        }).then(function (activities) {
            if (!output) {
                output = [];
            }

            activities.body.results.map(function (result) {
                output.push(result.url);
            });

            if (activities.data.next !== null) {
                module.exports.getActivity(activities.data.next, output);
            }
            return output;
        });
    },
    getLocations: function (urls) {
        let results = [];
        results.push(urls.map(async item => {
            request({
                "method": "GET",
                "uri": item,
                "json": true
            }).then(response => {

                let locations = [];
                response.body.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                        locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
                });

                return locations;
            });
        }));
        return results;
    },
    main: function(url) {
        return module.exports.getActivity(url)
            .then(module.exports.getLocations);
    }
};