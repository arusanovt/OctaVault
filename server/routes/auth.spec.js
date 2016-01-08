'use strict';
var request = require('supertest');
var expect = require('expect.js');
var db = require('../db/db');
var app = require('../app');

describe('Authorization', function() {
  beforeEach(function() {
    return db().then(models=>models.sync());
  });

  function getCsrf(agent) {
    return new Promise(function(resolve, reject) {
      agent
        .get('/api/wallet/@me')
        .expect('set-cookie', /x-csrf-token/)
        .end(function(err, res) {
          for (let cookie of res.headers['set-cookie']) {
            if (cookie.match(/x-csrf-token/)) {
              return resolve(/x-csrf-token=(.+?);/.exec(cookie)[1]);
            }
          }

          reject(new Error('no csrf cookie'));
        });
    });

  }

  describe('Register', function() {
    var agent = null;
    var csrf = '';
    beforeEach(function() {
      agent = request.agent(app);
      return getCsrf(agent).then(setScsrf => {
        csrf = setScsrf;
      });
    });

    it('should be able to register with security', function(done) {
      agent.post('/api/auth/register')
        .set('xsrf-token', csrf)
        .send({
          firstName: 'test',
          lastName: 'test',
          username: 'testuser',
          password: 'Qwer!123456',
          email:'test@mail.com',
          pin: '111111',
          phone: '+15005555555',
          secure: true,
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({ confirmationCodeRequired: true, type: 'registration_code' });
          done(err);
        });
    });
  });
});

