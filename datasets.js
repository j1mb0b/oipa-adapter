'use strict';

module.exports = function() {
    return [{
        id: 'mapcountrytrans',
        name: {en: 'Map country transactions data'},
        description: {en: 'Country map placement for transaction data'},
        columns: [
            {id: 'name', name: {en: 'Country name'}, type: 'hierarchy'},
            {id: 'disbursement', name: {en: 'Disbursement'}, type: 'numeric'},
            {id: 'latitude', name: {en: 'Latitude'}, type: 'numeric'},
            {id: 'longitude', name: {en: 'Longitude'}, type: 'numeric'}
        ]},
        {
        id: 'countryyeartrans',
        name: {en: 'Country year transactions'},
        description: {en: 'Aggregations of transactional data related to countries grouped by year'},
        columns: [
            {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
            {id: 'disbursement', name: {en: 'Disbursement'}, type: 'numeric'}
        ]
    }];
};