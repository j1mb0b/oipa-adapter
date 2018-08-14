let request = require('request-promise');
let Promise = require("bluebird");

module.exports = {
    getActivity: function (url, output) {
        return request({
            method: 'GET',
            url: url,
            json: true,
            headers: {
                'Connection': 'keep-alive',
                'Accept-Encoding': '',
                'Accept-Language': 'en-US,en;q=0.8'
            }
        }).then(function (activities) {
            if (!output) {
                output = [];
            }

            activities.results.map(function (result) {
                output.push(result.url);
            });

            if (activities.next !== null) {
                return module.exports.getActivity(activities.next, output);
            }

            return output;
        }).catch(function (err) {
            if(err.message === 'read ECONNRESET'){
                console.log('Timed out :(');
                return false;
            } else {
                console.log('Error.');
                throw err;
            }
        });
    },
    getLocations: function (urls) {
        return Promise.map(urls, function(item) {
            return request({
                "method": "GET",
                "uri": item,
                "json": true,
                "headers": {
                    'Connection': 'keep-alive',
                    'Accept-Encoding': '',
                    'Accept-Language': 'en-US,en;q=0.8'
                }
            }).then(response => {

                let locations = {};
                locations[response.recipient_countries.url] = {};
                locations[response.recipient_countries.url][item] = [];
                response.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                        locations[response.recipient_countries.url][item].push({"latitude": loc.point.pos.latitude, "longitude": loc.point.pos.longitude});
                });

                return locations ? locations : null;
            }).catch(function (err) {
                if(err.message === 'read ECONNRESET'){
                    console.log('Timed out :(');
                    return false;
                } else {
                    console.log('Error.');
                    throw err;
                }
            });
        }, { concurrency: 10}).then(function(data) {
            return data;
        });
    },
};