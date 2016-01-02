'use strict';

var express = require('express');
var authService = require('../auth/auth.service');
var router = express.Router();

//All routes here should be authorized and have user
router.all('*', authService.authMiddleware, authService.userMiddleware);

router.get('/', function(req, res) {
  //TODO: list all transactions
  res.json([]);
});

router.get('/@me', function(req, res) {
  //TODO: user details
  res.json({username: req.user.username});
});

module.exports = router;
