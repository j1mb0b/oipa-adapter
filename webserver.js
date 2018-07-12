'use strict';

module.exports = function() {

  var bodyParser = require('body-parser')
  var compression = require('compression');
  var dotenv = require('dotenv').config({path: __dirname + '/.env'});
  var https = require('https');
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/dgdportal.openfed8.blue4you.be/privkey.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/dgdportal.openfed8.blue4you.be/fullchain.pem', 'utf8');
  var credentials = {key: privateKey, cert: certificate};
  var express = require('express');

  // Configure webserver
  var app = express();
  app.set('json spaces', 2);
  app.set('x-powered-by', false);
  app.use(compression());
  app.use( (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Language', 'en');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-Language, Accept');
    next();
  });
  app.use(bodyParser.json());
  app.options('*', (req, res) => {
    res.status(204);
  });

  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(process.env.PORT, () => console.log(`[OK] Cumul.io plugin \'OIPA\' listening on port ${process.env.PORT}`));

  return app;

};