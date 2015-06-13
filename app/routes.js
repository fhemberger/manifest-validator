'use strict';

const Config = require('config');

const Html = require('./controllers/html.js');
const Api  = require('./controllers/api.js');


module.exports = [
    { method: 'GET',    path: '/',              config: Html.index },
    { method: 'GET',    path: '/{param*}',      config: {
                                                    cache: Config.server.public.cache,
                                                    handler: { directory: { path: Config.server.public.path } }
                                                }
    },

    { method: 'GET',    path: '/validate',      config: Html.redirectValidate },
    { method: 'POST',   path: '/validate',      config: Html.validate },

    { method: 'GET',    path: '/api',           config: Api.index },
    { method: 'GET',    path: '/api/validate',  config: Api.validateGET },
    { method: 'POST',   path: '/api/validate',  config: Api.validatePOST }
];



