'use strict';

module.exports = function () {
    return [
        {
            id: 'top-sectors',
            name: {en: 'Top sectors'},
            description: {en: 'Top sector mapped with sub-sectors'},
            columns: [
                {id: 'code', name: {en: 'Top sector code'}, type: 'hierarchy'},
                {id: 'name', name: {en: 'Top sector name'}, type: 'hierarchy'},
                {id: 'sector-id', name: {en: 'Sector ID'}, type: 'hierarchy'},
                {id: 'parent-sector-id', name: {en: 'Parent sector ID'}, type: 'hierarchy'},
                {id: 'sector-code', name: {en: 'Sub-sector code'}, type: 'hierarchy'},
            ]
        },
    ];
};