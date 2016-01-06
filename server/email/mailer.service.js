'use strict';
var nodemailer = require('nodemailer');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var config = require('../../config');
var swig = require('swig');
var path = require('path');
var url = require('url');

var transporter = nodemailer.createTransport(config.emailTransport);
transporter.use('compile', htmlToText());

exports.sendMail = function(to, template, data) {
  return new Promise(function(resolve, reject) {
    data.base = config.base;
    data.url = function(relativeUrl) {
      return url.resolve(data.base, relativeUrl);
    };

    console.log('sending email to', to, 'template', template, 'data', JSON.stringify(data));
    swig.renderFile(path.join(__dirname, `./templates/${template}.html`), data, function(err, output) {
      if (err) {
        return reject(err);
      }

      var mailOptions = {
        from: config.mailFrom,
        to: to,
        subject: data.subject,
        html: output,
      };

      transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
          return reject(err);
        }

        resolve(info);
      });

    });
  });
};
