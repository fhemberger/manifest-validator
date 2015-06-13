'use strict';

module.exports = {
    server: {
        baseUrl: 'http://manifest-validator.com',
        public: {
            cache: {
                expiresIn: 24 * 60 * 60 * 1000 // one day
            },
        },
    },
    good: {
        reporters: [
            {
                reporter: require('good-file'),
                events: { log: '*', error: '*' },
                config: {
                    path   : '~/log/manifest-validator',
                    prefix : 'event',
                    rotate : 'weekly'
                }
            },
            {
                reporter: require('good-file'),
                events: { response: '*' },
                config: {
                    path   : '~/log/manifest-validator',
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
