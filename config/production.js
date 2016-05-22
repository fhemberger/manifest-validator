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
        reporters: {
            influx: [{
                module: 'good-influx',
                args: [process.env.INFLUXDB_URL || 'http://localhost:8086/write?db=good']
            }]
        }
    },
    analytics: {
        enabled: false
    }
};
