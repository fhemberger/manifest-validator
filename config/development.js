'use strict';

module.exports = {
    good: {
        reporters: {
            console: [
                {
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', request: '*', response: '*' }]
                },
                {
                    module: 'good-console',
                    args: [{ format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }]
                },
                'stdout'
            ]
        }
    }
};
