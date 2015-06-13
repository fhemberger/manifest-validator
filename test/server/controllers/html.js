'use strict';

const Code = require('code');
const Lab = require('lab');
const MockHandler = require('../../mock-handler.js');


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;


describe('Controller: Pages', function () {

    const HtmlController = require('../../../app/controllers/html.js');

    afterEach(function (done) {

        MockHandler.reset();
        done();
    });


    describe('index', function () {

        it('should display the index view', function (done) {

            const request  = MockHandler.request;
            const reply    = MockHandler.reply;
            const response = HtmlController.index.handler(request, reply);

            expect( response.template ).to.equal('index');
            done();
        });
    });


    describe('redirectValidate', function () {

        it('should redirect GET requests', function (done) {

            const request = MockHandler.request;
            const reply = MockHandler.reply;

            HtmlController.redirectValidate.handler(request, reply);

            expect( reply.redirect.withArgs('/').calledOnce ).to.be.true();
            done();
        });
    });

});
