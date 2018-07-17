'use strict';

var domain = 'http://18.221.72.54:8000';
var app = require('./webserver')();
var datasets = require('./datasets')();
var request = require('request');

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
    var default_params = '?format=json&reporting_organisation_identifier=XM-DAC-2-10';
    var endpoint = "";
    var query = "";
    switch (req.body.id) {
        case 'mapcountrytrans':
        case 'mapcountrytransyear':
            var date_year = ""; // @todo make this dynamic.
            endpoint = '/api/transactions/aggregations/';
            query = default_params + '&group_by=recipient_country&aggregations=activity_count,disbursement&transaction_date_year=' + date_year;

            request.get({
                uri: domain + endpoint + query,
                gzip: true,
                json: true
            }, function (error, data) {
                if (error)
                    return res.status(500).end('Internal Server Error');
                var datasets = data.body.results.map(function (result) {
                    return [result.recipient_country.name, result.activity_count, result.disbursement, result.recipient_country.location.coordinates[1], result.recipient_country.location.coordinates[0]];
                });
                return res.status(200).json(datasets);
            });
            break;

        case 'country-disbursement':
        case 'country-commitment':
        case 'country-value':
            var country_code = (req.body.country_code) ? req.body.country_code : "MA";

            // Get the key used for filtering and getting a property from the response.
            var aggr_type = req.body.id.match(/country-(.*)/)[1];
            endpoint = '/api/transactions/aggregations/';
            // Exception for Budget since it uses a different field to the others.
            var groupOrderBy = (req.body.id === 'country-value') ? 'budget_period_end_year' : 'transaction_date_year';
            // Build query string.
            query = default_params + '&group_by=' + groupOrderBy + '&aggregations=' + aggr_type + '&order_by=' + groupOrderBy + '&recipient_country=' + country_code;

            request.get({
                uri: domain + endpoint + query,
                gzip: true,
                json: true
            }, function (error, data) {
                if (error || !data)
                    console.log(query);
                    return res.status(500).end('Internal Server Error');
                var datasets = data.body.results.map(function (result) {
                    var obj = Object.keys(result);
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
