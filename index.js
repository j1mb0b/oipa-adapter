'use strict';

let domain = 'http://18.221.72.54:8000';
let app = require('./webserver')();
let datasets = require('./datasets')();
let request = require('request');
let tools = require('./functions.js');

// 1. List datasets
app.get('/datasets', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    return res.status(200).json(datasets);
});

// 2. Retrieve data slices
app.post('/query', function (req, res) {
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

            tools.activity(domain + endpoint + default_params, domain, "activity", []).then(function(result) {
                console.log(result);
                return res.status(200).json(result);
            });
            break;

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
