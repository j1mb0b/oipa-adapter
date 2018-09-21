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
    query: function (endpoint, type = "", output = []) {
        return request(module.exports.getOptions(endpoint)).then(function (data) {
            switch (type) {
                case "sectors":
                    return Promise.map(data.results, function (result) {
                        return Promise.resolve(module.exports.query(result.url).catch(function (err) {
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
                    if (output.length <= 0) {
                        output = {};
                    }

                    let cc = {},
                        current_year = (new Date()).getFullYear(),
                        domain = endpoint.substr(0, endpoint.indexOf('/api')),
                        url = domain + "/api/transactions/aggregations/?format=json&group_by=recipient_country&aggregations=activity_count,disbursement_expenditure&order_by=recipient_country&page_size=500&transaction_date_year=" + current_year;

                    if (!output["results"] && !output["country_data"]) {
                        output["results"] = [];
                        output["country_data"] = {};
                    }
                    data.results.map(function (result) {
                        output["results"].push(result);
                        // Get the countries at activity level and build a array.
                        // This is used to determine the polygon for valid locations.
                        if (result.recipient_countries.length > 0) {
                            result.recipient_countries.map(function (country) {
                                if (output["country_data"].length <= 0 || output["country_data"][country.country.code] === undefined) {
                                    let budget_url = url + "&recipient_country=" + country.country.code;
                                    output["country_data"][country.country.code] = {
                                        "country": country.country.name,
                                        "id": country.country.code,
                                        //"projects": 10,
                                        // @todo - get globa budget for country instead of project budget.
                                        "budget": new Promise(function (resolve, reject) {
                                            return module.exports.query(budget_url).then(function (data) {
                                                if (data.results === undefined || data.results.length <= 0)
                                                    return reject("No data for - " + budget_url);

                                                return resolve({
                                                    "budget": data.results[0].disbursement_expenditure,
                                                    "activity_count": data.activity_count
                                                });
                                            });
                                        }),
                                        "flag": "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.1.0/flags/1x1/" + country.country.code.toLowerCase() + ".svg"
                                    };
                                }
                            });
                        }
                    });
                    break;

                default:
                    return output;
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