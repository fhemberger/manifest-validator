'use strict';

const Config = require('config');
const Hapi   = require('hapi');

const server = new Hapi.Server();
const Routes = require('./routes.js');


server.connection({
    port: Number(process.env.PORT) || Config.server.port,
    routes: {
        // hapi is really nitpicking when it comes to object validation
        security: Config.util.getConfigSources()[0].parsed.server.security
    }
});


server.register(
    [
        { register: require('inert') },
        { register: require('vision') },
        { register: require('good'),         options: Config.good },
        { register: require('crumb'),        options: Config.crumb },
        { register: require('hapi-swagger'), options: Config.swagger },
        { register: require('./lib/hapi-prefilter.js') }
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
            path         : Config.server.views,

            // Default context
            context: {
                lang       : require('../config/messages.json'),
                _analytics : Config.analytics,
                _api       : { docs: Config.swagger.documentationPath },
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

