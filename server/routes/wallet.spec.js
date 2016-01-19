'use strict';
var request = require('supertest');
var expect = require('expect.js');
var db = require('../db/db');
var sinon = require('sinon');
var uid = require('node-uuid');

describe('Wallet', function () {
  var dbModels = null;
  var app = require('../app')({csrf: false});
  var username = 'wallettestuser';

  before(function () {
    return db().then(models=> {
      dbModels = models;
      return models.sync()
        .then(models=> {
          return Promise.all([
            //Add test user
            models.User.qCreate({
              firstName: 'test',
              lastName: 'test',
              username: username,
              password: 'Qwer!123456',
              email: 'test@mail.com',
              pin: '111111',
              phone: '+15005555555',
              secure: false,
            }),
            // Add addresses
            models.UserAddress.qCreate({
              address: 'test1',
              username: username,
            }),
            models.UserAddress.qCreate({
              address: 'test2',
              username: username,
            }),
            // Add transactions
            models.Transaction.qCreate({
              id: uid.v4(),
              from: 'test1',
              to: 'test3',
              amount: 1,
            }),
            models.Transaction.qCreate({
              id: uid.v4(),
              from: 'test3',
              to: 'test1',
              amount: 10,
            }),
            models.Transaction.qCreate({
              id: uid.v4(),
              from: 'test2',
              to: 'test1',
              amount: 10,
            }),
          ]);
        });
    });
  });


  var agent = null;
  beforeEach(function (done) {
    agent = request.agent(app);
    agent.post('/api/auth/login')
      .send({
        username: username,
        password: 'Qwer!123456',
      })
      .expect(200)
      .end(function (err, res) {
        done(err);
      });
  });

  describe('Transactions', function () {
    it('should be able to get balance', function (done) {
      agent.get('/api/wallet/@me')
        .expect(200)
        .end(function (err, res) {
          expect(res.body).to.have.property('balance');
          expect(res.body.balance).to.be(9);
          done(err);
        });
    });
    it('should be able to get transactions', function (done) {
      agent.get('/api/wallet/transactions')
        .expect(200)
        .end(function (err, res) {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(4);
          for (let transaction of res.body) {
            expect(transaction).to.have.property('from');
            expect(transaction).to.have.property('to');
            expect(transaction).to.have.property('amount');
          }
          done(err);
        });
    });

  });
  describe('Addresses', function () {
    it('should be able to get addresses', function (done) {
      agent.get('/api/wallet/addresses')
        .expect(200)
        .end(function (err, res) {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(2);
          for (let address of res.body) {
            expect(address).to.have.property('address');
            expect(address).to.have.property('balance');
          }
          done(err);
        });
    });
    it('should be able to create addresses', function (done) {
      agent.post('/api/wallet/addresses')
        .send({
          address: 'address1'
        })
        .expect(200)
        .end(function (err, res) {
          agent.get('/api/wallet/addresses')
            .expect(200)
            .end(function (err, res) {
              expect(res.body).to.be.an('array');
              expect(res.body).to.have.length(3);
              for (let address of res.body) {
                expect(address).to.have.property('address');
                expect(address).to.have.property('balance');
              }
              done(err);
            });
        });
    });
  });
});

