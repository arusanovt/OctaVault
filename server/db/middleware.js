var qOrm = require('q-orm');
var orm = require('orm');
var config = require('../../config');

orm.settings.set('instance.returnAllErrors', true);

module.exports = qOrm.qExpress(config.db, {
  define: function(db, models, next) {
    models = db.load('./models/models', function(err) {
      if (err) {
        return next(err);
      }

      models.User = db.models.User;
      models.UserTrustedIp = db.models.UserTrustedIp;
      models.Transaction = db.models.Transaction;
      models.UserAddress = db.models.UserAddress;


      next();
    });
  },
});
