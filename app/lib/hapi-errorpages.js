'use strict';

const Url = require('url');
const Boom = require('boom');


exports.register = function (server, options, next) {

    // Error handler: General handler showing error page
    server.ext('onPreResponse', function (request, reply) {

        let error = request.response;

        if (error.domainThrown) {
            // Attach the error's stack trace to output
            error.data = error.data || {};
            error.data.stack = error.stack;
            request.server.log(['internal', 'implementation', 'error'], error);

            if (request.response.variety === 'view') {
                return reply
                    .view('error')
                    .code(500);
            }

            return reply(Boom.create(500));
        }

        if (!error.isBoom) {
            return reply.continue();
        }

        if (request.response.variety === 'view') {
            reply
                .view('error', error.output)
                .code(error.output.statusCode);
        } else {
            reply(error);
        }

        error.method = request.method.toUpperCase();
        error.url = Url.format(request.url);

        request.log(['error'], error);
    });

    return next();
};


exports.register.attributes = {
    name       : 'manifest-validator-hapi-errorpages',
    version    : '0.0.0'
};
