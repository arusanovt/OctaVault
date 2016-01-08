'use strict';
var pickupTransport = require('nodemailer-pickup-transport');

module.exports = {
  db: 'mysql://root:1@localhost:3306/octa-test',
  //Override base settings for development
  emailTransport: pickupTransport({
    directory: './.tmp/',
  }),
  smsSender: function(recipientPhoneNumber, text) {
    //Dummy sms sender
    console.log(`Dummy send sms to ${recipientPhoneNumber} with text'${text}'`);
  },
};
