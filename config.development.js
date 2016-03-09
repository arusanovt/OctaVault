'use strict';
var pickupTransport = require('nodemailer-pickup-transport');
var path = require('path');

module.exports = {
  //Override base settings for development
  emailTransport: pickupTransport({
    directory: path.join(__dirname,'.tmp'),
  }),
  smsSender: function(recipientPhoneNumber, text) {
    //Dummy sms sender
    console.log(`Dummy send sms to ${recipientPhoneNumber} with text'${text}'`);
  },
};
