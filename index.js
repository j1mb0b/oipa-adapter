'use strict';

let domain = 'http://18.221.72.54:8000';
let app = require('./webserver')();
let datasets = require('./datasets')();
let request = require('request');
// Load tools API.
let tools = require('./tools.js');
// Load cache provider.
let cacheProvider = require('./cache-provider');

// 1. List datasets
app.get('/datasets', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    return res.status(200).json(datasets);
});

//2. Generic query handler to request via OIPA, with cache engine.
app.post('/query', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    if (!req.headers['x-url'])
        return res.status(403).end('Please set "url" header in your request!');

    return cacheProvider.instance().get(req.headers['x-url'], function(err, value) {
        if (err) console.error(err);
        if (value === undefined) {
            console.log('Creating new cache entry and fetching results...');
            tools.query(url).then(function (result) {
                tools.setCache(url, result);
                return res.status(200).json(result);
            });
        }
        else {
            console.log('Results fetched from cache entry using key: ' + url);
            return res.status(200).json(value);
        }
    });
});





/**** TESTS ****/
// 2. Retrieve data slices
app.post('/test', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    if (!req.body.id)
        return res.status(403).end('Please set "id" in the body of your request!');

    // Default variables.
    let default_params = '?format=json&reporting_organisation_identifier=XM-DAC-2-10';
    let endpoint = "";
    let query = "";
    switch (req.body.id) {
        case 'activities':
            endpoint = '/api/activities/';
            let url = domain + endpoint + default_params;

            return cacheProvider.instance().get(url, function(err, value) {
                if (err) console.error(err);
                if (value === undefined) {
                    console.log('Creating new cache entry and fetching results...');
                    tools.main(url).then(function (result) {
                        tools.setCache(url, result);
                        return res.status(200).json(result);
                    });
                }
                else {
                    console.log('Results fetched from cache entry using key: ' + url);
                    return res.status(200).json(value);
                }
            });

        case 'country-disbursement':
        case 'country-commitment':
        case 'country-value':
            endpoint = '/api/transactions/aggregations/';
            let groupOrderBy = 'transaction_date_year';
            let country_code = (req.body.country_code) ? req.body.country_code : "MA";
            // Get the key used for logic, filtering and getting a property from the response.
            let aggr_type = req.body.id.match(/country-(.*)/)[1];
            // Handle "country-value" since it uses a different endpoint, group, and order by.
            if (aggr_type === 'value') {
                endpoint = '/api/budgets/aggregations/';
                // Exception for Budget since it uses a different field to the others.
                groupOrderBy = 'budget_period_end_year';
            }
            // Build query string.
            query = default_params + '&group_by=' + groupOrderBy + '&aggregations=' + aggr_type + '&order_by=' + groupOrderBy + '&recipient_country=' + country_code;
            let uri = domain + endpoint + query;
            request.get({
                uri: uri,
                gzip: true,
                json: true
            }, function (error, data) {
                if (error || !data.body.results) {
                    console.log(uri);
                    return res.status(500).end('Internal Server Error');
                }
                let datasets = data.body.results.map(function (result) {
                    let obj = Object.keys(result);
                    // We assume the order of keys are first: transaction year, second: amount.
                    // Also that it remains the same for the other "cases", if not we are forced to
                    // hard code the string to get the value which won't work well with this generic code.
                    return [result[obj[0]], result[obj[1]]];
                });
                return res.status(200).json(datasets);
            });
            break;

        default:
            return res.status(403).end('No match for data set ID: ' + req.body.id);
    }
});
