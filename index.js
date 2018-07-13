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

    var endpoint = "";
    var query = "";
    switch (req.body.id) {
        case 'map_country_trans':
            endpoint = '/api/transactions/aggregations/';
            query = '?format=json&group_by=recipient_country&aggregations=activity_count,disbursement&reporting_organisation_identifier=XM-DAC-2-10&transaction_date_year=2016';

            request.get({
                uri: domain + endpoint + query,
                gzip: true,
                json: true
            }, function (error, data) {
                if (error)
                    return res.status(500).end('Internal Server Error');
                var datasets = data.body.results.map(function (result) {
                    return [result.recipient_country.name, result.disbursement, result.recipient_country.location.coordinates[1], result.recipient_country.location.coordinates[0]];
                });
                return res.status(200).json(datasets);
            });
            break;

        case 'country_year_transactions':
            endpoint = '/api/transactions/aggregations/';
            query = '?format=json&group_by=transaction_date_year&aggregations=disbursement&reporting_organisation_identifier=XM-DAC-2-10&recipient_country=&order_by=transaction_date_year';

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
