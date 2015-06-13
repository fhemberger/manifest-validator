/* eslint max-nested-callbacks:[2,4] */
'use strict';

const Code = require('code');
const Lab = require('lab');

const Manifest = require('../../../app/lib/manifest.js');


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;


describe('Manifest', function () {

    var manifest;

    afterEach(function (done) {

        manifest = undefined;
        done();
    });


    // ----------------------------------------------------------------------------
    describe('#loadFromUri()', function () {

        beforeEach(function (done) {

            manifest = new Manifest();
            done();
        });


        it('should detect invalid URIs', function (done) {

            manifest.loadFromUri('file://no/valid/url', function (err, data) {
                expect( err ).to.exist();
                expect( data ).to.not.exist();
                expect( err ).to.equal( 'ERR_INVALID_URI' );
                done();
            });
        });


        it('should detect a 404 error for the manifest file', function (done) {

            manifest.loadFromUri('http://manifest-validator.com/test/notfound', function (err, data) {
                expect( err ).to.exist();
                expect( data ).to.not.exist();
                expect( err ).to.equal( 'ERR_LOAD_URI' );
                done();
            });
        });


        it('should load the manifest from a valid URI', function (done) {

            manifest.loadFromUri('http://manifest-validator.com/test/test.manifest', function (err, data) {
                expect( err ).to.not.exist();
                expect( data ).to.exist();
                expect( data ).to.be.not.empty();
                done();
            });
        });

    });


    // ----------------------------------------------------------------------------
    describe('#checkResources()', function () {

        beforeEach(function (done) {

            manifest = new Manifest();
            done();
        });


        it('should work if no resources are present', function (done) {

            manifest.checkResources(function () {
                expect( manifest ).to.include( 'invalidResources' );
                expect( manifest.invalidResources ).to.be.empty();
                done();
            });
        });


        it('should fail on invalid URIs', function (done) {

            manifest.resources = ['file://no/valid/url'];
            expect( manifest.checkResources ).to.throw(Error);
            done();
        });


        it('should detect not exisiting resources', function (done) {

            manifest.resources = ['http://manifest-validator.com/test/notfound'];
            manifest.checkResources(function () {

                expect( manifest ).to.include( 'invalidResources' );
                expect( manifest.invalidResources ).to.have.length( 1 );
                expect( manifest.invalidResources[0] ).to.equal( 'http://manifest-validator.com/test/notfound' );
                done();
            });
        });


        it('should pass with exisiting resources', function (done) {

            manifest.resources = ['http://manifest-validator.com/test/test.manifest'];
            manifest.checkResources(function () {

                expect( manifest ).to.include( 'invalidResources' );
                expect( manifest.invalidResources ).to.be.empty();
                expect( manifest ).to.include( 'resources' );
                expect( manifest.resources ).to.have.length( 1 );
                expect( manifest.resources[0] ).to.equal( 'http://manifest-validator.com/test/test.manifest' );
                done();
            });
        });

    });


    // ----------------------------------------------------------------------------
    describe('#validate()', function () {

        it('should fail if manifest is empty', function (done) {

            var manifest = new Manifest();
            var isValid  = manifest.validate();

            expect( isValid ).to.be.false();
            expect( manifest ).to.include( 'errors' );
            expect( manifest.errors ).to.have.length( 1 );
            expect( manifest.errors[0].error ).to.equal( 'ERR_EMPTY_FILE' );
            done();
        });


        it('should pass on valid manifest header', function (done) {

            var manifest = new Manifest('CACHE MANIFEST');
            var isValid  = manifest.validate();

            expect( isValid ).to.be.true();
            done();
        });


        it('should work with preceeding byte order mark (BOM)', function (done) {

            var manifest = new Manifest('\uFEFFCACHE MANIFEST');
            var isValid  = manifest.validate();

            expect( isValid ).to.be.true();
            done();
        });


        it('should fail on invalid manifest header', function (done) {

            var manifest = new Manifest('INVALID MANIFEST HEADER');
            var isValid  = manifest.validate();

            expect( isValid ).to.be.false();
            expect( manifest ).to.include( 'errors' );
            expect( manifest.errors ).to.have.length( 1 );
            expect( manifest.errors[0].error ).to.equal( 'ERR_MANIFEST_HEADER' );
            done();
        });


        it('should warn if same origin policy is violated in FALLBACK section', function (done) {

            var manifest = new Manifest('CACHE MANIFEST\nFALLBACK:\n/ https://127.0.0.1/');
            var isValid  = manifest.validate();

            // In 'file upload' and 'direct input' mode, only a warning is issued,
            // thus the manifest file is considered valid.
            expect( isValid ).to.be.true();

            // 3 = Number of lines of parsed manifest file
            expect( manifest.warnings ).to.have.length( 3 );
            expect( manifest.warnings[0] ).to.not.exist();
            expect( manifest.warnings[1] ).to.not.exist();
            expect( manifest.warnings[2].error ).to.equal( 'ERR_FALLBACK_SAME_ORIGIN' );
            done();
        });


        it('should fail if sheme (i.e. protocol) of resource and manifest file differ in NETWORK section', function (done) {

            var manifest = new Manifest('CACHE MANIFEST\nNETWORK:\nhttps://127.0.0.1/');
            var isValid  = manifest.validate();

            expect( isValid ).to.be.false();

            // 3 = Number of lines of parsed manifest file
            expect( manifest.errors ).to.have.length( 3 );

            // Default manifest file protocol is http, so a resource with a https-sheme fails
            expect( manifest.errors[0] ).to.not.exist();
            expect( manifest.errors[1] ).to.not.exist();
            expect( manifest.errors[2].error ).to.equal( 'ERR_WHITELIST_SAME_SCHEME' );
            done();
        });


        it('should warn if a FALLBACK entry is identical to a NETWORK entry', function (done) {

            // 7.7.6: a resource's URL matched by online whitelist stops the flow,
            // and ignores fallback namespace
            var manifest = new Manifest([
                'CACHE MANIFEST',
                'NETWORK:',
                '/foo',
                'FALLBACK:',
                '/foo /bar'
            ].join('\n'));
            var isValid = manifest.validate();

            expect( isValid ).to.be.true();
            expect( manifest.warnings ).to.have.length( 5 );
            expect( manifest.warnings[4].error ).to.equal('ERR_FALLBACK_IGNORED');
            done();
        });


        it('should warn if a FALLBACK entry is the sub-resource of a NETWORK entry', function (done) {

            // 7.7.6: a resource's URL matched by prefix in online whitelist stops
            // the flow, and ignores fallback namespace
            var manifest = new Manifest([
                'CACHE MANIFEST',
                'NETWORK:',
                '/foo',
                'FALLBACK:',
                '/foo/bar /baz'
            ].join('\n'));
            var isValid = manifest.validate();

            expect( isValid ).to.be.true();
            expect( manifest.warnings ).to.have.length( 5 );
            expect( manifest.warnings[4].error ).to.equal( 'ERR_FALLBACK_IGNORED' );
            done();
        });


        it('should pass if a FALLBACK entry is the super-resource of a NETWORK entry', function (done) {

            // 7.7.6: will override fallback for the sub-resource only
            var manifest = new Manifest([
                'CACHE MANIFEST',
                'NETWORK:',
                '/foo/bar',
                'FALLBACK:',
                '/foo /bar'
            ].join('\n'));
            var isValid = manifest.validate();

            expect( isValid ).to.be.true();
            done();
        });
    });
});
