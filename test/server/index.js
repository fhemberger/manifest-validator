'use strict';

const Hapi = require('hapi');
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


    it('returns a Hapi server instance', function (done) {

        expect( server ).to.be.an.instanceof( Hapi.Server );
        done();
    });


    it('has registered plugins', function (done) {

        expect( Object.keys(server.plugins).length ).to.be.above( 1 );
        done();
    });


    it('has loaded all routes', function (done) {

        let table = server.table();
        expect( table ).to.be.an.array();
        expect( table[0] ).to.exist();
        expect( table[0].table ).not.to.be.empty();

        done();
    });
});
