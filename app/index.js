'use strict';

const Config = require('ez-config');
const Hapi   = require('hapi');

const server = new Hapi.Server();
const Routes = require('./routes.js');

server.connection({
    port: Number(process.env.PORT) || Config.get('server.port'),
    routes: {
        security: Config.get('server.security')
    }
});


server.register(
    [
        { register: require('inert') },
        { register: require('vision') },
        { register: require('good'),         options: Config.get('good') },
        { register: require('hapi-swagger'), options: Config.get('swagger') },
        { register: require('./lib/hapi-prefilter.js') },
        { register: require('./lib/hapi-errorpages.js') }
    ],
    function (err) {

        if (err) { throw err; }

        server.views({
            engines: {
                jade: require('jade')
            },
            // During development, disable view caching
            isCached     : (process.env.NODE_ENV === 'production'),
            layout       : false,
            path         : Config.get('server.views'),

            // Default context
            context: {
                lang       : require('../config/messages.json'),
                _analytics : Config.get('analytics'),
                _api       : { docs: Config.get('swagger.documentationPath') },
                _env       : process.env.NODE_ENV || 'development'
            }
        });

        server.route(Routes);
        server.start(function () {

            if (process.env.NODE_ENV === 'test') { return; }
            server.log('info', `Server running at: ${server.info.uri}`);
        });
    }
);


module.exports = server;

