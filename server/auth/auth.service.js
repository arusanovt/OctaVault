'use strict';

exports.authMiddleware = function(req, res, next) {
  if (req.session.username && req.session.loginIp === req.ip) {
    return next();
  }

  var err = new Error('Unathorized');
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
    .catch(err=> {
      err.status = 401;
      return next(err);
    });
};
