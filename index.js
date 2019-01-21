'use strict';

const domain = 'https://dgd-oipa.blue4you.be';
const fs = require('fs');
let path = require('path');
const app = require('./webserver')();
const datasets = require('./datasets')();
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

    // By-pass OIPA cache, add date.
    // Check if we already have our base query param '?format=json'
    // and without a date, then ensure we just append with "&".
    if (checkQueryString(url, 'format') && !checkQueryString(url, 'date')) {
        url = url + '&date=' + (new Date()).getTime();
    }
    // If we don't have the base query param along with no date param,
    // then add it as a new one.
    else if (!checkQueryString(url, 'format') && !checkQueryString(url, 'date')) {
        url = url + '?date=' + (new Date()).getTime();
    }
    
    console.log(url);

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

// 3. Retrieve data slices
app.post('/query', function (req, res) {
    if (req.headers['x-secret'] !== process.env.CUMULIO_SECRET)
        return res.status(403).end('Given plugin secret does not match Cumul.io plugin secret.');

    if (!req.body.id)
        return res.status(403).end('Please set "id" in the body of your request!');

    // Handle request based on the request body "value" sent.
    switch (req.body.id) {
        case 'top-sectors':
            // Get content from file
            let contents = fs.readFileSync(path.join(__dirname, "top-sectors.json"));
            // Define to JSON type
            let jsonContent = JSON.parse(contents);
            let datasets = [];
            jsonContent.map(function (item) {
                datasets.push(item);
            });
            return res.status(200).json(datasets);

        default:
            return res.status(403).end('No match for data set ID: ' + req.body.id);
    }
});

/**
 * Helper function to get query string param.
 * @param url
 * @param field
 * @returns {boolean}
 */
var checkQueryString = function (url, field) {
    if (url.indexOf('?' + field + '=') != -1 ||
        url.indexOf('&' + field + '=') != -1) {
        return true;
    }
    return false;
}