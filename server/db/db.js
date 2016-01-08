'use strict';
var orm = require('orm');
var qOrm = require('q-orm');
var config = require('../../config');
orm.settings.set('instance.returnAllErrors', true);

module.exports = ()=> qOrm
  .qConnect(config.db)
  .then(db=> {
    return new Promise(function(resolve, reject) {
      db.load('./models/user', function(err) {
        if (err) return reject(err);

        let models = {};
        models.User = db.models.User;
        models.UserTrustedIp = db.models.UserTrustedIp;
        models.sync = ()=>db.qDrop().then(()=>db.qSync());
        return resolve(models);
      });
    });
  });
