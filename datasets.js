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
            id: 'year-disbursement',
            name: {en: 'Year disbursement'},
            description: {en: 'Aggregations of transactional data grouped by year'},
            columns: [
                {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
                {id: 'disbursement', name: {en: 'Expenditure'}, type: 'numeric'}
            ]
        },
        {
            id: 'year-commitment',
            name: {en: 'Year commitment'},
            description: {en: 'Aggregations of transactional data grouped by year'},
            columns: [
                {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
                {id: 'commitment', name: {en: 'Commitment'}, type: 'numeric'}
            ]
        },
        {
            id: 'year-value',
            name: {en: 'Year budget'},
            description: {en: 'Aggregations of transactional data grouped by year'},
            columns: [
                {id: 'year', name: {en: 'Year'}, type: 'hierarchy'},
                {id: 'budget', name: {en: 'Budget'}, type: 'numeric'}
            ]
        },
        {
            id: 'sector-disbursement',
            name: {en: 'Sector disbursement'},
            description: {en: 'Aggregations of transactional data related to sectors'},
            columns: [
                {id: 'activity-count', name: {en: 'Activity count'}, type: 'hierarchy'},
                {id: 'disbursement', name: {en: 'Disbursement'}, type: 'numeric'},
                {id: 'sector-code', name: {en: 'Sector code'}, type: 'hierarchy'},
                {id: 'sector-name', name: {en: 'Sector name'}, type: 'hierarchy'},
            ]
        },
        {
            id: 'participating-org-disbursement',
            name: {en: 'Participating organisation disbursement'},
            description: {en: 'Aggregations of transactional data related to Participating organisation'},
            columns: [
                {id: 'activity-count', name: {en: 'Activity count'}, type: 'hierarchy'},
                {id: 'disbursement', name: {en: 'Disbursement'}, type: 'numeric'},
                {id: 'participating-org', name: {en: 'Participating org name'}, type: 'hierarchy'},
                {id: 'participating-org-ref', name: {en: 'Participating org ref'}, type: 'hierarchy'},
            ]
        }
    ];
};