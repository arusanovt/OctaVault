'use strict';

var express = require('express');
var authService = require('../auth/auth.service');
var router = express.Router();

router.get('/login', function(req, res) {
  res.json({ok: true});
});

router.get('/logout', authService.authMiddleware, function(req, res) {
  req.session.destroy(function(err) {
    return res.json({status: 'ok'});
  });
});

module.exports = router;
