var express = require('express');
var path = require('path');
var logger = require('./log').connectLogger;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var session = require('express-session');
var config = require('../config');

var auth = require('./routes/auth');
var wallet = require('./routes/wallet');

var app = express();
var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.use(logger);
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieParser());
var sess = {
  secret: config.sessionSecret,
  cookie: {},
  saveUninitialized: false,
  resave: false,
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));
app.use(csrf({cookie:app.get('env') === 'development'}));
app.use(function(req, res, next) {
  var token = req.csrfToken();
  res.cookie('x-csrf-token', token);
  next();
});

app.use(require('./db/middleware'));
app.use('/api/auth', auth);
app.use('/api/wallet', wallet);


/// error handlers
app.use(function(err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  res.status(400).json({errors:[{message:'Token expired'}]});
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      message: err.message,
      error: err,
      reason:err.reason,
      stack: err.stack,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    reason:err.reason,
    error: {},
  });
});

module.exports = app;
