'use strict';
var log4js = require('log4js');
log4js.configure({
  appenders: [
    {type: 'console'},
    {type: 'file', filename: '.tmp/app.log', logSize: 5242880},//%Mb rolling log
  ],
});
var logger = log4js.getLogger();
module.exports = logger;
module.exports.connectLogger = log4js.connectLogger(logger, {level: log4js.levels.INFO});
