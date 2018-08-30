'use strict';

module.exports = function () {
    return [
        {   //http://18.221.72.54:8000/api/activities/?format=json&reporting_organisation=XM-DAC-2-10&hierarchy=1&fields=title,iati_identifier,locations,activity_dates,policy_markers,activity_status,recipient_countries,recipient_regions&page_size=500
            id: 'activities',
            name: {en: 'Activities'},
            description: {en: 'Activities data'},
            columns: [
                {id: 'title', name: {en: 'Title'}, type: 'hierarchy'},
                {id: 'iati_identifier', name: {en: 'IATI Identifier'}, type: 'hierarchy'},
                {id: 'locations', name: {en: 'Locations'}, type: 'hierarchy'},
                {id: 'activity_dates', name: {en: 'Activity dates'}, type: 'hierarchy'},
                {id: 'policy_markers', name: {en: 'Policy markers'}, type: 'hierarchy'},
                {id: 'activity_status', name: {en: 'Activity status'}, type: 'hierarchy'},
                {id: 'recipient_countries', name: {en: 'Recipient countries'}, type: 'hierarchy'},
                {id: 'recipient_regions', name: {en: 'Recipient countries'}, type: 'hierarchy'},
            ]
        },
        {
            id: 'sectors',
            name: {en: 'Sector'},
            description: {en: 'Sectors data'},
            columns: [
                {id: 'iati_identifier', name: {en: 'IATI Identifier'}, type: 'hierarchy'},
                {id: 'sector', name: {en: 'Sector'}, type: 'hierarchy'},
                {id: 'sector_code', name: {en: 'Sector code'}, type: 'numeric'},
                {id: 'percentage', name: {en: 'Percentage'}, type: 'numeric'},
                {id: 'vocabulary', name: {en: 'Vocabulary'}, type: 'hierarchy'},
                {id: 'vocabulary_code', name: {en: 'Vocabulary code'}, type: 'numeric'},
            ]
        },
        {
            id: 'participating-organisations',
            name: {en: 'Participating organisations'},
            description: {en: 'Participating organisations data'},
            columns: [
                {id: 'iati_identifier', name: {en: 'IATI Identifier'}, type: 'hierarchy'},
                {id: 'participating_organisations', name: {en: 'Participating org'}, type: 'hierarchy'},
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