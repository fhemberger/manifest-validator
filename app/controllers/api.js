'use strict';

const Config = require('ez-config');
const Hoek = require('hoek');
const Boom = require('boom');
const Joi = require('joi');

const Manifest = require('../lib/manifest.js');
const Analytics = require('../lib/analytics.js');


const internals = {};


internals.validation = {
    optional: Joi.any()
        .optional(),
    uri: Joi.string()
        .uri({ scheme: /https?/ })
        .options({ language: { string: { uriCustomScheme: 'must be a valid URI with a http(s) scheme' } } })
        .description('URI of the appcache manifest file')
};


internals.routeDefaultSettings = {
    cors: {
        origin  : ['*'],
        headers : ['X-Requested-With']
    },
    description: 'Validate appcache manifest',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responseMessages: [
                { code: 200, message: 'Ok' },
                { code: 400, message: 'Bad Request' }
            ]
        }
    },
    validate: {
        options: {
            abortEarly   : false,
            stripUnknown : true
        }
    }
};


internals.validateUri = function (uri, reply) {

    const manifest = new Manifest();

    manifest.loadFromUri(uri, function (err) {

        if (err) {
            return reply({
                source: 'uri',
                uri: uri,
                result: {
                    isValid: false,
                    errors:  err
                }
            });
        }

        manifest.validate();
        manifest.checkResources(function () {

            reply({
                source: 'uri',
                uri: uri,
                result: {
                    isValid:   (manifest.errors.length || manifest.invalidResources.length) ? false : true,
                    errors:    manifest.errors,
                    warnings:  manifest.warnings,
                    resources: manifest.invalidResources
                }
            });
        });
    });
};


internals.validateDirectInput = function (directinput, reply) {

    const manifest = new Manifest(directinput);

    manifest.validate();
    return reply({
        source: 'directinput',
        result: {
            isValid:  (manifest.errors && manifest.errors.length && manifest.errors.length !== 0) ? false : true,
            errors:   manifest.errors,
            warnings: manifest.warnings
        }
    });
};


exports.index = {
    handler: function (request, reply) {

        return reply({
            api: {
                version       : '1.0',
                endpoint      : `${Config.get('server.baseUrl')}/api/validate`,
                documentation : `${Config.get('server.baseUrl')}${Config.get('swagger.documentationPath')}`
            }
        });
    }
};


exports.validateGET = Hoek.applyToDefaults(internals.routeDefaultSettings, {
    jsonp: 'callback',
    validate: {
        query: {
            uri: internals.validation.uri
                .required(),
            callback: Joi.string()
                .optional()
                .description('Function name for JSONP response')
        }
    },
    handler: function (request, reply) {

        if (request.query.uri) {
            Analytics.trackPiwik(request.raw.req, 'uri');
            return internals.validateUri(request.query.uri, reply);
        }

        return reply(Boom.badRequest());
    }
});


exports.validatePOST = Hoek.applyToDefaults(internals.routeDefaultSettings, {
    notes: 'Requires either an URI pointing to the appcache manifest or a direct text input of the file.',
    validate: {
        payload: Joi.object({
            uri: internals.validation.uri,
            directinput: Joi.string()
                .description('Content of the appcache manifest')
        }).xor('uri', 'directinput')
    },
    handler: function (request, reply) {

        let payload = request.payload;

        if (payload.uri) {
            Analytics.trackPiwik(request.raw.req, 'uri');
            return internals.validateUri(payload.uri, reply);
        }

        if (payload.directinput) {
            Analytics.trackPiwik(request.raw.req, 'directinput');
            return internals.validateDirectInput(payload.directinput, reply);
        }

        return reply(Boom.badRequest());
    }
});
