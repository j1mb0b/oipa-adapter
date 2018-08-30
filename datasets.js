'use strict';

module.exports = function () {
    return [
        {   
            id: 'activities',
            name: {en: 'Activities'},
            description: {en: 'Activities data'},
            columns: [
                {id: 'iati-identifier', name: {en: 'IATI Identifier'}, type: 'hierarchy'},
                {id: 'title', name: {en: 'Title'}, type: 'hierarchy'},
                {id: 'descriptions', name: {en: 'Descriptions'}, type: 'hierarchy'},
                {id: 'activity-status', name: {en: 'Activity status'}, type: 'hierarchy'},
                {id: 'activity-status-code', name: {en: 'Activity status code'}, type: 'hierarchy'}
            ]
        },
        {
            id: 'sectors',
            name: {en: 'Sector'},
            description: {en: 'Sectors data'},
            columns: [
                {id: 'iati-identifier', name: {en: 'IATI Identifier'}, type: 'hierarchy'},
                {id: 'sector', name: {en: 'Sector'}, type: 'hierarchy'},
                {id: 'sector-code', name: {en: 'Sector code'}, type: 'hierarchy'},
                {id: 'percentage', name: {en: 'Percentage'}, type: 'numeric'},
                {id: 'vocabulary', name: {en: 'Vocabulary'}, type: 'hierarchy'},
                {id: 'vocabulary-code', name: {en: 'Vocabulary code'}, type: 'hierarchy'}
            ]
        },
        {
            id: 'participating-organisations',
            name: {en: 'Participating organisations'},
            description: {en: 'Participating organisations data'},
            columns: [
                {id: 'iati-identifier', name: {en: 'IATI Identifier'}, type: 'hierarchy'},
                {id: 'participating-organisations', name: {en: 'Participating org'}, type: 'hierarchy'},
                {id: 'type', name: {en: 'Type'}, type: 'hierarchy'},
                {id: 'role', name: {en: 'Role'}, type: 'hierarchy'}
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