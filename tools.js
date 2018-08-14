let request = require('request-promise-cache');
let Promise = require("bluebird");

module.exports = {
    getOptions: function(url) {
        return {
            method: 'GET',
            url: url,
            cacheKey: url,
            cacheTTL: 3600,
            cacheLimit: 12,
            json: true,
            headers: {
                'Connection': 'keep-alive',
                'Accept-Encoding': '',
                'Accept-Language': 'en-US,en;q=0.8'
            }
        }
    },
    getActivity: function (url, output) {
        return request(module.exports.getOptions(url)).then(function (activities) {
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
        let items = [];
        let countries = [];
        return Promise.map(urls, function(item) {
            return request(module.exports.getOptions(item)).then(response => {
                // Get the countries at activity level and build a array.
                // This is used to determine the polygon for valid locations.
                if (response.recipient_countries.length > 0) {
                    response.recipient_countries.map(function (country) {
                        if (countries.indexOf(country.country.url) === -1)
                            countries.push(country.country.url);
                    });
                }

                let locations = [];
                response.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0) {
                        locations.push({
                            "latitude": loc.point.pos.latitude,
                            "longitude": loc.point.pos.longitude
                        });
                    }
                });
                return locations;
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
            items.push({
                countries:countries,
                locations:data
            });

            return items;
        });
    },
};