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


// 1. List datasets
app.get('/datasets', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    return res.status(200).json(datasets);
});

// 2. Generic query handler to request via OIPA, with cache engine.
app.get('/oipa', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    let url = req.headers['x-url'],
        type = req.headers['x-type'];

    if (!url)
        return res.status(403).end('Please set "url" header in your request!');

    return cacheProvider.instance().get(url, function (err, value) {
        if (err) console.error(err);
        if (value === undefined) {
            console.log('Creating new cache entry and fetching results...');
            tools.query(url, type).then(function (result) {
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

// 4. Cumul.io embed dashboard.
app.get('/map', function (req, res) {
    let qp = {
        country: req.query.recipient_country,
        sector: req.query.sector,
        year: req.query.transaction_date_year
    };
    res.render(path.join(__dirname + '/public/map.html'), qp);
});

// 5. Retrieve data slices
app.post('/query', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    if (!req.body.id)
        return res.status(403).end('Please set "id" in the body of your request!');

    // Default variables.
    let default_params = '?format=json&reporting_organisation_identifier=XM-DAC-2-10',
        endpoint = "",
        filters = "";
    switch (req.body.id) {
        case 'activities':
            request.get({
                uri: domain + "/api/activities/?" + default_params + "&hierarchy=1&fields=title,iati_identifier,locations,activity_dates,policy_markers,activity_status,recipient_countries,recipient_regions&page_size=500",
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
                uri: domain + "/api/activities/?" + default_params + "&hierarchy=1&fields=iati_identifier,sectors&page_size=500",
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
                uri: domain + "/api/activities/?" + default_params + "&hierarchy=1&fields=iati_identifier,participating_organisations&page_size=500",
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

        case 'country-disbursement':
        case 'country-commitment':
        case 'country-value':
        case 'sector-disbursement':
        case 'participating-org-disbursement':
            endpoint = '/api/transactions/aggregations/';
            let aggr_type = req.body.id.match(/(.*)-(.*)/);
                //country = req.body.id.match(/country-(.*)/),

            // Handle "country-value" since it uses a different endpoint, group, and order by.
            //if (country && country[1] === 'value') {
                //endpoint = '/api/budgets/aggregations/';
                // Exception for Budget since it uses a different field to the others.
                //groupOrderBy = 'budget_period_end_year';
            //}
            let groupOrderBy = 'transaction_date_year';
            if (req.body.id === "sector-disbursement")
                groupOrderBy = 'sector';
            else if (req.body.id === "participating-org-disbursement")
                groupOrderBy = 'participating_organisation';

            // Build query string.
            let query = default_params + '&group_by=' + groupOrderBy + '&aggregations=activity_count,' + aggr_type[2] + '&order_by=' + groupOrderBy;
            let uri = domain + endpoint + query + filters;
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
                    if (sector) {
                        return [
                            result.activity_count,
                            result.disbursement,
                            result.sector.code,
                            result.sector.name
                        ];
                    }
                    else if (part_org) {
                        return [
                            result.activity_count,
                            result.disbursement,
                            result.participating_organisation,
                            result.participating_organisation_ref
                        ];
                    }
                    else {
                        let obj = Object.keys(result);
                        // We assume the order of keys are first: transaction year, second: amount.
                        // Also that it remains the same for the other "cases", if not we are forced to
                        // hard code the string to get the value which won't work well with this generic code.
                        return [result[obj[0]], result[obj[1]]];
                    }
                });
                return res.status(200).json(datasets);
            });
            break;

        default:
            return res.status(403).end('No match for data set ID: ' + req.body.id);
    }
});
