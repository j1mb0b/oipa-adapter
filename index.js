'use strict';

var domain = 'http://18.221.72.54:8000';
var endpoint = '/api/transactions/aggregations/';
var query = '?format=json&group_by=recipient_country&aggregations=activity_count,disbursement&reporting_organisation_identifier=XM-DAC-2-10&transaction_date_year=2016';
var app = require('./webserver')();
var request = require('request');

// 1. List datasets
app.get('/datasets', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    request.get({
        uri: domain + endpoint + query + "&page=1&page_size=1",
        gzip: true,
        json: true
    }, function (error, data) {
        if (error)
            return res.status(500).end('Internal Server Error');
        var datasets = data.body.results.map(function (result) {
            return {
                id: 'mapcountrytrans',
                name: {en: 'Map country transactions data'},
                description: {en: 'Country map placement for transaction data'},
                columns: [
                    {id: 'name', name: {en: 'Country name'}, type: 'hierarchy'},
                    {id: 'disbursement', name: {en: 'Country co-ordinates'}, type: 'numeric'},
                    {id: 'latitude', name: {en: 'Latitude'}, type: 'numeric'},
                    {id: 'longitude', name: {en: 'Longitude'}, type: 'numeric'},
                ]
            }
        });
        return res.status(200).json(datasets);
    });
});

// 2. Retrieve data slices
app.post('/query', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    // Set request specific properties for a given data set.
    var dataset_uri = false;
    var dataset_output = false;
    switch (req.body.id) {
        default:
            dataset_uri = domain + endpoint + query;
            dataset_output = [result.recipient_country.name, result.disbursement, result.recipient_country.location.coordinates[1], result.recipient_country.location.coordinates[0]];
            break;
    }

    // Preform generic request.
    request.get({
        uri: dataset_uri,
        gzip: true,
        json: true
    }, function (error, data) {
        if (error)
            return res.status(500).end('Internal Server Error');
        var datasets = data.body.results.map(function (result) {
            return dataset_output;
        });
        return res.status(200).json(datasets);
    });
});
