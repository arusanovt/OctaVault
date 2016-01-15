'use strict';

var orm = require('orm');
var qOrm = require('q-orm');
var passwordHash = require('../../auth/auth.passwordhash');
var verifyCode = require('../../auth/auth.codes');
var uuid = require('node-uuid');

var enforce = orm.enforce;

module.exports = function (db, cb) {
  var User = db.qDefine('User', {
    firstName: {type: 'text'},
    lastName: {type: 'text'},
    email: {type: 'text', unique: true, required: true},
    username: {type: 'text', unique: true, required: true, key: true}, //Primary key
    password: {type: 'text', required: true, size: 2048},
    pin: {type: 'text', required: true},
    phone: {type: 'text', required: true},
    secure: {type: 'boolean', defaultValue: '1'},

    //timestamps
    created: {type: 'date', time: true},
    updated: {type: 'date', time: true},

    //Login
    loginSmsCode: {type: 'text'},
    loginSmsCodeUpdated: {type: 'date', time: true},

    //Register
    registerSmsCode: {type: 'text'},
    registerSmsCodeUpdated: {type: 'date', time: true},

    //Reset password
    resetPasswordLink: {type: 'text'},
    resetPasswordLinkUpdated: {type: 'date', time: true},
    resetPasswordSmsCode: {type: 'text'},
    resetPasswordSmsCodeUpdated: {type: 'date', time: true},

  }, {
    hooks: {
      beforeCreate: function (next) {
        let _this = this;
        _this.created = new Date();
        _this.setPassword(_this.password).then(()=> {
          if (_this.secure) {
            _this.registerSmsCode = verifyCode.generateDigits(6);
            _this.registerSmsCodeUpdated = new Date();
          }

          User.exists({email: _this.email}, function (err, exists) {
            if (exists) {
              let e = new Error('Email already exists');
              e.property = 'email';
              return next(e);
            } else {
              User.exists({username: _this.username}, function (err, exists) {
                if (exists) {
                  let e = new Error('Username already taken');
                  e.property = 'username';
                  return next(e);
                } else
                  return next();
              });
            }
          });
        }).catch(next);
      },

      beforeSave: function () {
        this.updated = new Date();
      },
    },
    methods: {
      codeVerifyType: function (codeType) {
        var verify = '';
        if (codeType === 'registration_code') {
          verify = 'register';
        } else if (codeType === 'login_code') {
          verify = 'login';
        } else if (codeType === 'reset_password_code') {
          verify = 'resetPassword';
        }

        return verify;
      },

      isCodeValid: function (codeType, code, expiration) {
        var verify = this.codeVerifyType(codeType);
        return (this[verify + 'SmsCode'] === code) && !this.isCodeExpired(codeType, expiration);
      },

      isCodeExpired: function (codeType, expiration) {
        var verify = this.codeVerifyType(codeType);
        return ((new Date() - this[verify + 'SmsCodeUpdated']) > expiration);
      },

      clearCode: function (codeType) {
        var verify = this.codeVerifyType(codeType);
        this[verify + 'SmsCode'] = null;
        this[verify + 'SmsCodeUpdated'] = null;
        return this.qSave();
      },

      renewCode: function (codeType) {
        var verify = this.codeVerifyType(codeType);
        this[verify + 'SmsCode'] = verifyCode.generateDigits(6);
        this[verify + 'SmsCodeUpdated'] = new Date();
        return this.qSave().then(()=>this[verify + 'SmsCode']);
      },

      setPassword: function (newPassword) {
        return new Promise((resolve, reject)=> {
          var checks = new enforce.Enforce();
          checks
            .add(
              'password',
              enforce.security.password(`password should contain lowercase letters, uppercase letters, numbers, special characters and have minimal length of 6`)
            );
          checks.check({
            password: newPassword,
          }, (err)=> {
            if (err) return reject(err);
            this.password = passwordHash.generate(newPassword);
            resolve();
          });
        });

      },

      isSecureIp: function (ip) {
        return UserTrustedIp
          .qOne({username: this.username, ip: ip})
          .then(exists=> !!exists);
      },

      setSecureIp: function (ip) {
        return this.isSecureIp(ip)
          .then(secure=> {
            if (!secure) {
              return UserTrustedIp.qCreate({
                ip: ip,
                username: this.username,
              });
            }
          });
      },

      updatePasswordResetLink: function () {
        this.resetPasswordLink = uuid.v4();
        this.resetPasswordLinkUpdated = new Date();
        return this.qSave();
      },
    },
    validations: {
      username: [
        enforce.unique('username already taken'),
        enforce.security.username({length: 4}, 'username should consist of letters or numbers and contain at least 4 letters'),
      ],
      email: [
        enforce.unique('email already exists'),
        enforce.patterns.email('malformed email'),
      ],
    },
  });

  var UserTrustedIp = db.qDefine('UserTrustedIp', {
    ip: {type: 'text', required: true, unique: 'user-ip', key: true},
    username: {type: 'text', required: true, unique: 'user-ip', key: true},
    created: {type: 'date', time: true},
  }, {
    hooks: {
      beforeCreate: function (next) {
        this.created = new Date();
        next();
      },
    },
  });

  var UserAddress = db.qDefine('UserAddress', {
    address: {type: 'text', required: true, unique: 'user-address', key: true},
    username: {type: 'text', required: true, unique: 'user-address', key: true},
    created: {type: 'date', time: true},
  }, {
    hooks: {
      beforeCreate: function (next) {
        this.created = new Date();
        next();
      },
    },
  });

  UserAddress.getAddressBalance = function (username) {
    return new Promise(function (resolve, reject) {
      var query = 'select u.address, u.created, sum(CASE WHEN t.`from` = u.address THEN -t.amount ELSE t.amount END) as balance ' +
        'from Transaction as t right join UserAddress as u on u.address = t.`from` or u.address = t.`to` where u.username = ? group by u.address order by u.created desc';
      db.driver.db.query(query, [username], function (err, res) {
        if (err) return reject(err);
        resolve(res);
      });
    });
  };

  var Transaction = db.qDefine('Transaction', {
    id: {type: 'text', required: true, unique: true, key: true},
    from: {type: 'text', required: true},
    to: {type: 'text', required: true},
    amount: Number,

    //timestamps
    created: {type: 'date', time: true},

  }, {
    hooks: {
      beforeCreate: function (next) {
        this.created = new Date();
        next()
      },
    },
  });

  Transaction.getUserTransactions = function (username) {
    return new Promise(function (resolve, reject) {
      var query = 'select t.id, u.address,t.from, t.to, t.amount, t.created, CASE WHEN t.`from` = u.address THEN -t.amount ELSE t.amount END as diff ' +
        'from Transaction as t inner join UserAddress as u on u.address = t.`from` or u.address = t.`to` where u.username = ? order by t.created desc';
      db.driver.db.query(query, [username], function (err, res) {
        if (err) return reject(err);
        resolve(res);
      });
    });
  };

  Transaction.getUserBalance = function (username) {
    return new Promise(function (resolve, reject) {
      var query = 'select sum(CASE WHEN t.`from` = u.address THEN -t.amount ELSE t.amount END) as balance ' +
        'from Transaction as t inner join UserAddress as u on u.address = t.`from` or u.address = t.`to` where u.username = ?';
      db.driver.db.query(query, [username], function (err, res) {
        if (err) return reject(err);
        resolve(parseFloat(res[0].balance || 0));
      });
    });
  };

  return cb();
};
