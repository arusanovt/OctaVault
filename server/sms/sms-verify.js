'use strict';
var config = require('../../config');
var log = require('../log');

function nexmoSender() {
  var nexmo = require('easynexmo');
  nexmo.initialize(config.smsNexmoKey, config.smsNexmoSecret, true);

  return function(recipientPhoneNumber, text) {
    return new Promise(function(resolve, reject) {
      nexmo.sendTextMessage(config.smsFrom, recipientPhoneNumber, text, {}, function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  };
}

exports.currentSender = config.smsSender || nexmoSender();

exports.sendSmsCode = function(phoneNumber, code) {
  log.info(`sending code ${code} to ${phoneNumber}`);
  return exports.currentSender(phoneNumber, `OctaWallet code: ${code}`);
};

