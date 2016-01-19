'use strict';
var request = require('supertest');
var expect = require('expect.js');
var db = require('../db/db');
var sinon = require('sinon');
var sms = require('../sms/sms-verify');

describe('Authorization', function() {
  var dbModels = null;
  before(function() {
    return db().then(models=> {
      dbModels = models;
      return models.sync();
    });
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

  var app = require('../app')();
  var agent = null;
  var csrf = '';
  var sendSmsCode = null;
  beforeEach(function() {
    sendSmsCode = sinon.stub().returns(Promise.resolve());
    sms.currentSender = sendSmsCode;//Stub sms sender

    agent = request.agent(app);
    return getCsrf(agent).then(setScsrf => {
      csrf = setScsrf;
    });
  });

  describe('Register', function() {
    it('should be able to register with security', function(done) {
      agent.post('/api/auth/register')
        .set('xsrf-token', csrf)
        .send({
          firstName: 'test',
          lastName: 'test',
          username: 'testuser',
          password: 'Qwer!123456',
          email: 'test@mail.com',
          pin: '111111',
          phone: '+15005555555',
          secure: true,
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({confirmationCodeRequired: true, type: 'registration_code'});
          expect(sendSmsCode.called).to.be(true);
          expect(sendSmsCode.calledWith('+15005555555')).to.be(true);
          done(err);
        });
    });

    it('should be able to register without security', function(done) {
      agent.post('/api/auth/register')
        .set('xsrf-token', csrf)
        .send({
          firstName: 'test',
          lastName: 'test',
          username: 'testuser-insecure',
          password: 'Qwer!123456',
          email: 'test-insecure@mail.com',
          pin: '111111',
          phone: '+15005555555',
          secure: false,
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({confirmationCodeRequired: false, type: 'registration_code'});
          expect(sendSmsCode.called).to.not.be(true);
          done(err);
        });
    });

    it('shouldn\'t register user with same username', function(done) {
      agent.post('/api/auth/register')
        .set('xsrf-token', csrf)
        .send({
          firstName: 'test',
          lastName: 'test',
          username: 'testuser',
          password: 'Qwer!123456',
          email: 'test-another@mail.com',
          pin: '111111',
          phone: '+15005555555',
          secure: true,
        })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          expect(res.body.errors[0].property).to.eql('username');
          expect(sendSmsCode.called).to.not.be(true);
          done(err);
        });
    });

    it('shouldn\'t register user with same email', function(done) {
      agent.post('/api/auth/register')
        .set('xsrf-token', csrf)
        .send({
          firstName: 'test',
          lastName: 'test',
          username: 'testuser2',
          password: 'Qwer!123456',
          email: 'test@mail.com',
          pin: '111111',
          phone: '+15005555555',
          secure: true,
        })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          expect(res.body.errors[0].property).to.eql('email');
          expect(sendSmsCode.called).to.not.be(true);
          done(err);
        });
    });

  });

  describe('Login', function() {
    it('should be able to login with security', function(done) {
      agent.post('/api/auth/login')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser',
          password: 'Qwer!123456',
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({confirmationCodeRequired: false});
          done(err);
        });
    });

    it('should verify sms code from unknown IP when secure', function(done) {
      agent.post('/api/auth/login')
        .set('xsrf-token', csrf)
        .set('X-Forwarded-For', '192.168.1.1')
        .send({
          username: 'testuser',
          password: 'Qwer!123456',
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({confirmationCodeRequired: true, type: 'login_code'});
          expect(sendSmsCode.called).to.be(true);
          done(err);
        });
    });

    it('should be able to login without security', function(done) {
      agent.post('/api/auth/login')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser-insecure',
          password: 'Qwer!123456',
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({confirmationCodeRequired: false});
          agent.get('/api/wallet/@me')
            .expect(200)
            .end(function(err, res) {
              expect(res.body).to.have.property('balance');
              done(err);
            });
        });
    });

    it('shouldn\'t verify sms code from unknown IP when insecure', function(done) {
      agent.post('/api/auth/login')
        .set('xsrf-token', csrf)
        .set('X-Forwarded-For', '192.168.1.1')
        .send({
          username: 'testuser-insecure',
          password: 'Qwer!123456',
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({confirmationCodeRequired: false});
          expect(sendSmsCode.called).to.not.be(true);
          done(err);
        });
    });

    it('shouldn\'t be able to login with wrong password', function(done) {
      agent.post('/api/auth/login')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser',
          password: 'Qwer!12356',
        })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          expect(res.body.errors[0].property).to.eql('password');
          done(err);
        });
    });

    it('shouldn\'t be able to login with wrong username', function(done) {
      agent.post('/api/auth/login')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser1',
          password: 'Qwer!123456',
        })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          expect(res.body.errors[0].property).to.eql('password');
          done(err);
        });
    });

  });

  describe('Reset Password', function() {
    it('should be able to reset password with security', function(done) {
      agent.post('/api/auth/reset-password')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser',
          email: 'test@mail.com',
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({status: 'sent'});
          done(err);
        });
    });

    it('should be able to reset password without security', function(done) {
      agent.post('/api/auth/reset-password')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser-insecure',
          email: 'test-insecure@mail.com',
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({status: 'sent'});
          done(err);
        });
    });

    it('shouldn\'t be able to reset password without username', function(done) {
      agent.post('/api/auth/reset-password')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser1',
          email: 'test@mail.com',
        })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          expect(res.body.errors[0].property).to.eql('username');
          done(err);
        });
    });

    it('shouldn\'t be able to reset password without email', function(done) {
      agent.post('/api/auth/reset-password')
        .set('xsrf-token', csrf)
        .send({
          username: 'testuser',
          email: 'test1@mail.com',
        })
        .expect(400)
        .end(function(err, res) {
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          expect(res.body.errors[0].property).to.eql('username');
          done(err);
        });
    });
  });

  describe('SMS Codes', function() {
    describe('Registration', function() {

      it('should be able to register with security and pass sms check', function(done) {
        agent.post('/api/auth/register')
          .set('xsrf-token', csrf)
          .send({
            firstName: 'test',
            lastName: 'test',
            username: 'testsms',
            password: 'Qwer!123456',
            email: 'testsms@mail.com',
            pin: '111111',
            phone: '+15005555555',
            secure: true,
          })
          .expect(200)
          .end(function(err, res) {
            expect(res.body).to.eql({confirmationCodeRequired: true, type: 'registration_code'});
            expect(sendSmsCode.called).to.be(true);
            expect(sendSmsCode.calledWith('+15005555555')).to.be(true);

            //Get code
            var code = sendSmsCode.firstCall.args[1].replace(/[^\d]/g, '');

            //Validate using this code
            agent.post('/api/auth/validate-code')
              .set('xsrf-token', csrf)
              .send({
                code: 'someinvalidcode',
                type: 'registration_code',
              })
              .expect(200)
              .end(function(err, res) {
                expect(res.body).to.have.property('errors');
                expect(res.body.errors).to.be.an('array');
                expect(res.body.errors[0].property).to.eql('code');

                agent.post('/api/auth/validate-code')
                  .set('xsrf-token', csrf)
                  .send({
                    code: code,
                    type: 'registration_code',
                  })
                  .expect(200)
                  .end(function(err, res) {
                    expect(res.body).to.eql({validated: true});
                    done(err);
                  });
              });
          });
      });
    });

    describe('Login', function() {
      it('should verify sms code from unknown IP when secure and pass sms check', function(done) {
        agent.post('/api/auth/login')
          .set('xsrf-token', csrf)
          .set('X-Forwarded-For', '192.168.1.3')
          .send({
            username: 'testsms',
            password: 'Qwer!123456',
          })
          .expect(200)
          .end(function(err, res) {
            expect(res.body).to.eql({confirmationCodeRequired: true, type: 'login_code'});
            expect(sendSmsCode.called).to.be(true);

            //Get code
            var code = sendSmsCode.firstCall.args[1].replace(/[^\d]/g, '');

            //Validate using this code
            agent.post('/api/auth/validate-code')
              .set('xsrf-token', csrf)
              .set('X-Forwarded-For', '192.168.1.3')
              .send({
                code: 'someinvalidcode',
                type: 'login_code',
              })
              .expect(200)
              .end(function(err, res) {
                expect(res.body).to.have.property('errors');
                expect(res.body.errors).to.be.an('array');
                expect(res.body.errors[0].property).to.eql('code');

                agent.post('/api/auth/validate-code')
                  .set('xsrf-token', csrf)
                  .set('X-Forwarded-For', '192.168.1.3')
                  .send({
                    code: code,
                    type: 'login_code',
                  })
                  .expect(200)
                  .end(function(err, res) {
                    expect(res.body).to.eql({validated: true});
                    done(err);
                  });
              });
          });
      });
    });
  });
});

