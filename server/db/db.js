'use strict';
var orm = require('orm');
var qOrm = require('q-orm');
var config = require('../../config');
orm.settings.set('instance.returnAllErrors', true);

module.exports = ()=> qOrm
  .qConnect(config.db)
  .then(db=> {
    return new Promise(function (resolve, reject) {
      db.load('./models/models', function (err) {
        if (err) return reject(err);

        let models = {};
        models.User = db.models.User;
        models.UserTrustedIp = db.models.UserTrustedIp;
        models.Transaction = db.models.Transaction;
        models.UserAddress = db.models.UserAddress;

        models.sync = ()=>db.qDrop().then(()=>db.qSync()).then(()=>models);
        return resolve(models);
      });
    });
  });
