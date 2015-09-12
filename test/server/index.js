'use strict';

const Code = require('code');
const Lab = require('lab');


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const describe = lab.describe;
const it = lab.it;


describe('Hapi server', function () {

    let server;

    before(function (done) {

        server = require('../../app/index.js');
        done();
    });


    after(function (done) {

        server.stop({ timeout: 0 }, function () {

            done();
        });
    });


    describe('Hapi server', function () {

        it('is running', function (done) {

            expect(new Date(server.info.started)).to.be.a.date();
            done();
        });
    });


    it('has loaded all routes', function (done) {

        let table = server.table();
        expect( table ).to.be.an.array();
        expect( table[0] ).to.exist();
        expect( table[0].table ).not.to.be.empty();

        done();
    });
});
