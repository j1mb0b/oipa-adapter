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

            activities.results.map(function (result) {
                output.push(result.url);
            });

            if (activities.next !== null) {
                module.exports.getActivity(activities.next, output);
            }
            console.log(output);
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
                response.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                        locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
                });

                return locations;
            });
        }));
        console.log(results);
        return results;
    },
    main: function(url) {
        return module.exports.getActivity(url)
            .then(module.exports.getLocations);
    }
};