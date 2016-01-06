'use strict';
var pickupTransport = require('nodemailer-pickup-transport');

module.exports = {
  //Override base settings for development
  emailTransport: pickupTransport({
    directory: './.tmp/',
  }),
};
