'use strict';

const Ms = require('ms');
const logPath = process.env.LOG_PATH || '/var/log';


module.exports = {
    server: {
        baseUrl: 'http://manifest-validator.com',
        public: {
            cache: {
                expiresIn: ms('1d')
            }
        }
    },
    good: {
        reporters: [
            {
                reporter: require('good-file'),
                events: { log: '*', error: '*' },
                config: {
                    path   : logPath,
                    prefix : 'event',
                    rotate : 'weekly'
                }
            },
            {
                reporter: require('good-file'),
                events: { response: '*' },
                config: {
                    path   : logPath,
                    prefix : 'access',
                    rotate : 'weekly'
                }
            }
        ]
    },
    analytics: {
        enabled: false
    }
};
