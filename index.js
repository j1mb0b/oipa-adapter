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
        return res.status(403).end('Please include data set "id" in your request!');

    // Default variables.
    var default_params = '?format=json&reporting_organisation_identifier=XM-DAC-2-10';
    var endpoint = "";
    var query = "";
    // Dynamic variables.
    // @todo dynamic variable assignment.
    var date_year = "";
    var country_code = "MA";
    switch (req.body.id) {
        case 'mapcountrytrans':
        case 'mapcountrytransyear':
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

        case 'countryyeartrans':
            endpoint = '/api/transactions/aggregations/';
            query = default_params + '&group_by=transaction_date_year&aggregations=disbursement&order_by=transaction_date_year&recipient_country=' + country_code;

            request.get({
                uri: domain + endpoint + query,
                gzip: true,
                json: true
            }, function (error, data) {
                if (error)
                    return res.status(500).end('Internal Server Error');
                var datasets = data.body.results.map(function (result) {
                    return [result.transaction_date_year, result.disbursement];
                });
                return res.status(200).json(datasets);
            });
            break;

        default:
            return res.status(403).end('No match for data set ID: ' + req.body.id);
    }
});
