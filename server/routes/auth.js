'use strict';

var express = require('express');
var authService = require('../auth/auth.service');
var passwordHash = require('../auth/auth.passwordhash');
var router = express.Router();

function formatError(error) {
  if (!Array.isArray(error)) {
    error = [error];
  }

  return {
    errors: error.map(err=> {
      return {
        message: err.message,
        property: err.property,
        type: err.type,
      };
    }),
  };
}

router.post('/login', function(req, res) {
  req.models.User.qGet(req.body.username)
    .then((user)=> {
      if (passwordHash.verify(req.body.password, user.password)) {
        //TODO: check security and IP table
        req.session.username = user.username;
        req.session.loginIp = req.ip;
        res.json({confirmationCodeRequired: false});
      } else {
        throw new Error('Password not matched');
      }
    })
    .catch(_=> {
      //Always return one error to prevent username sneaking
      let err = new Error('Password not matched');
      err.property = 'password';
      res.status(400).json(formatError(err));
    });
});

router.post('/register', function(req, res) {
  //TODO: Add middleware for validating recaptcha
  req.models.User.qCreate(req.body)
    .then((user)=> {
      //Save user into session
      req.session.username = user.username;
      req.session.loginIp = req.ip;
      if (user.secure) {
        //TODO: Send code
      }

      res.json({confirmationCodeRequired: user.secure});
    })
    .catch(err=> {
      res.status(400).json(formatError(err));
    });
});

router.post('/reset-password', function(req, res) {
  res.json({ok: true, data: req.body});
});

router.get('/logout', authService.authMiddleware, function(req, res) {
  req.session.destroy(function(err) {
    return res.json({status: 'ok'});
  });
});

module.exports = router;
