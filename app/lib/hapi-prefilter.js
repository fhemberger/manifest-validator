'use strict';

const internals = {};

internals.prefilter = function (property) {

    if (Array.isArray(property)) {
        property = property.map(internals.prefilter);
    }

    if (typeof property === 'object') {
        Object.getOwnPropertyNames(property).forEach(function (key) {
            property[key] = internals.prefilter(property[key]);
        });
    }

    if (typeof property !== 'string') {
        return property;
    }

    return property
        // Normalize Unicode characters
        .normalize('NFKC')
        // Remove ASCII control chars except TAB, CR and LF
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        // Remove DEL character
        .replace(/\x7F/g, '')
        // Replace Unicode Directional Formatting (http://www.unicode.org/reports/tr9/#Directional_Formatting_Codes)
        .replace(/[\u200E\u200F\u061C\u202A\u202D\u202B\u202E\u202C\u2066\u2067\u2068\u2069]/g, '')
        // Replace Unicode Whitespace with regular space (https://www.cs.tut.fi/~jkorpela/chars/spaces.html)
        .replace(/[\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
        // Finally, remove everything that remotely looks like HTML
        .replace(/<[^>]*>?/g, '');
};


exports.register = function (server, options, next) {

    // Filter all incoming
    server.ext('onPostAuth', function (request, reply) {

        ['header', 'params', 'payload', 'query'].forEach(function (input) {

            if (!request[input]) { return; }

            Object.keys( request[input] ).forEach(function (property) {

                request[input][property] = internals.prefilter(request[input][property]);
            });
        });

        return reply.continue();
    });

    return next();
};


exports.register.attributes = {
    name       : 'manifest-validator-hapi-prefilter',
    version    : '0.0.0'
};
