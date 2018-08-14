let request = require('request-promise');

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
    getLocations: async function (urls) {
        return await Promise.all(urls.map(async function(item) {
            return await request({
                "method": "GET",
                "uri": item,
                "json": true,
                "headers": {
                    'Connection': 'keep-alive',
                    'Accept-Encoding': '',
                    'Accept-Language': 'en-US,en;q=0.8'
                }
            }).then(response => {

                let locations = [];
                response.locations.map(function (loc) {
                    if (loc.point.pos !== null && Object.keys(loc.point.pos).length > 0)
                        locations.push(loc.point.pos.latitude, loc.point.pos.longitude);
                });

                return locations;
            }).catch((err) => {
                if(err.message === 'read ECONNRESET'){
                    console.log('Timed out :(');
                    return false;
                } else {
                    console.log('Error.');
                    throw err;
                }
            });
        }));
    },
};