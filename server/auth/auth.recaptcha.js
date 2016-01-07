'use strict';
var recaptcha = require('nodejs-nocaptcha-recaptcha');
var config = require('../../config');
/*
 Validate recaptcha
 */
module.exports = function(req, res, next) {
  Promise.resolve(req.headers['x-recaptcha-response'])
    .then(recaptchaResponse=> {
      return new Promise(function(resolve, reject) {
        recaptcha(recaptchaResponse, config.recaptchaSecret, function(success) {
          success ? resolve() : reject();
        });
      });
    })
    .then(()=>next())
    .catch(_=> {
      var err = new Error('Bad recaptcha');
      err.property = 'recaptcha';
      err.status = 400;
      return next(err);
    });
};
