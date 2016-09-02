'use strict';

const Ms = require('ms');
const logPath = process.env.LOG_PATH || '/var/log';


module.exports = {
    server: {
        baseUrl: 'http://manifest-validator.com',
        public: {
            cache: {
                expiresIn: Ms('1d')
            }
        }
    },
    good: {
        reporters: {
            console: [
                {
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', error: '*' }]
                },
                {
                    module: 'good-console',
                    args: [{ format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }]
                },
                'stdout'
            ]
        }
    },
    analytics: {
        enabled: false
    }
};
