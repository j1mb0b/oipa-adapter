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
    var datasets = "";
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
                datasets = data.body.results.map(function (result) {
                    return [result.recipient_country.name, result.activity_count, result.disbursement, result.recipient_country.location.coordinates[1], result.recipient_country.location.coordinates[0]];
                });
                return res.status(200).json(datasets);
            });
            break;

        case 'disbursement':
            var country_code = (req.body.country_code) ? req.body.country_code : "MA";
            var aggr_type = ['disbursement', 'commitment', 'value'];
            for (var type in aggr_type) {
                endpoint = '/api/transactions/aggregations/';
                query = default_params + '&group_by=transaction_date_year&aggregations=' + type + '&order_by=transaction_date_year&recipient_country=' + country_code;

                request.get({
                    uri: domain + endpoint + query,
                    gzip: true,
                    json: true
                }, function (error, data) {
                    if (error)
                        return res.status(500).end('Internal Server Error');
                    datasets.push(data.body.results.map(function (result) {
                        var obj = Object.keys(result);
                        // We assume the order of keys are first: transaction year, second: amount.
                        // Also that it remains the same for the other "cases", if not we are forced to
                        // hard code the string to get the value which won't work well with this generic code.
                        return [result[obj[0]], result[obj[1]], type];
                    }))
                });
            }
            if (datasets)
                return res.status(200).json(datasets);
            break;

        default:
            return res.status(403).end('No match for data set ID: ' + req.body.id);
    }
});
