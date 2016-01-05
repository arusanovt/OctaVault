'use strict';

exports.sendSmsCode = function(phoneNumber, code) {
  console.log(`Sending code ${code} to ${phoneNumber}`);
  return Promise.resolve();
};
