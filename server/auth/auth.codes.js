'use strict';

exports.generateDigits = function (length) {
  let mul = Math.pow(10, (length || 7) - 1);
  return (~~(mul + Math.random() * mul)).toString(10);
};
