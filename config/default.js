'use strict';

const Path = require('path');
const Ms = require('ms');
const Package = require( Path.resolve(process.cwd(), 'package.json') );


module.exports = {
    server: {
        port: 3000,
        public: {
            cache: {
                privacy: 'public',
                expiresIn: 0
            },
            path: './public'
        },
        security: {
            hsts: false,
            xframe: true,
            xss: true,
            noOpen: true,
            noSniff: true
        },
        views: Path.join(process.cwd(), 'app/views'),
        baseUrl: 'http://localhost:3000'
    },
    uri: {
        timeout: Ms('10s'),
        ressourceTimeout: Ms('10s')
    },
    // hapi logging
    good: {
        reporters: [{
            reporter: require('good-console'),
            events: { log: '*', request: '*' },
            config: { format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }
        }]
    },
    swagger: {
        documentationPath : '/documentation',
        payloadType       : 'form',
        info: {
            version     : '1.0',
            title       : Package.name,
            description : Package.description
        }
    },
    analytics: {
        enabled: false
    }
};
