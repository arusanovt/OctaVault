var orm = require('orm');
var enforce = orm.enforce;

module.exports = function(db, cb) {
  var User = db.define('User', {
    firstName: {type: 'text'},
    lastName: {type: 'text'},
    email: {type: 'text', unique: true, required: true},
    username: {type: 'text', unique: true, required: true, key: true}, //Primary key
    password: {type: 'text', unique: true, required: true},
    pin: {type: 'text', required: true},
    phone: {type: 'text', unique: true, required: true},
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
    validations: {
      username: [
        enforce.unique('username already taken'),
        enforce.security.username({length: 4}, 'username should contain at least 4 letters'),
      ],
      email: [
        enforce.unique('email already exists'),
        enforce.patterns.email('malformed email'),
      ],
      password: [
        enforce.security.password(`password should contain lowercase letters, uppercase letters, numbers,
         special characters and have minimal length of 6`),
      ],
    },
  });

  var UserTrustedIp = db.define('UserTrustedIp', {
    ip: {type: 'text', required: true},

    //timestamps
    created: {type: 'date', time: true},
  });

  UserTrustedIp.hasOne('owner', User, {reverse: 'trustedIp'});
  return cb();
};
