'use strict';

exports.generateDigits = function(length) {
  let mul = Math.pow(10, length);
  return ~~(mul + Math.random() * mul);
};
