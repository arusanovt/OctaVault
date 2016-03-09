'use strict';
var pickupTransport = require('nodemailer-pickup-transport');
var path = require('path');

module.exports = {
  db: 'mysql://root:1234@localhost:3306/octa-test',
  //Override base settings for development
  emailTransport: pickupTransport({
    directory: path.join(__dirname,'.tmp'),
  }),
  smsSender: function(recipientPhoneNumber, text) {
    //Dummy sms sender
    console.log(`Dummy send sms to ${recipientPhoneNumber} with text'${text}'`);
  },
  wallet: {
    host: 'localhost',
    port: 4246,
    user: 'test',
    pass: 'test',
    timeout: 30000
  }
};
