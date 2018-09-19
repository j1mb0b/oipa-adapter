let request = require('request-promise');
let Promise = require("bluebird");
let cacheProvider = require('./cache-provider');

module.exports = {
    getOptions: function (url) {
        return {
            method: 'GET',
            url: url,
            json: true,
            headers: {
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Content-Language': 'en',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Content-Language, Accept',
                'Accept-Encoding': '',
                'Accept-Language': 'en-US,en;q=0.8'
            }
        }
    },
    query: function (endpoint, type, output) {
        if (!output) {
            output = [];
        }
        return request(module.exports.getOptions(endpoint)).then(function (data) {
            switch (type) {
                case "sectors":
                    return Promise.map(data.results, function (result) {
                        return Promise.resolve(module.exports.query(result.url, "").catch(function (err) {
                            return module.exports.errorHandler(err, result.url);
                        }));
                    }, {concurrency: 5}).then(function (data) {
                        return data;
                    });

                case "documents":
                    data.results.map(function (docs) {
                        docs.document_links.map(function (doc) {
                            output.push(doc);
                        });
                    });
                    break;

                case "countries":
                    let countries = {},
                        cc = {};
                    countries["country_data"] = [];
                    countries["results"] = [];
                    data.results.map(function (result) {
                        // Get the countries at activity level and build a array.
                        // This is used to determine the polygon for valid locations.
                        if (result.recipient_countries.length > 0) {
                            result.recipient_countries.map(function (country) {
                                if (!cc.hasOwnProperty('country.country.code')) {
                                    cc[country.country.code] = {
                                        "country": country.country.name,
                                        "id": country.country.code,
                                        //"projects": 10,
                                        // @todo - get globa budget for country instead of project budget.
                                        "budget": result.budgets.map(function (budget) {
                                            return {year: budget.period_start, value: budget.value.value}
                                        }),
                                        "flag": "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.1.0/flags/1x1/" + country.country.code.toLowerCase() + ".svg"
                                    };
                                }
                            });
                            countries["country_data"].push(cc);
                            countries["results"].push(result);
                        }
                    });
                    output.push(countries);
                    break;

                default:
                    data.results.map(function (result) {
                        output.push(result);
                    });
            }

            if (data.next !== null) {
                return module.exports.query(data.next, type, output);
            }

            return output;
        }).catch(function (err) {
            return module.exports.errorHandler(err, endpoint);
        });
    },
    getPolygon: function (items) {
        if (items[0].countries.length <= 0)
            return false;

        return Promise.map(items[0].countries, function (item) {
            return request(module.exports.getOptions(item)).then(response => {
                let poly = {};
                poly[item] = response.polygon.coordinates;
                return poly;
            }).catch(function (err) {
                return module.exports.errorHandler(err, item);
            });
        }, {concurrency: 5}).then(function (data) {
            items[0].countries = data;
            return items;
        });
    },
    setCache: function (key, obj) {
        const CACHE_DURATION = 86400;
        cacheProvider.instance().set(key, obj, CACHE_DURATION, function (err, success) {
            if (!err && success) {
                console.log("Cache entry on " + key + " has been set.");
            }
        });
    },
    errorHandler: function (err, url) {
        switch (err.message) {
            case '404 - {"detail":"Not found."}':
                console.log('Detail not found on request: ' + url);
                return;

            default:
                console.log('Error on request: ' + url);
                throw err;
        }
    }
};