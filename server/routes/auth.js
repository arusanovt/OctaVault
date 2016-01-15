'use strict';

var express = require('express');
var config = require('../../config');
var log = require('../log');
var sms = require('../sms/sms-verify');
var authService = require('../auth/auth.service');
var passwordHash = require('../auth/auth.passwordhash');
var recaptchaMiddleware = require('../auth/auth.recaptcha');
var mailer = require('../email/mailer.service');
var router = express.Router();

function loginUser(user, req) {
  return new Promise(function(resolve, reject) {
    req.session.username = user.username;
    req.session.loginIp = req.ip;
    if (user.secure) {
      //Check login ip
      user.isSecureIp(req.ip).then(secure=> {
        if (!secure) {
          //Update login code and deny access
          if (user.isCodeExpired('login_code', config.smsCodeValidInterval)) {
            log.info(`user ${user.username} login ip ${req.ip} is not secure. generating new code`);
            return user.renewCode('login_code')
              .then((code)=>sms.sendSmsCode(user.phone, code))
              .then(()=> resolve({confirmationCodeRequired: true, type: 'login_code'}));
          } else {
            //Code was already sent before and still valid
            log.info(`user ${user.username} login ip ${req.ip} is not secure. waiting for code`);
            resolve({confirmationCodeRequired: true});
          }
        } else {
          log.info(`user ${user.username} logged in from ip ${req.ip}`);
          req.session.authorized = true;
          resolve({confirmationCodeRequired: false});
        }
      });
    } else {
      log.info(`user ${user.username} logged in from ip ${req.ip}`);
      req.session.authorized = true;
      resolve({confirmationCodeRequired: false});
    }
  });
}

router.post('/login', function(req, res) {
  req.models.User.qGet(req.body.username)
    .then((user)=> {
      if (passwordHash.verify(req.body.password, user.password)) {
        return loginUser(user, req);
      } else {
        throw new Error('Password not matched');
      }
    })
    .then(result=>res.json(result))
    .catch(_=> {
      //Always return one error to prevent username sneaking
      let err = new Error('Password not matched');
      err.property = 'password';
      res.jsonerror(err);
    });
});

router.post('/register', recaptchaMiddleware, function(req, res) {
  req.models.User.qCreate(req.body)
    .then((user)=> {
      //Save user into session
      req.session.username = user.username;
      req.session.loginIp = req.ip;
      return (user.secure ? Promise.all([sms.sendSmsCode(user.phone, user.registerSmsCode), user.setSecureIp(req.ip)]) : Promise.resolve())
        .then(()=> {
          req.session.authorized = !user.secure;
          log.info(`user ${user.username} register ip ${req.ip}`);
          return res.json({confirmationCodeRequired: user.secure, type: 'registration_code'});
        });
    })
    .catch(err=> res.jsonerror(err));
});

router.post('/validate-code', authService.authenticationMiddleware, authService.userMiddleware, function(req, res) {
  Promise.resolve()
    .then(()=> {
      //User should be authorized but not validated here
      var user = req.user;
      if (req.body.code && req.body.type) {
        if (user.isCodeValid(req.body.type, req.body.code, config.smsCodeValidInterval)) {

          let promiseToResolve = [Promise.resolve()];
          if (user.secure) {
            promiseToResolve.push(user.setSecureIp(req.ip));
          }

          if (req.session.passwordReset) {
            //New password from reset
            promiseToResolve.push(
              user
                .setPassword(req.session.passwordReset)
                .then(()=> {
                  log.info(`new password for user ${user.username} is set`);
                  req.session.passwordReset = null;
                  delete req.session.passwordReset;
                })
            );
          }

          return Promise.all(promiseToResolve)
            .then(()=>user.clearCode(req.body.type))
            .then(()=> {
              req.session.authorized = true;
              return res.json({validated: true});
            })
            .catch(err=> {
              err.property = 'code';
              res.jsonerror(err);
            });
        }
      }

      throw new Error('Bad or expired code');
    })
    .catch(err=> {
      err.property = 'code';
      res.jsonerror(err);
    });
});

router.post('/renew-code', authService.authenticationMiddleware, authService.userMiddleware, function(req, res) {
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
      res.jsonerror(err);
    });
});

router.post('/reset-password', recaptchaMiddleware, function(req, res) {
  Promise.resolve()
    .then(()=> {
      if (!req.body.email || !req.body.username) throw new Error('Invalid username or email');

      //Find user in db
      return req.models.User.qOne({email: req.body.email, username: req.body.username});
    })
    .then(user=> {
      if (user) return user.updatePasswordResetLink();
      else throw new Error('Invalid username');
    })
    .then(user=> mailer.sendMail(user.email, 'reset-password', {link: `/reset-password-complete?code=${user.resetPasswordLink}`}))
    .then(()=>res.json({status: 'sent'}))
    .catch(err=> {
      err.property = 'username';
      res.jsonerror(err);
    });
});

router.post('/reset-password-complete', function(req, res) {
  Promise.resolve()
    .then(()=> {
      if (!req.body.password || !req.body.username || !req.body.code) throw new Error('Invalid username');

      //Find user in db
      return req.models.User.qOne({resetPasswordLink: req.body.code, username: req.body.username});
    })
    .then(user=> {
      if (user) {
        if ((new Date() - user.resetPasswordLinkUpdated) > config.passwordResetValidInterval) {
          throw new Error('Link expired');
        }

        if (user.secure) {
          //Generate a code
          return user.renewCode('reset_password_code')
            .then((code)=>sms.sendSmsCode(user.phone, code))
            .then(()=> {
              //Store new temp password in session
              req.session.passwordReset = req.body.password;
              req.session.username = user.username;
              req.session.loginIp = req.ip;
              return {confirmationCodeRequired: true, type: 'reset_password_code'};
            });
        } else {
          //Set new password and login
          return new Promise((resolve, reject)=> {
            user.setPassword(req.body.password, (err)=> {
              if (err) return reject(err);

              //Remove link and save user
              user.resetPasswordLink = null;
              user.resetPasswordLinkUpdated = null;
              log.info(`new password for user ${user.username} is set`);
              return user.qSave(resolve, reject)
                .then(()=> loginUser(user, req)); //Log in user
            });
          });
        }
      } else throw new Error('Invalid username');
    })
    .then((status)=>res.json(status))
    .catch(err=> {
      err.property = 'username';
      res.jsonerror(err);
    });
});

router.get('/logout', authService.authenticationMiddleware, function(req, res) {
  req.session.destroy(function(err) {
    return res.status(401).json({});//Just send 401
  });
});

module.exports = router;
