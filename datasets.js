'use strict';

module.exports = function () {
    return [
        {
            id: 'activities',
            name: {en: 'Activities'},
            description: {en: 'Activities data'},
            columns: [
                {id: 'name', name: {en: 'Country name'}, type: 'hierarchy'},
                {id: 'activity_count', name: {en: 'Total projects'}, type: 'numeric'},
                {id: 'disbursement', name: {en: 'Total disbursement'}, type: 'numeric'},
            ]
        },
        {
            id: 'country-disbursement',
            name: {en: 'Country year disbursement'},
            description: {en: 'Aggregations of transactional data related to countries grouped by year'},
            columns: [
                {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
                {id: 'disbursement', name: {en: 'Expenditure'}, type: 'numeric'}
            ]
        },
        {
            id: 'country-commitment',
            name: {en: 'Country year commitment'},
            description: {en: 'Aggregations of transactional data related to countries grouped by year'},
            columns: [
                {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
                {id: 'commitment', name: {en: 'Commitment'}, type: 'numeric'}
            ]
        },
        {
            id: 'country-value',
            name: {en: 'Country year budget'},
            description: {en: 'Aggregations of transactional data related to countries grouped by year'},
            columns: [
                {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
                {id: 'budget', name: {en: 'Budget'}, type: 'numeric'}
            ]
        }

    ];
};