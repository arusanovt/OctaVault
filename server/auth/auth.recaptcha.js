'use strict';
var recaptcha = require('nodejs-nocaptcha-recaptcha');
var config = require('../../config');
/*
 Validate recaptcha
 */
module.exports = function(req, res, next) {
  if (req.app.get('env') === 'test') return next();//No capctha in tests

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
      return res.status(400).json({
        errors: [{
          message: 'Invalid recaptcha',
          property: 'recaptcha',
          type: 'validation',
        },
        ],
      });
    });
};
