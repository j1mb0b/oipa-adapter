'use strict';

let cacheProvider = require('./cache-provider');

module.exports = function () {
    let bodyParser = require('body-parser');
    let compression = require('compression');
    let dotenv = require('dotenv').config({path: __dirname + '/.env'});
    let fs = require('fs');
    let https = require('https');
    let privateKey = fs.readFileSync('/etc/letsencrypt/live/dgdportal.openfed8.blue4you.be/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('/etc/letsencrypt/live/dgdportal.openfed8.blue4you.be/fullchain.pem', 'utf8');
    let credentials = {key: privateKey, cert: certificate};
    let express = require('express');

    // Configure webserver
    let app = express();
    app.set('json spaces', 2);
    app.set('x-powered-by', false);
    app.use(compression());
    app.use(function (req, res, next) {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Language', 'en');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-Language, Accept');
        next();
    });
    app.use(bodyParser.json());
    app.options('*', function (req, res) {
        res.status(204);
    });
    app.use(express.static(__dirname + '/public'));
    app.use(__dirname + '/public/leaflet', express.static(__dirname + '/node_modules/leaflet/dist/'));

    let httpsServer = https.createServer(credentials, app);
    httpsServer.listen(process.env.PORT, function () {
        console.log("[OK] Cumul.io plugin 'OIPA' listening on port" + process.env.PORT);
    });

    cacheProvider.start(function(err) {
        if (err) console.error(err);
    });

    return app;
};