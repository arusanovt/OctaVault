'use strict';
var log = require('../log');

exports.authenticationMiddleware = function(req, res, next) {
  if (req.session.username && req.session.loginIp === req.ip) {
    return next();
  }

  log.error('No session user');
  var err = new Error('Unauthorized');
  err.status = 401;
  return next(err);
};

exports.authorizationMiddleware = function(req, res, next) {
  //Check if user is authorized to access
  if (req.session.authorized) {
    return next();
  }

  log.error('No session authorization');
  var err = new Error('Unauthorized');
  err.status = 401;
  return next(err);
};

exports.userMiddleware = function(req, res, next) {
  //Provide user to request
  log.info(`getting user ${req.session.username}`);
  req.models.User.qGet(req.session.username)
    .then(user=> {
      req.user = user;
      next();
    })
    .catch(err => {
      log.error('No user');
      err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    });
};

exports.smsCodeMiddleware = function(req, res, next) {
  if (req.user) {
    var user = req.user;

    if (user.loginSmsCode) {
      //Login isn't confirmed
      log.info(`required login code ${user.loginSmsCode} for user ${user.username}`);
      let err = new Error('Login code required');
      err.reason = 'login_code';
      err.status = 401;
      return next(err);
    }

    if (user.registerSmsCode) {
      //Register isn't confirmed
      log.info(`required registration code ${user.loginSmsCode} for user ${user.username}`);
      let err = new Error('Registration code required');
      err.reason = 'registration_code';
      err.status = 401;
      return next(err);
    }

    return next();
  } else {
    let err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
};
