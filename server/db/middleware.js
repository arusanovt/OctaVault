var qOrm = require('q-orm');
var config = require('../../config');

module.exports = qOrm.qExpress(config.db, {
  define: function(db, models, next) {
    db.load('./models/user');
    db.sync(next);
  },
});
