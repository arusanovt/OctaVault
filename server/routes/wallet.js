'use strict';

var express = require('express');
var authService = require('../auth/auth.service');
var router = express.Router();

//All routes here should be authorized and have user
router.all('*',
  authService.authenticationMiddleware,
  authService.authorizationMiddleware,
  authService.userMiddleware,
  authService.smsCodeMiddleware
);

router.get('/', function (req, res) {
  //TODO: list all transactions
  res.json([]);
});

router.get('/@me', function (req, res) {
  Promise.resolve(req.user.username)
    .then(username=> {
      return req.models.Transaction.getUserBalance(username);
    })
    .then(balance => res.json({balance: balance}))
    .catch(err=> res.jsonerror(err))
});

router.get('/addresses', function (req, res) {
  Promise.resolve(req.user.username)
    .then((username)=> req.models.UserAddress.getAddressBalance(username))
    .then(addresses => res.json(addresses))
    .catch(err=> res.jsonerror(err))
});

router.post('/addresses', function (req, res) {
  req.models.UserAddress.qCreate({username: req.user.username, address: req.body.address})
    .then(()=> req.models.UserAddress.getAddressBalance(req.user.username))
    .then(addresses => res.json(addresses))
    .then((userAddress)=> res.json(userAddress))
    .catch(err=> res.jsonerror(err));
});

router.get('/transactions', function (req, res) {
  Promise.resolve(req.user.username)
    .then(username=> {
      return req.models.Transaction.getUserTransactions(username);
    })
    .then(transactions => res.json(transactions))
    .catch(err=> res.jsonerror(err))
});

module.exports = router;
