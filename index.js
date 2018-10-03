'use strict';

const domain = 'http://18.221.72.54:8000';
const app = require('./webserver')();
const datasets = require('./datasets')();
const request = require('request');
let path = require('path');
// Load tools API.
const tools = require('./tools.js');
// Load cache provider.
const cacheProvider = require('./cache-provider');
// Cumul.io
const Cumulio = require('cumulio');


// 2. List datasets
app.get('/datasets', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    return res.status(200).json(datasets);
});

// . Retrieve data slices
app.post('/query', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    if (!req.body.id)
        return res.status(403).end('Please set "id" in the body of your request!');

    // Default variables.
    let default_params = '?format=json&reporting_organisation_identifier=XM-DAC-2-10', endpoint, filters, aggr_type, groupOrderBy, query, uri;
    // Handle request based on the request body "value" sent.
    switch (req.body.id) {
        case 'activities':
            request.get({
                uri: domain + "/api/activities/?" + default_params + "&fields=title,iati_identifier,locations,activity_dates,policy_markers,activity_status,recipient_countries,recipient_regions&page_size=500",
                gzip: true,
                json: true
            }, function (error, data) {
                if (error || !data.body.results) {
                    console.log(uri);
                    return res.status(500).end('Internal Server Error');
                }

                let datasets = data.body.results.map(function (result) {
                    return [
                        result.iati_identifier,
                        result.title.narratives ? result.title.narratives[0].text : "",
                        result.descriptions ? result.descriptions[0].narratives[0].text : "",
                        result.activity_status.code,
                        result.activity_status.name
                    ];
                });
                return res.status(200).json(datasets);
            });
            break;

        case 'sectors':
            request.get({
                uri: domain + "/api/activities/?" + default_params + "&fields=iati_identifier,sectors&page_size=500",
                gzip: true,
                json: true
            }, function (error, data) {
                if (error || !data.body.results) {
                    console.log(uri);
                    return res.status(500).end('Internal Server Error');
                }

                let datasets = [];
                data.body.results.map(function (result) {
                    result.sectors.map(function (item) {
                        datasets.push([
                            result.iati_identifier,
                            item.sector.name,
                            item.sector.code,
                            item.percentage,
                            item.vocabulary.name,
                            item.vocabulary.code
                        ]);
                    });
                });
                return res.status(200).json(datasets);
            });
            break;

        case 'participating-organisations':
            request.get({
                uri: domain + "/api/activities/?" + default_params + "&fields=iati_identifier,participating_organisations&page_size=500",
                gzip: true,
                json: true
            }, function (error, data) {
                if (error || !data.body.results) {
                    console.log(uri);
                    return res.status(500).end('Internal Server Error');
                }

                let datasets = [];
                data.body.results.map(function (result) {
                    result.participating_organisations.map(function (item) {
                        datasets.push([
                            result.iati_identifier,
                            item.narratives[0].text,
                            item.type.code,
                            item.role.code
                        ]);
                    });
                });
                return res.status(200).json(datasets);
            });
            break;

        case 'year-disbursement':
        case 'year-commitment':
        case 'year-value':
            endpoint = '/api/transactions/aggregations/';
            aggr_type = req.body.id.match(/(.*)-(.*)/);
            groupOrderBy = 'transaction_date_year';
            query = default_params + '&group_by=' + groupOrderBy + '&aggregations=' + aggr_type[2] + '&order_by=' + groupOrderBy;
            uri = domain + endpoint + query;
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

        case 'sector-disbursement':
            endpoint = '/api/transactions/aggregations/';
            aggr_type = req.body.id.match(/(.*)-(.*)/);
            groupOrderBy = 'sector';
            query = default_params + '&group_by=' + groupOrderBy + '&aggregations=activity_count,' + aggr_type[2] + '&order_by=' + groupOrderBy;
            uri = domain + endpoint + query;
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
                    return [
                        result.activity_count,
                        result.disbursement,
                        result.sector.code,
                        result.sector.name
                    ];

                });
                return res.status(200).json(datasets);
            });
            break;

        case 'participating-org-disbursement':
            endpoint = '/api/transactions/aggregations/';
            aggr_type = req.body.id.match(/(.*)-(.*)/);
            groupOrderBy = 'participating_organisation';
            query = default_params + '&group_by=' + groupOrderBy + '&aggregations=activity_count,' + aggr_type[2] + '&order_by=' + groupOrderBy;
            uri = domain + endpoint + query;
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

                    return [
                        result.activity_count,
                        result.disbursement,
                        result.participating_organisation,
                        result.participating_organisation_ref
                    ];
                });
                return res.status(200).json(datasets);
            });
            break;

        default:
            return res.status(403).end('No match for data set ID: ' + req.body.id);
    }
});
