'use strict';
var datasets = [];
module.exports = {
    getProjects: function (url) {
        request.get({
            uri: url,
            gzip: true,
            json: true
        }, function (error, data) {
            if (error)
                return res.status(500).end('Internal Server Error');

            datasets.push(data.body.results.map(function (result) {
                return [result.recipient_country.name, result.activity_count, result.disbursement, result.recipient_country.location.coordinates[1], result.recipient_country.location.coordinates[0], result.recipient_country.region.name];
            }));

            if (result.next) {
                this(result.next);
            }
            else {
                return res.status(200).json(datasets);
            }
        });
    }
};
