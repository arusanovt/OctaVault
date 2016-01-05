'use strict';

exports.authMiddleware = function(req, res, next) {
  if (req.session.username && req.session.loginIp === req.ip) {
    return next();
  }

  var err = new Error('Unauthorized');
  err.status = 401;
  return next(err);
};

exports.userMiddleware = function(req, res, next) {
  //Provide user to request
  req.models.User.qGet(req.session.username)
    .then(user=> {
      req.user = user;
      next();
    })
    .catch(_=> {
      var err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    });
};

exports.smsCodeMiddleware = function(req, res, next) {
  if (req.user) {
    var user = req.user;

    if (user.loginSmsCode) {
      //Login isn't confirmed
      console.log('required login code', user.loginSmsCode);
      let err = new Error('Login code required');
      err.reason = 'login_code';
      err.status = 401;
      return next(err);
    }

    if (user.registerSmsCode) {
      //Register isn't confirmed
      console.log('required registration code', user.registerSmsCode);
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
