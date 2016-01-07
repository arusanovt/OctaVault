'use strict';
var pickupTransport = require('nodemailer-pickup-transport');

module.exports = {
  //Override base settings for development
  emailTransport: pickupTransport({
    directory: './.tmp/',
  }),
  smsSender: function(recipientPhoneNumber, text) {
    //Dummy sms sender
    console.log(`Dummy send sms to ${recipientPhoneNumber} with text'${text}'`);
  },
};
