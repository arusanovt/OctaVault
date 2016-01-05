'use strict';

var express = require('express');
var config = require('../../config');
var sms = require('../sms/sms-verify');
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
        if (user.secure) {
          //Check login ip
          user.isSecureIp(req.ip).then(secure=> {
            if (!secure) {
              //Update login code and deny access
              let err = new Error('Unauthorized');
              err.reason = 'login_code';
              err.status = 401;
              if (user.isCodeExpired('login_code', config.smsCodeValidInterval)) {
                return user.renewCode('login_code')
                  .then((code)=>sms.sendSmsCode(user.phone, code))
                  .then(()=> {
                    res.json({confirmationCodeRequired: true});
                  });
              } else {
                //Code was already sent before and still valid
                res.json({confirmationCodeRequired: true});
              }
            } else {
              res.json({confirmationCodeRequired: false});
            }
          });
        } else {
          res.json({confirmationCodeRequired: false});
        }
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
      return (user.secure ? Promise.all([sms.sendSmsCode(user.phone, user.registerSmsCode), user.setSecureIp(req.ip)]) : Promise.resolve())
        .then(()=>res.json({confirmationCodeRequired: user.secure}));
    })
    .catch(err=> {
      res.status(400).json(formatError(err));
    });
});

router.post('/validate-code', authService.authMiddleware, authService.userMiddleware, function(req, res) {
  Promise.resolve()
    .then(()=> {
      //User should be authorized but not validated here
      var user = req.user;
      if (req.body.code && req.body.type) {
        if (user.isCodeValid(req.body.type, req.body.code, config.smsCodeValidInterval)) {

          return (user.secure ? user.setSecureIp(req.ip) : Promise.resolve())
            .then(()=>user.clearCode(req.body.type))
            .then(()=>res.json({validated: true}))
            .catch(err=> {
              err.property = 'code';
              res.status(400).json(formatError(err));
            });
        }
      }

      throw new Error('Bad or expired code');
    })
    .catch(err=> {
      err.property = 'code';
      res.status(400).json(formatError(err));
    });
});

router.post('/renew-code', authService.authMiddleware, authService.userMiddleware, function(req, res) {
  Promise.resolve()
    .then(()=> {
      //User should be authorized but not validated here
      var user = req.user;
      if (req.body.type && user.isCodeExpired(req.body.type, config.smsCodeValidInterval)) {
        return user.renewCode(req.body.type)
          .then((code)=>sms.sendSmsCode(user.phone, code))
          .then(()=>res.json({renewed: Date.now() + config.smsCodeValidInterval}));
      }

      throw new Error('Code is not updated');
    })
    .catch(err=> {
      err.property = 'code';
      res.status(400).json(formatError(err));
    });
});

router.post('/reset-password', function(req, res) {
  res.json({ok: true, data: req.body});
});

router.get('/logout', authService.authMiddleware, authService.userMiddleware, function(req, res) {
  req.session.destroy(function(err) {
    return res.status(401).json({});//Just send 401
  });
});

module.exports = router;
