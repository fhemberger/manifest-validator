'use strict';

const Path = require('path');
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
        timeout: 10000,
        ressourceTimeout: 10000
    },
    // hapi logging
    good: {
        reporters: [{
            reporter: require('good-console'),
            events: { log: '*', request: '*' },
            config: { format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }
        }]
    },
    // hapi CSRF token management
    crumb: {
        cookieOptions: {
            isHttpOnly: true,
            isSecure: false
        }
    },
    swagger: {
        documentationPath : '/documentation',
        apiVersion        : '1.0',
        payloadType       : 'form',
        info: {
            title       : Package.name,
            description : Package.description
        }
    },
    analytics: {
        enabled: false
    }
};


/*
module.exports = {
  express: {
    port: 3000,
    baseurl: "http://localhost:3000",
    shutdownTimeout: 30000,
    caching: {
      favicon: 0,
      public: 0
    }
  },
  uri: {
    timeout: 10000,
    ressourceTimeout: 10000
  },
  upload: {
    maxFilesize: 1048576, // 1 MB
    timeout: 10000
  },
  logging: {
    access: {
      enabled: true,
      format: 'dev'
    },
    application: {
      enabled: true
    }
  },
  analytics: {
    enabled: false,
    siteId: 0,
    host: ''
  }
};
*/
