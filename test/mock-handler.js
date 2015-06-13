'use strict';

const Sinon = require('sinon');
const internals = {};


internals.request = {
    log: function () {}
};


internals.reply = function (value) {

    return value;
};


internals.reply.view = function (template, ctx) {

    return {
        template,
        ctx
    };
};


internals.reply.redirect = function () {

    return {
        permanent: function() {}
    }
}


internals.reply.continue = Sinon.spy();


Sinon.spy(internals, 'reply');
Sinon.spy(internals.reply, 'view');
Sinon.spy(internals.reply, 'redirect');


module.exports.request = internals.request;
module.exports.reply = internals.reply;
module.exports.reset = function () {

    [
        internals.reply,
        internals.reply.view,
        internals.reply.redirect,
        internals.reply.continue
    ].forEach(function (method) { method.reset(); });
};
