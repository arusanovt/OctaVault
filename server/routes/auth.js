'use strict';

var express = require('express');
var authService = require('../auth/auth.service');
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
  res.json({ok: true, data: req.body});
});

router.post('/register', function(req, res) {
  //TODO: Add middleware for validating recaptcha
  req.models.User.qCreate(req.body)
    .then((user)=> {
      res.json(user);
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
