'use strict';

var should    = require('chai').should(),
    analytics = require('../lib/analytics.js');


/*jshint expr:true, es5:true*/
describe('Analytics', function() {

  it('should be instanced properly', function() {
    analytics.should.have.ownProperty('account');
    analytics.should.have.ownProperty('host');

    analytics.host.should.equal('localhost');
  });

  describe('#trackPage()', function() {
    it('should not track on localhost', function() {
      analytics.trackPage('mocha').should.be.false;
    });

    it('should track on all other hosts', function() {
      analytics.host    = '';
      analytics.account = '';
      analytics.ga      = {
        trackPage: function(userAgent) { return userAgent; }
      };
      analytics.trackPage().should.equal('/api/validate');
      analytics.trackPage('mocha').should.equal('/api/validate?user-agent=mocha');
      analytics.trackPage('User-Agent/1.0 (Mocha; Encoding Test)').should.equal('/api/validate?user-agent=User-Agent%2F1.0%20(Mocha%3B%20Encoding%20Test)');
    });
  });

});
