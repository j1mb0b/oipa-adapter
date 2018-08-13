let request = require('request-promise');

let oipaApi = {
    getActivity: function (url, output) {
        return request({
            method: 'GET',
            url: url,
            json: true
        }).then(function (activities) {
            if (!output) {
                output = [];
            }

            activities.data.results.map(function (result) {
                output.push(result.url);
            });

            if (activities.data.next !== null) {
                oipaApi.getActivity(activities.data.next, output);
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
                response.data.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                        locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
                });

                return locations;
            });
        }));
        return results;
    },
    main: function(url) {
        return oipaApi.getActivity(url)
            .then(oipaApi.getLocations);
    }
};