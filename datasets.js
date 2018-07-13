'use strict';

module.exports = function() {
    var datasets = [];

    datasets.push({
        id: 'map_country_trans',
        name: {en: 'Map country transactions data'},
        description: {en: 'Country map placement for transaction data'},
        columns: [
            {id: 'name', name: {en: 'Country name'}, type: 'hierarchy'},
            {id: 'disbursement', name: {en: 'Country co-ordinates'}, type: 'numeric'},
            {id: 'latitude', name: {en: 'Latitude'}, type: 'numeric'},
            {id: 'longitude', name: {en: 'Longitude'}, type: 'numeric'}
        ]},
        {
        id: 'country_year_transactions',
        name: {en: 'Country year transactions'},
        description: {en: 'Aggregations of transactional data related to countries grouped by year'},
        columns: [
            {id: 'year', name: {en: 'Year'}, type: 'date'},
            {id: 'disbursement', name: {en: 'Amount'}, type: 'numeric'},
            {id: 'country', name: {en: 'Country name'}, type: 'hierarchy'}
        ]
    });

    return datasets;
};