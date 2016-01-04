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

      if (user.loginSmsCode) {
        //Login isn't confirmed
        let err = new Error('Login code required');
        err.reason = 'login_code';
        err.status = 401;
        return next(err);
      }

      if (user.registerSmsCode) {
        //Register isn't confirmed
        let err = new Error('Registration code required');
        err.status = 'registration_code';
        err.status = 401;
        return next(err);
      }

      next();
    })
    .catch(_=> {
      var err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    });
};
